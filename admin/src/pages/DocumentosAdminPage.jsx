import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Edit, Search, Loader2, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const TIPOS = [
  { id: 'guia', label: 'Guías Clínicas' },
  { id: 'protocolo', label: 'Protocolos' },
  { id: 'manual', label: 'Manuales' },
  { id: 'normativa', label: 'Normativas' },
  { id: 'instructivo', label: 'Instructivos' },
  { id: 'estudio', label: 'Estudios' },
];

export default function DocumentosAdminPage() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  const [formData, setFormData] = useState({ titulo: '', tipo: 'guia', driveUrl: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchDocumentos = async () => {
    try {
      const { data } = await api.get('/admin/documentos');
      setDocumentos(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documentos.filter(d =>
    d.titulo.toLowerCase().includes(search.toLowerCase()) ||
    d.tipo.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ titulo: '', tipo: 'guia', driveUrl: '' });
    setFile(null);
    setSelectedDoc(null);
    setShowModal(true);
  };

  const openEditModal = (doc) => {
    setModalMode('edit');
    setSelectedDoc(doc);
    setFormData({
      titulo: doc.titulo || '',
      tipo: doc.tipo || 'guia',
      driveUrl: doc.driveUrl || '',
    });
    setFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) return;
    try {
      await api.delete(`/admin/documentos/${id}`);
      fetchDocumentos();
    } catch (err) {
      alert('Error al eliminar el documento');
    }
  };

  // Cuando el admin selecciona un PDF, pre-rellenar el título con el nombre del archivo
  // (limpiado de guiones/underscores y sin extensión) para que sea editable
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    // Solo auto-rellenar si el campo está vacío (modo crear) o el admin lo quiere
    if (!formData.titulo || modalMode === 'create') {
      // Limpiar nombre de archivo: quitar extensión, reemplazar _ y - por espacios, capitalizar
      const rawName = selectedFile.name.replace(/\.[^/.]+$/, ''); // quitar extensión
      const cleanName = rawName
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        // Capitalizar primera letra de cada palabra
        .replace(/\b\w/g, c => c.toUpperCase());
      setFormData(prev => ({ ...prev, titulo: cleanName }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const data = new FormData();
    data.append('titulo', formData.titulo);
    data.append('tipo', formData.tipo);
    if (formData.driveUrl) data.append('driveUrl', formData.driveUrl);
    if (file) data.append('archivo', file);

    try {
      if (modalMode === 'create') {
        if (!file && !formData.driveUrl) {
          alert('Debes subir un archivo o proveer una URL de Drive');
          setSaving(false);
          return;
        }
        await api.post('/admin/documentos', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.put(`/admin/documentos/${selectedDoc.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowModal(false);
      fetchDocumentos();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el documento. Verifica los datos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-heading text-neutral-900 flex items-center gap-2">
            <BookOpen size={28} className="text-primary" /> Documentos Clínicos
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Gestiona guías, protocolos y normativas.</p>
        </div>
        <button onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition shadow-sm">
          <Plus size={16} /> Nuevo Documento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-neutral-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Buscar documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-primary transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm">No se encontraron documentos.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                  <th className="px-6 py-3">Título</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Archivo / Enlace</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-neutral-100">
                {paginatedDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-neutral-50/50 transition">
                    <td className="px-6 py-4 font-medium text-neutral-900 max-w-md truncate" title={doc.titulo}>
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-neutral-400 shrink-0" />
                        <span className="truncate">{doc.titulo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 capitalize">
                      <span className="px-2.5 py-1 bg-neutral-100 rounded-full text-xs font-medium">
                        {TIPOS.find(t => t.id === doc.tipo)?.label || doc.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {doc.archivoUrl ? (
                        <a href={`http://localhost:3001${doc.archivoUrl}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">PDF Local</a>
                      ) : doc.driveUrl ? (
                        <a href={doc.driveUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Ver enlace</a>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(doc)}
                          className="p-1.5 text-neutral-400 hover:text-primary rounded-lg hover:bg-primary-pale transition"
                          title="Editar nombre y categoría"
                        >
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <span className="text-sm text-neutral-500">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredDocs.length)} de {filteredDocs.length}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h3 className="font-semibold text-neutral-900">
                {modalMode === 'create' ? 'Nuevo Documento' : 'Editar Documento'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600 transition">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="docForm" onSubmit={handleSubmit} className="space-y-4">
                
                {/* Subida de archivo — va primero en modo crear para auto-rellenar el título */}
                {modalMode === 'create' && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Subir Archivo PDF{' '}
                        <span className="font-normal text-blue-600 text-xs">(el nombre se sugiere automáticamente)</span>
                      </label>
                      <input type="file" accept=".pdf" onChange={handleFileChange}
                        className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                    </div>
                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-blue-200"></div>
                      <span className="flex-shrink-0 mx-4 text-blue-400 text-xs font-medium uppercase tracking-wider">O</span>
                      <div className="flex-grow border-t border-blue-200"></div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">URL de Enlace (Drive / Externo)</label>
                      <input type="url" value={formData.driveUrl} onChange={e => setFormData({ ...formData, driveUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="https://..." />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Título del Documento *
                    {modalMode === 'create' && file && (
                      <span className="ml-2 text-xs text-green-600 font-normal">✏️ Puedes editarlo antes de guardar</span>
                    )}
                  </label>
                  <input required type="text" value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Ej: Guía de Práctica Clínica de Hipertensión" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría *</label>
                  <select required value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>

                {/* En modo EDITAR: opción de reemplazar archivo */}
                {modalMode === 'edit' && (
                  <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl space-y-3">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Reemplazar archivo (opcional)</p>
                    <div>
                      <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])}
                        className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                      {selectedDoc?.archivoUrl && !file && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12}/> Ya tiene un archivo. Sube uno nuevo solo si deseas reemplazarlo.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">URL de Enlace (Drive / Externo)</label>
                      <input type="url" value={formData.driveUrl} onChange={e => setFormData({ ...formData, driveUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="https://..." />
                    </div>
                  </div>
                )}

              </form>
            </div>
            <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50/50">
              <button onClick={() => setShowModal(false)} type="button" className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition">
                Cancelar
              </button>
              <button form="docForm" type="submit" disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-light rounded-lg transition disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {modalMode === 'create' ? 'Guardar Documento' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
