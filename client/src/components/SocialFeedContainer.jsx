import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

// Custom Facebook SVG Icon for reliability and brand fidelity
const FacebookIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z" />
  </svg>
);

// Custom Instagram SVG Icon for reliability and brand fidelity
const InstagramIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function SocialFeedContainer() {
  const [activeTab, setActiveTab] = useState('instagram');
  const [instaLoading, setInstaLoading] = useState(true);
  const [instaError, setInstaError] = useState(false);
  const [fbLoading, setFbLoading] = useState(true);
  const [fbError, setFbError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const instaTimeoutRef = useRef(null);
  const fbTimeoutRef = useRef(null);
  const checkIntervalRef = useRef(null);

  // Inyección controlada del script de Elfsight
  useEffect(() => {
    const scriptId = 'elfsight-platform-script';
    let script = document.getElementById(scriptId);

    // Si el tab activo es Instagram, iniciamos la carga o verificación
    if (activeTab === 'instagram') {
      setInstaLoading(true);
      setInstaError(false);

      // Timeout de seguridad en caso de bloqueo por privacidad o ad-blockers (4 segundos)
      instaTimeoutRef.current = setTimeout(() => {
        // Verificar si se crearon elementos dentro del contenedor de Elfsight
        const widget = document.querySelector('.elfsight-app-631c985a-a076-4c26-8774-c881c447548a');
        if (!widget || widget.children.length === 0) {
          setInstaLoading(false);
          setInstaError(true);
        }
      }, 4000);

      if (!script) {
        script = document.createElement('script');
        script.src = 'https://elfsightcdn.com/platform.js';
        script.id = scriptId;
        script.async = true;
        script.onload = () => {
          // Esperar un breve momento a que el widget se renderice después de cargar el script
          setTimeout(() => {
            setInstaLoading(false);
            setInstaError(false);
          }, 1000);
        };
        script.onerror = () => {
          setInstaLoading(false);
          setInstaError(true);
        };
        document.body.appendChild(script);
      } else {
        // Si el script ya existe, monitoreamos periódicamente si el widget se inicializa
        checkIntervalRef.current = setInterval(() => {
          const widget = document.querySelector('.elfsight-app-631c985a-a076-4c26-8774-c881c447548a');
          if (widget && widget.children.length > 0) {
            setInstaLoading(false);
            setInstaError(false);
            clearInterval(checkIntervalRef.current);
          }
        }, 300);
      }
    }

    return () => {
      if (instaTimeoutRef.current) clearTimeout(instaTimeoutRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [activeTab, retryCount]);

  // Función para cargar el SDK de Facebook dinámicamente
  const loadFacebookSDK = () => {
    setFbLoading(true);
    setFbError(false);

    // Configurar un timeout de respaldo por si falla el renderizado de Meta (6 segundos)
    if (fbTimeoutRef.current) clearTimeout(fbTimeoutRef.current);
    fbTimeoutRef.current = setTimeout(() => {
      setFbLoading(false);
      setFbError(true);
    }, 6000);

    // 1. Si el SDK ya existe en el ambiente, le pedimos que vuelva a parsear el elemento
    if (window.FB) {
      try {
        window.FB.XFBML.parse();
        // Le damos un pequeño margen para que pinte el HTML antes de quitar el esqueleto
        setTimeout(() => {
          setFbLoading(false);
          if (fbTimeoutRef.current) clearTimeout(fbTimeoutRef.current);
        }, 1000);
      } catch (e) {
        console.error("Error al parsear XFBML:", e);
        setFbError(true);
        setFbLoading(false);
      }
      return;
    }

    // 2. Si no existe, creamos el script e inyectamos el SDK oficial de Meta
    const scriptId = 'facebook-jssdk';
    if (!document.getElementById(scriptId)) {
      // Registrar la función de inicialización global antes de inyectar el script
      window.fbAsyncInit = function() {
        window.FB.init({
          xfbml: true,
          version: 'v18.0'
        });
      };

      const fjs = document.getElementsByTagName('script')[0];
      const js = document.createElement('script');
      js.id = scriptId;
      js.src = "https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v18.0";
      js.async = true;
      js.defer = true;
      js.onload = () => {
        // Cuando el script base carga, procesa las etiquetas de la página
        setTimeout(() => {
          setFbLoading(false);
          if (fbTimeoutRef.current) clearTimeout(fbTimeoutRef.current);
        }, 1500);
      };
      js.onerror = () => {
        setFbLoading(false);
        setFbError(true);
      };
      
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      } else {
        document.head.appendChild(js);
      }
    } else {
      // Si el script ya está en el DOM pero window.FB aún no se ha definido (cargando),
      // verificamos periódicamente hasta que esté listo y lo parseamos.
      const checkInterval = setInterval(() => {
        if (window.FB) {
          try {
            window.FB.XFBML.parse();
            setTimeout(() => {
              setFbLoading(false);
              if (fbTimeoutRef.current) clearTimeout(fbTimeoutRef.current);
            }, 1000);
          } catch (e) {
            setFbError(true);
            setFbLoading(false);
          }
          clearInterval(checkInterval);
        }
      }, 300);

      // Limpiar el intervalo si se acaba el tiempo de espera
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 6000);
    }
  };

  // Manejo del estado de carga del SDK de Facebook
  useEffect(() => {
    if (activeTab === 'facebook') {
      loadFacebookSDK();
    }

    return () => {
      if (fbTimeoutRef.current) clearTimeout(fbTimeoutRef.current);
    };
  }, [activeTab, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="w-full bg-white rounded-card shadow-card border border-neutral-100 overflow-hidden flex flex-col h-[620px] transition-all duration-300 hover:shadow-hero">
      
      {/* Cabecera del Contenedor */}
      <div className="px-5 pt-5 pb-3 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-dark text-base flex items-center gap-2">
            Canales Oficiales
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
          </h3>
          <p className="text-xs text-gray mt-0.5">Mantente informado en tiempo real</p>
        </div>
      </div>

      {/* Sistema de Pestañas (Tabs) con diseño Premium */}
      <div className="p-3 bg-neutral-50/70 border-b border-neutral-100 flex gap-2">
        <button
          onClick={() => setActiveTab('instagram')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'instagram'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-rose-100 scale-[1.02]'
              : 'bg-white text-gray border border-neutral-200 hover:text-dark hover:border-neutral-300'
          }`}
        >
          <InstagramIcon size={14} className={activeTab === 'instagram' ? 'animate-pulse' : ''} />
          Instagram
        </button>
        <button
          onClick={() => setActiveTab('facebook')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'facebook'
              ? 'bg-gradient-to-r from-blue-600 to-primary-light text-white shadow-md shadow-blue-100 scale-[1.02]'
              : 'bg-white text-gray border border-neutral-200 hover:text-dark hover:border-neutral-300'
          }`}
        >
          <FacebookIcon size={14} className={activeTab === 'facebook' ? 'animate-pulse' : ''} />
          Facebook
        </button>
      </div>

      {/* Contenedor del Feed de Redes Sociales */}
      <div className="p-4 flex-1 overflow-hidden min-h-0 bg-white relative flex flex-col justify-center">
        
        {/* ================= INSTAGRAM FEED (Elfsight) ================= */}
        {activeTab === 'instagram' && (
          <div className="w-full h-full flex flex-col justify-between overflow-y-auto">
            {/* Esqueleto de Carga de Instagram */}
            {instaLoading && (
              <div className="space-y-4 w-full h-full animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-neutral-200 rounded w-1/3"></div>
                    <div className="h-2.5 bg-neutral-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 flex-1 min-h-[300px]">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-neutral-200 rounded-md"></div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-neutral-200 rounded w-full"></div>
                  <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
                </div>
              </div>
            )}

            {/* Mensaje de error/privacidad para Instagram */}
            {instaError && !instaLoading && (
              <div className="flex flex-col items-center justify-center text-center p-6 bg-rose-50/50 rounded-xl border border-rose-100 my-auto">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-full mb-3">
                  <AlertTriangle size={24} />
                </div>
                <h4 className="font-heading font-semibold text-dark text-sm mb-1">
                  Feed no disponible
                </h4>
                <p className="text-xs text-gray max-w-[240px] mb-4">
                  Tu navegador o un bloqueador de anuncios ha impedido la carga del feed de Instagram.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <button 
                    onClick={handleRetry}
                    className="flex-1 py-2 px-3 bg-white border border-neutral-200 hover:border-neutral-300 text-dark text-xs rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw size={12} />
                    Reintentar
                  </button>
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 text-white text-xs rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-rose-100"
                  >
                    <ExternalLink size={12} />
                    Ver Instagram
                  </a>
                </div>
              </div>
            )}

            {/* Widget Oficial de Elfsight */}
            <div 
              className={`w-full overflow-y-auto flex-1 min-h-0 ${instaLoading || instaError ? 'hidden' : 'block'}`}
            >
              <div 
                className="elfsight-app-631c985a-a076-4c26-8774-c881c447548a" 
                data-elfsight-app-lazy
              ></div>
            </div>
          </div>
        )}

        {/* ================= FB PAGE PLUGIN (Meta SDK) ================= */}
        {activeTab === 'facebook' && (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Esqueleto de Carga de Facebook */}
            {fbLoading && (
              <div className="space-y-4 w-full h-full animate-pulse">
                {/* Cabecera del Perfil de Facebook */}
                <div className="h-32 bg-neutral-200 rounded-lg relative overflow-hidden">
                  <div className="absolute bottom-3 left-4 flex items-end gap-3">
                    <div className="w-14 h-14 rounded-md border-2 border-white bg-neutral-300"></div>
                    <div className="space-y-1.5 mb-1">
                      <div className="h-3 bg-neutral-300 rounded w-24"></div>
                      <div className="h-2 bg-neutral-300 rounded w-16"></div>
                    </div>
                  </div>
                </div>
                {/* Publicación Mock */}
                <div className="space-y-3 flex-1">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-full bg-neutral-200"></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2.5 bg-neutral-200 rounded w-1/4"></div>
                      <div className="h-2 bg-neutral-200 rounded w-1/6"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-neutral-200 rounded w-full"></div>
                  <div className="h-3 bg-neutral-200 rounded w-4/5"></div>
                  <div className="h-32 bg-neutral-200 rounded-md"></div>
                </div>
              </div>
            )}

            {/* Mensaje de error/privacidad para Facebook */}
            {fbError && !fbLoading && (
              <div className="flex flex-col items-center justify-center text-center p-6 bg-blue-50/50 rounded-xl border border-blue-100 my-auto">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3">
                  <AlertTriangle size={24} />
                </div>
                <h4 className="font-heading font-semibold text-dark text-sm mb-1">
                  Timeline no disponible
                </h4>
                <p className="text-xs text-gray max-w-[240px] mb-4">
                  Las políticas de privacidad o tu bloqueador de rastreo impiden la carga directa de Facebook.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <button 
                    onClick={handleRetry}
                    className="flex-1 py-2 px-3 bg-white border border-neutral-200 hover:border-neutral-300 text-dark text-xs rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw size={12} />
                    Reintentar
                  </button>
                  <a
                    href="https://www.facebook.com/HospitalVerdiCevallos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-primary hover:opacity-90 text-white text-xs rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-blue-100"
                  >
                    <ExternalLink size={12} />
                    Ver Facebook
                  </a>
                </div>
              </div>
            )}

            {/* Contenedor HTML5 Oficial de Facebook (SDK) */}
            <div 
              className={`w-full flex justify-center items-start overflow-hidden ${fbLoading || fbError ? 'hidden' : 'flex'}`}
              style={{ minHeight: '500px' }}
            >
              <div 
                className="fb-page" 
                data-href="https://www.facebook.com/HospitalVerdiCevallos" 
                data-tabs="timeline" 
                data-width="380" 
                data-height="500" 
                data-small-header="true" 
                data-adapt-container-width="true" 
                data-hide-cover="false" 
                data-show-facepile="false"
              >
                <blockquote cite="https://www.facebook.com/HospitalVerdiCevallos" className="fb-xfbml-parse-ignore">
                  <a href="https://www.facebook.com/HospitalVerdiCevallos">Hospital Verdi Cevallos</a>
                </blockquote>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
