import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, FileText, X, ChevronLeft,
  Sparkles, Send, Loader2, BookMarked,
  Layers, Stethoscope, AlertCircle, FileBarChart, ShieldCheck
} from 'lucide-react';
import api from '../api/axios';
import Skeleton from '../components/ui/Skeleton';

// ── Configuración Visual ───────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CATEGORIAS = [
  { id: 'guia', label: 'Guías Clínicas', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', desc: 'Guías de Práctica Clínica del MSP' },
  { id: 'protocolo', label: 'Protocolos', icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', desc: 'Protocolos de atención hospitalaria' },
  { id: 'manual', label: 'Manuales', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', desc: 'Manuales de procedimientos médicos' },
  { id: 'normativa', label: 'Normativas', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', desc: 'Acuerdos ministeriales y normas' },
  { id: 'instructivo', label: 'Instructivos', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', desc: 'Instrucciones paso a paso' },
  { id: 'estudio', label: 'Estudios', icon: FileBarChart, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', desc: 'Artículos y estudios clínicos' },
];

const DEFAULT_CAT = { label: 'Otros Documentos', icon: FileText, color: 'text-neutral-600', bg: 'bg-neutral-50', border: 'border-neutral-100', desc: 'Documentos sin clasificar' };

// ── Componente: Chat IA Integrado ──────────────────────────────────────────
function AiChatPanel({ documento }) {
  const [pregunta, setPregunta] = useState('');
  const [mensajes, setMensajes] = useState([{
    role: 'assistant',
    content: `Hola. He leído "${documento.titulo}". ¿Qué deseas saber sobre este documento específicamente?`
  }]);
  const [cargando, setCargando] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensajes]);

  async function enviar() {
    const texto = pregunta.trim();
    if (!texto || cargando) return;
    setPregunta('');
    setMensajes(m => [...m, { role: 'user', content: texto }]);
    setCargando(true);
    try {
      const { data } = await api.post('/public/documentos/preguntar', {
        pregunta: texto,
        documentoId: documento.id
      });
      setMensajes(m => [...m, { role: 'assistant', content: data.respuesta, fuentes: data.fuentes }]);
    } catch {
      setMensajes(m => [...m, { role: 'assistant', content: 'Ocurrió un error al consultar. Intenta de nuevo.' }]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50 border-l border-neutral-200">
      <div className="px-4 py-3 bg-white border-b border-neutral-200 flex items-center gap-2 shrink-0">
        <Sparkles size={18} className="text-primary" />
        <div>
          <h3 className="font-semibold text-neutral-800 text-sm">Asistente HPVC</h3>
          <p className="text-[10px] text-neutral-500">Analizando el documento actual</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0 }}>
        {mensajes.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] text-sm rounded-2xl px-4 py-2.5 leading-relaxed shadow-sm
              ${m.role === 'user'
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-white text-neutral-700 border border-neutral-100 rounded-bl-sm'}`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.fuentes?.length > 0 && (
                <div className="mt-3 pt-2 border-t border-neutral-100">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Fuentes en este doc:</p>
                  {m.fuentes.map((f, fi) => (
                    <p key={fi} className="text-[11px] text-primary flex items-center gap-1.5">
                      <FileText size={10} /> Página {f.pagina || '?'}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-xs text-neutral-500 font-medium">Buscando en el documento...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-neutral-200 shrink-0">
        <div className="relative flex items-center">
          <input
            value={pregunta}
            onChange={e => setPregunta(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
            placeholder="Pregunta sobre este documento..."
            className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-full pl-4 pr-12 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            onClick={enviar}
            disabled={cargando || !pregunta.trim()}
            className="absolute right-1.5 p-1.5 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-40 transition-colors">
            <Send size={16} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente: Visor PDF + Chat ───────────────────────────────────────────
function PdfPreviewModal({ doc, onClose }) {
  const [showAi, setShowAi] = useState(false);

  useEffect(() => {
    // Bloquear scroll de la página de fondo
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const pdfUrl = doc.archivoUrl ? `${API_BASE.replace('/api', '')}${doc.archivoUrl}` : doc.driveUrl;

  return (
    <div className="fixed inset-0 z-[9999] flex bg-neutral-900/90 backdrop-blur-md">
      <div className="flex-1 flex flex-col h-full bg-white max-w-7xl mx-auto w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 shrink-0">
              <BookMarked size={20} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-neutral-900 text-lg truncate leading-tight">{doc.titulo}</h2>
              <p className="text-xs text-neutral-500 font-medium capitalize">{doc.tipo}</p>
            </div>
          </div>
          <button onClick={onClose} className="hidden sm:block p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors shrink-0">
            <X size={24} />
          </button>
        </div>

        {/* Layout Dividido: Visor */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-[2] h-full bg-neutral-100 relative">
            <iframe src={pdfUrl} title={doc.titulo} className="absolute inset-0 w-full h-full border-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página Principal ───────────────────────────────────────────────────────
export default function DocumentosPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const timerRef = useRef(null);

  const fetchDocs = useCallback(async (q) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    try {
      const { data } = await api.get(`/public/documentos?${params}`);
      setDocs(data.data || []);
    } catch { setDocs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchDocs(search), 300);
    return () => clearTimeout(timerRef.current);
  }, [search, fetchDocs]);

  // Si hay búsqueda global activa, ignoramos la categoría seleccionada para mostrar todos los resultados
  const isGlobalSearch = search.trim().length > 0;
  const docsToShow = isGlobalSearch
    ? docs
    : selectedCategory
      ? docs.filter(d => d.tipo === selectedCategory.id)
      : [];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header Hero */}
      <div className="bg-gradient-to-br from-primary via-blue-800 to-slate-900 text-white pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:24px_24px]"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <nav className="text-blue-200/80 text-sm mb-8 flex items-center gap-2 font-medium">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span>Biblioteca Clínica</span>
          </nav>
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Biblioteca Clínica <span className="text-blue-300">HPVC</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl font-light leading-relaxed mb-10">
              Accede a las Guías de Práctica Clínica, Protocolos y Normativas del Ministerio de Salud Pública, asistido por Inteligencia Artificial.
            </p>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search size={20} className="text-neutral-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Buscar cualquier documento por título..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white text-neutral-900 placeholder-gray-500 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all text-base font-medium"
              />
              {isGlobalSearch && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 -mt-10 relative z-20">
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm flex flex-col h-[200px]">
                <Skeleton className="w-14 h-14 rounded-2xl mb-5" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-6 flex-1" />
                <div className="flex justify-between items-center mt-auto">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : isGlobalSearch ? (
          /* Resultados de Búsqueda Global */
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 min-h-[400px]">
            <h2 className="text-2xl font-semibold text-neutral-800 mb-6 flex items-center gap-2">
              <Search size={24} className="text-primary" /> Resultados de búsqueda
            </h2>
            {docsToShow.length === 0 ? (
              <div className="text-center py-16 text-neutral-400">
                <FileText size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">No encontramos ningún documento con ese título.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {docsToShow.map(doc => {
                  const cat = CATEGORIAS.find(c => c.id === doc.tipo) || DEFAULT_CAT;
                  const Icono = cat.icon;
                  return (
                    <div key={doc.id} onClick={() => setPreviewDoc(doc)}
                      className="group bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all p-5 cursor-pointer flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-3">
                        <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
                          <Icono size={22} className={cat.color} />
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${cat.bg} ${cat.color}`}>
                          {cat.label}
                        </span>
                      </div>
                      <h3 className="font-semibold text-neutral-800 text-[15px] leading-snug group-hover:text-primary transition-colors flex-1">
                        {doc.titulo}
                      </h3>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : !selectedCategory ? (
          /* Vista 1: Tarjetas de Categorías (Tipo Especialidades) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIAS.map(cat => {
              const count = docs.filter(d => d.tipo === cat.id).length;
              if (count === 0 && cat.id !== 'guia') return null; // Ocultar vacías (excepto guías para que no se vea feo si carga)
              const Icono = cat.icon;
              return (
                <div key={cat.id} onClick={() => setSelectedCategory(cat)}
                  className={`bg-white rounded-3xl p-6 border ${cat.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden group`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${cat.bg} rounded-bl-full opacity-50 group-hover:scale-110 transition-transform`}></div>
                  <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center mb-5 relative z-10`}>
                    <Icono size={28} className={cat.color} />
                  </div>
                  <h2 className="text-2xl font-semibold text-neutral-800 mb-2 relative z-10">{cat.label}</h2>
                  <p className="text-neutral-500 text-sm mb-6 flex-1 relative z-10">{cat.desc}</p>
                  <div className="flex items-center justify-between relative z-10 border-t border-neutral-50 pt-4 mt-auto">
                    <span className="font-semibold text-neutral-900 text-lg">{count} <span className="text-sm text-neutral-400 font-medium">archivos</span></span>
                    <span className={`text-sm font-bold ${cat.color} group-hover:translate-x-1 transition-transform`}>Ver todos →</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Vista 2: Lista de Documentos de una Categoría */
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 min-h-[500px] overflow-hidden">
            <div className={`px-8 py-6 ${selectedCategory.bg} border-b ${selectedCategory.border} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedCategory(null)}
                  className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-neutral-50 text-neutral-600 transition-colors shrink-0">
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className={`text-2xl font-semibold ${selectedCategory.color} flex items-center gap-2`}>
                    <selectedCategory.icon size={24} /> {selectedCategory.label}
                  </h2>
                  <p className="text-sm text-neutral-600 mt-1">{docsToShow.length} documentos disponibles</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {docsToShow.length === 0 ? (
                <div className="text-center py-16 text-neutral-400">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No hay documentos en esta categoría aún.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {docsToShow.map(doc => (
                    <div key={doc.id} onClick={() => setPreviewDoc(doc)}
                      className="group flex items-start gap-4 p-4 rounded-2xl border border-neutral-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors cursor-pointer">
                      <div className={`w-12 h-12 rounded-xl ${selectedCategory.bg} flex items-center justify-center shrink-0`}>
                        <FileText size={20} className={selectedCategory.color} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800 text-[15px] leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {doc.titulo}
                        </h3>
                      
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Visor + Chat */}
      {previewDoc && <PdfPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}
