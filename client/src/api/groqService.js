/**
 * groqService.js
 * Integración con Groq AI para extracción y búsqueda semántica de horarios.
 * Modelo: llama-3.1-8b-instant (rápido, gratuito)
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.1-8b-instant';
const API_KEY      = import.meta.env.VITE_GROQ_API_KEY;

/**
 * Llama a la API de Groq con un array de mensajes.
 * @param {Array} messages  - Array de { role, content }
 * @param {number} maxTokens
 * @returns {string} Respuesta del modelo
 */
async function callGroq(messages, maxTokens = 2048) {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model:       GROQ_MODEL,
      messages,
      max_tokens:  maxTokens,
      temperature: 0.1, // Baja temperatura para respuestas precisas
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() ?? '';
}

/**
 * Extrae y normaliza datos crudos del Excel (en formato JSON) usando IA.
 * El Excel de guardias tiene un formato libre (no el formato estándar de la BD).
 *
 * @param {Array} rawRows  - Filas del Excel parseadas por xlsx (objetos crudos)
 * @returns {Array} Array normalizado: [{ nombreMedico, especialidad, servicio, turno, dias, horario, estado }]
 */
export async function extraerHorariosConIA(rawRows) {
  if (!rawRows || rawRows.length === 0) return [];

  // Enviamos solo las primeras 80 filas para no exceder el contexto
  const sample = rawRows.slice(0, 80);
  const jsonStr = JSON.stringify(sample, null, 2);

  const prompt = `
Eres un asistente experto en procesamiento de datos de Excel de hospitales del Ecuador.

Se te proporcionan filas crudas de un Excel de "Matriz de Guardias de Médicos".
El formato puede ser libre, con columnas en español y valores variados.

Tu tarea: extraer y normalizar la información en un array JSON.
Cada elemento debe tener exactamente estas claves:
- "nombreMedico": nombre completo del médico (string)
- "especialidad": especialidad médica (string, inferir si es posible)
- "servicio": servicio o área del hospital (string, ej: "Emergencias", "Consulta Externa", "UCI")
- "turno": "MAÑANA" | "TARDE" | "NOCHE" | "LIBRE" (string, normalizar)
- "dias": array de días abreviados en que trabaja ese turno, ej: ["LUN","MAR","MIE","JUE","VIE"] (Array<string>)
- "horario": horario de atención como string, ej: "07:00-13:00" o "—" si no aplica
- "estado": "DISPONIBLE" | "VACACIONES" | "SIN_ATENCION" (inferir según contexto)

IMPORTANTE:
- Si un campo no se puede determinar, usa null.
- No incluyas filas de cabecera, totales o filas vacías.
- Devuelve ÚNICAMENTE el array JSON válido, sin explicaciones ni markdown.

Datos del Excel:
${jsonStr}
`;

  try {
    const raw = await callGroq([
      { role: 'system', content: 'Eres un extractor de datos JSON. Responde SOLO con JSON válido, sin explicaciones.' },
      { role: 'user', content: prompt },
    ], 3000);

    // Limpiar posibles bloques markdown que el modelo pueda añadir
    const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[Groq] Error al extraer horarios:', err.message);
    return [];
  }
}

/**
 * Búsqueda semántica en horarios ya cargados.
 * Dada una query en lenguaje natural, retorna los IDs/índices relevantes.
 *
 * @param {string} query       - Consulta del usuario, ej: "cardiólogos de la mañana"
 * @param {Array}  horarios    - Array de horarios normalizados o de la BD
 * @returns {Array}            - Sub-array de horarios relevantes, rankeados
 */
export async function buscarHorariosConIA(query, horarios) {
  if (!query?.trim() || !horarios?.length) return horarios;

  // Construimos un resumen compacto para no exceder tokens
  const resumen = horarios.slice(0, 60).map((h, i) => ({
    idx: i,
    nombre: h.nombreMedico || h.medico?.nombre || '',
    especialidad: h.especialidad || h.medico?.especialidad?.nombre || '',
    servicio: h.servicio || '',
    turno: h.turno || '',
    dias: Array.isArray(h.dias) ? h.dias.join(',') : (h.lunes || ''),
    estado: h.estado || 'DISPONIBLE',
  }));

  const prompt = `
Tienes este listado de médicos y sus horarios en un hospital ecuatoriano:
${JSON.stringify(resumen)}

El usuario buscó: "${query}"

Devuelve ÚNICAMENTE un array JSON con los valores de "idx" de los médicos más relevantes para esa búsqueda, ordenados por relevancia (el más relevante primero).
Si ninguno coincide, devuelve [].
Ejemplo de respuesta: [3, 7, 0, 12]
`;

  try {
    const raw = await callGroq([
      { role: 'system', content: 'Eres un motor de búsqueda. Responde solo con un array JSON de índices.' },
      { role: 'user', content: prompt },
    ], 256);

    const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const indices = JSON.parse(clean);

    if (!Array.isArray(indices)) return horarios;

    // Devolver los elementos en el orden de relevancia
    const resultado = indices
      .filter(i => typeof i === 'number' && i >= 0 && i < horarios.length)
      .map(i => horarios[i]);

    // Si Groq devolvió resultados, usarlos; si no, devolver todos
    return resultado.length > 0 ? resultado : horarios;
  } catch (err) {
    console.error('[Groq] Error en búsqueda semántica:', err.message);
    // Fallback: búsqueda local simple por texto
    const q = query.toLowerCase();
    return horarios.filter(h => {
      const nombre = (h.nombreMedico || h.medico?.nombre || '').toLowerCase();
      const esp = (h.especialidad || h.medico?.especialidad?.nombre || '').toLowerCase();
      const srv = (h.servicio || '').toLowerCase();
      return nombre.includes(q) || esp.includes(q) || srv.includes(q);
    });
  }
}
