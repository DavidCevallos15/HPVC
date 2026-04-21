import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Filter } from 'lucide-react';
import api from '../api/axios';

const ESTADO_BADGE = {
  DISPONIBLE:    'badge badge-disponible',
  VACACIONES:    'badge badge-vacaciones',
  SIN_ATENCION:  'badge badge-sin-atencion',
};
const ESTADO_LABEL = { DISPONIBLE: 'Disponible', VACACIONES: 'Vacaciones', SIN_ATENCION: 'Sin atención' };

const getCurrentMes = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function DirectorioPage() {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEsp, setFiltroEsp] = useState('');
  const [mes, setMes] = useState(getCurrentMes());

  useEffect(() => {
    Promise.all([
      api.get('/public/medicos'),
      api.get('/public/especialidades'),
    ]).then(([m, e]) => {
      setMedicos(m.data.data);
      setEspecialidades(e.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get(`/public/horarios/${mes}`).then(r => setHorarios(r.data.data)).catch(() => setHorarios([]));
  }, [mes]);

  const getMesLabel = (m) => {
    const [y, mo] = m.split('-');
    return new Date(y, parseInt(mo) - 1).toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
  };

  const filtered = medicos.filter((m) => {
    const matchSearch = m.nombre.toLowerCase().includes(search.toLowerCase());
    const matchEsp = filtroEsp ? m.especialidadId === parseInt(filtroEsp) : true;
    return matchSearch && matchEsp;
  });

  const getHorario = (medicoId) => horarios.find(h => h.medicoId === medicoId);

  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  const diasLabel = { lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue', viernes: 'Vie' };

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-16">
        <div className="container mx-auto px-6">
          <nav className="text-primary-pale text-sm mb-4">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <span className="mx-2">/</span>
            <span>Directorio Médico</span>
          </nav>
          <h1 className="text-4xl font-bold font-heading">Directorio Médico</h1>
          <p className="text-primary-pale mt-2">Conozca a nuestros especialistas y sus horarios de atención mensual.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Filtros */}
        <div className="bg-white rounded-card shadow-card p-5 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
            <input type="text" placeholder="Buscar médico..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-btn text-sm focus:outline-none focus:border-primary transition-colors" />
          </div>
          <select value={filtroEsp} onChange={e => setFiltroEsp(e.target.value)}
            className="border border-gray-200 rounded-btn px-3 py-2 text-sm text-dark focus:outline-none focus:border-primary transition-colors">
            <option value="">Todas las especialidades</option>
            {especialidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
            className="border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" />
        </div>

        {/* Leyenda horarios */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(ESTADO_LABEL).map(([k, v]) => (
            <span key={k} className={ESTADO_BADGE[k]}>{v}</span>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-card animate-pulse" />)}
          </div>
        ) : (
          <>
            <p className="text-gray text-sm mb-4">{filtered.length} médico{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''} — {getMesLabel(mes)}</p>
            <div className="space-y-4">
              {filtered.map((m) => {
                const h = getHorario(m.id);
                return (
                  <div key={m.id} className="bg-white rounded-card shadow-card p-5 flex flex-col md:flex-row gap-4">
                    {/* Info médico */}
                    <div className="flex flex-col gap-3 md:w-64 shrink-0 border-b border-gray-100 pb-4 md:border-b-0 md:border-r md:pr-4">
                      <div className="flex items-center gap-3">
                         <div className="w-14 h-14 rounded-full bg-primary-pale border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                           {m.foto ? (
                              <img src={`http://localhost:3001${m.foto}`} alt={m.nombre} className="w-full h-full object-cover" />
                           ) : (
                              <User size={24} className="text-primary" />
                           )}
                         </div>
                         <div>
                           <div className="font-bold text-dark text-sm leading-tight">{m.nombre}</div>
                           <div className="text-secondary text-xs mt-0.5 font-medium">{m.especialidad?.nombre}</div>
                         </div>
                      </div>
                      
                      {m.bio && <p className="text-xs text-gray-500 leading-relaxed mt-1 line-clamp-3" title={m.bio}>{m.bio}</p>}
                      
                      {(m.email || m.telefono) && (
                         <div className="text-xs text-gray-400 mt-1">
                            {m.telefono && <div className="mb-0.5">📞 {m.telefono}</div>}
                            {m.email && <div>✉️ {m.email}</div>}
                         </div>
                      )}

                      {m.cvUrl && (
                         <a href={`http://localhost:3001${m.cvUrl}`} target="_blank" rel="noreferrer" 
                            className="mt-2 text-xs font-semibold text-primary hover:text-primary-light flex items-center gap-1 transition-colors">
                            Descargar Hoja de Vida
                         </a>
                      )}
                    </div>

                    {/* Horarios */}
                    <div className="flex-1 flex flex-col justify-center">
                      {h ? (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={ESTADO_BADGE[h.estado]}>{ESTADO_LABEL[h.estado]}</span>
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {dias.map((dia) => (
                              <div key={dia} className="text-center">
                                <div className="text-[10px] text-gray mb-1.5 font-bold uppercase tracking-wider">{diasLabel[dia]}</div>
                                <div className={`text-xs px-1 py-1.5 rounded-lg text-center ${h[dia] ? 'bg-secondary-pale text-secondary font-medium border border-secondary/20' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                  {h[dia] || '—'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-400 text-sm italic text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                           Sin horario registrado para {getMesLabel(mes)}.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-20 text-gray">
                  <User size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No se encontraron médicos con los filtros actuales.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
