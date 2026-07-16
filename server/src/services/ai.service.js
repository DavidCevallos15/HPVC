/**
 * ai.service.js
 * Servicio de Inteligencia Artificial basado en Groq + RAG.
 * Responde preguntas sobre protocolos clínicos citando fuente y página.
 */

const Groq = require('groq-sdk');
const { buscarChunks } = require('./documentos.service');

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const SYSTEM_PROMPT = `Eres un asistente clínico del Hospital Provincial Verdi Cevallos (HPVC).
Tu función es responder preguntas sobre protocolos, guías clínicas, manuales y normativas del hospital,
basándote EXCLUSIVAMENTE en el contexto de documentos oficiales del MSP Ecuador que te proporcionan.

Reglas:
1. Responde siempre en español formal y claro.
2. Si la información no está en el contexto, indícalo: "No encontré ese protocolo en los documentos disponibles."
3. Sé preciso y conciso. Enumera los pasos de un protocolo si los hay.
4. Al final, lista siempre las fuentes consultadas con el formato: [Documento: nombre | Fragmento #N].
5. Nunca inventes información médica.`;

/**
 * Responde una pregunta usando RAG sobre los documentos indexados.
 * @param {string} pregunta
 * @param {number} documentoId - Opcional. ID del documento a consultar
 * @returns {{ respuesta: string, fuentes: Array }}
 */
async function preguntarProtocolo(pregunta, documentoId = null) {
  // 1. Recuperar chunks relevantes
  const chunks = await buscarChunks(pregunta, 6, documentoId);

  if (!chunks || chunks.length === 0) {
    return {
      respuesta: 'No encontré información específica sobre ese tema en los documentos clínicos disponibles.',
      fuentes: [],
    };
  }

  // 2. Construir contexto para el LLM
  const contexto = chunks
    .map((c, i) =>
      `[Fragmento #${i + 1} | Documento: "${c.titulo}" | Tipo: ${c.tipo}]\n${c.contenido}`
    )
    .join('\n\n---\n\n');

  if (!groq) {
    const respuesta = [
      'Modo local: no hay GROQ_API_KEY configurada, por lo que no se generó una respuesta redactada por IA externa.',
      'Estos son los fragmentos más relevantes encontrados en los documentos indexados:',
      ...chunks.slice(0, 3).map((c, i) => `${i + 1}. ${c.contenido.slice(0, 700)}${c.contenido.length > 700 ? '...' : ''}`),
    ].join('\n\n');

    const fuentesMap = new Map();
    chunks.forEach(c => {
      if (!fuentesMap.has(c.documentoId)) {
        fuentesMap.set(c.documentoId, {
          documentoId: c.documentoId,
          titulo: c.titulo,
          tipo: c.tipo,
          archivoUrl: c.archivoUrl,
          similitud: parseFloat(c.similitud),
        });
      }
    });

    return { respuesta, fuentes: Array.from(fuentesMap.values()) };
  }

  // 3. Llamar a Groq
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `CONTEXTO DE DOCUMENTOS OFICIALES:\n\n${contexto}\n\nPREGUNTA DEL PROFESIONAL: ${pregunta}`,
      },
    ],
    temperature: 0.2,   // Baja temperatura para respuestas más exactas
    max_tokens: 1024,
  });

  // 4. Deduplicar fuentes por documento
  const fuentesMap = new Map();
  chunks.forEach(c => {
    if (!fuentesMap.has(c.documentoId)) {
      fuentesMap.set(c.documentoId, {
        documentoId: c.documentoId,
        titulo: c.titulo,
        tipo: c.tipo,
        archivoUrl: c.archivoUrl,
        similitud: parseFloat(c.similitud),
      });
    }
  });

  return {
    respuesta: completion.choices[0].message.content,
    fuentes: Array.from(fuentesMap.values()),
  };
}

module.exports = { preguntarProtocolo };
