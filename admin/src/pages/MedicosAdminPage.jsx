import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, User, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import api from '../api/axios';

export default function MedicosAdminPage() {
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Estados para Buscar y Reemplazar Masivo en Nombres de Médicos + Deshacer (Undo)
  const [showBulkDbPanel, setShowBulkDbPanel] = useState(false);
  const [bulkFindDb, setBulkFindDb] = useState('');
  const [bulkReplaceDb, setBulkReplaceDb] = useState('');
  const [replacingDb, setReplacingDb] = useState(false);
  const [dbHistory, setDbHistory] = useState([]); // Historial para deshacer cambios (Ctrl+Z)

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

  // Función de Reemplazo Masivo de Nombres en la Base de Datos
  const handleBulkReplaceDb = async () => {
    if (!bulkFindDb) return;
    const medicosToUpdate = medicos.filter(m => m.nombre.toLowerCase().includes(bulkFindDb.toLowerCase()));
    
    if (medicosToUpdate.length === 0) {
      alert('No se encontraron médicos en la base de datos que coincidan con la búsqueda.');
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas reemplazar "${bulkFindDb}" por "${bulkReplaceDb}" en los ${medicosToUpdate.length} médicos encontrados en la base de datos?`)) {
      return;
    }

    setReplacingDb(true);
    
    // Guardar el estado actual en el historial de BD para poder deshacer
    const currentDbState = medicosToUpdate.map(m => ({
      id: m.id,
      nombre: m.nombre,
      especialidadId: m.especialidadId,
      activo: m.activo,
      bio: m.bio,
      telefono: m.telefono,
      email: m.email
    }));
    setDbHistory(currentDbState);

    try {
      for (const medico of medicosToUpdate) {
        const escapedFind = bulkFindDb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const newNombre = medico.nombre.replace(new RegExp(escapedFind, 'gi'), bulkReplaceDb).replace(/\s+/g, ' ').trim();
        const data = new FormData();
        data.append('nombre', newNombre);
        data.append('especialidadId', medico.especialidadId);
        data.append('activo', medico.activo);
        if (medico.bio) data.append('bio', medico.bio);
        if (medico.telefono) data.append('telefono', medico.telefono);
        if (medico.email) data.append('email', medico.email);
        
        await api.put(`/admin/medicos/${medico.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      
      alert('Reemplazo masivo de nombres de médicos completado exitosamente.');
      setBulkFindDb('');
      setBulkReplaceDb('');
      setShowBulkDbPanel(false);
      fetchMedicos();
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error durante el reemplazo en lote. Algunos médicos podrían haberse actualizado.');
    } finally {
      setReplacingDb(false);
    }
  };

  // Función Deshacer (Undo) para restaurar nombres de médicos originales
  const handleUndoDb = async () => {
    if (dbHistory.length === 0) return;
    
    if (!confirm(`¿Deseas deshacer el último reemplazo masivo y restaurar los nombres originales de ${dbHistory.length} médicos en la base de datos?`)) {
      return;
    }

    setReplacingDb(true);
    try {
      for (const doc of dbHistory) {
        const data = new FormData();
        data.append('nombre', doc.nombre);
        data.append('especialidadId', doc.especialidadId);
        data.append('activo', doc.activo);
        if (doc.bio) data.append('bio', doc.bio);
        if (doc.telefono) data.append('telefono', doc.telefono);
        if (doc.email) data.append('email', doc.email);
        
        await api.put(`/admin/medicos/${doc.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      
      alert('Se han restaurado los nombres originales de los médicos exitosamente.');
      setDbHistory([]); // Limpiar historial una vez deshecho
      fetchMedicos();
    } catch (err) {
      console.error(err);
      alert('Error al intentar restaurar algunos nombres en la base de datos.');
    } finally {
      setReplacingDb(false);
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

      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex items-center justify-between gap-4 flex-wrap">
         <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o especialidad..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary transition" 
            />
         </div>

         <button 
            type="button"
            onClick={() => setShowBulkDbPanel(!showBulkDbPanel)}
            className="text-xs font-semibold text-primary hover:text-primary-light flex items-center gap-1.5 px-3 py-2 bg-primary/5 hover:bg-primary/10 rounded-lg transition"
          >
            Buscar y Reemplazar Nombres (En BD)
          </button>
      </div>

      {/* Panel de Reemplazo Masivo en Base de Datos para Médicos */}
      {showBulkDbPanel && (
        <div className="p-4 bg-yellow-50/50 rounded-xl border border-neutral-100 space-y-3 animate-fade-in shadow-sm">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-yellow-800 uppercase tracking-wider">
              <AlertCircle size={14} /> Buscar y Reemplazar Nombres de Médicos en la Base de Datos
            </div>
            {dbHistory.length > 0 && (
              <button
                type="button"
                onClick={handleUndoDb}
                disabled={replacingDb}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                <RotateCcw size={12} /> Deshacer Último Reemplazo ({dbHistory.length})
              </button>
            )}
          </div>
          <p className="text-xs text-neutral-500">
            Esta herramienta buscará coincidencias en todos los nombres del directorio de médicos y te permitirá reemplazarlas o limpiarlas en lote.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 mb-1">Palabra o caracter a buscar</label>
              <input 
                type="text"
                placeholder="Ej: Dr."
                value={bulkFindDb}
                onChange={e => setBulkFindDb(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 mb-1">Reemplazar con</label>
              <input 
                type="text"
                placeholder="Ej: (dejar vacío para borrar)"
                value={bulkReplaceDb}
                onChange={e => setBulkReplaceDb(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="button"
              onClick={handleBulkReplaceDb}
              disabled={!bulkFindDb || replacingDb}
              className="w-full px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-light disabled:opacity-50 transition flex items-center justify-center gap-2 h-[32px] shadow-sm"
            >
              {replacingDb && <Loader2 size={12} className="animate-spin" />}
              Reemplazar en Lote BD
            </button>
          </div>
          {bulkFindDb && (
            <div className="text-xs text-neutral-600 font-medium">
              Se encontraron <span className="text-primary font-bold">{medicos.filter(m => m.nombre.toLowerCase().includes(bulkFindDb.toLowerCase())).length}</span> médicos que contienen "{bulkFindDb}" en sus nombres.
            </div>
          )}
        </div>
      )}

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
            <div className="flex gap-1 items-center">
              {currentPage > 1 && (
                <button 
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-1 text-xs font-semibold bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 rounded transition mr-2"
                >
                  Volver al inicio
                </button>
              )}
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
