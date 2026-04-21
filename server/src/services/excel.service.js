const XLSX = require('xlsx');

/**
 * Parsea un buffer de Excel y retorna array de horarios.
 * Columnas esperadas: medicoId, lunes, martes, miercoles, jueves, viernes, estado
 * @param {Buffer} buffer
 * @returns {Array<Object>}
 */
const parseHorariosExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  const horarios = rows
    .filter((row) => row.medicoId)
    .map((row) => ({
      medicoId: parseInt(row.medicoId),
      lunes: row.lunes ? String(row.lunes).trim() : null,
      martes: row.martes ? String(row.martes).trim() : null,
      miercoles: row.miercoles ? String(row.miercoles).trim() : null,
      jueves: row.jueves ? String(row.jueves).trim() : null,
      viernes: row.viernes ? String(row.viernes).trim() : null,
      estado: row.estado?.toUpperCase() || 'DISPONIBLE',
    }));

  return horarios;
};

module.exports = { parseHorariosExcel };
