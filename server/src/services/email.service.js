const path = require('path');
const nodemailer = require('nodemailer');

const ESCUDO_PATH = path.resolve(__dirname, '../../../client/src/assets/escudo-ec.png');
const MSP_LOGO_PATH = path.resolve(__dirname, '../../../client/src/assets/logo-msp-remove.png');

let transporter;

const isEmailConfigured = () => {
  const port = Number.parseInt(process.env.SMTP_PORT, 10);
  const credentialsAreComplete = !process.env.SMTP_USER || Boolean(process.env.SMTP_PASS);

  return Boolean(
    process.env.SMTP_HOST
    && Number.isInteger(port)
    && port > 0
    && process.env.SMTP_FROM
    && credentialsAreComplete
  );
};

const getTransporter = () => {
  if (transporter) return transporter;

  const port = Number.parseInt(process.env.SMTP_PORT, 10);
  const auth = process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });

  return transporter;
};

const htmlToText = (html) => html
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/p>/gi, '\n\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#039;/g, "'")
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const sendEmail = async ({ to, subject, html, messageId }) => {
  if (!isEmailConfigured()) {
    throw new Error('El servicio SMTP no está configurado.');
  }

  return getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
    text: htmlToText(html),
    messageId,
    attachments: [
      {
        filename: 'escudo-ec.png',
        path: ESCUDO_PATH,
        cid: 'escudo-ecuador-hpvc',
      },
      {
        filename: 'logo-msp.png',
        path: MSP_LOGO_PATH,
        cid: 'logo-msp-hpvc',
      },
    ],
  });
};

module.exports = {
  isEmailConfigured,
  sendEmail,
};
