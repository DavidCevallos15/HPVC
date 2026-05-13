import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, ChevronLeft, ChevronRight,
  AlertCircle, CalendarDays, Activity, Users, ShieldCheck,
  Stethoscope, Info
} from 'lucide-react';
import api from '../api/axios';

/* ── Utilidades de fecha ─────────────────────────────────────────── */
const diasDelMes = (mes) => {
  const [y, m] = mes.split('-').map(Number);
  const total = new Date(y, m, 0).getDate();
  return Array.from({ length: total }, (_, i) => String(i + 1).padStart(2, '0'));
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

const getDiaHoy = () => String(new Date().getDate()).padStart(2, '0');

/* ── Calcular áreas activas ese día ─────────────────────────────── */
function calcularAreasActivas(horarios, mes, dia) {
  const dias = diasDelMes(mes);
  if (!dias.includes(dia)) return [];

  const mapa = {}; // area -> { trabajan, vacaciones, permisos }

  horarios.forEach(h => {
    const area = h.area || 'Área General';
    if (!mapa[area]) mapa[area] = { trabajan: 0, vacaciones: 0, permisos: 0, total: 0 };
    const valor = h[`d${dia}`];
    mapa[area].total++;
    if (valor === 'VAC') mapa[area].vacaciones++;
    else if (valor === 'PERM') mapa[area].permisos++;
    else if (valor) mapa[area].trabajan++;
  });

  return Object.entries(mapa)
    .map(([area, stats]) => ({ area, ...stats }))
    .filter(a => a.trabajan > 0) // solo áreas con al menos 1 persona trabajando
    .sort((a, b) => b.trabajan - a.trabajan);
}

/* ── Tarjeta de área activa ──────────────────────────────────────── */
function AreaActivaCard({ area, trabajan, vacaciones, permisos, total }) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-secondary-pale flex items-center justify-center shrink-0">
            <Stethoscope size={18} className="text-secondary" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-dark text-sm leading-tight truncate">{area}</div>
            <div className="text-xs text-neutral-400 mt-0.5">Área activa hoy</div>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold bg-secondary-pale text-secondary px-2 py-0.5 rounded-full border border-secondary/20">
          <Activity size={10} /> ACTIVA
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
          <Users size={11} /> {trabajan} disponible{trabajan !== 1 ? 's' : ''}
        </span>
        {vacaciones > 0 && (
          <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full">
            {vacaciones} en vacaciones
          </span>
        )}
        {permisos > 0 && (
          <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-full">
            {permisos} con permiso
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-neutral-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
          <div className="h-3 bg-neutral-200 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-24 bg-neutral-100 rounded-full" />
        <div className="h-6 w-20 bg-neutral-100 rounded-full" />
      </div>
    </div>
  );
}

/* ── Página Principal ────────────────────────────────────────────── */
export default function HorariosPage() {
  const [horarios, setHorarios]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [mes, setMes]             = useState(getMesActual);
  const [diaSeleccionado, setDia] = useState(getDiaHoy);

  /* ── Carga de datos ──────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/public/guardias/${mes}`)
      .then(r => setHorarios(r.data.data || []))
      .catch(() => setError('No se pudieron cargar los horarios. Verifica tu conexión.'))
      .finally(() => setLoading(false));
  }, [mes]);

  const dias = React.useMemo(() => diasDelMes(mes), [mes]);
  const areasActivas = React.useMemo(
    () => calcularAreasActivas(horarios, mes, diaSeleccionado),
    [horarios, mes, diaSeleccionado]
  );

  const today = getMesActual() === mes ? getDiaHoy() : null;

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
              <h1 className="text-4xl font-semibold font-heading flex items-center gap-3">
                <CalendarDays size={36} className="opacity-80" />
                Horarios de Atención
              </h1>
              <p className="text-primary-pale mt-2 text-lg">
                Consulta las áreas médicas disponibles por día.
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

        {/* Aviso de privacidad */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <ShieldCheck size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            <strong>Información protegida:</strong> Por seguridad y privacidad del personal médico, los nombres de los profesionales no se muestran en esta vista pública.
            Se indica únicamente qué <strong>áreas están disponibles</strong> en la fecha seleccionada.
          </p>
        </div>

        {/* Selector de día */}
        <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-5 mb-6">
          <p className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            Selecciona un día para ver las áreas activas
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {dias.map(d => (
              <button
                key={d}
                onClick={() => setDia(d)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                  d === diaSeleccionado
                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30 ring-offset-1'
                    : d === today
                    ? 'bg-accent/20 text-primary border-2 border-accent hover:bg-accent/30'
                    : 'bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-primary-pale hover:text-primary hover:border-primary/30'
                }`}
              >
                {parseInt(d)}
              </button>
            ))}
          </div>
          {today && (
            <p className="text-xs text-neutral-400 mt-2">
              El día de hoy ({parseInt(today)}) aparece resaltado en amarillo.
            </p>
          )}
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <AlertCircle size={40} className="text-error opacity-60" />
            <p className="text-dark font-medium">{error}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray text-sm">
                <span className="font-semibold text-dark">{areasActivas.length}</span> área{areasActivas.length !== 1 ? 's' : ''} activa{areasActivas.length !== 1 ? 's' : ''} —{' '}
                <span className="capitalize">
                  {new Date(parseInt(mes.split('-')[0]), parseInt(mes.split('-')[1]) - 1, parseInt(diaSeleccionado))
                    .toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </p>
            </div>

            {areasActivas.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {areasActivas.map(a => (
                  <AreaActivaCard key={a.area} {...a} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-24 text-center">
                <Info size={40} className="text-neutral-300" />
                <p className="text-dark font-medium">
                  {horarios.length === 0
                    ? `No hay horarios registrados para ${getMesLabel(mes)}.`
                    : 'No hay áreas con personal disponible en este día.'}
                </p>
                <p className="text-gray text-sm">
                  {horarios.length === 0
                    ? 'El administrador aún no ha subido el Excel de este mes.'
                    : 'Intenta seleccionar otro día.'}
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
