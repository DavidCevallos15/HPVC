import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Trash2, Download, UploadCloud, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import Skeleton from '../components/ui/Skeleton';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

export default function PoaAdminPage() {
  const [poasList, setPoasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '' }

  useEffect(() => {
    fetchPoas();
  }, []);

  const fetchPoas = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/poa');
      setPoasList(data.data || []);
    } catch (err) {
      console.error('Error al obtener POAs:', err);
      showNotification('error', 'No se pudo cargar el listado de POAs.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (validateExcel(file)) {
      setSelectedFile(file);
    }
  };

  const validateExcel = (file) => {
    if (!file) return false;
    const nameLow = file.name.toLowerCase();
    if (!nameLow.endsWith('.xlsx') && !nameLow.endsWith('.xls')) {
      showNotification('error', 'Formato inválido. Solo se permiten archivos Excel (.xlsx, .xls).');
      return false;
    }
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (validateExcel(file)) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showNotification('error', 'Por favor, selecciona o arrastra un archivo Excel.');
      return;
    }
    if (!anio || isNaN(anio) || anio < 2000 || anio > 2100) {
      showNotification('error', 'Por favor, ingresa un año válido.');
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append('anio', anio);
    formData.append('archivo', selectedFile);

    try {
      const { data } = await api.post('/admin/poa', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showNotification('success', data.message || 'POA subido exitosamente.');
      setSelectedFile(null);
      // Mantener el año siguiente sugerido
      setAnio(new Date().getFullYear());
      fetchPoas();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Error al subir el POA. Inténtelo de nuevo.';
      showNotification('error', errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, year) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el POA del año ${year}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.delete(`/admin/poa/${id}`);
      showNotification('success', `POA del año ${year} eliminado correctamente.`);
      fetchPoas();
    } catch (err) {
      console.error(err);
      showNotification('error', 'Error al eliminar el POA.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold font-heading text-neutral-900 flex items-center gap-2">
          <FileSpreadsheet size={28} className="text-primary" /> Plan Operativo Anual (POA)
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Carga y administra los archivos de POA anuales del hospital.</p>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} className="shrink-0 text-emerald-600" /> : <AlertCircle size={20} className="shrink-0 text-rose-600" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Upload Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-100 p-6 self-start">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 font-heading">Subir Nuevo POA</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Año correspondiente *</label>
              <input
                type="number"
                required
                min="2000"
                max="2100"
                value={anio}
                onChange={(e) => setAnio(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Ej: 2026"
              />
            </div>

            {/* Drag & Drop Area */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Archivo Excel (xls, xlsx) *</label>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150 ${
                  dragActive 
                    ? 'border-primary bg-emerald-50/50 scale-[0.99]' 
                    : 'border-neutral-300 hover:border-primary'
                }`}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <UploadCloud size={36} className={dragActive ? 'text-primary' : 'text-neutral-400'} />
                  <p className="text-sm font-medium text-neutral-700">
                    Arrastra el archivo Excel aquí o <span className="text-primary font-semibold">explora</span>
                  </p>
                  <p className="text-xs text-neutral-400">Archivos permitidos: .xlsx, .xls de hasta 20MB</p>
                </div>
              </div>
            </div>

            {/* Selected File Display */}
            {selectedFile && (
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <FileSpreadsheet size={20} className="text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <p className="font-medium text-neutral-800 truncate" title={selectedFile.name}>{selectedFile.name}</p>
                    <p className="text-xs text-neutral-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition shrink-0"
                >
                  Quitar
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !selectedFile}
              className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-light transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              <span>{saving ? 'Subiendo...' : 'Subir POA'}</span>
            </button>
          </form>
        </div>

        {/* History List Card */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 font-heading">Historial de POAs Subidos</h2>
          
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : poasList.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-sm">
              No se han subido archivos de POA todavía.
            </div>
          ) : (
            <div className="space-y-3">
              {poasList.map((poa) => (
                <div key={poa.id} className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200/60 rounded-xl hover:shadow-sm hover:border-neutral-300 transition duration-150">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                      <FileSpreadsheet size={22} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-neutral-800 text-sm flex items-center gap-2">
                        Año {poa.anio}
                        <span className="text-xs font-normal text-neutral-400">
                          (Subido el {new Date(poa.creadoEn).toLocaleDateString()})
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-500 truncate" title={poa.nombreOriginal}>
                        {poa.nombreOriginal}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-4">
                    <a
                      href={`${API_ORIGIN}${poa.archivoUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-neutral-500 hover:text-primary hover:bg-neutral-200/50 rounded-lg transition"
                      title="Descargar archivo Excel"
                    >
                      <Download size={18} />
                    </a>
                    <button
                      onClick={() => handleDelete(poa.id, poa.anio)}
                      className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar POA"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
