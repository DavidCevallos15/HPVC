import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Baby, Scissors, Heart, Bone, Activity,
  Layers, Brain, Eye, Smile, FlaskConical, FlaskRound, ArrowRight,
  Clock, Newspaper, ExternalLink, ChevronRight, PlayCircle, Phone, ShieldCheck
} from 'lucide-react';
import api from '../api/axios';
import EmbedRenderer from '../components/EmbedRenderer';
import bgHero from '../assets/background-hero-section.jpeg';
import footerImg from '../assets/Footer-escudo.png';
import bgFooter from '../assets/background-footer.jpg';
import imgOp from '../assets/hero-section-propuesta-operacion.jpg';
import imgMed from '../assets/propuesta4.jpg';
import imgAmb from '../assets/propuesta2.jpg';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

const toAbsoluteMediaUrl = (url) => {
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};

const ICON_MAP = {
  Stethoscope, Baby, Scissors, Heart, Bone, Activity,
  Layers, Brain, Eye, Smile, FlaskConical, FlaskRound,
};

// ── Hero section ────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative min-h-[calc(100svh-4rem)] md:min-h-[calc(100svh-6rem)] flex items-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${bgHero})` }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/20 translate-y-1/2 -translate-x-1/3" />
      <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-accent/10" />

      {/* Overlay oscuro para legibilidad general */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 animate-fade-in h-full flex items-center py-0">
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">

          {/* Text Content */}
          <div className="w-full lg:w-1/2 max-w-2xl lg:max-w-none text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Badge Logo - SIN MARCOS */}
            <div className="mb-3 sm:mb-5">
              <img src={footerImg} alt="Gobierno del Nuevo Ecuador" className="h-9 sm:h-11 md:h-14 object-contain drop-shadow-lg" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.35rem] font-bold text-white font-heading leading-tight mb-4 sm:mb-5">
              Hospital Provincial<br />
              <span className="text-accent">Dr. Verdi Cevallos Balda</span>
            </h1>

            <p className="text-primary-pale text-base sm:text-lg md:text-xl leading-relaxed mb-5 sm:mb-6 max-w-xl">
              Atención médica de calidad para toda la provincia de Manabí. Emergencias disponibles <strong className="text-white">24 horas al día, los 365 días del año.</strong>
            </p>

            <div className="flex flex-wrap justify-start lg:justify-start gap-3 sm:gap-4 mb-2 lg:mb-0">
              <Link to="http://186.47.77.45:8082/consulta_cita/" className="btn-primario bg-accent text-primary-dark hover:bg-yellow-400 text-sm sm:text-base py-3 px-6 shadow-lg inline-flex items-center gap-2 transition-transform hover:-translate-y-1">
                <Clock size={18} /> Consulta tu cita
                <ChevronRight size={18} />
              </Link>
              <a href="http://186.47.77.45:8081/hpvc/" target="_blank" rel="noopener noreferrer"
                className="btn-outline border-white text-white hover:bg-white hover:text-primary text-sm sm:text-base py-3 px-6 transition-transform hover:-translate-y-1 inline-flex items-center gap-2">
                <FlaskConical size={18} /> Resultados de Lab
                <ExternalLink size={16} />
              </a>
            </div>

            {/* Stats row */}
            {/* { <div className="flex flex-col gap-6 pt-8 border-t border-white/20">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { label: 'Especialidades', value: '12+' },
                  { label: 'Médicos activos', value: '80+' },
                  { label: 'Pacientes al año', value: '50K+' },
                  { label: 'Años de servicio', value: '60+' },
                ].map(({ label, value }) => (
                  <div key={label} className="group cursor-default">
                    <div className="text-2xl md:text-3xl font-extrabold text-accent font-heading leading-tight transition-transform duration-300 group-hover:scale-105 origin-left">{value}</div>
                    <div className="text-primary-pale text-xs tracking-wider uppercase mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div> } */}

          </div>

          {/* Tres imágenes inclinadas sin marco ni límite */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end overflow-hidden my-0">
            <div className="w-full h-[300px] sm:h-[360px] md:h-[420px] lg:h-[500px] flex items-stretch gap-0 my-0">
              <div
                className="group relative flex-1 overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 88% 0, 100% 100%, 0 100%)' }}
              >
                <img
                  src={imgOp}
                  alt="Operación"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 pointer-events-none transition-colors duration-300 group-hover:bg-black/0" />
              </div>

              <div
                className="group relative flex-1 overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 88% 0, 100% 100%, 12% 100%)' }}
              >
                <img
                  src={imgMed}
                  alt="Médica"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 pointer-events-none transition-colors duration-300 group-hover:bg-black/0" />
              </div>

              <div
                className="group relative flex-1 overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 12% 100%)' }}
              >
                <img
                  src={imgAmb}
                  alt="Ambulancia"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 pointer-events-none transition-colors duration-300 group-hover:bg-black/0" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


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
              const IconComp = ICON_MAP[esp.icono] || Stethoscope;
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
          <a href="tel:(05) 259-0140"
            className="bg-white text-secondary hover:bg-accent hover:text-primary-dark font-bold py-4 px-8 rounded-card text-xl transition-all shadow-floating whitespace-nowrap inline-flex items-center gap-2">
            <Phone size={24} /> (05) 259-0140
          </a>
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

export default function HomePage() {
  return (
    <>
      <Hero />
      <EspecialidadesPreview />
      <RecorridoVirtualBanner />
      <NoticiasRecientes />
      <EmergenciasBanner />
    </>
  );
}
