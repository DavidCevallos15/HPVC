import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Newspaper, ArrowRight, Filter } from 'lucide-react';
import EmbedRenderer from '../components/EmbedRenderer';
import api from '../api/axios';

const CATEGORIAS = ['Todos', 'Infraestructura', 'Salud Pública', 'Tecnología', 'Educación', 'Institución'];
const catColors = {
  'Infraestructura': 'bg-blue-100 text-blue-700',
  'Salud Pública':   'bg-green-100 text-green-700',
  'Tecnología':      'bg-purple-100 text-purple-700',
  'Educación':       'bg-orange-100 text-orange-700',
  'Institución':     'bg-primary-pale text-primary',
  'default':         'bg-neutral-100 text-gray',
};

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const cat = categoria !== 'Todos' ? `&categoria=${encodeURIComponent(categoria)}` : '';
    api.get(`/public/noticias?page=${page}&limit=9${cat}`)
      .then(r => { 
        setNoticias(r.data?.data || []); 
        setTotalPages(r.data?.meta?.totalPages || 1); 
      })
      .catch(() => {
        setNoticias([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [page, categoria]);

  const handleCat = (c) => { setCategoria(c); setPage(1); };

  const filtered = search
    ? noticias.filter(n => (n.titulo || '').toLowerCase().includes(search.toLowerCase()) || (n.extracto || '').toLowerCase().includes(search.toLowerCase()))
    : noticias;

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-16">
        <div className="container mx-auto px-6">
          <nav className="text-primary-pale text-sm mb-4">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <span className="mx-2">/</span>
            <span>Noticias</span>
          </nav>
          <h1 className="text-4xl font-semibold font-heading">Noticias Institucionales</h1>
          <p className="text-primary-pale mt-2">Mantente al día con las novedades del Hospital Verdi Cevallos.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
            <input type="text" placeholder="Buscar noticia..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-btn text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map(c => (
              <button key={c} onClick={() => handleCat(c)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${categoria === c ? 'bg-primary text-white border-primary' : 'bg-white text-gray border-neutral-200 hover:border-primary hover:text-primary'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => <div key={i} className="h-64 bg-neutral-200 rounded-card animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray">
            <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay noticias disponibles con los filtros actuales.</p>
          </div>
        ) : (
          <>
            <div className="columns-1 md:columns-2 lg:columns-2 xl:columns-3 gap-6 space-y-6">
              {filtered.map((n) => {
                if (n.embedUrl) {
                  return (
                    <div key={n.id} className="break-inside-avoid inline-block w-full mb-6 bg-white rounded-card shadow-card flex flex-col overflow-hidden h-auto transition-all duration-200 hover:-translate-y-1 hover:shadow-hero">
                      {/* Header con la categoría */}
                      <div className="p-4 pb-2 flex justify-between items-center bg-white">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${catColors[n.categoria] || catColors.default}`}>
                          {n.categoria}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {n.publicadoEn ? new Date(n.publicadoEn).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' }) : ''}
                        </span>
                      </div>
                      
                      {n.titulo && (
                        <div className="px-4 pb-2">
                          <h2 className="font-semibold font-heading text-dark text-sm leading-snug line-clamp-1" title={n.titulo}>
                            {n.titulo}
                          </h2>
                        </div>
                      )}

                      {/* Contenedor del Embed */}
                      <div className="w-full overflow-hidden">
                        <EmbedRenderer
                          html={n.embedUrl}
                          showDirectAccess={true}
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <Link key={n.id} to={`/noticias/${n.slug}`}
                    className="break-inside-avoid inline-block w-full mb-6 group bg-white rounded-card shadow-card hover:shadow-hero transition-all duration-200 hover:-translate-y-1 overflow-hidden flex flex-col">
                    {n.imagenUrl ? (
                      <div className="h-44 overflow-hidden">
                        <img src={`http://localhost:3001${n.imagenUrl}`} alt={n.titulo || 'Noticia'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="h-44 bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                        <Newspaper size={36} className="text-white/30" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-center mb-3">
                         <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start ${catColors[n.categoria] || catColors.default}`}>{n.categoria}</span>
                      </div>
                      <h2 className="font-semibold font-heading text-dark text-sm leading-snug group-hover:text-primary transition-colors line-clamp-3 flex-1">{n.titulo || 'Sin Título'}</h2>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
                        <span className="text-xs text-gray">
                          {n.publicadoEn ? new Date(n.publicadoEn).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </span>
                        <span className="text-primary text-xs font-medium flex items-center gap-1">Leer <ArrowRight size={11} /></span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-btn text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary text-white' : 'bg-white text-gray hover:bg-primary-pale hover:text-primary border border-neutral-200'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
