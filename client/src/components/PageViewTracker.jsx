import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

let fallbackVisitorId = null;
let fallbackSessionId = null;
let lastTrackedPath = null;
let lastTrackedAt = 0;

const createId = () => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const getOrCreateId = (storage, key, fallbackKey) => {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const id = createId();
    storage.setItem(key, id);
    return id;
  } catch {
    if (fallbackKey === 'visitor') {
      fallbackVisitorId ||= createId();
      return fallbackVisitorId;
    }
    fallbackSessionId ||= createId();
    return fallbackSessionId;
  }
};

const getPageTitle = (pathname) => {
  if (pathname === '/') return 'Inicio';
  if (/^\/noticias\/[^/]+/.test(pathname)) return 'Detalle de noticia';

  const titles = {
    '/especialidades': 'Especialidades',
    '/directorio': 'Directorio médico',
    '/noticias': 'Noticias',
    '/contacto': 'Contacto',
    '/documentos': 'Documentos',
    '/recorrido-virtual': 'Recorrido virtual',
    '/accesos': 'Accesos',
    '/subcentros': 'Subcentros',
    '/acerca': 'Acerca del hospital',
    '/horarios': 'Horarios',
    '/servicios-paciente': 'Servicios al paciente',
    '/asistente-clinico': 'Asistente clínico',
    '/institucion': 'Institución',
    '/servicios': 'Servicios',
  };

  return titles[pathname] || 'Otra página';
};

export default function PageViewTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname.length > 1
      ? pathname.replace(/\/+$/, '')
      : pathname;
    const now = Date.now();

    if (lastTrackedPath === normalizedPath && now - lastTrackedAt < 10_000) return;
    lastTrackedPath = normalizedPath;
    lastTrackedAt = now;

    const visitanteId = getOrCreateId(localStorage, 'hpvc_visitor_id', 'visitor');
    const sesionId = getOrCreateId(sessionStorage, 'hpvc_session_id', 'session');

    api.post('/public/analytics/visit', {
      ruta: normalizedPath,
      titulo: getPageTitle(normalizedPath),
      visitanteId,
      sesionId,
    }, {
      silent: true,
      timeout: 5000,
    }).catch(() => {
      // La analítica nunca debe interferir con la navegación pública.
    });
  }, [pathname]);

  return null;
}
