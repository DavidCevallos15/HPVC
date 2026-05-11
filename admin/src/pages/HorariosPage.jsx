import React, { useState } from 'react';
import {
  Upload, FileSpreadsheet, CheckCircle, AlertCircle,
  Info, Table, Calendar, Sparkles, Loader2, Eye, EyeOff
} from 'lucide-react';
import api from '../api/axios';
import * as XLSX from 'xlsx';

/* ── Groq: extracción y normalización con IA ─────────────────────── */
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GROQ_KEY   = import.meta.env.VITE_GROQ_API_KEY;

/**
 * Usa Groq para normalizar los datos crudos del Excel antes de importarlos.
 * Limpia nombres, detecta estados especiales y valida la información.
 */
async function normalizarConIA(rawRows) {
  if (!rawRows?.length || !GROQ_KEY) return null;

  // Enviar muestra representativa (máx 60 filas para no exceder tokens)
  const muestra = rawRows.slice(0, 60);

  const prompt = `
Eres un asistente de procesamiento de datos hospitalarios del Ecuador.

Se te dan filas JSON de un Excel de guardias médicas del Hospital Verdi Cevallos.
Cada fila tiene: tipoContrato, nombreMedico, area, telefono, y campos d01-d31 (días del mes).

Tu tarea: revisar y normalizar los datos. Para cada registro devuelve:
- "nombreMedico": limpia el nombre (quita cargos como JEFE, notas entre paréntesis, espacios extras)
- "area": normaliza el nombre del área (ej: "GINECO OBSTETRICIA" → "Ginecología y Obstetricia")
- "tipoContrato": mantén el valor original
- "observacion": si hay algo inusual en el registro (vacaciones largas, nombre con cargo, etc.), una nota breve. Si todo es normal, null.

Devuelve ÚNICAMENTE un array JSON con exactamente ${muestra.length} objetos (uno por fila de entrada), con solo las claves: nombreMedico, area, tipoContrato, observacion.
`;

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'Responde SOLO con JSON válido, sin explicaciones ni markdown.' },
          { role: 'user', content: prompt + '\n\nDatos:\n' + JSON.stringify(muestra) },
        ],
        max_tokens: 3000,
        temperature: 0.1,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const raw  = data.choices[0]?.message?.content?.trim() ?? '';
    const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/* ── TAB 1: Subir Matriz de Guardias ─────────────────────────────── */
