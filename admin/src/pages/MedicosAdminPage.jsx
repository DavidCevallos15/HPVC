import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, User } from 'lucide-react';
import api from '../api/axios';

export default function MedicosAdminPage() {
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchMedicos = () => {
    setLoading(true);
    api.get('/admin/medicos')
      .then(res => setMedicos(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMedicos();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar a este médico?')) {
      try {
        await api.delete(`/admin/medicos/${id}`);
        fetchMedicos();
      } catch (err) {
        alert('Error al eliminar el médico.');
      }
    }
  };

  const filtered = medicos.filter(m => 
    m.nombre.toLowerCase().includes(search.toLowerCase()) || 
    m.especialidad?.nombre.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold font-heading text-neutral-900">Médicos</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Gestiona el directorio de profesionales de la salud.</p>
        </div>
        <button 
          onClick={() => navigate('/medicos/nuevo')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Agregar Médico
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex gap-4">
         <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o especialidad..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary transition" 
            />
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 text-neutral-600 font-medium">
              <tr>
                <th className="px-6 py-4">Médico</th>
                <th className="px-6 py-4">Especialidad</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                 <tr>
                    <td colSpan="4" className="text-center py-8 text-neutral-400">Cargando médicos...</td>
                 </tr>
              ) : filtered.length === 0 ? (
                 <tr>
                    <td colSpan="4" className="text-center py-8 text-neutral-400">No se encontraron médicos.</td>
                 </tr>
              ) : paginated.map(medico => (
                <tr key={medico.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden shrink-0">
                           {medico.foto ? (
                              <img src={`http://localhost:3001${medico.foto}`} alt={medico.nombre} className="w-full h-full object-cover" />
                           ) : (
                              <User size={18} className="text-neutral-400" />
                           )}
                        </div>
                        <div>
                           <div className="font-medium text-neutral-900">{medico.nombre}</div>
                           <div className="text-xs text-neutral-500">{medico.email || 'Sin correo'}</div>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{medico.especialidad?.nombre}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${medico.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {medico.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => navigate(`/medicos/editar/${medico.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                         <Edit2 size={16} />
                       </button>
                       <button onClick={() => handleDelete(medico.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <span className="text-sm text-neutral-500">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length}
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-neutral-200 rounded hover:bg-white disabled:opacity-50"
              >
                Anterior
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
