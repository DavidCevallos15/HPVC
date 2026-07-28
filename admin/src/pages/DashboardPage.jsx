import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BookOpenText,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  FilePlus2,
  Globe2,
  MailOpen,
  MessageSquareText,
  MousePointerClick,
  Newspaper,
  RefreshCw,
  Sparkles,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Skeleton from '../components/ui/Skeleton';

const numberFormatter = new Intl.NumberFormat('es-EC');
const compactFormatter = new Intl.NumberFormat('es-EC', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const PAGE_COLORS = ['#2e7d6f', '#c96f48', '#e9b949', '#83a89d', '#7f8c65', '#c99b7c'];
const DASHBOARD_POLL_INTERVAL_MS = 120_000;
const DASHBOARD_MIN_REFRESH_MS = 60_000;
const DASHBOARD_REQUEST_TIMEOUT_MS = 10_000;

const formatNumber = (value) => numberFormatter.format(value || 0);
const formatCompact = (value) => compactFormatter.format(value || 0);

const formatDay = (date) => new Intl.DateTimeFormat('es-EC', {
  day: '2-digit',
  month: 'short',
}).format(new Date(`${date}T12:00:00`));

const formatRelativeTime = (value) => {
  const date = new Date(value);
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)} h`;
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short' }).format(date);
};

function TrendBadge({ value, label }) {
  const positive = value > 0;
  const negative = value < 0;
  const Icon = positive ? TrendingUp : negative ? TrendingDown : Activity;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
      positive
        ? 'bg-emerald-50 text-emerald-700'
        : negative
          ? 'bg-rose-50 text-rose-700'
          : 'bg-slate-100 text-slate-500'
    }`}>
      <Icon size={11} />
      {positive ? '+' : ''}{value || 0}% {label}
    </span>
  );
}

function KpiCard({ label, value, helper, trend, Icon, accent, dark = false, to }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: dark ? 'rgba(201,111,72,0.14)' : `${accent}16`, color: dark ? '#a95231' : accent }}
        >
          <Icon size={19} strokeWidth={2.2} />
        </div>
        {trend && <TrendBadge value={trend.value} label={trend.label} />}
      </div>
      <div className="mt-5">
        <p className={`text-[11px] font-bold uppercase tracking-[0.15em] ${dark ? 'text-[#8b5c46]' : 'text-slate-400'}`}>
          {label}
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="text-3xl font-extrabold tracking-[-0.04em] text-[#243b36]">
            {value}
          </p>
          {to && <ArrowRight size={17} className={dark ? 'text-secondary/70' : 'text-slate-300'} />}
        </div>
        <p className={`mt-2 text-xs ${dark ? 'text-[#6f746e]' : 'text-slate-500'}`}>{helper}</p>
      </div>
    </>
  );

  const className = `dashboard-card relative overflow-hidden rounded-2xl border p-5 transition duration-300 ${
    dark
      ? 'border-[#efd8ca] bg-[#fff8f2] shadow-[0_18px_44px_rgba(126,78,54,0.10)] hover:-translate-y-0.5 hover:border-[#e5c6b4]'
      : 'border-white/80 bg-white shadow-[0_15px_35px_rgba(46,80,70,0.07)] hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(46,80,70,0.11)]'
  }`;

  return to
    ? <Link to={to} className={className}>{content}</Link>
    : <article className={className}>{content}</article>;
}

