import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, Search, Filter } from 'lucide-react';
import api from '../api/axios';

const TIPOS = ['Todos', 'articulo', 'guia', 'protocolo', 'manual', 'estudio'];
const tipoLabel = { articulo: 'Artículo Científico', guia: 'Guía Clínica', protocolo: 'Protocolo', manual: 'Manual', estudio: 'Estudio' };
const tipoColors = {
  articulo:     'bg-purple-100 text-purple-700', guia:     'bg-blue-100 text-blue-700',
  protocolo: 'bg-green-100 text-green-700',   manual:   'bg-orange-100 text-orange-700',
  estudio:   'bg-primary-pale text-primary',
};

export default function DocumentosPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('Todos');

  useEffect(() => {
    const q = tipo !== 'Todos' ? `?tipo=${tipo}` : '';
    api.get(`/public/documentos${q}`).then(r => setDocs(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [tipo]);

  const filtered = search
    ? docs.filter(d => d.titulo.toLowerCase().includes(search.toLowerCase()))
    : docs;

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-16">
        <div className="container mx-auto px-6">
          <nav className="text-primary-pale text-sm mb-4">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <span className="mx-2">/</span>
            <span>Documentos Académicos</span>
          </nav>
          <h1 className="text-4xl font-bold font-heading">Documentos Académicos</h1>
          <p className="text-primary-pale mt-2">Accede a artículos científicos, guías clínicas, protocolos y manuales del HPVC.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
            <input type="text" placeholder="Buscar documento..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-btn text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex flex-wrap gap-2">
            {TIPOS.map(t => (
              <button key={t} onClick={() => setTipo(t)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors capitalize ${tipo === t ? 'bg-primary text-white border-primary' : 'bg-white text-gray border-gray-200 hover:border-primary hover:text-primary'}`}>
                {t === 'Todos' ? 'Todos' : tipoLabel[t] || t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-card animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay documentos disponibles.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc) => (
              <a key={doc.id} href={doc.driveUrl} target="_blank" rel="noopener noreferrer"
                className="group bg-white rounded-card shadow-card hover:shadow-hero transition-all duration-200 hover:-translate-y-1 p-5 flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary-pale rounded-card flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                  <BookOpen size={18} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tipoColors[doc.tipo] || 'bg-gray-100 text-gray'}`}>
                    {tipoLabel[doc.tipo] || doc.tipo}
                  </span>
                  <h3 className="font-bold text-dark text-sm mt-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">{doc.titulo}</h3>
                  <div className="flex items-center gap-1 mt-2 text-xs text-secondary font-medium">
                    <ExternalLink size={11} /> Abrir en Drive
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
