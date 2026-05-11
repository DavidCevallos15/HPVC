import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, User, Calendar, ChevronLeft, ChevronRight,
  Filter, X, AlertCircle, CalendarDays
} from 'lucide-react';
import api from '../api/axios';

/* ── Utilidades de fecha ─────────────────────────────────────────── */
const diasDelMes = (mes) => {
  const [y, m] = mes.split('-').map(Number);
  const total = new Date(y, m, 0).getDate();
  return Array.from({ length: total }, (_, i) => String(i + 1).padStart(2, '0'));
};

const nombreDia = (mes, dStr) => {
  const [y, m] = mes.split('-').map(Number);
  const fecha = new Date(y, m - 1, parseInt(dStr, 10));
  return fecha.toLocaleDateString('es-EC', { weekday: 'short' }).replace('.', '');
};

const getMesActual = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
};

const getMesLabel = (m) => {
  const [y, mo] = m.split('-');
  return new Date(y, parseInt(mo) - 1).toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
};

const navegarMes = (mes, delta) => {
  const [y, mo] = mes.split('-').map(Number);
  const d = new Date(y, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/* ── Constantes ──────────────────────────────────────────────────── */
const POR_PAGINA = 10;

/* ── Skeleton ────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-1 mt-3">
        {[...Array(10)].map((_, i) => <div key={i} className="h-8 w-7 bg-gray-100 rounded" />)}
      </div>
    </div>
  );
}

/* ── Card individual de médico ───────────────────────────────────── */
function HorarioCard({ guardia, mes }) {
  const dias = diasDelMes(mes);
  const tieneAlgunDia = dias.some(d => guardia[`d${d}`]);
  const algunVac = dias.some(d => guardia[`d${d}`] === 'VAC');
  const todosVac = dias.every(d => { const v = guardia[`d${d}`]; return !v || v === 'VAC'; });
  const estado = todosVac && algunVac ? 'VAC' : tieneAlgunDia ? 'OK' : 'NADA';

  const estadoClase = {
    OK:   'bg-secondary-pale text-secondary border-secondary/30',
    VAC:  'bg-yellow-50 text-yellow-700 border-yellow-200',
    NADA: 'bg-gray-50 text-gray-400 border-gray-200',
  }[estado];
  const estadoLabel = { OK: 'Disponible', VAC: 'Vacaciones', NADA: 'Sin guardia' }[estado];

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-primary-pale border-2 border-primary/10 flex items-center justify-center shrink-0">
            <User size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-dark text-sm leading-tight">{guardia.nombreMedico}</div>
            <div className="text-secondary text-xs font-medium mt-0.5 truncate">{guardia.area || '—'}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {guardia.tipoContrato && (
            <span className="text-[10px] bg-primary-pale text-primary font-bold px-2 py-0.5 rounded-full">
              {guardia.tipoContrato}
            </span>
          )}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${estadoClase}`}>
            {estadoLabel}
          </span>
        </div>
      </div>

      {/* Cuadrícula de días */}
      <div className="overflow-x-auto -mx-1 pb-1">
        <div className="flex gap-[3px] min-w-max px-1">
          {dias.map(d => {
            const valor = guardia[`d${d}`];
            const esVac  = valor === 'VAC';
            const esPerm = valor === 'PERM';
            const hayValor = !!valor;
            return (
              <div key={d} className="text-center" style={{ minWidth: '26px' }}>
                <div className="text-[8px] text-gray-400 font-bold leading-none mb-0.5">
                  {nombreDia(mes, d)}
                </div>
                <div className="text-[8px] text-gray-300 leading-none mb-1">{parseInt(d)}</div>
                <div title={valor || 'Sin guardia'} className={`text-[9px] w-[26px] h-[26px] flex items-center justify-center rounded font-bold border ${
                  esVac  ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  esPerm ? 'bg-orange-50 text-orange-600 border-orange-200' :
                  hayValor ? 'bg-secondary-pale text-secondary border-secondary/20' :
                  'bg-gray-50 text-gray-200 border-gray-100'
                }`}>
                  {hayValor ? (esVac ? 'V' : esPerm ? 'P' : valor.charAt(0)) : '·'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {guardia.telefono && (
        <div className="text-xs text-gray-400">📞 {guardia.telefono}</div>
      )}
    </div>
  );
}

/* ── Paginación ──────────────────────────────────────────────────── */
function Paginacion({ paginaActual, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;

  const paginas = [];
  const inicio = Math.max(1, paginaActual - 2);
  const fin    = Math.min(totalPaginas, paginaActual + 2);
  for (let i = inicio; i <= fin; i++) paginas.push(i);

  const btnBase = 'w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all';

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onChange(paginaActual - 1)}
        disabled={paginaActual === 1}
        className={`${btnBase} border border-gray-200 text-gray hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <ChevronLeft size={16} />
      </button>

      {inicio > 1 && (
        <>
          <button onClick={() => onChange(1)} className={`${btnBase} border border-gray-200 text-gray hover:bg-primary hover:text-white hover:border-primary`}>1</button>
          {inicio > 2 && <span className="px-1 text-gray-400 text-sm">…</span>}
        </>
      )}

      {paginas.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`${btnBase} border ${
            p === paginaActual
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'border-gray-200 text-gray hover:bg-primary hover:text-white hover:border-primary'
          }`}
        >
          {p}
        </button>
      ))}

      {fin < totalPaginas && (
        <>
          {fin < totalPaginas - 1 && <span className="px-1 text-gray-400 text-sm">…</span>}
          <button onClick={() => onChange(totalPaginas)} className={`${btnBase} border border-gray-200 text-gray hover:bg-primary hover:text-white hover:border-primary`}>{totalPaginas}</button>
        </>
      )}

      <button
        onClick={() => onChange(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className={`${btnBase} border border-gray-200 text-gray hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ── Página Principal ────────────────────────────────────────────── */
export default function HorariosPage() {
  const [horarios, setHorarios] = useState([]);
  const [areas,    setAreas]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [mes,      setMes]      = useState(getMesActual);

  // Filtros
  const [search,          setSearch]          = useState('');
  const [filtroArea,      setFiltroArea]      = useState('');
  const [filtroContrato,  setFiltroContrato]  = useState('');
  const [filtroEstado,    setFiltroEstado]    = useState('');

  // Paginación
  const [pagina, setPagina] = useState(1);

  /* ── Carga de datos ──────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    setError(null);
    setPagina(1);
    api.get(`/public/guardias/${mes}`)
      .then(r => {
        setHorarios(r.data.data || []);
        setAreas(r.data.areas   || []);
      })
      .catch(() => setError('No se pudieron cargar los horarios. Verifica tu conexión.'))
      .finally(() => setLoading(false));
  }, [mes]);

  // Reiniciar página al cambiar filtros
  useEffect(() => { setPagina(1); }, [search, filtroArea, filtroContrato, filtroEstado]);

  /* ── Filtrado local ──────────────────────────────────────────── */
  const q = search.toLowerCase().trim();
  const dias = diasDelMes(mes);
  const filtered = horarios.filter(h => {
    const matchSearch = !q
      || (h.nombreMedico || '').toLowerCase().includes(q)
      || (h.area || '').toLowerCase().includes(q)
      || (h.tipoContrato || '').toLowerCase().includes(q);
    const matchArea     = !filtroArea     || h.area         === filtroArea;
    const matchContrato = !filtroContrato || h.tipoContrato === filtroContrato;
    
    let matchEstado = true;
    if (filtroEstado === 'TRABAJA') {
      matchEstado = dias.some(d => { const v = h[`d${d}`]; return v && v !== 'VAC' && v !== 'PERM'; });
    } else if (filtroEstado === 'VAC') {
      matchEstado = dias.some(d => h[`d${d}`] === 'VAC');
    } else if (filtroEstado === 'PERM') {
      matchEstado = dias.some(d => h[`d${d}`] === 'PERM');
    } else if (filtroEstado === 'SIN') {
      matchEstado = !dias.some(d => h[`d${d}`]);
    }

    return matchSearch && matchArea && matchContrato && matchEstado;
  });

  /* ── Paginación ──────────────────────────────────────────────── */
  const totalPaginas = Math.ceil(filtered.length / POR_PAGINA);
  const paginados    = filtered.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const limpiarFiltros = () => { setSearch(''); setFiltroArea(''); setFiltroContrato(''); setFiltroEstado(''); };
  const hayFiltros = search || filtroArea || filtroContrato || filtroEstado;
  const tiposContrato = [...new Set(horarios.map(h => h.tipoContrato).filter(Boolean))].sort();

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-light">

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-14">
        <div className="container mx-auto px-6">
          <nav className="text-primary-pale text-sm mb-4 flex items-center gap-1">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span className="mx-1">/</span>
            <span>Horarios de Atención</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold font-heading flex items-center gap-3">
                <CalendarDays size={36} className="opacity-80" />
                Horarios de Atención
              </h1>
              <p className="text-primary-pale mt-2 text-lg">
                Consulta los turnos y disponibilidad de nuestros especialistas.
              </p>
            </div>

            {/* Navegador de mes */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
              <button onClick={() => setMes(m => navegarMes(m, -1))}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors" title="Mes anterior">
                <ChevronLeft size={18} />
              </button>
              <span className="font-semibold text-sm capitalize min-w-[150px] text-center">
                {getMesLabel(mes)}
              </span>
              <button onClick={() => setMes(m => navegarMes(m, 1))}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors" title="Mes siguiente">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">

        {/* Barra de filtros */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">

            {/* Buscador simple */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
              <input
                type="text"
                placeholder="Buscar por médico, área o tipo de contrato..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Filtro área */}
            <select value={filtroArea} onChange={e => setFiltroArea(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-dark focus:outline-none focus:border-primary transition-colors">
              <option value="">Todas las áreas</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            {/* Filtro tipo contrato */}
            <select value={filtroContrato} onChange={e => setFiltroContrato(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-dark focus:outline-none focus:border-primary transition-colors">
              <option value="">Todos los tipos</option>
              {tiposContrato.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {hayFiltros && (
              <button onClick={limpiarFiltros}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray hover:bg-gray-50 hover:text-dark transition-colors shrink-0">
                <X size={14} /> Limpiar
              </button>
            )}
          </div>

          {/* Tags de filtros activos */}
          {hayFiltros && (
            <div className="flex flex-wrap gap-2 mt-3">
              {search && (
                <span className="text-xs bg-primary-pale text-primary border border-primary/20 px-2.5 py-1 rounded-full">
                  Búsqueda: "{search}"
                </span>
              )}
              {filtroArea && (
                <span className="text-xs bg-secondary-pale text-secondary border border-secondary/20 px-2.5 py-1 rounded-full">
                  Área: {filtroArea}
                </span>
              )}
              {filtroContrato && (
                <span className="text-xs bg-gray-100 text-gray border border-gray-200 px-2.5 py-1 rounded-full">
                  Tipo: {filtroContrato}
                </span>
              )}
              {filtroEstado && (
                <span className="text-xs bg-dark/5 text-dark border border-dark/10 px-2.5 py-1 rounded-full">
                  Estado: {
                    filtroEstado === 'TRABAJA' ? 'Trabaja' :
                    filtroEstado === 'VAC' ? 'Vacaciones' :
                    filtroEstado === 'PERM' ? 'Permiso' : 'Sin guardia'
                  }
                </span>
              )}
            </div>
          )}
        </div>

        {/* Leyenda de colores / Filtros rápidos */}
        <div className="flex flex-wrap gap-3 mb-5">
          <button 
            onClick={() => setFiltroEstado(prev => prev === 'TRABAJA' ? '' : 'TRABAJA')}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${filtroEstado === 'TRABAJA' ? 'bg-secondary text-white border-secondary shadow-sm ring-2 ring-secondary/30 ring-offset-1' : 'bg-secondary-pale text-secondary border-secondary/20 hover:bg-secondary/10'}`}
          >
            X / letra = Trabaja ese día
          </button>
          <button 
            onClick={() => setFiltroEstado(prev => prev === 'VAC' ? '' : 'VAC')}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${filtroEstado === 'VAC' ? 'bg-yellow-500 text-white border-yellow-500 shadow-sm ring-2 ring-yellow-500/30 ring-offset-1' : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'}`}
          >
            V = Vacaciones
          </button>
          <button 
            onClick={() => setFiltroEstado(prev => prev === 'PERM' ? '' : 'PERM')}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${filtroEstado === 'PERM' ? 'bg-orange-500 text-white border-orange-500 shadow-sm ring-2 ring-orange-500/30 ring-offset-1' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'}`}
          >
            P = Permiso
          </button>
          <button 
            onClick={() => setFiltroEstado(prev => prev === 'SIN' ? '' : 'SIN')}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${filtroEstado === 'SIN' ? 'bg-gray-500 text-white border-gray-500 shadow-sm ring-2 ring-gray-500/30 ring-offset-1' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
          >
            · = Sin guardia
          </button>
        </div>

        {/* Carga / Error / Resultados */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <AlertCircle size={40} className="text-error opacity-60" />
            <p className="text-dark font-medium">{error}</p>
            <button onClick={() => setMes(m => m)} className="btn-primario mt-2 text-sm">
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Contador */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray text-sm">
                <span className="font-semibold text-dark">{filtered.length}</span> médico{filtered.length !== 1 ? 's' : ''} —{' '}
                <span className="capitalize">{getMesLabel(mes)}</span>
                {totalPaginas > 1 && (
                  <span className="ml-2 text-gray-400">
                    · Página {pagina} de {totalPaginas}
                  </span>
                )}
              </p>
            </div>

            {/* Grid de cards */}
            {paginados.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {paginados.map(h => (
                    <HorarioCard key={h.id} guardia={h} mes={mes} />
                  ))}
                </div>

                {/* Paginación */}
                <Paginacion
                  paginaActual={pagina}
                  totalPaginas={totalPaginas}
                  onChange={p => { setPagina(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />

                {/* Info de rango */}
                {totalPaginas > 1 && (
                  <p className="text-center text-xs text-gray-400 mt-3">
                    Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, filtered.length)} de {filtered.length} médicos
                  </p>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-24 text-center">
                <Filter size={40} className="text-gray-300" />
                <p className="text-dark font-medium">No se encontraron resultados</p>
                <p className="text-gray text-sm">Intenta con otros filtros o un mes diferente.</p>
                {hayFiltros && (
                  <button onClick={limpiarFiltros} className="btn-outline mt-2 text-sm">
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}

            {/* Sin datos del mes */}
            {horarios.length === 0 && (
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <Calendar size={28} className="mx-auto text-blue-400 mb-2" />
                <p className="text-blue-700 text-sm font-medium">
                  No hay horarios registrados para {getMesLabel(mes)}.
                </p>
                <p className="text-blue-500 text-xs mt-1">
                  El administrador aún no ha subido el Excel de este mes.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
