import React, { useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import api from '../api/axios';

const initialState = {
  noticias: [],
  loading: true,
  search: '',
  deleting: null,
  currentPage: 1
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true };
    case 'FETCH_SUCCESS': return { ...state, noticias: action.payload, loading: false };
    case 'SET_SEARCH': return { ...state, search: action.payload, currentPage: 1 };
    case 'SET_PAGE': return { ...state, currentPage: action.payload };
    case 'SET_DELETING': return { ...state, deleting: action.payload };
    default: return state;
  }
}

export default function NoticiasAdminPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { noticias, loading, search, deleting, currentPage } = state;
  const itemsPerPage = 9;

  const fetchNoticias = () => {
    dispatch({ type: 'FETCH_START' });
    api.get('/admin/noticias')
      .then(r => dispatch({ type: 'FETCH_SUCCESS', payload: r.data?.data || [] }))
      .catch(() => dispatch({ type: 'FETCH_SUCCESS', payload: [] }));
  };

  useEffect(() => { fetchNoticias(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta noticia?')) return;
    dispatch({ type: 'SET_DELETING', payload: id });
    try { await api.delete(`/admin/noticias/${id}`); fetchNoticias(); }
    catch { alert('Error al eliminar.'); }
    finally { dispatch({ type: 'SET_DELETING', payload: null }); }
  };

  const filtered = noticias.filter(n => (n.titulo || '').toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold font-heading text-neutral-900">Noticias</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{noticias.length} artículo{noticias.length !== 1 ? 's' : ''} en total</p>
        </div>
        <Link to="/noticias/nueva" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
          <Plus size={16} /> Nueva noticia
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input type="text" placeholder="Buscar noticia..." value={search} onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary transition" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-neutral-100 rounded animate-pulse" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Título</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600 hidden sm:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600 hidden md:table-cell">Fecha</th>
                <th className="text-center px-4 py-3 font-semibold text-neutral-600">Estado</th>
                <th className="text-right px-4 py-3 font-semibold text-neutral-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {paginated.map((n) => (
                <tr key={n.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-neutral-900 line-clamp-1">{n.titulo || 'Sin título'}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs px-2 py-0.5 bg-primary-pale text-primary rounded-full">{n.categoria}</span>
                  </td>
                  <td suppressHydrationWarning className="px-4 py-3 text-neutral-500 hidden md:table-cell">
                    {n.creadoEn ? new Date(n.creadoEn).toLocaleDateString('es-EC') : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {n.publicado
                      ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><Eye size={11} /> Publicado</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full"><EyeOff size={11} /> Borrador</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/noticias/editar/${n.id}`}
                        className="p-1.5 text-neutral-400 hover:text-primary hover:bg-primary-pale rounded transition-colors">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-neutral-400">No hay noticias.</td></tr>
              )}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <span className="text-sm text-neutral-500">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length}
            </span>
            <div className="flex gap-1 items-center">
              {currentPage > 1 && (
                <button 
                  onClick={() => dispatch({ type: 'SET_PAGE', payload: 1 })}
                  className="px-3 py-1 text-xs font-semibold bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 rounded transition mr-2"
                >
                  Volver al inicio
                </button>
              )}
              <button 
                onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.max(1, currentPage - 1) })}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-neutral-200 rounded hover:bg-white disabled:opacity-50"
              >
                Anterior
              </button>
              <button 
                onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.min(totalPages, currentPage + 1) })}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-neutral-200 rounded hover:bg-white disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
