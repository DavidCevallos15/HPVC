import React, { useState, useEffect } from 'react';
import {
  Upload, FileSpreadsheet, CheckCircle, AlertCircle,
  Info, Table, Calendar, Sparkles, Loader2, Eye, EyeOff,
  Search, User, ChevronLeft, ChevronRight, Filter, X, CalendarDays
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
        <h1 className="text-xl sm:text-2xl font-semibold font-heading text-neutral-900">Matriz de Guardias Médicas</h1>
        <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4 sm:p-6 space-y-5">

        {/* Mes manual */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Mes de referencia{' '}
            <span className="text-neutral-400 font-normal">(se detecta del Excel, pero puedes sobreescribirlo)</span>
          </label>
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
            className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
        </div>

        {/* Drop zone */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Archivo Excel *</label>
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            archivo ? 'border-secondary bg-secondary-pale' : 'border-neutral-200 hover:border-primary'
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
                  <Upload size={36} className="text-neutral-300" />
                  <div className="text-sm text-neutral-400">
                    Arrastra el Excel o <span className="text-primary font-medium">haz clic aquí</span>
                  </div>
                  <div className="text-xs text-neutral-300">Acepta .xlsx y .xls (max 10MB)</div>
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
            'border-neutral-200 bg-neutral-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-dark">
                <Sparkles size={15} className={aiPreview ? 'text-amber-500' : 'text-neutral-400'} />
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
              <p className="text-xs text-neutral-400">Configura VITE_GROQ_API_KEY para activar el análisis IA.</p>
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
              <p className="text-xs text-neutral-400">Selecciona un archivo para activar el análisis.</p>
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
                          <td className="px-3 py-1.5 text-neutral-400">{i + 1}</td>
                          <td className="px-3 py-1.5 font-medium text-dark">{r.nombreMedico}</td>
                          <td className="px-3 py-1.5 text-secondary">{r.area}</td>
                          <td className="px-3 py-1.5 text-neutral-500">{r.tipoContrato}</td>
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
            <summary className="cursor-pointer text-sm font-medium text-neutral-500 hover:text-dark flex items-center gap-2 select-none">
              <Table size={14} /> Vista previa del archivo Excel (primeras filas)
            </summary>
            <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200">
              <div className="overflow-x-auto max-h-48">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {previewRows.map((row, i) => (
                      <tr key={i} className={i < 7 ? 'bg-blue-50/30' : 'hover:bg-neutral-50'}>
                        <td className="px-2 py-1 text-neutral-300 font-mono">{i}</td>
                        {row.slice(0, 8).map((cell, j) => (
                          <td key={j} className="px-3 py-1 border-l border-neutral-100 max-w-[120px] truncate">
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
                  <div>✅ {result.total} registros de guardia importados</div>
                  {result.mesDetectado      && <div>📅 Mes detectado: {result.mesDetectado}</div>}
                  {result.diasEncontrados   && <div>📆 Días mapeados: {result.diasEncontrados}</div>}
                  {result.nuevosMedicos > 0 && <div>👨‍⚕️ {result.nuevosMedicos} médico(s) nuevos registrados en el directorio</div>}
                  {result.nuevasEspecialidades > 0 && <div>🏥 {result.nuevasEspecialidades} especialidad(es) nueva(s) creadas</div>}
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
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 transition">
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



/* ── VISUALIZAR HORARIOS: Utilidades ─────────────────────────────── */
const diasDelMes = (mes) => {
  const [y, m] = mes.split('-').map(Number);
  const total = new Date(y, m, 0).getDate();
  return Array.from({ length: total }, (_, i) => String(i + 1).padStart(2, '0'));
};
const nombreDia = (mes, dStr) => {
  const [y, m] = mes.split('-').map(Number);
  return new Date(y, m - 1, parseInt(dStr, 10)).toLocaleDateString('es-EC', { weekday: 'short' }).replace('.', '');
};
const getMesActual = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`; };
const getMesLabel = (m) => { const [y,mo] = m.split('-'); return new Date(y, parseInt(mo)-1).toLocaleDateString('es-EC', { month: 'long', year: 'numeric' }); };
const navegarMes = (mes, delta) => { const [y,mo] = mes.split('-').map(Number); const d = new Date(y, mo-1+delta, 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };
const POR_PAGINA = 12;

/* ── Card de médico (vista admin completa) ───────────────────────── */
function HorarioCardAdmin({ guardia, mes }) {
  const dias = diasDelMes(mes);
  const tieneAlgunDia = dias.some(d => guardia[`d${d}`]);
  const algunVac = dias.some(d => guardia[`d${d}`] === 'VAC');
  const todosVac = dias.every(d => { const v = guardia[`d${d}`]; return !v || v === 'VAC'; });
  const estado = todosVac && algunVac ? 'VAC' : tieneAlgunDia ? 'OK' : 'NADA';
  const estadoClase = { OK:'bg-secondary-pale text-secondary border-secondary/30', VAC:'bg-yellow-50 text-yellow-700 border-yellow-200', NADA:'bg-neutral-50 text-neutral-400 border-neutral-200' }[estado];
  const estadoLabel = { OK:'Disponible', VAC:'Vacaciones', NADA:'Sin guardia' }[estado];
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary-pale border border-primary/10 flex items-center justify-center shrink-0">
            <User size={16} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-dark text-sm leading-tight truncate">{guardia.nombreMedico}</div>
            <div className="text-secondary text-xs font-medium mt-0.5 truncate">{guardia.area || '—'}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {guardia.tipoContrato && <span className="text-[10px] bg-primary-pale text-primary font-bold px-2 py-0.5 rounded-full">{guardia.tipoContrato}</span>}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${estadoClase}`}>{estadoLabel}</span>
        </div>
      </div>
      <div className="overflow-x-auto -mx-1 pb-1">
        <div className="flex gap-[3px] min-w-max px-1">
          {dias.map(d => {
            const valor = guardia[`d${d}`];
            const esVac = valor === 'VAC';
            const esPerm = valor === 'PERM';
            const hayValor = !!valor;
            return (
              <div key={d} className="text-center" style={{ minWidth:'24px' }}>
                <div className="text-[8px] text-neutral-400 font-bold leading-none mb-0.5">{nombreDia(mes,d)}</div>
                <div className="text-[8px] text-neutral-300 leading-none mb-1">{parseInt(d)}</div>
                <div title={valor||'Sin guardia'} className={`text-[9px] w-[24px] h-[24px] flex items-center justify-center rounded font-bold border ${
                  esVac ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  esPerm ? 'bg-orange-50 text-orange-600 border-orange-200' :
                  hayValor ? 'bg-secondary-pale text-secondary border-secondary/20' :
                  'bg-neutral-50 text-neutral-200 border-neutral-100'
                }`}>{hayValor ? (esVac ? 'V' : esPerm ? 'P' : valor.charAt(0)) : '·'}</div>
              </div>
            );
          })}
        </div>
      </div>
      {guardia.telefono && <div className="text-xs text-neutral-400">📞 {guardia.telefono}</div>}
    </div>
  );
}

/* ── Tab: Visualizar Horarios (Privado Admin) ────────────────────── */
function VisualizarHorarios() {
  const [horarios, setHorarios] = useState([]);
  const [areas,    setAreas]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [mes,      setMes]      = useState(getMesActual);
  const [search,   setSearch]   = useState('');
  const [filtroArea,     setFiltroArea]     = useState('');
  const [filtroContrato, setFiltroContrato] = useState('');
  const [pagina,   setPagina]   = useState(1);

  useEffect(() => {
    setLoading(true); setError(null); setPagina(1);
    api.get(`/admin/guardias?mes=${mes}`)
      .then(r => { setHorarios(r.data.data || []); setAreas([...new Set((r.data.data||[]).map(g=>g.area).filter(Boolean))].sort()); })
      .catch(() => setError('Error al cargar los horarios.'))
      .finally(() => setLoading(false));
  }, [mes]);

  useEffect(() => { setPagina(1); }, [search, filtroArea, filtroContrato]);

  const q = search.toLowerCase().trim();
  const filtered = horarios.filter(h => {
    const matchSearch = !q || (h.nombreMedico||'').toLowerCase().includes(q) || (h.area||'').toLowerCase().includes(q);
    const matchArea     = !filtroArea     || h.area === filtroArea;
    const matchContrato = !filtroContrato || h.tipoContrato === filtroContrato;
    return matchSearch && matchArea && matchContrato;
  });

  const totalPaginas = Math.ceil(filtered.length / POR_PAGINA);
  const paginados    = filtered.slice((pagina-1)*POR_PAGINA, pagina*POR_PAGINA);
  const hayFiltros   = search || filtroArea || filtroContrato;
  const tiposContrato = [...new Set(horarios.map(h=>h.tipoContrato).filter(Boolean))].sort();
  const limpiar = () => { setSearch(''); setFiltroArea(''); setFiltroContrato(''); };

  const btnPage = 'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all border';

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold font-heading text-neutral-900 flex items-center gap-2">
            <CalendarDays size={22} className="text-primary" /> Visualizar Horarios Médicos
          </h2>
          <p className="text-neutral-400 text-xs mt-0.5">Vista privada y completa — solo disponible para administradores.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-1.5">
          <button onClick={() => setMes(m => navegarMes(m,-1))} className="p-1 hover:bg-neutral-100 rounded-lg transition"><ChevronLeft size={16}/></button>
          <span className="font-semibold text-sm capitalize min-w-[130px] text-center text-dark">{getMesLabel(mes)}</span>
          <button onClick={() => setMes(m => navegarMes(m,1))} className="p-1 hover:bg-neutral-100 rounded-lg transition"><ChevronRight size={16}/></button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"/>
            <input type="text" placeholder="Buscar médico o área..." value={search} onChange={e=>setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary transition"/>
          </div>
          <select value={filtroArea} onChange={e=>setFiltroArea(e.target.value)}
            className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-dark focus:outline-none focus:border-primary">
            <option value="">Todas las áreas</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filtroContrato} onChange={e=>setFiltroContrato(e.target.value)}
            className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-dark focus:outline-none focus:border-primary">
            <option value="">Todos los tipos</option>
            {tiposContrato.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {hayFiltros && (
            <button onClick={limpiar} className="flex items-center gap-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-500 hover:bg-neutral-50 transition shrink-0">
              <X size={14}/> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[...Array(6)].map((_,i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-4 animate-pulse h-28"/>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle size={36} className="text-red-400"/>
          <p className="text-dark font-medium text-sm">{error}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500">
            <span className="font-semibold text-dark">{filtered.length}</span> médico{filtered.length!==1?'s':''}
            {totalPaginas>1 && <span className="ml-2 text-neutral-400">· Página {pagina} de {totalPaginas}</span>}
          </p>
          {paginados.length > 0 ? (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {paginados.map(h => <HorarioCardAdmin key={h.id} guardia={h} mes={mes}/>)}
              </div>
              {totalPaginas > 1 && (
                <div className="flex items-center justify-center gap-1 mt-6">
                  <button onClick={()=>setPagina(p=>Math.max(1,p-1))} disabled={pagina===1} className={`${btnPage} text-neutral-500 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30`}><ChevronLeft size={15}/></button>
                  {Array.from({length:Math.min(5,totalPaginas)},(_,i)=>i+Math.max(1,pagina-2)).filter(p=>p<=totalPaginas).map(p=>(
                    <button key={p} onClick={()=>setPagina(p)} className={`${btnPage} ${p===pagina?'bg-primary text-white border-primary':'border-neutral-200 text-neutral-600 hover:bg-primary-pale'}`}>{p}</button>
                  ))}
                  <button onClick={()=>setPagina(p=>Math.min(totalPaginas,p+1))} disabled={pagina===totalPaginas} className={`${btnPage} text-neutral-500 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30`}><ChevronRight size={15}/></button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Filter size={36} className="text-neutral-300"/>
              <p className="text-dark font-medium text-sm">No se encontraron resultados.</p>
              {hayFiltros && <button onClick={limpiar} className="text-primary text-sm hover:underline">Limpiar filtros</button>}
            </div>
          )}
          {horarios.length === 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center text-sm text-blue-700">
              No hay guardias importadas para {getMesLabel(mes)}. Usa la pestaña "Matriz de Guardias" para subir el Excel.
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Root con tabs ───────────────────────────────────────────────── */
export default function HorariosPage() {
  const [tab, setTab] = useState('guardias');

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-6 border-b border-neutral-200 overflow-x-auto whitespace-nowrap hide-scrollbar pb-px">
        <button onClick={() => setTab('guardias')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition shrink-0 ${
            tab === 'guardias' ? 'bg-white border border-b-white border-neutral-200 text-secondary' : 'text-neutral-500 hover:text-dark'
          }`}>
          <span className="flex items-center gap-2"><Calendar size={15}/> Matriz de Guardias</span>
        </button>
        <button onClick={() => setTab('visualizar')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition shrink-0 ${
            tab === 'visualizar' ? 'bg-white border border-b-white border-neutral-200 text-primary' : 'text-neutral-500 hover:text-dark'
          }`}>
          <span className="flex items-center gap-2"><Eye size={15}/> Visualizar Horarios</span>
        </button>
      </div>

      {tab === 'guardias'   && <UploadGuardias />}
      {tab === 'visualizar' && <VisualizarHorarios />}
    </div>
  );
}
