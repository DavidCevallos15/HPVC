import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Newspaper } from 'lucide-react';
import EmbedRenderer from '../components/EmbedRenderer';
import api from '../api/axios';

export default function NoticiaDetallePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/public/noticias/${slug}`)
      .then(r => setNoticia(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="container mx-auto px-6 py-20 max-w-3xl">
      <div className="h-64 bg-gray-100 rounded-card animate-pulse mb-6" />
      <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}</div>
    </div>
  );

  if (error || !noticia) return (
    <div className="container mx-auto px-6 py-20 text-center">
      <Newspaper size={48} className="mx-auto text-gray opacity-30 mb-4" />
      <h2 className="text-2xl font-bold text-dark mb-2">Noticia no encontrada</h2>
      <p className="text-gray mb-6">La noticia que buscas no existe o fue eliminada.</p>
      <Link to="/noticias" className="btn-primario inline-flex">← Volver a Noticias</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-3 flex items-center gap-2 text-sm text-gray">
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/noticias" className="hover:text-primary transition-colors">Noticias</Link>
          <span>/</span>
          <span className="text-dark line-clamp-1">{noticia.titulo || 'Detalle'}</span>
        </div>
      </div>

      <article className="container mx-auto px-6 py-10 max-w-3xl">
        {/* Button back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary text-sm font-medium mb-6 hover:underline">
          <ArrowLeft size={16} /> Volver
        </button>

        {/* Hero image o publicacion */}
        {noticia.embedUrl ? (
          <div className="mb-8 flex justify-center w-full">
            <EmbedRenderer 
              className="w-full flex justify-center bg-white shadow-sm border border-gray-100 rounded-lg p-4 [&>iframe]:w-full [&>iframe]:max-w-[100%] overflow-hidden [&_blockquote]:my-0 [&_blockquote]:mx-auto"
              html={noticia.embedUrl}
            />
          </div>
        ) : noticia.imagenUrl ? (
          <div className="w-full h-64 md:h-96 rounded-card overflow-hidden mb-8">
            <img src={`http://localhost:3001${noticia.imagenUrl}`} alt={noticia.titulo || 'Noticia'} className="w-full h-full object-cover" />
          </div>
        ) : null}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 bg-primary-pale text-primary rounded-full">
            <Tag size={11} /> {noticia.categoria}
          </span>
          {noticia.publicadoEn && (
            <span className="inline-flex items-center gap-1 text-xs text-gray">
              <Calendar size={11} />
              {new Date(noticia.publicadoEn).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold font-heading text-dark leading-tight mb-4">{noticia.titulo || 'Sin Título'}</h1>
        {noticia.extracto && <p className="text-lg text-gray leading-relaxed mb-8 border-l-4 border-primary-pale pl-4">{noticia.extracto}</p>}

        <div
          className="prose prose-lg max-w-none text-dark [&>p]:mb-4 [&>p]:leading-relaxed [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-primary [&>h2]:mt-8 [&>h2]:mb-4 [&>strong]:text-dark"
          dangerouslySetInnerHTML={{ __html: noticia.contenido }}
        />



        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link to="/noticias" className="btn-outline inline-flex">
            <ArrowLeft size={16} /> Ver más noticias
          </Link>
        </div>
      </article>
    </div>
  );
}
