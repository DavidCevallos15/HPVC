import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';

/* ─── Iconos SVG ─────────────────────────────────────────────── */
const FacebookIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z" />
  </svg>
);

const InstagramIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const XIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

/* ─── IDs de widgets Elfsight ─────────────────────────────────── */
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/p/Hospital-General-Dr-Verdi-Cevallos-Balda-61570730374806/';
const FACEBOOK_WIDGET_URL = 'https://widgets.sociablekit.com/facebook-page-posts/iframe/25697669';
const FACEBOOK_WIDGET_HEIGHT = 3200;
const FACEBOOK_WIDGET_BASE_WIDTH = 500;

/* ─── Componente reutilizable: tarjeta de red social ─────────── */
function SocialCard({ header, feedHeight = 480, feedContent, footerHref }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col transition-all hover:shadow-md">
      {/* Header con color de marca */}
      <div className="flex-shrink-0">{header}</div>

      {/* Feed con altura fija y scroll interno */}
      <div
        style={{ height: feedHeight, overflowY: 'auto', overflowX: 'hidden' }}
        className="w-full bg-neutral-50 flex-shrink-0"
      >
        {feedContent}
      </div>

      {/* Footer — botón de enlace */}
      <div className="p-4 border-t border-neutral-100 bg-white flex-shrink-0">
        {footerHref}
      </div>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────── */
export default function NoticiasPage() {
  const facebookWidgetRef = useRef(null);
  const [facebookWidgetLayout, setFacebookWidgetLayout] = useState({
    scale: 1,
    width: FACEBOOK_WIDGET_BASE_WIDTH,
  });

  useEffect(() => {
    // Un único script de Elfsight sirve para todos los widgets de la página
    const scriptId = 'elfsight-platform-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id    = scriptId;
      script.src   = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else if (window.ElfsightApps) {
      // Re-init si el componente se monta después de una navegación SPA
      window.ElfsightApps.init();
    }
  }, []);

  useEffect(() => {
    const node = facebookWidgetRef.current;
    if (!node) return undefined;

    const updateScale = () => {
      const width = node.clientWidth || FACEBOOK_WIDGET_BASE_WIDTH;
      const iframeWidth = Math.max(FACEBOOK_WIDGET_BASE_WIDTH, Math.floor(width));
      const scale = Math.min(1, width / iframeWidth);

      setFacebookWidgetLayout((current) => {
        if (current.width === iframeWidth && Math.abs(current.scale - scale) < 0.001) {
          return current;
        }

        return { scale, width: iframeWidth };
      });
    };

    updateScale();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateScale);
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const facebookIframeHeight = Math.ceil(FACEBOOK_WIDGET_HEIGHT / facebookWidgetLayout.scale);

  return (
    <main className="w-full min-h-screen bg-neutral-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Encabezado ── */}
        <div className="text-center md:text-left space-y-2 border-b border-neutral-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Canales Oficiales y Redes Sociales
          </h1>
          <p className="text-base text-neutral-500 max-w-2xl">
            Mantente informado en tiempo real con las últimas actualizaciones, comunicados y
            actividades oficiales de nuestra comunidad de salud.
          </p>
        </div>

        {/*
          ┌────────────────────────────┬────────────────┐
          │  Instagram  (Elfsight)     │                │
          ├────────────────────────────┤   Facebook     │
          │  Twitter/X  (Elfsight)     │   (iframe)     │
          └────────────────────────────┴────────────────┘
          Columna izquierda: 2/3 del ancho
          Columna derecha:   1/3 del ancho
        */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ══ COLUMNA IZQUIERDA — Instagram + Twitter apilados ══ */}
          <div className="lg:col-span-3 flex flex-col gap-8">

            {/* ── Instagram (Elfsight) ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col transition-all hover:shadow-md">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <InstagramIcon size={22} />
                  <div>
                    <h3 className="font-semibold text-sm">Instagram Oficial</h3>
                    <p className="text-xs text-pink-100">@hospitalverdi</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">Oficial</span>
              </div>

              {/* Feed Elfsight — clase exacta que necesita el script de Elfsight */}
              <div className="w-full bg-neutral-50 overflow-x-hidden">
                <div
                  className="elfsight-app-b64000ac-aef1-4efd-b211-847e5794f442"
                  data-elfsight-app-lazy
                  style={{ width: '100%' }}
                ></div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-neutral-100 bg-white flex-shrink-0">
                <a
                  href="https://www.instagram.com/hospitalverdi/?hl=es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <ExternalLink size={14} />
                  Ir a Instagram
                </a>
              </div>
            </div>

            {/* ── Twitter / X (Elfsight) ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col transition-all hover:shadow-md">
              {/* Header */}
              <div className="p-4 bg-neutral-900 text-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <XIcon size={22} />
                  <div>
                    <h3 className="font-semibold text-sm">X (Twitter) Oficial</h3>
                    <p className="text-xs text-neutral-400">@HospitalVerdi</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">Oficial</span>
              </div>

              {/* Feed Elfsight — overflow visible para que el widget multi-columna no se corte */}
              <div className="w-full bg-neutral-50" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                <div
                  className="elfsight-app-d65137e4-2e4c-4c52-afa0-e5dcf3f139ef"
                  data-elfsight-app-lazy
                  style={{ width: '100%', minWidth: 0 }}
                ></div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-neutral-100 bg-white flex-shrink-0">
                <a
                  href="https://x.com/HospitalVerdi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink size={14} />
                  Ir a X (Twitter)
                </a>
              </div>
            </div>

          </div>{/* fin columna izquierda */}

          {/* ══ COLUMNA DERECHA — Facebook fijo al costado, con sticky y altura máxima ══ */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col transition-all hover:shadow-md lg:sticky lg:top-8 self-start">
            {/* Header */}
            <div className="p-4 bg-[#1877F2] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <FacebookIcon size={22} className="fill-current" />
                <div>
                  <h3 className="font-semibold text-sm">Facebook Oficial</h3>
                  <p className="text-xs text-blue-100">Hospital Verdi Cevallos</p>
                </div>
              </div>
              <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">Oficial</span>
            </div>

            {/* Feed — altura máxima de viewport menos header/footer */}
            <div
              className="w-full bg-neutral-50"
              style={{ height: '1000px', overflowY: 'auto', overflowX: 'hidden' }}
            >
              <div
                ref={facebookWidgetRef}
                className="relative w-full overflow-hidden"
                style={{ height: FACEBOOK_WIDGET_HEIGHT }}
              >
                <iframe
                  src={FACEBOOK_WIDGET_URL}
                  width={facebookWidgetLayout.width}
                  height={facebookIframeHeight}
                  style={{
                    border: 'none',
                    display: 'block',
                    width: facebookWidgetLayout.width,
                    height: facebookIframeHeight,
                    maxWidth: 'none',
                    minWidth: facebookWidgetLayout.width,
                    transform: `scale(${facebookWidgetLayout.scale})`,
                    transformOrigin: 'top left',
                  }}
                  scrolling="yes"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title="Facebook Feed"
                ></iframe>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-100 bg-white flex-shrink-0">
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <ExternalLink size={14} />
                Ir a Facebook
              </a>
            </div>
          </div>

        </div>{/* fin grid */}
      </div>
    </main>
  );
}
