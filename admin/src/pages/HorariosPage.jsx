import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Info, Table } from 'lucide-react';
import api from '../api/axios';
import * as XLSX from 'xlsx';

export default function HorariosPage() {
  const [archivo, setArchivo] = useState(null);
  const [mes, setMes] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewData, setPreviewData] = useState(null); // Almacena datos analizados locales para preview

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setArchivo(file);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Limita a las primeras 10 filas para la vista previa para no sobrecargar el dom
        setPreviewData(data.slice(0, 10));
      } catch (err) {
        setResult({ ok: false, message: 'No se pudo leer el archivo Excel para la vista local.'});
        setPreviewData(null);
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
      const r = await api.post('/admin/horarios/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult({ ok: true, ...r.data });
    } catch (err) {
      setResult({ ok: false, message: err.response?.data?.message || 'Error al procesar el archivo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Horarios Médicos</h1>
        <p className="text-gray-500 text-sm mt-0.5">Importa los horarios mensuales desde un archivo Excel.</p>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <strong>Formato esperado del Excel:</strong>
          <p className="mt-1">El archivo debe tener las columnas: <code className="bg-blue-100 px-1 rounded">medicoId</code>, <code className="bg-blue-100 px-1 rounded">lunes</code>, <code className="bg-blue-100 px-1 rounded">martes</code>, <code className="bg-blue-100 px-1 rounded">miercoles</code>, <code className="bg-blue-100 px-1 rounded">jueves</code>, <code className="bg-blue-100 px-1 rounded">viernes</code>, <code className="bg-blue-100 px-1 rounded">estado</code> (DISPONIBLE / VACACIONES / SIN_ATENCION)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mes de los horarios *</label>
          <input type="month" value={mes} onChange={e => setMes(e.target.value)} required
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Archivo Excel *</label>
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${archivo ? 'border-secondary bg-secondary-pale' : 'border-gray-200 hover:border-primary'}`}>
            <input type="file" id="excel" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" required />
            <label htmlFor="excel" className="cursor-pointer flex flex-col items-center gap-3">
              {archivo ? (
                <>
                  <FileSpreadsheet size={36} className="text-secondary" />
                  <div className="text-sm font-medium text-secondary">{archivo.name}</div>
                  <div className="text-xs text-green-600">Archivo listo para importar</div>
                </>
              ) : (
                <>
                  <Upload size={36} className="text-gray-300" />
                  <div className="text-sm text-gray-400">Arrastra el archivo o <span className="text-primary font-medium">haz clic aquí</span></div>
                  <div className="text-xs text-gray-300">Acepta .xlsx y .xls (max 10MB)</div>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Vista previa Local */}
        {previewData && previewData.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
               <span className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-2">
                 <Table size={14}/> Vista Previa de Datos
               </span>
               <span className="text-xs text-gray-400">Mostrando top 10</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-100/50 text-gray-600 font-medium">
                  <tr>
                    <th className="px-4 py-2">MedicoId</th>
                    <th className="px-4 py-2">Lun</th>
                    <th className="px-4 py-2">Mar</th>
                    <th className="px-4 py-2">Mié</th>
                    <th className="px-4 py-2">Jue</th>
                    <th className="px-4 py-2">Vie</th>
                    <th className="px-4 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2 font-mono text-xs">{row.medicoId || '-'}</td>
                      <td className="px-4 py-2">{row.lunes || '-'}</td>
                      <td className="px-4 py-2">{row.martes || '-'}</td>
                      <td className="px-4 py-2">{row.miercoles || '-'}</td>
                      <td className="px-4 py-2">{row.jueves || '-'}</td>
                      <td className="px-4 py-2">{row.viernes || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs leading-none ${row.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                           {row.estado || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {result && (
          <div className={`flex items-start gap-3 rounded-lg p-4 ${result.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {result.ok ? <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" /> : <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />}
            <div>
              <p className={`text-sm font-medium ${result.ok ? 'text-green-700' : 'text-red-600'}`}>{result.message}</p>
              {result.errores?.length > 0 && (
                <ul className="mt-2 text-xs text-red-600 space-y-0.5">
                  {result.errores.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-2">
          {archivo && (
            <button 
              type="button" 
              onClick={() => { setArchivo(null); setPreviewData(null); }} 
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Limpiar
            </button>
          )}
          <button type="submit" disabled={loading || !archivo}
            className="flex items-center gap-2 px-5 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary-light transition disabled:opacity-60">
            <Upload size={15} /> {loading ? 'Importando...' : 'Confirmar e Importar'}
          </button>
        </div>
      </form>
    </div>
  );
}
