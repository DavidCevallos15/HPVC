import React, { useEffect, useState } from 'react';
import { Mail, CheckCheck, Trash2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

export default function ContactoAdminPage() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // todos | noLeidos | leidos
  const [selected, setSelected] = useState(null);

  const fetch = () => {
    setLoading(true);
    const q = filtro === 'noLeidos' ? '?leido=false' : filtro === 'leidos' ? '?leido=true' : '';
    api.get(`/admin/contacto${q}`).then(r => setMensajes(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filtro]);

  const markRead = async (id) => {
    await api.put(`/admin/contacto/${id}/leer`);
    fetch();
    window.dispatchEvent(new Event('hpvc:messages-changed'));
    if (selected?.id === id) setSelected({ ...selected, leido: true });
  };

  const del = async (id) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    await api.delete(`/admin/contacto/${id}`);
    setSelected(null);
    fetch();
    window.dispatchEvent(new Event('hpvc:messages-changed'));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold font-heading text-neutral-900">Mensajes de Contacto</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Inbox del formulario de contacto público.</p>
        </div>
        <div className="flex gap-2">
          {['todos', 'noLeidos', 'leidos'].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtro === f ? 'bg-primary text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
              {f === 'todos' ? 'Todos' : f === 'noLeidos' ? 'Sin leer' : 'Leídos'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Lista */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded animate-pulse" />)}</div>
          ) : mensajes.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-sm"><Mail size={24} className="mx-auto mb-2 opacity-30" />Sin mensajes.</div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {mensajes.map(m => (
                <button key={m.id} onClick={() => { setSelected(m); if (!m.leido) markRead(m.id); }}
                  className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors ${selected?.id === m.id ? 'bg-primary-pale' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${m.leido ? 'bg-neutral-200' : 'bg-primary'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-neutral-900 truncate">{m.nombre}</div>
                      <div className="text-xs text-neutral-500 truncate">{m.asunto}</div>
                      <div className="text-xs text-neutral-400 mt-0.5">{new Date(m.creadoEn).toLocaleDateString('es-EC')}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalle */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-neutral-100">
          {selected ? (
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-semibold font-heading text-lg text-neutral-900">{selected.asunto}</h2>
                  <p className="text-sm text-neutral-500">{selected.nombre} — <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a></p>
                  {selected.telefono && <p className="text-sm text-neutral-500">{selected.telefono}</p>}
                </div>
                <div className="flex gap-2">
                  {!selected.leido && (
                    <button onClick={() => markRead(selected.id)} className="p-2 text-neutral-400 hover:text-primary hover:bg-primary-pale rounded-lg transition-colors" title="Marcar leído">
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button onClick={() => del(selected.id)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="border-t border-neutral-100 pt-4">
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{selected.mensaje}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-50 text-xs text-neutral-400">
                Recibido: {new Date(selected.creadoEn).toLocaleString('es-EC')}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
              <Mail size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Selecciona un mensaje para verlo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
