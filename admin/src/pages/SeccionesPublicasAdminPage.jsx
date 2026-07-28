import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function SeccionesPublicasAdminPage() {
  const { user } = useAuth();
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const canEdit = user?.rol === 'SUPERADMIN';

  const loadSections = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const { data } = await api.get('/admin/secciones-publicas');
      setSecciones(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'No fue posible cargar las secciones públicas.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  const summary = useMemo(() => ({
    enabled: secciones.filter(item => item.habilitada).length,
    disabled: secciones.filter(item => !item.habilitada).length,
    protected: secciones.filter(item => item.protegida).length,
  }), [secciones]);

  const toggleSection = async (seccion) => {
    if (!canEdit || seccion.protegida || updating) return;

    const nextValue = !seccion.habilitada;
    if (!nextValue) {
      const confirmed = window.confirm(
        `¿Inhabilitar temporalmente “${seccion.nombre}”? El enlace y su acceso público dejarán de estar disponibles.`
      );
      if (!confirmed) return;
    }

    setUpdating(seccion.clave);
    setFeedback(null);

    try {
      const { data } = await api.put(`/admin/secciones-publicas/${seccion.clave}`, {
        habilitada: nextValue,
      });
      setSecciones(items => items.map(item => (
        item.clave === seccion.clave ? { ...item, ...data.data } : item
      )));
      setFeedback({ type: 'success', message: data.message });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'No fue posible cambiar el estado de la sección.',
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Globe2 size={14} aria-hidden="true" />
            Portal público
          </div>
          <h1 className="font-heading text-2xl font-semibold text-neutral-900">
            Secciones públicas
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
            Controle qué páginas están visibles sin eliminar noticias, documentos ni otra
            información existente.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSections}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Habilitadas"
          value={summary.enabled}
          Icon={Eye}
          color="border-emerald-200 bg-emerald-50 text-emerald-800"
        />
        <SummaryCard
          label="Inhabilitadas"
          value={summary.disabled}
          Icon={EyeOff}
          color="border-amber-200 bg-amber-50 text-amber-800"
        />
        <SummaryCard
          label="Protegidas"
          value={summary.protected}
          Icon={ShieldCheck}
          color="border-blue-200 bg-blue-50 text-blue-800"
        />
      </div>

      {!canEdit && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <ShieldCheck size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>Puede consultar el estado. Solo un usuario SUPERADMIN puede modificarlo.</p>
        </div>
      )}

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
            feedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {feedback.type === 'error'
            ? <AlertCircle size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
            : <CheckCircle2 size={19} className="mt-0.5 shrink-0" aria-hidden="true" />}
          <p>{feedback.message}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-xl bg-neutral-100" />
            ))}
          </div>
        ) : secciones.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <Globe2 size={40} className="mb-3 text-neutral-300" aria-hidden="true" />
            <h2 className="font-heading text-lg font-semibold text-neutral-800">
              No hay secciones configuradas
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Ejecute la migración y la carga inicial del servidor.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {secciones.map(seccion => {
              const busy = updating === seccion.clave;
              const locked = seccion.protegida || !canEdit;
              return (
                <li
                  key={seccion.clave}
                  className="grid gap-4 p-5 transition duration-200 ease-out hover:bg-slate-50/80 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading font-semibold text-neutral-900">
                        {seccion.nombre}
                      </h2>
                      {seccion.protegida && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          <ShieldCheck size={13} aria-hidden="true" />
                          Protegida
                        </span>
                      )}
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        seccion.habilitada
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {seccion.habilitada ? 'Habilitada' : 'Inhabilitada'}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-neutral-500">{seccion.rutaBase}</p>
                    {seccion.descripcion && (
                      <p className="mt-2 max-w-3xl text-sm leading-5 text-neutral-500">
                        {seccion.descripcion}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={seccion.habilitada}
                    aria-label={`${seccion.habilitada ? 'Inhabilitar' : 'Habilitar'} ${seccion.nombre}`}
                    title={seccion.protegida ? 'Esta sección esencial no puede inhabilitarse' : undefined}
                    onClick={() => toggleSection(seccion)}
                    disabled={locked || busy}
                    className="inline-flex min-h-11 min-w-44 items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {busy ? (
                      <Loader2 size={18} className="animate-spin text-primary" aria-hidden="true" />
                    ) : seccion.habilitada ? (
                      <Eye size={18} className="text-emerald-600" aria-hidden="true" />
                    ) : (
                      <EyeOff size={18} className="text-amber-600" aria-hidden="true" />
                    )}
                    {busy ? 'Guardando...' : seccion.habilitada ? 'Habilitada' : 'Inhabilitada'}
                    <span
                      aria-hidden="true"
                      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                        seccion.habilitada ? 'bg-emerald-600' : 'bg-neutral-300'
                      }`}
                    >
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                        seccion.habilitada ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, Icon, color }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl border p-5 ${color}`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-75">{label}</p>
        <p className="mt-1 text-3xl font-semibold">{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70">
        <Icon size={22} aria-hidden="true" />
      </div>
    </div>
  );
}
