const XLSX = require('xlsx');

// Palabras clave de secciones a ignorar (no son médicos)
const SECCIONES_IGNORAR = [
  'médicos generales', 'medicos generales', 'guardia 1', 'guardia 2', 'guardia 3',
  'guardia  1', 'guardia  2', 'guardia  3',
  'médicos de planta', 'medicos de planta',
  'elaborado', 'revisado', 'aprobado',
  'leyenda', 'j.f.', 'p.', 'm.i.', 'c.', 'o.', 'mr', 'er',
];

const TIPOS_CONTRATO_VALIDOS = ['tc1','tc2','tc3','tc4','tc5','g','guardia','jefaturas','sd','rural','i/m'];

/**
 * Detecta si una fila es un médico real (no cabecera, sección o leyenda).
 */
function esMedico(fila) {
  const nombre = String(fila[1] || '').trim();
  if (!nombre || nombre.length < 3) return false;

  // Si la segunda columna contiene una descripción larga (leyenda), ignorar
  if (nombre.length > 80) return false;

  // Si el nombre parece ser un título de sección
  const nombreLower = nombre.toLowerCase();
  if (SECCIONES_IGNORAR.some(s => nombreLower.startsWith(s))) return false;

  return true;
}

/**
 * Convierte el serial numérico de fecha de Excel al día del mes.
 * @param {number|string} serial
 * @returns {number|null}
 */
function serialADia(serial) {
  if (!serial || typeof serial !== 'number') return null;
  // Excel fecha base: 1 enero 1900 = serial 1
  const fecha = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
  return fecha.getUTCDate();
}

/**
 * Parsea el Excel real de guardias del Hospital Verdi Cevallos.
 *
 * Estructura del Excel:
 * - Fila 0-4: encabezados institucionales
 * - Fila 5: etiquetas de días (VIER, SAB, DOM, LUN, MAR, MIER, JUEV...)
 * - Fila 6: seriales de fecha de cada columna (col 4-34 = días 1-31 del mes)
 * - Filas 7+: datos de médicos (col0=tipoContrato, col1=nombre, col3=area, col4-34=días, col36=telefono)
 *
 * @param {Buffer} buffer - Buffer del archivo Excel
 * @returns {{ medicos: Array, mes: string|null, diasMap: Object }}
 */
