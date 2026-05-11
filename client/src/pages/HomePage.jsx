import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Baby, Scissors, Heart, Bone, Activity,
  Layers, Brain, Eye, Smile, FlaskConical, FlaskRound, ArrowRight,
  Clock, Newspaper, ExternalLink, ChevronRight, ChevronLeft, PlayCircle, Phone, ShieldCheck,
  User, Building, Briefcase, Package, Archive, Wrench, Users, TestTube, Cross, X
} from 'lucide-react';
import api from '../api/axios';
import EmbedRenderer from '../components/EmbedRenderer';
import HeroCarousel from '../components/HeroCarousel';
import footerImg from '../assets/Footer-escudo.png';
import bgFooter from '../assets/background-footer.jpg';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

const toAbsoluteMediaUrl = (url) => {
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getIconForSpecialty = (nombre, dbIcon) => {
   const n = nombre?.toLowerCase() || '';
   if (n.includes('pediatr') || n.includes('neonat')) return Baby;
   if (n.includes('cirug') || n.includes('quir') || n.includes('parto')) return Scissors;
   if (n.includes('cardio') || n.includes('vascular')) return Heart;
   if (n.includes('trauma') || n.includes('ortop')) return Bone;
   if (n.includes('neuro') || n.includes('psiquia') || n.includes('psicol')) return Brain;
   if (n.includes('oftal') || n.includes('optom')) return Eye;
   if (n.includes('odont') || n.includes('maxilo')) return Smile;
   if (n.includes('laboratorio') || n.includes('patolog') || n.includes('sangre')) return FlaskConical;
   if (n.includes('emergencia') || n.includes('uci') || n.includes('triage') || n.includes('intensiv')) return Activity;
   if (n.includes('gastro') || n.includes('nutri') || n.includes('endocrin')) return TestTube;
   if (n.includes('gineco') || n.includes('obste')) return Users;
   
   if (n.includes('admin') || n.includes('gerencia') || n.includes('direcci') || n.includes('financiero') || n.includes('juridica')) return Briefcase;
   if (n.includes('farmacia') || n.includes('bodega') || n.includes('compras')) return Package;
   if (n.includes('archivo') || n.includes('estadist') || n.includes('informacion')) return Archive;
   if (n.includes('mantenimiento') || n.includes('tics')) return Wrench;
   if (n.includes('enfermeria') || n.includes('epidemiologia')) return Cross;
   
   if (dbIcon === 'building') return Building;
   if (dbIcon === 'user') return User;
   return Stethoscope;
};




// ── Especialidades Preview ──────────────────────────────────────────
function EspecialidadesPreview() {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/especialidades').then((r) => setEspecialidades(r.data.data.slice(0, 8))).catch(() => { }).finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-secondary text-sm font-semibold uppercase tracking-widest">Nuestros Servicios</span>
            <h2 className="text-3xl font-bold font-heading text-dark mt-1">Especialidades Médicas</h2>
          </div>
          <Link to="/especialidades" className="hidden md:flex items-center gap-2 text-primary text-sm font-medium hover:underline">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {especialidades.map((esp) => {
              const IconComp = getIconForSpecialty(esp.nombre, esp.icono);
              return (
                <Link key={esp.id} to={`/especialidades`}
                  className="group bg-white border border-gray-100 hover:border-primary hover:shadow-card rounded-card p-5 flex flex-col items-center text-center gap-3 transition-all duration-200 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-full bg-primary-pale group-hover:bg-primary flex items-center justify-center transition-colors">
                    <IconComp size={22} className="text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="font-semibold text-dark text-sm leading-tight group-hover:text-primary transition-colors">{esp.nombre}</div>
                    {esp._count?.medicos > 0 && (
                      <div className="text-xs text-gray mt-0.5">{esp._count.medicos} médico{esp._count.medicos > 1 ? 's' : ''}</div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Link to="/especialidades" className="flex md:hidden items-center justify-center gap-2 mt-6 text-primary text-sm font-medium">
          Ver todas las especialidades <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

// ── Noticias Recientes ──────────────────────────────────────────────
function NoticiasRecientes() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/noticias?limit=3').then((r) => setNoticias(r.data.data)).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const catColors = {
    'Infraestructura': 'bg-blue-100 text-blue-700',
    'Salud Pública': 'bg-green-100 text-green-700',
    'Tecnología': 'bg-purple-100 text-purple-700',
    'default': 'bg-primary-pale text-primary',
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-secondary text-sm font-semibold uppercase tracking-widest">Actualidad</span>
            <h2 className="text-3xl font-bold font-heading text-dark mt-1">Noticias Recientes</h2>
          </div>
          <Link to="/noticias" className="hidden md:flex items-center gap-2 text-primary text-sm font-medium hover:underline">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {noticias.map((n) => (
              <Link key={n.id} to={`/noticias/${n.slug}`}
                className="group bg-white rounded-card shadow-card hover:shadow-hero transition-all duration-200 hover:-translate-y-1 overflow-hidden flex flex-col">
                {n.previewMode === 'frame' && n.embedUrl ? (
                  <div className="h-44 bg-gray-50 border-b border-gray-100 overflow-hidden [&_iframe]:w-full [&_iframe]:h-44 [&_iframe]:border-0 [&_iframe]:pointer-events-none [&_blockquote]:pointer-events-none">
                    <EmbedRenderer
                      className="w-full h-full"
                      html={n.embedUrl}
                    />
                  </div>
                ) : toAbsoluteMediaUrl(n.previewImageUrl || n.imagenUrl) ? (
                  <div className="h-44 overflow-hidden bg-gray-100">
                    <img
                      src={toAbsoluteMediaUrl(n.previewImageUrl || n.imagenUrl)}
                      alt={n.titulo || 'Vista previa de noticia'}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                    <Newspaper size={40} className="text-white/40" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start mb-3 ${catColors[n.categoria] || catColors.default}`}>
                    {n.categoria}
                  </span>
                  <h3 className="font-bold font-heading text-dark text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {n.titulo}
                  </h3>
                  <p className="text-gray text-xs leading-relaxed line-clamp-3 flex-1">{n.extracto}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray">
                      {n.publicadoEn ? new Date(n.publicadoEn).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                    </span>
                    <span className="text-primary text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Leer <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Emergencias Banner ──────────────────────────────────────────────
function EmergenciasBanner() {
  return (
    <section className="py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center blur-[2px] scale-105"
        style={{ backgroundImage: `url(${bgFooter})` }}
      />
      <div className="absolute inset-0 bg-secondary/80" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <div className="text-accent font-bold text-sm uppercase tracking-widest mb-1">Emergencias</div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading">Servicio disponible <span className="text-accent">24/7</span></h2>
            <p className="text-secondary-pale mt-1 text-sm">No esperes si es una urgencia. Nuestra sala de emergencias está siempre lista.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-white">
            <div className="text-center">
              <div className="text-accent font-bold text-sm uppercase tracking-widest mb-2">Ubicación</div>
              <div className="text-lg font-semibold">Av. Urbina y Quito</div>
              <div className="text-sm opacity-90">Portoviejo, Manabí, Ecuador</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Recorrido Virtual Banner ──────────────────────────────────────────────
function RecorridoVirtualBanner() {
  return (
    <section className="py-20 bg-white overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="bg-gradient-to-br from-[#0B1120] to-primary-dark rounded-3xl p-8 md:p-14 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-10">

          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 mix-blend-screen pointer-events-none" />

          <div className="flex-1 relative z-10 text-white">
            <span className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase mb-4 text-accent">NUEVO</span>
            <h2 className="text-3xl md:text-5xl font-bold font-heading leading-tight mb-4">
              Recorrido Virtual 360°
            </h2>
            <p className="text-primary-pale text-lg mb-8 max-w-lg leading-relaxed">
              Descubre nuestras renovadas instalaciones, conoce las áreas de especialidad y ubícate fácilmente antes de tu visita de manera interactiva.
            </p>
            <Link to="/recorrido-virtual"
              className="inline-flex items-center gap-3 bg-white text-primary-dark hover:bg-gray-100 font-bold py-3.5 px-8 rounded-xl text-base transition-all hover:-translate-y-1 hover:shadow-lg">
              <Eye size={20} /> Iniciar Recorrido
            </Link>
          </div>

          <div className="w-full md:w-5/12 relative z-10 flex justify-center">
            <div className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden border border-white/20 shadow-2xl group flex items-center justify-center bg-black/40">
              {/* Image Placeholder representing 360 view */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-transparent"></div>
              <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg relative z-10 text-primary-dark group-hover:scale-110 group-hover:bg-accent transition-all animate-pulse">
                <PlayCircle size={24} className="ml-1" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── Imagen Mes Banner (Carrusel) ───────────────────────────────────
function ImagenMesBanner() {
  const [images,    setImages]    = useState([]);
  const [intervalMs, setIntervalMs] = useState(5000);
  const [current,   setCurrent]   = useState(0);
  const [isPaused,  setIsPaused]  = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const intervalRef               = React.useRef(null);

  useEffect(() => {
    api.get('/public/configuracion').then((r) => {
      const data = r.data.data || {};
      const imgs = [];
      for (let i = 1; i <= 8; i++) {
        const url = data[`imagen_mes_${i}`];
        if (url) imgs.push(toAbsoluteMediaUrl(url));
      }
      // fallback: clave antigua
      if (imgs.length === 0 && data.imagen_mes_noticias) {
        imgs.push(toAbsoluteMediaUrl(data.imagen_mes_noticias));
      }
      setImages(imgs);
      const secs = parseInt(data.imagen_mes_intervalo || '5', 10);
      setIntervalMs(Math.max(2, secs) * 1000);
    }).catch(() => {});
  }, []);

  // Auto-play
  useEffect(() => {
    if (images.length > 1 && !isPaused) {
      intervalRef.current = setInterval(() => setCurrent(p => (p + 1) % images.length), intervalMs);
    }
    return () => clearInterval(intervalRef.current);
  }, [images.length, isPaused, intervalMs]);

  if (images.length === 0) return null;

  const prev = () => { clearInterval(intervalRef.current); setCurrent(p => (p - 1 + images.length) % images.length); };
  const next = () => { clearInterval(intervalRef.current); setCurrent(p => (p + 1) % images.length); };

  return (
    <>
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center">
            <span className="text-secondary text-sm font-semibold uppercase tracking-widest mb-4">Noticias del Mes</span>

            <div
              className="relative rounded-2xl overflow-hidden shadow-xl w-full max-w-4xl bg-gray-50 border border-gray-100"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Slides */}
              <div className="relative max-h-[600px] overflow-hidden cursor-pointer" onClick={() => setModalOpen(true)}>
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className={`transition-opacity duration-700 ${idx === current ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'}`}
                  >
                    <img
                      src={url}
                      alt={`Noticia del Mes ${idx + 1}`}
                      className="w-full h-auto object-contain max-h-[600px]"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 text-primary-dark px-6 py-3 rounded-full font-bold shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all flex items-center gap-2">
                    <Eye size={20} /> Ver en grande
                  </div>
                </div>
              </div>

              {/* Flechas */}
              {images.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm shadow-lg z-10" aria-label="Anterior">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm shadow-lg z-10" aria-label="Siguiente">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Indicadores */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => { clearInterval(intervalRef.current); setCurrent(idx); }}
                      className={`rounded-full transition-all duration-300 ${idx === current ? 'w-6 h-2.5 bg-primary' : 'w-2.5 h-2.5 bg-white/60 hover:bg-white'}`}
                      aria-label={`Imagen ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Contador */}
              {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full z-10">
                  {current + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Click hint */}
            <p className="text-xs text-gray mt-3 flex items-center gap-1">
              <Eye size={12} /> Haz clic en la imagen para verla en grande
            </p>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={(e) => { e.stopPropagation(); setModalOpen(false); }}
          >
            <X size={32} />
          </button>
          <img
            src={images[current]}
            alt={`Noticia del Mes ${current + 1} (Grande)`}
            className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <EspecialidadesPreview />
      <RecorridoVirtualBanner />
      <ImagenMesBanner />
      <NoticiasRecientes />
      <EmergenciasBanner />
    </>
  );
}
