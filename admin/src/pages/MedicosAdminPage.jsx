import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, User } from 'lucide-react';
import api from '../api/axios';

export default function MedicosAdminPage() {
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Médicos</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestiona el directorio de profesionales de la salud.</p>
        </div>
        <button 
          onClick={() => navigate('/medicos/nuevo')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Agregar Médico
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
         <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o especialidad..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition" 
            />
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Médico</th>
                <th className="px-6 py-4">Especialidad</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-400">Cargando médicos...</td>
                 </tr>
              ) : filtered.length === 0 ? (
                 <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-400">No se encontraron médicos.</td>
                 </tr>
              ) : filtered.map(medico => (
                <tr key={medico.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                           {medico.foto ? (
                              <img src={`http://localhost:3001${medico.foto}`} alt={medico.nombre} className="w-full h-full object-cover" />
                           ) : (
                              <User size={18} className="text-gray-400" />
                           )}
                        </div>
                        <div>
                           <div className="font-medium text-gray-900">{medico.nombre}</div>
                           <div className="text-xs text-gray-500">{medico.email || 'Sin correo'}</div>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{medico.especialidad?.nombre}</td>
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
      </div>
    </div>
  );
}
