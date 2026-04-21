import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image } from 'lucide-react';
import EmbedRenderer from '../components/EmbedRenderer';
import api from '../api/axios';

const CATEGORIAS = ['Infraestructura', 'Salud Pública', 'Tecnología', 'Educación', 'Institución', 'General'];

export default function NoticiaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ titulo: '', extracto: '', contenido: '', categoria: 'General', publicado: false, embedUrl: '' });
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get('/admin/noticias').then(r => {
        const n = r.data.data.find(x => x.id === parseInt(id));
        if (n) setForm({ 
          titulo: n.titulo || '', 
          extracto: n.extracto || '', 
          contenido: n.contenido || '', 
          categoria: n.categoria, 
          publicado: n.publicado, 
          embedUrl: n.embedUrl || '' 
        });
      }).catch(() => navigate('/noticias'));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (imagen) data.append('imagen', imagen);

      if (isEdit) await api.put(`/admin/noticias/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/admin/noticias', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      navigate('/noticias');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/noticias')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">{isEdit ? 'Editar noticia' : 'Nueva noticia'}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{isEdit ? 'Modifica los campos y guarda.' : 'Completa el formulario para publicar.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título de la noticia"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select name="categoria" value={form.categoria} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition">
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <input type="checkbox" id="publicado" name="publicado" checked={form.publicado} onChange={handleChange}
              className="w-4 h-4 accent-primary" />
            <label htmlFor="publicado" className="text-sm font-medium text-gray-700">Publicar inmediatamente</label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Extracto <span className="font-normal text-gray-400">(máx. 200 caracteres)</span></label>
          <textarea name="extracto" value={form.extracto} onChange={handleChange} rows={2} maxLength={200}
            placeholder="Resumen breve de la noticia..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition resize-none" />
          <div className="text-right text-xs text-gray-400">{(form.extracto || '').length}/200</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contenido completo</label>
          <textarea name="contenido" value={form.contenido} onChange={handleChange} rows={10}
            placeholder="Escribe el contenido HTML completo de la noticia..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition resize-y font-mono" />
          <p className="text-xs text-gray-400 mt-1">Puedes usar HTML básico: &lt;p&gt;, &lt;strong&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de portada</label>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-primary transition-colors">
            <input type="file" id="imagen" accept="image/*" onChange={e => setImagen(e.target.files[0])} className="hidden" />
            <label htmlFor="imagen" className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-primary transition-colors">
              <Image size={24} />
              <span className="text-sm">{imagen ? imagen.name : 'Haz clic para seleccionar imagen (max 5MB)'}</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5 mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Embed de Redes Sociales (Opcional)
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Pega el código HTML de inserción (&lt;iframe&gt;) de Facebook, Instagram o X.
          </p>
          <textarea name="embedUrl" value={form.embedUrl} onChange={handleChange} rows={3}
            placeholder='<iframe src="..." ...></iframe>'
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition font-mono mb-4 text-gray-600" />
          
          {form.embedUrl && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Vista Previa del Embed</h4>
              <EmbedRenderer 
                className="w-full flex justify-center bg-white border border-gray-100 rounded shadow-sm py-4 [&>iframe]:w-full [&>iframe]:max-w-[100%] overflow-hidden"
                html={form.embedUrl}
              />
            </div>
          )}
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={() => navigate('/noticias')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition disabled:opacity-60">
            <Save size={15} /> {loading ? 'Guardando...' : 'Guardar noticia'}
          </button>
        </div>
      </form>
    </div>
  );
}
