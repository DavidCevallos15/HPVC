import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image, Sparkles } from 'lucide-react';
import EmbedRenderer from '../components/EmbedRenderer';
import api from '../api/axios';

const CATEGORIAS = ['Infraestructura', 'Salud Pública', 'Tecnología', 'Educación', 'Institución', 'General'];

export default function NoticiaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ titulo: '', extracto: '', contenido: '', categoria: 'General', publicado: true, embedUrl: '' });
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAIGenerate = async () => {
    if (!form.embedUrl || form.embedUrl.trim().length < 10) {
      return alert('Pega el código de la publicación (Iframe, Script o URL) en "Publicación de Redes Sociales" para extraer los datos.');
    }
    setAiLoading(true);
    try {
      const res = await api.post('/admin/noticias/generate-metadata', { embedUrl: form.embedUrl });
      if (res.data.success) {
        setForm(prev => ({
          ...prev,
          titulo: res.data.data.titulo || prev.titulo,
          extracto: res.data.data.extracto || prev.extracto,
          contenido: res.data.data.contenidoGenerado || prev.contenido
        }));
      }
    } catch (err) {
      alert('Error al generar con IA: ' + (err.response?.data?.message || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      api.get('/admin/noticias').then(r => {
        const list = r.data?.data || [];
        const n = list.find(x => x.id === parseInt(id));
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

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const getIframeAttr = (attr) => {
    if (!form.embedUrl) return '';
    const match = form.embedUrl.match(new RegExp(`${attr}=["']?(\\d+)["']?`, 'i'));
    return match ? parseInt(match[1], 10) : '';
  };

  const handleAdjustIframe = (dimension, value) => {
    if (!form.embedUrl || !form.embedUrl.includes('<iframe')) return;
    let newUrl = form.embedUrl;
    const regex = new RegExp(`${dimension}=["']?\\d+["']?`, 'i');
    if (regex.test(newUrl)) {
      newUrl = newUrl.replace(regex, `${dimension}="${value}"`);
    } else {
      newUrl = newUrl.replace('<iframe ', `<iframe ${dimension}="${value}" `);
    }
    setForm(prev => ({ ...prev, embedUrl: newUrl }));
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
        <button onClick={() => navigate('/noticias')} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold font-heading text-neutral-900">{isEdit ? 'Editar noticia' : 'Nueva noticia'}</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{isEdit ? 'Modifica los campos y guarda.' : 'Completa el formulario para publicar.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-5">
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-neutral-700 mb-1">Título</label>
          <input id="titulo" name="titulo" value={form.titulo} onChange={handleFormChange} placeholder="Título de la noticia"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
        </div>

        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-neutral-700 mb-1">Categoría *</label>
          <select id="categoria" name="categoria" value={form.categoria} onChange={handleFormChange}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition">
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="extracto" className="block text-sm font-medium text-neutral-700 mb-1">Extracto <span className="font-normal text-neutral-400">(máx. 200 caracteres)</span></label>
          <textarea id="extracto" name="extracto" value={form.extracto} onChange={handleFormChange} rows={2} maxLength={200}
            placeholder="Resumen breve de la noticia..."
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition resize-none" />
          <div className="text-right text-xs text-neutral-400">{(form.extracto || '').length}/200</div>
        </div>

        <div>
          <label htmlFor="contenido" className="block text-sm font-medium text-neutral-700 mb-1">Contenido completo</label>
          <textarea id="contenido" name="contenido" value={form.contenido} onChange={handleFormChange} rows={10}
            placeholder="Escribe el contenido HTML completo de la noticia..."
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition resize-y font-mono" />
          <p className="text-xs text-neutral-400 mt-1">Puedes usar HTML básico: &lt;p&gt;, &lt;strong&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;</p>
        </div>

        <div>
          <span className="block text-sm font-medium text-neutral-700 mb-1">Imagen de portada</span>
          <div className="border-2 border-dashed border-neutral-200 rounded-lg p-4 text-center hover:border-primary transition-colors">
            <input type="file" id="imagen" accept="image/*" onChange={e => setImagen(e.target.files[0])} className="hidden" />
            <label htmlFor="imagen" className="cursor-pointer flex flex-col items-center gap-2 text-neutral-400 hover:text-primary transition-colors">
              <Image size={24} />
              <span className="text-sm">{imagen ? imagen.name : 'Haz clic para seleccionar imagen (max 5MB)'}</span>
            </label>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-5 mt-5">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="embedUrl" className="block text-sm font-medium text-neutral-700">
              Publicación de Redes Sociales
              <span className="ml-2 text-xs font-normal text-neutral-400">(Opcional)</span>
            </label>
            {/* <button type="button" onClick={handleAIGenerate} disabled={aiLoading} className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50">
              <Sparkles size={14} /> {aiLoading ? 'Extrayendo...' : 'Autocompletar con IA'}
            </button> */}
          </div>
          <p className="text-xs text-neutral-400 mb-2">
            Pega el código de inserción de Facebook, Instagram o X. En Facebook: 
            <strong className="text-neutral-600"> Compartir → Insertar → Copiar código</strong>. Luego presiona el botón mágico arriba para intentar autocompletar el título.
          </p>
          <textarea
            id="embedUrl"
            name="embedUrl"
            value={form.embedUrl}
            onChange={handleFormChange}
            rows={5}
            placeholder={'Ejemplo Facebook:\n<iframe src="https://www.facebook.com/plugins/post.php?href=..." ...></iframe>\n\nEjemplo YouTube:\nhttps://www.youtube.com/watch?v=...'}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition font-mono mb-3 text-neutral-600"
          />
          
          {form.embedUrl && form.embedUrl.trim().length > 0 && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Vista Previa del Embed</h4>
              <EmbedRenderer 
                className="w-full flex justify-center bg-white border border-neutral-100 rounded shadow-sm py-4 overflow-hidden [&_iframe]:max-w-full [&_iframe]:border-0"
                html={form.embedUrl}
              />
              
              {form.embedUrl.includes('<iframe') && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <h5 className="text-xs font-semibold text-neutral-600 mb-3">Ajuste de tamaño del contenedor (px)</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Ancho: <span className="font-semibold">{getIframeAttr('width') || 500}px</span>
                      </label>
                      <input 
                        type="range" min="300" max="800" step="5"
                        value={getIframeAttr('width') || 500}
                        onChange={(e) => handleAdjustIframe('width', e.target.value)}
                        className="w-full accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Alto: <span className="font-semibold">{getIframeAttr('height') || 500}px</span>
                      </label>
                      <input 
                        type="range" min="200" max="1000" step="5"
                        value={getIframeAttr('height') || 500}
                        onChange={(e) => handleAdjustIframe('height', e.target.value)}
                        className="w-full accent-primary"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-2 leading-tight">
                    Utiliza las barras para ajustar visualmente el tamaño. Ajusta el <strong>alto</strong> para eliminar espacios en blanco o evitar que los videos se corten. El código se actualizará automáticamente.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-100 rounded-lg p-4">
          <input type="checkbox" id="publicado" name="publicado" checked={form.publicado} onChange={handleFormChange}
            className="w-4 h-4 accent-primary" />
          <div>
            <label htmlFor="publicado" className="text-sm font-semibold text-neutral-700">Publicar inmediatamente</label>
            <p className="text-xs text-neutral-400">Si está marcado, la noticia se publicará visible de forma instantánea.</p>
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={() => navigate('/noticias')} className="px-4 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 transition">
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
