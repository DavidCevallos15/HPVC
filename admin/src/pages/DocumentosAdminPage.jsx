import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Edit, Search, Loader2, BookOpen, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import api from '../api/axios';
import JSZip from 'jszip';
import Skeleton from '../components/ui/Skeleton';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');


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
  const itemsPerPage = 9; // Exactamente 9 por página como solicitó el usuario para evitar scroll
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  const [formData, setFormData] = useState({ titulo: '', tipo: 'guia', driveUrl: '' });
  const [selectedFiles, setSelectedFiles] = useState([]); // { id, file, titulo, tipo }
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState('');
  const [parsingZip, setParsingZip] = useState(false);

  // Estados para Reemplazo Masivo en cola de subida y su historial (Deshacer)
  const [bulkFind, setBulkFind] = useState('');
  const [bulkReplace, setBulkReplace] = useState('');
  const [queueHistory, setQueueHistory] = useState([]); // Historial de cola local para deshacer (Ctrl+Z)

  // Estados para Reemplazo Masivo en Base de Datos (BD) y su historial (Deshacer)
  const [showBulkDbPanel, setShowBulkDbPanel] = useState(false);
  const [bulkFindDb, setBulkFindDb] = useState('');
  const [bulkReplaceDb, setBulkReplaceDb] = useState('');
  const [replacingDb, setReplacingDb] = useState(false);
  const [dbHistory, setDbHistory] = useState([]); // Historial de BD para deshacer cambios

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchDocumentos = async () => {
    try {
      const { data } = await api.get('/admin/documentos?limit=1000');
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
    setSelectedFiles([]);
    setSelectedDoc(null);
    setUploadProgress({ current: 0, total: 0 });
    setBulkFind('');
    setBulkReplace('');
    setQueueHistory([]); // Limpiar historial local
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
    setSelectedFiles([]);
    setQueueHistory([]);
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

  // Función de sanitización de nombres para títulos sugeridos en el frontend
  const cleanFileNameToTitle = (filename) => {
    const rawName = filename.replace(/\.[^/.]+$/, ''); // quitar extensión
    return rawName
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, c => c.toUpperCase()); // Capitalizar cada palabra
  };

  // Procesamiento local de archivos (PDFs o ZIP)
  const handleFileChange = async (e) => {
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (!files || files.length === 0) return;

    const newItems = [];
    setParsingZip(true);

    try {
      for (const file of files) {
        const nameLow = file.name.toLowerCase();

        if (nameLow.endsWith('.zip')) {
          // Extraer ZIP localmente usando JSZip en el navegador
          const zip = new JSZip();
          const contents = await zip.loadAsync(file);
          
          for (const [filename, fileEntry] of Object.entries(contents.files)) {
            // Omitir directorios y archivos de sistema de macOS
            if (filename.toLowerCase().endsWith('.pdf') && !filename.includes('__MACOSX')) {
              const blob = await fileEntry.async('blob');
              // Extraer el nombre base del archivo
              const baseName = filename.split('/').pop();
              const extractedFile = new File([blob], baseName, { type: 'application/pdf' });
              
              newItems.push({
                id: Math.random().toString(36).substr(2, 9),
                file: extractedFile,
                titulo: cleanFileNameToTitle(baseName),
                tipo: formData.tipo || 'guia'
              });
            }
          }
        } else if (nameLow.endsWith('.pdf')) {
          newItems.push({
            id: Math.random().toString(36).substr(2, 9),
            file: file,
            titulo: cleanFileNameToTitle(file.name),
            tipo: formData.tipo || 'guia'
          });
        } else {
          alert(`El archivo "${file.name}" no es soportado. Solo se permiten archivos PDF o ZIP.`);
        }
      }

      if (newItems.length > 0) {
        // Guardar estado en historial antes de añadir
        setQueueHistory(prev => [...prev, [...selectedFiles]]);
        setSelectedFiles(prev => [...prev, ...newItems]);
      }
    } catch (err) {
      console.error(err);
      alert('Error al procesar el archivo ZIP localmente.');
    } finally {
      setParsingZip(false);
      // Resetear el input para permitir volver a subir el mismo archivo si es necesario
      if (e.target) e.target.value = '';
    }
  };

  // Guardar historial para deshacer una acción específica
  const saveLocalHistory = () => {
    // Clonación profunda simple de los elementos de la cola actual
    const currentQueueCopy = selectedFiles.map(item => ({ ...item }));
    setQueueHistory(prev => [...prev, currentQueueCopy]);
  };

  // Operaciones de edición individual en la lista de vistas previas
  const updateFileItem = (id, field, value) => {
    setSelectedFiles(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeFileItem = (id) => {
    saveLocalHistory();
    setSelectedFiles(prev => prev.filter(item => item.id !== id));
  };

  const clearAllSelectedFiles = () => {
    saveLocalHistory();
    setSelectedFiles([]);
  };

  // Previsualización del PDF en un iframe
  const handlePreviewPDF = (fileObject) => {
    const url = URL.createObjectURL(fileObject);
    setPreviewPdfUrl(url);
  };

  // Buscar y reemplazar en la cola de subida local
  const handleBulkReplaceLocal = () => {
    if (!bulkFind) return;
    
    saveLocalHistory(); // Guardar historial antes del reemplazo

    setSelectedFiles(prev => prev.map(item => {
      // Reemplazo insensible a mayúsculas/minúsculas de manera global
      const escapedFind = bulkFind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedFind, 'gi');
      const newTitle = item.titulo.replace(regex, bulkReplace).replace(/\s+/g, ' ').trim();
      return { ...item, titulo: newTitle };
    }));

    setBulkFind('');
    setBulkReplace('');
  };

  // Función Deshacer (Undo / Control Z) para la cola local
  const handleUndoLocal = () => {
    if (queueHistory.length === 0) return;
    const previousState = queueHistory[queueHistory.length - 1];
    setSelectedFiles(previousState);
    setQueueHistory(prev => prev.slice(0, -1)); // Remover el último del historial
  };

  // Buscar y reemplazar en la base de datos en lote
  const handleBulkReplaceDb = async () => {
    if (!bulkFindDb) return;
    const docsToUpdate = documentos.filter(d => d.titulo.toLowerCase().includes(bulkFindDb.toLowerCase()));
    
    if (docsToUpdate.length === 0) {
      alert('No se encontraron documentos en la base de datos que coincidan con la búsqueda.');
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas reemplazar "${bulkFindDb}" por "${bulkReplaceDb}" en los ${docsToUpdate.length} documentos encontrados en la base de datos?`)) {
      return;
    }

    setReplacingDb(true);
    
    // Guardar el estado actual en el historial de BD para poder deshacer
    const currentDbState = docsToUpdate.map(d => ({
      id: d.id,
      titulo: d.titulo,
      tipo: d.tipo,
      driveUrl: d.driveUrl
    }));
    setDbHistory(currentDbState);

    try {
      for (const doc of docsToUpdate) {
        const escapedFind = bulkFindDb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const newTitle = doc.titulo.replace(new RegExp(escapedFind, 'gi'), bulkReplaceDb).replace(/\s+/g, ' ').trim();
        const data = new FormData();
        data.append('titulo', newTitle);
        data.append('tipo', doc.tipo);
        if (doc.driveUrl) data.append('driveUrl', doc.driveUrl);
        
        await api.put(`/admin/documentos/${doc.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      
      alert('Reemplazo masivo en la base de datos completado exitosamente.');
      setBulkFindDb('');
      setBulkReplaceDb('');
      fetchDocumentos();
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error durante el reemplazo en lote. Algunos documentos podrían haberse actualizado.');
    } finally {
      setReplacingDb(false);
    }
  };

  // Función Deshacer (Undo) para restaurar nombres en la Base de Datos
  const handleUndoDb = async () => {
    if (dbHistory.length === 0) return;
    
    if (!confirm(`¿Deseas deshacer el último reemplazo masivo y restaurar los nombres originales de ${dbHistory.length} documentos en la base de datos?`)) {
      return;
    }

    setReplacingDb(true);
    try {
      for (const doc of dbHistory) {
        const data = new FormData();
        data.append('titulo', doc.titulo);
        data.append('tipo', doc.tipo);
        if (doc.driveUrl) data.append('driveUrl', doc.driveUrl);
        
        await api.put(`/admin/documentos/${doc.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      
      alert('Se han restaurado los nombres originales en la base de datos exitosamente.');
      setDbHistory([]); // Limpiar historial una vez deshecho
      fetchDocumentos();
    } catch (err) {
      console.error(err);
      alert('Error al intentar restaurar algunos nombres en la base de datos.');
    } finally {
      setReplacingDb(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e);
  };

  // Subida de archivos y enlaces a la API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (modalMode === 'create') {
        // Caso A: Solo enlace externo de Drive
        if (selectedFiles.length === 0 && formData.driveUrl) {
          if (!formData.titulo) {
            alert('El título es requerido para enlaces externos.');
            setSaving(false);
            return;
          }
          const data = new FormData();
          data.append('titulo', formData.titulo);
          data.append('tipo', formData.tipo);
          data.append('driveUrl', formData.driveUrl);

          await api.post('/admin/documentos', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        // Caso B: Carga masiva de múltiples archivos previsualizados
        else if (selectedFiles.length > 0) {
          setUploadProgress({ current: 0, total: selectedFiles.length });
          
          // Subir uno por uno para asegurar que el backend procese cada título/categoría personalizado
          for (let i = 0; i < selectedFiles.length; i++) {
            const item = selectedFiles[i];
            const data = new FormData();
            data.append('titulo', item.titulo);
            data.append('tipo', item.tipo);
            data.append('archivo', item.file);
            
            // Si colocaron un driveUrl global, asociarlo a cada archivo
            if (formData.driveUrl) {
              data.append('driveUrl', formData.driveUrl);
            }

            await api.post('/admin/documentos', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUploadProgress(prev => ({ ...prev, current: i + 1 }));
          }
        } else {
          alert('Debes arrastrar o seleccionar archivos PDF/ZIP, o proveer un enlace de Drive.');
          setSaving(false);
          return;
        }
      } 
      // Modo Edición
      else {
        const data = new FormData();
        data.append('titulo', formData.titulo);
        data.append('tipo', formData.tipo);
        data.append('driveUrl', formData.driveUrl);
        
        // Si hay una preselección de archivo para reemplazar
        if (selectedFiles.length > 0) {
          data.append('archivo', selectedFiles[0].file);
        }

        await api.put(`/admin/documentos/${selectedDoc.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setShowModal(false);
      fetchDocumentos();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Error al guardar el documento. Verifica los datos.';
      alert(errMsg);
    } finally {
      setSaving(false);
      setUploadProgress({ current: 0, total: 0 });
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
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between gap-4 flex-wrap">
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
          
          <button 
            type="button"
            onClick={() => setShowBulkDbPanel(!showBulkDbPanel)}
            className="text-xs font-semibold text-primary hover:text-primary-light flex items-center gap-1.5 px-3 py-2 bg-primary/5 hover:bg-primary/10 rounded-lg transition"
          >
            Buscar y Reemplazar Nombres (En BD)
          </button>
        </div>

        {/* Panel de Reemplazo Masivo en Base de Datos */}
        {showBulkDbPanel && (
          <div className="p-4 bg-yellow-50/50 border-b border-neutral-100 space-y-3 animate-fade-in">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-yellow-800 uppercase tracking-wider">
                <AlertCircle size={14} /> Buscar y Reemplazar Nombres en la Base de Datos
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
              Esta herramienta buscará coincidencias en todos los títulos guardados de la base de datos y te permitirá reemplazarlas en lote.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">Palabra a buscar</label>
                <input 
                  type="text"
                  placeholder="Ej: signed"
                  value={bulkFindDb}
                  onChange={e => setBulkFindDb(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">Reemplazar con</label>
                <input 
                  type="text"
                  placeholder="Ej: (dejar vacío para eliminar)"
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
                Se encontraron <span className="text-primary font-bold">{documentos.filter(d => d.titulo.toLowerCase().includes(bulkFindDb.toLowerCase())).length}</span> documentos que contienen "{bulkFindDb}" en la base de datos.
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
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
                        <a href={`${API_ORIGIN}${doc.archivoUrl}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">PDF Local</a>
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

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h3 className="font-semibold text-neutral-900">
                {modalMode === 'create' ? 'Nuevo Documento' : 'Editar Documento'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600 transition">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Indicador de carga de archivos ZIP locales */}
              {parsingZip && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span>Procesando archivo ZIP localmente... cargando documentos PDF...</span>
                </div>
              )}

              {/* Indicador de subida masiva activa */}
              {saving && uploadProgress.total > 0 && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm font-semibold text-primary">
                    <span>Subiendo y guardando documentos...</span>
                    <span>{uploadProgress.current} / {uploadProgress.total}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <form id="docForm" onSubmit={handleSubmit} className="space-y-4">
                
                {/* Zona de Carga (Drag and Drop) — Solo en creación */}
                {modalMode === 'create' && (
                  <div className="space-y-4">
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${isDragging ? 'border-primary bg-blue-50 scale-[0.99]' : 'border-neutral-300 hover:border-primary'}`}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                    >
                      <label className="flex flex-col items-center justify-center cursor-pointer gap-2">
                        <FileText size={36} className={isDragging ? 'text-primary' : 'text-neutral-400'} />
                        <div className="text-sm font-medium text-neutral-700">
                          Arrastra múltiples PDFs o un archivo ZIP aquí o <span className="text-primary font-semibold">explora</span>
                        </div>
                        <div className="text-xs text-neutral-400">
                          Soporta archivos <strong>.PDF</strong> individuales/múltiples y archivos <strong>.ZIP</strong>
                        </div>
                        <input type="file" accept=".pdf,.zip" multiple onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>

                    <div className="relative flex items-center justify-center py-1">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200"></div></div>
                      <span className="relative px-3 bg-white text-xs font-semibold text-neutral-400 uppercase tracking-wider">O vincula enlace externo</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">URL de Enlace (Drive / Externo)</label>
                      <input type="url" value={formData.driveUrl} onChange={e => setFormData({ ...formData, driveUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="https://..." />
                    </div>
                  </div>
                )}

                {/* VISTA PREVIA Y EDICIÓN DE LOTE (Múltiples archivos seleccionados) */}
                {modalMode === 'create' && selectedFiles.length > 0 && (
                  <div className="space-y-3 bg-neutral-50/50 border border-neutral-200 rounded-xl p-4 animate-fade-in">
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                      <span className="text-sm font-semibold text-neutral-700">Lista de Documentos a Subir ({selectedFiles.length})</span>
                      <button 
                        type="button" 
                        onClick={clearAllSelectedFiles} 
                        className="text-xs text-red-600 hover:underline"
                      >
                        Limpiar todos
                      </button>
                    </div>

                    {/* SECCIÓN DE REEMPLAZO MASIVO (ESTILO WORD) EN COLA LOCAL */}
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 space-y-2">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider block">Reemplazo Masivo en Nombres (Cola Actual)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          placeholder="Buscar texto (ej: signed)" 
                          value={bulkFind}
                          onChange={e => setBulkFind(e.target.value)}
                          className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                        />
                        <input 
                          type="text" 
                          placeholder="Reemplazar con (ej: dejar vacío para borrar)" 
                          value={bulkReplace}
                          onChange={e => setBulkReplace(e.target.value)}
                          className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex justify-between items-center gap-2 pt-1 flex-wrap">
                        <span className="text-[11px] text-neutral-500">
                          {bulkFind ? `Se encontraron ${selectedFiles.filter(f => f.titulo.toLowerCase().includes(bulkFind.toLowerCase())).length} coincidencias` : 'Introduce un texto a buscar'}
                        </span>
                        
                        <div className="flex gap-2">
                          {queueHistory.length > 0 && (
                            <button
                              type="button"
                              onClick={handleUndoLocal}
                              className="px-2.5 py-1 bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-300 transition flex items-center gap-1 shadow-sm"
                              title="Deshacer el último cambio de nombres o eliminación"
                            >
                              <RotateCcw size={12} /> Deshacer
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleBulkReplaceLocal}
                            disabled={!bulkFind}
                            className="px-3.5 py-1 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-light disabled:opacity-50 transition shadow-sm"
                          >
                            Reemplazar Todos
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* LISTA SCROLLABLE DE ARCHIVOS CON DETALLES */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {selectedFiles.map((item, index) => (
                        <div key={item.id} className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 bg-white border border-neutral-200 rounded-xl shadow-sm">
                          {/* Campo del Título */}
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xs font-semibold text-neutral-400 w-5 shrink-0 text-center">{index + 1}</span>
                            <FileText size={16} className="text-primary shrink-0" />
                            <input 
                              type="text" 
                              required
                              value={item.titulo} 
                              onChange={(e) => updateFileItem(item.id, 'titulo', e.target.value)}
                              className="flex-1 min-w-0 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                              placeholder="Título del documento..."
                            />
                          </div>

                          {/* Selección de Categoría + Botones de Acción */}
                          <div className="flex items-center gap-2 justify-between shrink-0 pl-7 md:pl-0">
                            <select 
                              value={item.tipo} 
                              onChange={(e) => updateFileItem(item.id, 'tipo', e.target.value)}
                              className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:border-primary focus:bg-white transition shrink-0"
                            >
                              {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>

                            <div className="flex gap-1 shrink-0">
                              <button 
                                type="button"
                                onClick={() => handlePreviewPDF(item.file)}
                                className="px-2.5 py-1 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-medium transition"
                                title="Ver PDF completo"
                              >
                                Ver PDF
                              </button>
                              <button 
                                type="button"
                                onClick={() => removeFileItem(item.id)}
                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Remover de la lista"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campos Tradicionales de Edición o para Enlaces Externos */}
                {((modalMode === 'edit') || (modalMode === 'create' && selectedFiles.length === 0)) && (
                  <div className="space-y-4 p-4 bg-neutral-50 border border-neutral-100 rounded-xl">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Título del Documento *</label>
                      <input 
                        required={modalMode === 'edit' || (modalMode === 'create' && selectedFiles.length === 0 && formData.driveUrl)} 
                        type="text" 
                        value={formData.titulo} 
                        onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                        placeholder="Ej: Guía de Práctica Clínica de Hipertensión" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría General *</label>
                      <select required value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white">
                        {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Modo Editar: opción de reemplazar archivo */}
                {modalMode === 'edit' && (
                  <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl space-y-3">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Reemplazar archivo adjunto (opcional)</p>
                    <div className="flex items-center gap-3">
                      <input type="file" accept=".pdf,.zip" onChange={handleFileChange}
                        className="flex-1 text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                      {selectedFiles.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => handlePreviewPDF(selectedFiles[0].file)}
                          className="px-3 py-1.5 text-blue-600 hover:underline text-sm font-medium"
                        >
                          Ver PDF
                        </button>
                      )}
                    </div>
                    {selectedDoc?.archivoUrl && selectedFiles.length === 0 && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12}/> Ya tiene un archivo guardado. Sube uno nuevo solo si deseas reemplazarlo.</p>
                    )}
                  </div>
                )}

              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50/50">
              <button onClick={() => setShowModal(false)} type="button" className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition">
                Cancelar
              </button>
              <button form="docForm" type="submit" disabled={saving || parsingZip}
                className="px-5 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-light rounded-lg transition disabled:opacity-50 flex items-center gap-2 shadow-sm">
                {(saving || parsingZip) && <Loader2 size={16} className="animate-spin" />}
                {modalMode === 'create' 
                  ? (selectedFiles.length > 1 ? `Subir ${selectedFiles.length} Documentos` : 'Guardar Documento') 
                  : 'Guardar Cambios'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GIGANTE DE VISTA PREVIA DEL PDF EN VIVO */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                <BookOpen size={18} className="text-primary" /> Previsualización del Documento
              </h3>
              <button 
                onClick={() => { URL.revokeObjectURL(previewPdfUrl); setPreviewPdfUrl(''); }} 
                className="text-neutral-400 hover:text-neutral-600 transition text-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 bg-neutral-100 p-2">
              <iframe src={previewPdfUrl} className="w-full h-full border-0 rounded-xl" title="PDF Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
