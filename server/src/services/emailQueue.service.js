const { PrismaClient } = require('@prisma/client');
const { contactAutoReplyTemplate } = require('../templates/contactAutoReply.template');
const { isEmailConfigured, sendEmail } = require('./email.service');

const prisma = new PrismaClient();

const readPositiveInteger = (value, fallback, maximum) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, maximum);
};

const BATCH_SIZE = readPositiveInteger(process.env.EMAIL_QUEUE_BATCH_SIZE, 3, 3);
const POLL_MS = readPositiveInteger(process.env.EMAIL_QUEUE_POLL_MS, 5_000, 60_000);
const MAX_ATTEMPTS = readPositiveInteger(process.env.EMAIL_QUEUE_MAX_ATTEMPTS, 3, 10);
const LOCK_TIMEOUT_MS = readPositiveInteger(process.env.EMAIL_QUEUE_LOCK_TIMEOUT_MS, 300_000, 3_600_000);

let timer;
let activeCycle;

const createContactEmailJob = (db, message) => db.emailQueue.create({
  data: {
    mensajeContactoId: message.id,
    to: message.email,
    subject: 'Hemos recibido su solicitud - HPVC',
    html: contactAutoReplyTemplate({
      nombre: message.nombre,
      asunto: message.asunto,
    }),
  },
});

const recoverStaleJobs = async () => {
  const staleBefore = new Date(Date.now() - LOCK_TIMEOUT_MS);

  await prisma.$executeRaw`
    UPDATE "email_queue"
    SET
      "status" = CASE
        WHEN "attempts" >= ${MAX_ATTEMPTS} THEN 'FAILED'::"EmailStatus"
        ELSE 'PENDING'::"EmailStatus"
      END,
      "lockedAt" = NULL,
      "availableAt" = NOW(),
      "lastError" = COALESCE("lastError", 'Trabajo recuperado después de una interrupción.'),
      "updatedAt" = NOW()
    WHERE "status" = 'SENDING'
      AND "lockedAt" < ${staleBefore}
  `;
};

const claimJobs = async () => prisma.$transaction(async (tx) => tx.$queryRaw`
  WITH candidates AS (
    SELECT "id"
    FROM "email_queue"
    WHERE "status" = 'PENDING'
      AND "attempts" < ${MAX_ATTEMPTS}
      AND "availableAt" <= NOW()
    ORDER BY "createdAt" ASC
    FOR UPDATE SKIP LOCKED
    LIMIT ${BATCH_SIZE}
  )
  UPDATE "email_queue" AS queue
  SET
    "status" = 'SENDING',
    "attempts" = queue."attempts" + 1,
    "lockedAt" = NOW(),
    "updatedAt" = NOW()
  FROM candidates
  WHERE queue."id" = candidates."id"
  RETURNING queue.*
`);

const sanitizeError = (error) => {
  let message = error instanceof Error ? error.message : String(error);

  for (const secret of [process.env.SMTP_PASS, process.env.SMTP_USER]) {
    if (secret) message = message.replaceAll(secret, '[oculto]');
  }

  return message.slice(0, 2_000);
};

const markAsSent = (job) => prisma.$transaction(async (tx) => {
  const claimedJob = await tx.emailQueue.updateMany({
    where: {
      id: job.id,
      status: 'SENDING',
      lockedAt: job.lockedAt,
    },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      lockedAt: null,
      lastError: null,
    },
  });

  if (claimedJob.count === 1) {
    await tx.mensajeContacto.update({
      where: { id: job.mensajeContactoId },
      data: {
        autoRespuestaEnviada: true,
        autoRespuestaEnviadaEn: new Date(),
        autoRespuestaError: null,
      },
    });
  }
});

const markAsFailed = (job, error) => {
  const lastError = sanitizeError(error);
  const exhausted = job.attempts >= MAX_ATTEMPTS;
  const retryDelayMs = 30_000 * (2 ** Math.max(0, job.attempts - 1));

  return prisma.$transaction(async (tx) => {
    const claimedJob = await tx.emailQueue.updateMany({
      where: {
        id: job.id,
        status: 'SENDING',
        lockedAt: job.lockedAt,
      },
      data: {
        status: exhausted ? 'FAILED' : 'PENDING',
        lastError,
        lockedAt: null,
        availableAt: new Date(Date.now() + retryDelayMs),
      },
    });

    if (claimedJob.count === 1) {
      await tx.mensajeContacto.update({
        where: { id: job.mensajeContactoId },
        data: { autoRespuestaError: lastError },
      });
    }
  });
};

const processJob = async (job) => {
  try {
    await sendEmail({
      to: job.to,
      subject: job.subject,
      html: job.html,
      messageId: `<contacto-${job.mensajeContactoId}@hpvc.gob.ec>`,
    });
    await markAsSent(job);
  } catch (error) {
    await markAsFailed(job, error);
    console.error(`No se pudo enviar la autorespuesta de contacto (trabajo ${job.id}, intento ${job.attempts}).`);
  }
};

const runWorkerCycle = async () => {
  if (activeCycle) return activeCycle;

  activeCycle = (async () => {
    await recoverStaleJobs();
    const jobs = await claimJobs();
    await Promise.allSettled(jobs.map(processJob));
  })()
    .catch((error) => {
      console.error('Error al procesar la cola de correo:', sanitizeError(error));
    })
    .finally(() => {
      activeCycle = null;
    });

  return activeCycle;
};

const startEmailQueueWorker = () => {
  if (timer) return true;

  if (!isEmailConfigured()) {
    console.warn('Cola de correo en espera: configure SMTP_HOST, SMTP_PORT y SMTP_FROM.');
    return false;
  }

  void runWorkerCycle();
  timer = setInterval(() => void runWorkerCycle(), POLL_MS);
  timer.unref();
  console.log(`Cola de correo activa (hasta ${BATCH_SIZE} mensajes por ciclo).`);
  return true;
};

const stopEmailQueueWorker = async () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  if (activeCycle) await activeCycle;
  await prisma.$disconnect();
};

module.exports = {
  createContactEmailJob,
  runWorkerCycle,
  startEmailQueueWorker,
  stopEmailQueueWorker,
};