const parseMatrizGuardias = (buffer) => {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: false });

  // Buscar la hoja con datos (la primera con contenido real)
  let sheetName = wb.SheetNames[0];
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (raw.length > 10) { sheetName = name; break; }
  }

  const ws = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  // ── Encontrar la fila de cabecera (tiene "ÁREA ASIGNADA" o días) ──
  let filaHeaders = -1;
  let filaFechas  = -1;

  for (let i = 0; i < Math.min(raw.length, 15); i++) {
    const row = raw[i];
    const rowStr = row.map(c => String(c).toUpperCase()).join(' ');
    if (rowStr.includes('ÁREA ASIGNADA') || rowStr.includes('AREA ASIGNADA')) {
      filaHeaders = i;
      // La siguiente fila suele tener los seriales de fecha
      if (i + 1 < raw.length) filaFechas = i + 1;
      break;
    }
  }

  if (filaHeaders === -1) {
    // Fallback: buscar la primera fila con números seriales de fecha (>40000)
    for (let i = 0; i < Math.min(raw.length, 15); i++) {
      const row = raw[i];
      const tieneSerial = row.some(c => typeof c === 'number' && c > 40000);
      if (tieneSerial) { filaFechas = i; filaHeaders = i - 1; break; }
    }
  }

  // ── Mapear columnas → día del mes ──
  const diasMap = {}; // { columnaIndex: diaDelMes (1-31) }
  let mesDetectado = null;

  if (filaFechas >= 0) {
    const filaSerial = raw[filaFechas];
    for (let c = 0; c < filaSerial.length; c++) {
      const serial = filaSerial[c];
      if (typeof serial === 'number' && serial > 40000) {
        const dia = serialADia(serial);
        if (dia) {
          diasMap[c] = dia;
          // Detectar el mes del primer serial
          if (!mesDetectado) {
            const fecha = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
            const anio = fecha.getUTCFullYear();
            const mes  = String(fecha.getUTCMonth() + 1).padStart(2, '0');
            mesDetectado = `${anio}-${mes}`;
          }
        }
      }
    }
  }

  // ── Detectar índice de columna del teléfono ──
  // Suele ser la penúltima o última columna no vacía en la fila de headers
  let colTelefono = -1;
  if (filaHeaders >= 0) {
    const headerRow = raw[filaHeaders];
    for (let c = headerRow.length - 1; c >= 0; c--) {
      const v = String(headerRow[c]).toLowerCase();
      if (v.includes('celular') || v.includes('telefono') || v.includes('teléfono')) {
        colTelefono = c;
        break;
      }
    }
  }

  // ── Parsear filas de médicos ──
  const primeraFilaDatos = Math.max(filaFechas + 1, filaHeaders + 2, 7);
  const medicos = [];
  let tipoContratoActual = '';

  for (let i = primeraFilaDatos; i < raw.length; i++) {
    const fila = raw[i];
    if (!fila || fila.length === 0) continue;

    const col0 = String(fila[0] || '').trim();
    const col1 = String(fila[1] || '').trim();

    // Detectar cambio de tipo de contrato (col 0 no vacía y es un tipo conocido)
    if (col0 && TIPOS_CONTRATO_VALIDOS.includes(col0.toLowerCase().replace(/\s+/g, ''))) {
      tipoContratoActual = col0;
    }
    // "GUARDIA 1", "GUARDIA 2" etc. como tipo especial
    if (/^GUARDIA\s*\d+$/i.test(col0)) {
      tipoContratoActual = col0;
    }

    if (!esMedico(fila)) continue;

    const area     = String(fila[3] || '').trim() || null;
    const telefono = colTelefono >= 0 ? String(fila[colTelefono] || '').trim() || null : null;

    // Construir objeto con los 31 días
    const diasObj = {};
    for (let d = 1; d <= 31; d++) {
      diasObj[`d${String(d).padStart(2, '0')}`] = null;
    }

    for (const [colStr, dia] of Object.entries(diasMap)) {
      const col = parseInt(colStr);
      const valor = String(fila[col] || '').trim();
      if (valor) {
        const key = `d${String(dia).padStart(2, '0')}`;
        // Normalizar valores comunes
        const valNorm = valor.toUpperCase();
        if (valNorm === 'VACACIONES' || valNorm === 'VACACIONES ') {
          diasObj[key] = 'VAC';
        } else if (valNorm === 'PERMISO' || valNorm === 'PM') {
          diasObj[key] = 'PERM';
        } else {
          diasObj[key] = valor.substring(0, 100); // truncar por seguridad
        }
      }
    }

    medicos.push({
      tipoContrato:  tipoContratoActual || col0 || null,
      nombreMedico:  col1,
      area,
      telefono,
      ...diasObj,
    });
  }

  return { medicos, mes: mesDetectado, diasMap };
};

// Mantener compatibilidad con el parser anterior
const parseHorariosExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  return rows
    .filter((row) => row.medicoId)
    .map((row) => ({
      medicoId:  parseInt(row.medicoId),
      lunes:     row.lunes     ? String(row.lunes).trim()     : null,
      martes:    row.martes    ? String(row.martes).trim()    : null,
      miercoles: row.miercoles ? String(row.miercoles).trim() : null,
      jueves:    row.jueves    ? String(row.jueves).trim()    : null,
      viernes:   row.viernes   ? String(row.viernes).trim()   : null,
      estado:    row.estado?.toUpperCase() || 'DISPONIBLE',
    }));
};

module.exports = { parseHorariosExcel, parseMatrizGuardias };
