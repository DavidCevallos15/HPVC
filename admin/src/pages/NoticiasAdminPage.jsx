import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import api from '../api/axios';

export default function NoticiasAdminPage() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchNoticias = () => {
    setLoading(true);
    api.get('/admin/noticias').then(r => setNoticias(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchNoticias(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta noticia?')) return;
    setDeleting(id);
    try { await api.delete(`/admin/noticias/${id}`); fetchNoticias(); }
    catch { alert('Error al eliminar.'); }
    finally { setDeleting(null); }
  };

  const filtered = noticias.filter(n => (n.titulo || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Noticias</h1>
          <p className="text-gray-500 text-sm mt-0.5">{noticias.length} artículo{noticias.length !== 1 ? 's' : ''} en total</p>
        </div>
        <Link to="/noticias/nueva" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
          <Plus size={16} /> Nueva noticia
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar noticia..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Título</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Fecha</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 line-clamp-1">{n.titulo || 'Sin título'}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs px-2 py-0.5 bg-primary-pale text-primary rounded-full">{n.categoria}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {n.creadoEn ? new Date(n.creadoEn).toLocaleDateString('es-EC') : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {n.publicado
                      ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><Eye size={11} /> Publicado</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"><EyeOff size={11} /> Borrador</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/noticias/editar/${n.id}`}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-pale rounded transition-colors">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No hay noticias.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
