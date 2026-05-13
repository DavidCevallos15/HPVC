import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

export default function DirectorioPage() {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEsp, setFiltroEsp] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    Promise.all([
      api.get('/public/medicos'),
      api.get('/public/especialidades'),
    ]).then(([m, e]) => {
      setMedicos(m.data.data);
      setEspecialidades(e.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = medicos.filter((m) => {
    const matchSearch = m.nombre.toLowerCase().includes(search.toLowerCase());
    const matchEsp = filtroEsp ? String(m.especialidadId) === String(filtroEsp) : true;
    return matchSearch && matchEsp;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [search, filtroEsp]);

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white pt-32 pb-16">
        <div className="container mx-auto px-6">
          <nav className="text-primary-pale text-sm mb-4 flex items-center gap-2">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <span>/</span>
            <span>Directorio Médico</span>
          </nav>
          <h1 className="text-4xl font-semibold font-heading">Directorio Médico e Institucional</h1>
          <p className="text-primary-pale mt-2">Conozca a nuestros especialistas y personal en cada área.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Filtros */}
        <div className="bg-white rounded-card shadow-card p-5 mb-10 flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
            <input type="text" placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
          </div>
          <select value={filtroEsp} onChange={e => setFiltroEsp(e.target.value)}
            className="border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors sm:w-72">
            <option value="">Todas las áreas / especialidades</option>
            {especialidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-neutral-200 rounded-card animate-pulse" />)}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <p className="text-gray text-sm mb-6 text-center">{filtered.length} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentItems.map((m) => (
                <div key={m.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 hover:border-primary/50 hover:shadow-md transition-all p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary-pale border border-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                    {m.foto ? (
                      <img src={`http://localhost:3001${m.foto}`} alt={m.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-primary/70" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-dark text-base leading-tight truncate" title={m.nombre}>{m.nombre}</div>
                    <div className="text-primary text-sm mt-0.5 font-medium truncate" title={m.especialidad?.nombre}>{m.especialidad?.nombre}</div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray">
                <User size={40} className="mx-auto mb-3 opacity-30" />
                <p>No se encontraron registros con los filtros actuales.</p>
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border border-neutral-200 disabled:opacity-50 hover:bg-neutral-50 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1 flex-wrap justify-center max-w-sm">
                  {/* Para no mostrar demasiados botones si hay muchas páginas, mostramos un rango limitado o todas si son pocas */}
                  {[...Array(totalPages)].map((_, i) => {
                     // Solo mostrar páginas cercanas para no desbordar
                     if (totalPages > 10 && Math.abs(currentPage - (i + 1)) > 3 && i !== 0 && i !== totalPages - 1) {
                        if (i === 1 || i === totalPages - 2) return <span key={i} className="px-1 text-neutral-400">...</span>;
                        return null;
                     }
                     return (
                        <button 
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-primary text-white' : 'bg-white border border-neutral-200 text-gray hover:bg-neutral-50'}`}
                        >
                          {i + 1}
                        </button>
                     );
                  })}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white border border-neutral-200 disabled:opacity-50 hover:bg-neutral-50 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