function TrafficChart({ data = [] }) {
  const width = 760;
  const height = 270;
  const padding = { top: 24, right: 22, bottom: 42, left: 38 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.visitas, item.visitantes]));

  const getPoints = (key) => data.map((item, index) => ({
    x: padding.left + (index * chartWidth) / Math.max(1, data.length - 1),
    y: padding.top + chartHeight - ((item[key] || 0) / maxValue) * chartHeight,
    value: item[key] || 0,
    fecha: item.fecha,
  }));

  const visitPoints = getPoints('visitas');
  const visitorPoints = getPoints('visitantes');
  const linePath = (points) => points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const visitPath = linePath(visitPoints);
  const visitorPath = linePath(visitorPoints);
  const areaPath = visitPoints.length
    ? `${visitPath} L ${visitPoints.at(-1).x} ${padding.top + chartHeight} L ${visitPoints[0].x} ${padding.top + chartHeight} Z`
    : '';
  const labelIndexes = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  return (
    <div className="mt-4">
      <div className="mb-2 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#2e7d6f]" /> Visitas
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#c96f48]" /> Visitantes
        </span>
      </div>
      <div className="overflow-hidden rounded-xl bg-[#f7faf9] px-1 py-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[250px] w-full"
          role="img"
          aria-label="Gráfico de visitas y visitantes de los últimos catorce días"
        >
          <defs>
            <linearGradient id="trafficArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2e7d6f" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2e7d6f" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight * ratio;
            const value = Math.round(maxValue * (1 - ratio));
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="#dce7e6"
                  strokeDasharray="4 6"
                />
                <text x={padding.left - 9} y={y + 4} textAnchor="end" fontSize="10" fill="#8aa0a5">
                  {formatCompact(value)}
                </text>
              </g>
            );
          })}
          {areaPath && <path d={areaPath} fill="url(#trafficArea)" />}
          {visitorPath && (
            <path d={visitorPath} fill="none" stroke="#c96f48" strokeWidth="2.5" strokeDasharray="7 6" />
          )}
          {visitPath && (
            <path d={visitPath} fill="none" stroke="#2e7d6f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
          )}
          {visitPoints.map((point, index) => (
            <g key={point.fecha}>
              <circle cx={point.x} cy={point.y} r="4" fill="#fff" stroke="#2e7d6f" strokeWidth="2.5">
                <title>{`${formatDay(point.fecha)}: ${point.value} visitas`}</title>
              </circle>
              {labelIndexes.has(index) && (
                <text x={point.x} y={height - 13} textAnchor="middle" fontSize="10" fill="#789098">
                  {formatDay(point.fecha)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function PageDistribution({ pages = [] }) {
  const total = pages.reduce((sum, page) => sum + page.visitas, 0);
  let cursor = 0;
  const gradient = total
    ? pages.map((page, index) => {
      const start = cursor;
      cursor += (page.visitas / total) * 100;
      return `${PAGE_COLORS[index % PAGE_COLORS.length]} ${start}% ${cursor}%`;
    }).join(', ')
    : '#dce7e6 0 100%';
  const maxVisits = Math.max(1, ...pages.map((page) => page.visitas));

  return (
    <div className="mt-5">
      <div className="flex justify-center">
        <div
          className="relative flex size-40 items-center justify-center rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
          role="img"
          aria-label={`Distribución de ${total} visitas entre ${pages.length} páginas`}
        >
          <div className="flex size-24 flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <span className="text-2xl font-extrabold tracking-tight text-[#243b36]">{formatCompact(total)}</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">visitas</span>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {pages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400">
            Las páginas aparecerán aquí cuando el portal reciba visitas.
          </div>
        ) : pages.map((page, index) => (
          <div key={`${page.ruta}-${page.titulo}`} className="group">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: PAGE_COLORS[index % PAGE_COLORS.length] }} />
                <span className="truncate text-xs font-semibold text-slate-600">{page.titulo || page.ruta}</span>
              </div>
              <span className="text-xs font-bold text-[#243b36]">{formatNumber(page.visitas)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(page.visitas / maxVisits) * 100}%`,
                  backgroundColor: PAGE_COLORS[index % PAGE_COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 rounded-[28px]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-44 rounded-2xl" />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Skeleton className="h-[430px] rounded-2xl xl:col-span-2" />
        <Skeleton className="h-[430px] rounded-2xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef(null);
  const hasStatsRef = useRef(false);
  const lastLoadedAtRef = useRef(0);
  const isSuperAdmin = user?.rol === 'SUPERADMIN';

  const loadStats = useCallback(async ({
    silent = false,
    indicate = false,
    force = false,
  } = {}) => {
    if (requestRef.current) return;
    if (
      !force
      && silent
      && Date.now() - lastLoadedAtRef.current < DASHBOARD_MIN_REFRESH_MS
    ) return;

    const controller = new AbortController();
    requestRef.current = controller;
    if (indicate) setRefreshing(true);

    try {
      const response = await api.get('/admin/stats', {
        silent,
        signal: controller.signal,
        timeout: DASHBOARD_REQUEST_TIMEOUT_MS,
      });
      setStats(response.data.data);
      hasStatsRef.current = true;
      lastLoadedAtRef.current = Date.now();
      setError('');
    } catch (requestError) {
      if (
        requestError?.code !== 'ERR_CANCELED'
        && (!silent || !hasStatsRef.current)
      ) {
        setError('No se pudieron cargar las estadísticas. Revisa la conexión con el servidor.');
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
        if (indicate) setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadStats();

    const refreshWhenActive = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        loadStats({ silent: true });
      }
    };
    const refreshAfterReconnect = () => {
      loadStats({ silent: true, force: true });
    };

    const interval = window.setInterval(refreshWhenActive, DASHBOARD_POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', refreshWhenActive);
    window.addEventListener('online', refreshAfterReconnect);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshWhenActive);
      window.removeEventListener('online', refreshAfterReconnect);
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [loadStats]);

  const visitStats = stats?.visitas || {};
  const topPage = visitStats.paginasPrincipales?.[0];
  const updatedAt = stats?.actualizadoEn
    ? new Date(stats.actualizadoEn).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    : '—';

  const portalCoverage = useMemo(() => {
    if (!stats?.totalNoticias) return 0;
    return Math.round((stats.noticiasPub / stats.totalNoticias) * 100);
  }, [stats]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="mx-auto max-w-[1600px] pb-8">
      <section className="dashboard-hero relative overflow-hidden rounded-[28px] border border-white/90 bg-gradient-to-br from-[#e4f2ee] via-[#fbfaf5] to-[#f9e9df] px-5 py-6 text-[#243b36] shadow-[0_24px_65px_rgba(46,80,70,0.12)] sm:px-8 sm:py-8">
        <div className="dashboard-grid-pattern absolute inset-0 opacity-70" />
        <div className="absolute -right-16 -top-24 size-80 rounded-full bg-[#83a89d]/25 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-[#c96f48]/15 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#83a89d] opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Centro de operaciones digitales
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-4xl xl:text-5xl">
              Buenos días, {user?.nombre?.split(' ')[0] || 'equipo'}.
              <span className="block text-primary">Así se mueve el portal hoy.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#60736c]">
              Actividad ciudadana, contenido institucional y mensajes del hospital reunidos en una sola lectura.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/90 bg-white/70 px-4 py-3 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7a8b84]">Última lectura</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <Clock3 size={14} className="text-secondary" /> {updatedAt}
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadStats({ silent: true, indicate: true, force: true })}
              disabled={refreshing}
              className="flex size-12 items-center justify-center rounded-xl bg-primary text-white shadow-[0_10px_24px_rgba(46,125,111,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-light disabled:cursor-wait disabled:opacity-70"
              aria-label="Actualizar estadísticas"
            >
              <RefreshCw size={19} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={() => loadStats({ force: true })} className="shrink-0 font-bold underline">Reintentar</button>
        </div>
      )}

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principales">
        <KpiCard
          label="Visitas · 30 días"
          value={formatNumber(visitStats.total30Dias)}
          helper={`${formatNumber(visitStats.sesiones30Dias)} sesiones registradas`}
          trend={{ value: visitStats.cambio30Dias, label: 'vs. periodo anterior' }}
          Icon={Eye}
          accent="#2e7d6f"
        />
        <KpiCard
          label="Visitantes únicos"
          value={formatNumber(visitStats.visitantesUnicos30Dias)}
          helper={`${visitStats.paginasPorSesion || 0} páginas por sesión`}
          Icon={UsersRound}
          accent="#66756f"
        />
        <KpiCard
          label="Actividad de hoy"
          value={formatNumber(visitStats.hoy)}
          helper={topPage ? `Página líder: ${topPage.titulo || topPage.ruta}` : 'Esperando las primeras visitas'}
          trend={{ value: visitStats.cambioHoy, label: 'vs. ayer' }}
          Icon={MousePointerClick}
          accent="#c96f48"
        />
        {isSuperAdmin ? (
          <KpiCard
            label="Mensajes sin leer"
            value={formatNumber(stats?.mensajesNoLeidos)}
            helper={stats?.mensajesNoLeidos ? 'Requieren revisión del equipo' : 'Bandeja al día'}
            Icon={MessageSquareText}
            accent="#e9b949"
            dark
            to="/contacto"
          />
        ) : (
          <KpiCard
            label="Contenido publicado"
            value={`${portalCoverage}%`}
            helper={`${formatNumber(stats?.noticiasPub)} de ${formatNumber(stats?.totalNoticias)} noticias`}
            Icon={CheckCircle2}
            accent="#e9b949"
            dark
            to="/noticias"
          />
        )}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-3">
        <article className="rounded-2xl border border-white/80 bg-white p-5 shadow-[0_15px_35px_rgba(46,80,70,0.07)] sm:p-6 xl:col-span-2">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-primary">Pulso del portal</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-[-0.025em] text-[#243b36]">Tráfico de los últimos 14 días</h2>
              <p className="mt-1 text-xs text-slate-400">Visitas totales frente a personas distintas.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Actualización automática
            </span>
          </div>
          <TrafficChart data={visitStats.serieDiaria} />
        </article>

        <article className="rounded-2xl border border-white/80 bg-white p-5 shadow-[0_15px_35px_rgba(46,80,70,0.07)] sm:p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-secondary">Interés ciudadano</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.025em] text-[#243b36]">Páginas más visitadas</h2>
            <p className="mt-1 text-xs text-slate-400">Distribución de los últimos 30 días.</p>
          </div>
          <PageDistribution pages={visitStats.paginasPrincipales} />
        </article>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-5">
        <article className="rounded-2xl border border-white/80 bg-white p-5 shadow-[0_15px_35px_rgba(46,80,70,0.07)] sm:p-6 lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#7f8c65]">
                {isSuperAdmin ? 'Bandeja ciudadana' : 'Estado editorial'}
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-[-0.025em] text-[#243b36]">
                {isSuperAdmin ? 'Mensajes recientes' : 'Contenido del portal'}
              </h2>
            </div>
            {isSuperAdmin && (
              <Link to="/contacto" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark">
                Ver todos <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {isSuperAdmin ? (
            <div className="mt-5 divide-y divide-slate-100">
              {stats?.mensajesRecientes?.length ? stats.mensajesRecientes.map((message) => (
                <Link
                  key={message.id}
                  to="/contacto"
                  className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    message.leido ? 'bg-slate-100 text-slate-400' : 'bg-[#fff2da] text-[#b56b00]'
                  }`}>
                    {message.leido ? <MailOpen size={17} /> : <MessageSquareText size={17} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-[#314a43]">{message.nombre}</p>
                      {!message.leido && <span className="size-1.5 shrink-0 rounded-full bg-secondary" />}
                    </div>
                    <p className="truncate text-xs text-slate-400">{message.asunto}</p>
                  </div>
                  <time className="shrink-0 text-[10px] font-semibold text-slate-400">
                    {formatRelativeTime(message.creadoEn)}
                  </time>
                </Link>
              )) : (
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 py-10 text-center">
                  <MessageSquareText size={24} className="mx-auto text-slate-300" />
                  <p className="mt-2 text-xs text-slate-400">Todavía no hay mensajes ciudadanos.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Publicadas', value: stats?.noticiasPub, Icon: Newspaper, color: '#2e7d6f' },
                { label: 'Médicos', value: stats?.totalMedicos, Icon: Stethoscope, color: '#c96f48' },
                { label: 'Especialidades', value: stats?.totalEspecialidades, Icon: Sparkles, color: '#e9b949' },
              ].map(({ label, value, Icon, color }) => (
                <div key={label} className="rounded-xl bg-[#f7f9f5] p-4">
                  <Icon size={18} style={{ color }} />
                  <p className="mt-4 text-2xl font-extrabold text-[#243b36]">{formatNumber(value)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-white/80 bg-white p-5 shadow-[0_15px_35px_rgba(46,80,70,0.07)] sm:p-6 lg:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-secondary">Gestión del portal</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-[-0.025em] text-[#243b36]">Acciones rápidas</h2>
          <div className="mt-5 space-y-2.5">
            <Link to="/noticias/nueva" className="dashboard-action group">
              <span className="dashboard-action-icon bg-primary-pale text-primary"><FilePlus2 size={17} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#314a43]">Publicar una noticia</span>
                <span className="block text-[11px] text-slate-400">Crear contenido institucional</span>
              </span>
              <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
            <Link to="/horarios" className="dashboard-action group">
              <span className="dashboard-action-icon bg-[#fff2da] text-[#b56b00]"><CalendarClock size={17} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#314a43]">Actualizar guardias</span>
                <span className="block text-[11px] text-slate-400">Importar la matriz mensual</span>
              </span>
              <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
            <Link to="/documentos" className="dashboard-action group">
              <span className="dashboard-action-icon bg-[#edf0e5] text-[#7f8c65]"><BookOpenText size={17} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#314a43]">Gestionar documentos</span>
                <span className="block text-[11px] text-slate-400">Biblioteca clínica y académica</span>
              </span>
              <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
            <a
              href={import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173'}
              target="_blank"
              rel="noreferrer"
              className="dashboard-action group"
            >
              <span className="dashboard-action-icon bg-secondary-pale text-secondary"><Globe2 size={17} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#314a43]">Abrir sitio público</span>
                <span className="block text-[11px] text-slate-400">Revisar la experiencia ciudadana</span>
              </span>
              <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
            </a>
          </div>
        </article>
      </section>
    </div>
  );
}
