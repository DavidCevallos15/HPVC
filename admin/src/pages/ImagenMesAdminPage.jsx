import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Save, CheckCircle, Loader2, Trash2, Clock } from 'lucide-react';
import api from '../api/axios';

const API_BASE   = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');
const MAX_IMGS   = 8;

export default function ImagenMesAdminPage() {
  const [images,        setImages]        = useState(Array(MAX_IMGS).fill(null));
  const [selectedFiles, setSelectedFiles] = useState({});
  const [previewUrls,   setPreviewUrls]   = useState({});
  const [intervalSec,   setIntervalSec]   = useState(5);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      const res  = await api.get('/admin/configuracion');
      const data = res.data.data || {};
      const imgs = Array(MAX_IMGS).fill(null).map((_, i) => {
        const url = data[`imagen_mes_${i + 1}`];
        return url ? `${API_ORIGIN}${url}` : null;
      });
      setImages(imgs);
      setIntervalSec(parseInt(data.imagen_mes_intervalo || '5', 10));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (idx, file) => {
    if (!file) return;
    setSelectedFiles(p => ({ ...p, [idx]: file }));
    setPreviewUrls(p  => ({ ...p, [idx]: URL.createObjectURL(file) }));
    setSaved(false);
  };

  const removeImage = async (idx) => {
    if (!confirm(`¿Eliminar la imagen ${idx + 1}?`)) return;
    try {
      await api.delete(`/admin/configuracion/imagen_mes_${idx + 1}`);
      setImages(p => { const a = [...p]; a[idx] = null; return a; });
      setSelectedFiles(p => { const a = { ...p }; delete a[idx]; return a; });
      setPreviewUrls(p  => { const a = { ...p }; delete a[idx]; return a; });
    } catch { alert('Error al eliminar'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Subir archivos nuevos
      for (const [idx, file] of Object.entries(selectedFiles)) {
        const fd = new FormData();
        fd.append('clave',  `imagen_mes_${parseInt(idx, 10) + 1}`);
        fd.append('imagen', file);
        await api.post('/admin/configuracion/imagen', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      // Guardar intervalo
      await api.put('/admin/configuracion', {
        configs: [{ clave: 'imagen_mes_intervalo', valor: String(intervalSec) }]
      });
      setSelectedFiles({});
      setPreviewUrls({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await fetchConfig();
    } catch {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold font-heading text-neutral-900 flex items-center gap-2">
          <ImageIcon size={28} className="text-primary" /> Carrusel de Noticias del Mes
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Sube hasta {MAX_IMGS} imágenes que rotarán en la sección "Imagen del Mes" de la página principal.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <CheckCircle size={15} /> Imágenes actualizadas exitosamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Configuración del intervalo */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5 flex items-center gap-4 flex-wrap">
          <Clock size={20} className="text-primary shrink-0" />
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Segundos entre imágenes</label>
            <p className="text-xs text-neutral-400">Tiempo que tarda el carrusel en cambiar de imagen automáticamente.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={2} max={15} step={1}
              value={intervalSec}
              onChange={e => { setIntervalSec(parseInt(e.target.value, 10)); setSaved(false); }}
              className="w-32 accent-primary"
            />
            <span className="text-primary font-bold text-lg w-10 text-center">{intervalSec}s</span>
          </div>
        </div>

        {/* Grid de imágenes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {images.map((imgUrl, idx) => {
            const preview = previewUrls[idx] || imgUrl;
            const hasNew  = !!selectedFiles[idx];
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Imagen {idx + 1}
                  </span>
                  {imgUrl && !hasNew && (
                    <button type="button" onClick={() => removeImage(idx)}
                      className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors" title="Eliminar">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* Vista previa */}
                <div className="relative rounded-lg overflow-hidden bg-neutral-50 border border-dashed border-neutral-200 h-36 flex items-center justify-center">
                  {preview ? (
                    <>
                      <img src={preview} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                      {hasNew && (
                        <div className="absolute top-1 left-1 bg-accent text-primary-dark text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                          NUEVA
                        </div>
                      )}
                    </>
                  ) : (
                    <ImageIcon size={28} className="text-neutral-300" />
                  )}
                </div>

                {/* Botón subir */}
                <label className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition border ${
                  hasNew
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                }`}>
                  <Upload size={13} />
                  {hasNew ? 'Cambiar' : imgUrl ? 'Reemplazar' : 'Subir imagen'}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => handleFileChange(idx, e.target.files[0])} />
                </label>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-100">
          <button
            type="submit"
            disabled={saving || (Object.keys(selectedFiles).length === 0)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
