import React, { useState, useEffect, useRef } from 'react';
import { Clock, FlaskConical, ExternalLink, ChevronRight, ChevronLeft } from 'lucide-react';
import bgHero from '../assets/background-hero-section.jpeg';
import logoEscudo from '../assets/Footer-escudo.png';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

const toAbsoluteMediaUrl = (url) => {
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};

const DEFAULT_IMAGES = [
  { id: 'd1', url: new URL('../assets/hero-section-propuesta-operacion.jpg', import.meta.url).href, alt: 'Operación quirúrgica',  title: 'Excelencia quirúrgica',  description: 'Tecnología de punta para intervenciones seguras' },
  { id: 'd2', url: new URL('../assets/propuesta4.jpg',                        import.meta.url).href, alt: 'Personal médico',        title: 'Personal calificado',    description: 'Más de 140 especialistas a tu servicio' },
  { id: 'd3', url: new URL('../assets/propuesta2.jpg',                        import.meta.url).href, alt: 'Instalaciones',          title: 'Modernas instalaciones', description: 'Ambientes renovados para tu bienestar' },
];

export default function HeroCarousel() {
  const [heroImages, setHeroImages] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [current,    setCurrent]    = useState(0);
  const [isPaused,   setIsPaused]   = useState(false);
  const intervalRef                 = useRef(null);

  /* ─── Fetch images ────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_ORIGIN}/api/public/configuracion`);
        const data = await res.json();
        if (data.success && data.data) {
          const imgs = [];
          for (let i = 1; i <= 10; i++) {
            const url = data.data[`hero_carousel_${i}`];
            if (url) imgs.push({ id: `h${i}`, url: toAbsoluteMediaUrl(url), alt: `Imagen ${i}`, title: data.data[`hero_carousel_${i}_title`] || '', description: data.data[`hero_carousel_${i}_description`] || '' });
          }
          setHeroImages(imgs.length > 0 ? imgs : DEFAULT_IMAGES);
        } else { setHeroImages(DEFAULT_IMAGES); }
      } catch { setHeroImages(DEFAULT_IMAGES); }
      finally  { setLoading(false); }
    })();
  }, []);

  /* ─── Auto-play ───────────────────────────────────────── */
  useEffect(() => {
    if (!isPaused && heroImages.length > 1) {
      intervalRef.current = setInterval(() => setCurrent(p => (p + 1) % heroImages.length), 5500);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPaused, heroImages.length]);

  const go = (dir) => { clearInterval(intervalRef.current); setCurrent(p => (p + dir + heroImages.length) % heroImages.length); };

  /* ─────────────────────────────────────────────────────────
     ARQUITECTURA:
       Layer 0 (z-0) — fondo fijo nítido (background-hero-section)
       Layer 1 (z-10) — carrusel de imágenes encima del fondo
       Layer 2 (z-20) — cinematic gradient overlay (solo fade lateral suave)
       Layer 3 (z-30) — contenido: texto + botones + controles
  ──────────────────────────────────────────────────────────── */
  return (
    <section
      className="relative w-full min-h-[calc(100svh-4rem)] md:min-h-[calc(100svh-5.5rem)] overflow-hidden flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >

      {/* ─── Layer 0 · Fondo base desenfocado ──────────────────── */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: `url(${bgHero})`, backgroundSize: 'cover', backgroundPosition: 'center left', filter: 'blur(6px)', transform: 'scale(1.04)' }}
      />

      {/* ─── Layer 1 · Slides del carrusel (Derecha - Solo Desktop) ─────────── */}
      <div className="hidden lg:block absolute top-0 right-0 w-[55%] h-full z-10 overflow-hidden">
        {/* Máscara suave para evitar borde rígido */}
        <div 
          className="absolute inset-0"
          style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 100%)', maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 100%)' }}
        >
          {!loading && heroImages.map((img, idx) => (
            <div
              key={img.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover object-center" loading={idx === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
      </div>



      {/* ─── Layer 3 · Contenido ────────────────────────────── */}
      <div className="relative z-30 w-full flex">
        <div className="container mx-auto px-6 sm:px-10 lg:px-16 flex items-center h-full">
          <div className="max-w-xl xl:max-w-2xl relative">

            {/* Logo / escudo */}
            <div className="mb-5">
              <img src={logoEscudo} alt="Escudo Ecuador" className="h-11 sm:h-13 md:h-14 object-contain drop-shadow-lg" />
            </div>

            {/* Título institucional */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3rem] font-bold text-white font-heading leading-[1.1] mb-5 drop-shadow-lg">
              Hospital Provincial<br />
              <span className="text-accent">Verdi Cevallos Balda</span>
            </h1>

            {/* Subtítulo */}
            <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-8 max-w-md drop-shadow">
              Atención médica de calidad para toda la provincia de Manabí.{' '}
              <strong className="text-white">Emergencias disponibles 24 horas al día, 365 días del año.</strong>
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <a
                href="http://186.47.77.45:8082/consulta_cita/"
                className="inline-flex items-center gap-2 bg-accent text-primary-dark font-bold text-sm sm:text-base py-3 px-6 rounded-lg shadow-xl hover:bg-yellow-400 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Clock size={18} /> Consulta tu cita <ChevronRight size={16} />
              </a>
              <a
                href="http://186.47.77.45:8081/hpvc/"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-white/70 text-white font-semibold text-sm sm:text-base py-3 px-6 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 hover:border-white transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <FlaskConical size={18} /> Resultados de Lab <ExternalLink size={15} />
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Layer 3 · Controles del carrusel (Solo Desktop) ─────────────── */}
      <div className="hidden lg:block">
        {/* Flechas */}
        {!loading && heroImages.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/65 border border-white/20 text-white backdrop-blur-sm shadow-lg transition-all hover:scale-110 active:scale-95 pointer-events-auto"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/65 border border-white/20 text-white backdrop-blur-sm shadow-lg transition-all hover:scale-110 active:scale-95 pointer-events-auto"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Indicadores tipo pill */}
        {!loading && heroImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-auto">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { clearInterval(intervalRef.current); setCurrent(idx); }}
                className={`rounded-full transition-all duration-400 ${idx === current ? 'w-7 h-2.5 bg-accent shadow-md' : 'w-2.5 h-2.5 bg-white/45 hover:bg-white/70'}`}
                aria-label={`Imagen ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Contador */}
        {!loading && heroImages.length > 1 && (
          <div className="absolute top-5 right-5 z-30 text-xs text-white/80 bg-black/35 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 pointer-events-auto">
            {current + 1} / {heroImages.length}
          </div>
        )}

        {/* Slide title/description (abajo derecha) */}
        {!loading && heroImages[current]?.title && (
          <div className="absolute bottom-14 right-6 z-30 text-right max-w-xs pointer-events-auto">
            <p className="text-white font-semibold text-sm drop-shadow leading-tight">{heroImages[current].title}</p>
            {heroImages[current].description && (
              <p className="text-white/65 text-xs mt-0.5">{heroImages[current].description}</p>
            )}
          </div>
        )}
      </div>

    </section>
  );
}