function UploadGuardias() {
  const [archivo,      setArchivo]      = useState(null);
  const [mes,          setMes]          = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading,      setLoading]      = useState(false);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [result,       setResult]       = useState(null);
  const [previewRows,  setPreviewRows]  = useState(null);
  const [aiPreview,    setAiPreview]    = useState(null);  // datos normalizados por IA
  const [mostrarAI,    setMostrarAI]    = useState(false);
  const [rawCount,     setRawCount]     = useState(0);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
    setResult(null);
    setAiPreview(null);
    setMostrarAI(false);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb   = XLSX.read(evt.target.result, { type: 'binary' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const raw  = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        // Vista previa cruda: primeras 15 filas no vacías
        const preview = raw
          .slice(0, 30)
          .filter(r => r.some(c => c !== ''))
          .slice(0, 15);
        setPreviewRows(preview);

        // Contar filas con médico (col 1 con contenido de texto real)
        const conteo = raw.filter((r, i) =>
          i > 6 && String(r[1] || '').trim().length > 3 && String(r[1] || '').length < 80
        ).length;
        setRawCount(conteo);

        // ── Usar IA para normalizar datos ──
        // Convertir las filas de médicos a objetos simples para enviar a Groq
        const filasMedicos = raw
          .filter((r, i) => i > 6 && String(r[1] || '').trim().length > 3 && String(r[1] || '').length < 80)
          .map(r => ({
            tipoContrato: String(r[0] || '').trim(),
            nombreMedico: String(r[1] || '').trim(),
            area:         String(r[3] || '').trim(),
            telefono:     String(r[36] || '').trim(),
          }))
          .slice(0, 60);

        if (filasMedicos.length > 0 && GROQ_KEY) {
          setAiLoading(true);
          const normalizado = await normalizarConIA(filasMedicos);
          setAiPreview(normalizado);
          setAiLoading(false);
        }
      } catch {
        setPreviewRows(null);
        setAiLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return;
    setLoading(true);
    setResult(null);
    try {
      const data = new FormData();
      data.append('archivo', archivo);
      data.append('mes', mes);
      const r = await api.post('/admin/guardias/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult({ ok: true, ...r.data });
    } catch (err) {
      setResult({
        ok: false,
        message: err.response?.data?.message || 'Error al procesar el archivo.',
        hint:    err.response?.data?.hint,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl w-full">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">Matriz de Guardias Médicas</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
          Importa la matriz de guardias mensual desde el Excel institucional. La IA analiza y normaliza los datos antes de guardarlos.
        </p>
      </div>

      {/* Info de formato */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-blue-700">
          <strong>Formato soportado:</strong> Excel institucional del Hospital Verdi Cevallos.
          <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-blue-600 text-[11px] sm:text-xs">
            <li>Columna A: tipo de contrato (TC1, TC3, GUARDIA 1…)</li>
            <li>Columna B: nombre del médico · Columna D: área/especialidad</li>
            <li>Columnas de días: X = trabaja, VACACIONES, PERMISO, etc.</li>
            <li>El mes se detecta <strong>automáticamente</strong> desde las fechas del archivo</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-5">

        {/* Mes manual */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mes de referencia{' '}
            <span className="text-gray-400 font-normal">(se detecta del Excel, pero puedes sobreescribirlo)</span>
          </label>
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
        </div>

        {/* Drop zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Archivo Excel *</label>
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            archivo ? 'border-secondary bg-secondary-pale' : 'border-gray-200 hover:border-primary'
          }`}>
            <input type="file" id="excel-guardias" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" required />
            <label htmlFor="excel-guardias" className="cursor-pointer flex flex-col items-center gap-3">
              {archivo ? (
                <>
                  <FileSpreadsheet size={36} className="text-secondary" />
                  <div className="text-sm font-medium text-secondary">{archivo.name}</div>
                  <div className="text-xs text-green-600">
                    {(archivo.size / 1024).toFixed(0)} KB · {rawCount} médicos detectados
                  </div>
                </>
              ) : (
                <>
                  <Upload size={36} className="text-gray-300" />
                  <div className="text-sm text-gray-400">
                    Arrastra el Excel o <span className="text-primary font-medium">haz clic aquí</span>
                  </div>
                  <div className="text-xs text-gray-300">Acepta .xlsx y .xls (max 10MB)</div>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Panel IA: análisis y normalización */}
        {archivo && (
          <div className={`rounded-xl border p-4 ${
            aiLoading ? 'border-primary/30 bg-primary-pale/30' :
            aiPreview ? 'border-accent/40 bg-amber-50/50' :
            'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-dark">
                <Sparkles size={15} className={aiPreview ? 'text-amber-500' : 'text-gray-400'} />
                Análisis con IA (Groq)
              </span>
              {aiPreview && (
                <button type="button" onClick={() => setMostrarAI(v => !v)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline">
                  {mostrarAI ? <><EyeOff size={12} /> Ocultar</> : <><Eye size={12} /> Ver datos normalizados</>}
                </button>
              )}
            </div>

            {aiLoading && (
              <div className="flex items-center gap-2 text-xs text-primary">
                <Loader2 size={13} className="animate-spin" />
                Groq está analizando y normalizando los datos del Excel...
              </div>
            )}

            {!aiLoading && !GROQ_KEY && (
              <p className="text-xs text-gray-400">Configura VITE_GROQ_API_KEY para activar el análisis IA.</p>
            )}

            {!aiLoading && aiPreview && (
              <p className="text-xs text-green-700">
                ✅ IA analizó {aiPreview.length} registros — nombres y áreas normalizados correctamente.
                {aiPreview.some(r => r.observacion) && (
                  <span className="text-amber-600 ml-1">
                    · {aiPreview.filter(r => r.observacion).length} registros con observaciones.
                  </span>
                )}
              </p>
            )}

            {!aiLoading && !aiPreview && GROQ_KEY && (
              <p className="text-xs text-gray-400">Selecciona un archivo para activar el análisis.</p>
            )}

            {/* Tabla de datos normalizados por IA */}
            {mostrarAI && aiPreview && (
              <div className="mt-3 overflow-hidden rounded-lg border border-amber-200">
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="bg-amber-100 text-amber-800">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Nombre Médico</th>
                        <th className="px-3 py-2">Área Normalizada</th>
                        <th className="px-3 py-2">Tipo</th>
                        <th className="px-3 py-2">Obs.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {aiPreview.map((r, i) => (
                        <tr key={i} className={r.observacion ? 'bg-amber-50' : 'bg-white'}>
                          <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                          <td className="px-3 py-1.5 font-medium text-dark">{r.nombreMedico}</td>
                          <td className="px-3 py-1.5 text-secondary">{r.area}</td>
                          <td className="px-3 py-1.5 text-gray-500">{r.tipoContrato}</td>
                          <td className="px-3 py-1.5 text-amber-600 italic">{r.observacion || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vista previa cruda del Excel */}
        {previewRows && previewRows.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-dark flex items-center gap-2 select-none">
              <Table size={14} /> Vista previa del archivo Excel (primeras filas)
            </summary>
            <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto max-h-48">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {previewRows.map((row, i) => (
                      <tr key={i} className={i < 7 ? 'bg-blue-50/30' : 'hover:bg-gray-50'}>
                        <td className="px-2 py-1 text-gray-300 font-mono">{i}</td>
                        {row.slice(0, 8).map((cell, j) => (
                          <td key={j} className="px-3 py-1 border-l border-gray-100 max-w-[120px] truncate">
                            {String(cell).substring(0, 25) || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        )}

        {/* Resultado de la importación */}
        {result && (
          <div className={`flex items-start gap-3 rounded-lg p-4 ${
            result.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {result.ok
              ? <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
              : <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            }
            <div>
              <p className={`text-sm font-medium ${result.ok ? 'text-green-700' : 'text-red-600'}`}>
                {result.message}
              </p>
              {result.ok && (
                <div className="text-xs text-green-600 mt-1 space-y-0.5">
                  <div>✅ {result.total} médicos importados</div>
                  {result.mesDetectado   && <div>📅 Mes detectado: {result.mesDetectado}</div>}
                  {result.diasEncontrados && <div>📆 Días mapeados: {result.diasEncontrados}</div>}
                </div>
              )}
              {result.hint && <p className="text-xs text-red-500 mt-1">{result.hint}</p>}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-2">
          {archivo && (
            <button type="button"
              onClick={() => { setArchivo(null); setPreviewRows(null); setAiPreview(null); setResult(null); setMostrarAI(false); }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
              Limpiar
            </button>
          )}
          <button type="submit" disabled={loading || !archivo}
            className="flex items-center gap-2 px-5 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary-light transition disabled:opacity-60">
            <Upload size={15} />
            {loading ? 'Importando...' : 'Confirmar e Importar'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── TAB 2: Formato Legado (medicoId) ────────────────────────────── */
function UploadHorariosLegado() {
  const [archivo, setArchivo] = useState(null);
  const [mes, setMes] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return;
    setLoading(true);
    setResult(null);
    try {
      const data = new FormData();
      data.append('archivo', archivo);
      data.append('mes', mes);
      const r = await api.post('/admin/horarios/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult({ ok: true, ...r.data });
    } catch (err) {
      setResult({ ok: false, message: err.response?.data?.message || 'Error al procesar el archivo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl w-full">
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Horarios por medicoId (Legado)</h2>
        <p className="text-gray-400 text-[11px] sm:text-xs mt-1">Formato antiguo: columnas medicoId, lunes, martes, miercoles, jueves, viernes, estado</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-5">
        <input type="month" value={mes} onChange={e => setMes(e.target.value)} required
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary w-full sm:w-auto" />
        <div className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center ${archivo ? 'border-secondary bg-secondary-pale' : 'border-gray-200'}`}>
          <input type="file" id="excel-legado" accept=".xlsx,.xls"
            onChange={e => { setArchivo(e.target.files[0]); setResult(null); }} className="hidden" required />
          <label htmlFor="excel-legado" className="cursor-pointer flex flex-col items-center gap-2">
            {archivo
              ? <><FileSpreadsheet size={32} className="text-secondary" /><span className="text-xs sm:text-sm text-secondary break-all">{archivo.name}</span></>
              : <><Upload size={32} className="text-gray-300" /><span className="text-xs sm:text-sm text-gray-400">Seleccionar archivo</span></>
            }
          </label>
        </div>
        {result && (
          <div className={`p-3 rounded-lg text-xs sm:text-sm ${result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {result.message}
          </div>
        )}
        <div className="flex justify-end">
          <button type="submit" disabled={loading || !archivo}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition disabled:opacity-60">
            <Upload size={15} /> {loading ? 'Importando...' : 'Importar'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Root con tabs ───────────────────────────────────────────────── */
export default function HorariosPage() {
  const [tab, setTab] = useState('guardias');

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto whitespace-nowrap hide-scrollbar pb-px">
        <button onClick={() => setTab('guardias')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition shrink-0 ${
            tab === 'guardias'
              ? 'bg-white border border-b-white border-gray-200 text-secondary'
              : 'text-gray-500 hover:text-dark'
          }`}>
          <span className="flex items-center gap-2"><Calendar size={15} /> Matriz de Guardias</span>
        </button>
        <button onClick={() => setTab('legado')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition shrink-0 ${
            tab === 'legado'
              ? 'bg-white border border-b-white border-gray-200 text-primary'
              : 'text-gray-500 hover:text-dark'
          }`}>
          Formato Legado
        </button>
      </div>

      {tab === 'guardias' ? <UploadGuardias /> : <UploadHorariosLegado />}
    </div>
  );
}
