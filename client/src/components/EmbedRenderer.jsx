import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, MessageCircle } from 'lucide-react';

export default function EmbedRenderer({ html, className, showDirectAccess = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!html || !containerRef.current) return;

    const container = containerRef.current;
    const scripts = container.getElementsByTagName('script');
    
    // Clonamos y reemplazamos los scripts para forzar al navegador a ejecutarlos
    Array.from(scripts).forEach((oldScript) => {
      const newScript = document.createElement('script');
      // Copiar todos los atributos (src, async, charset, etc.)
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      // Copiar el contenido interno
      const scriptText = document.createTextNode(oldScript.innerHTML);
      newScript.appendChild(scriptText);
      
      // Reemplazar el viejo nodo inactivo por el nuevo
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    // Fallback: Llamar funciones de re-renderizado global de redes sociales si ya están cargadas
    const timeoutId = setTimeout(() => {
      if (window.instgrm?.Embeds?.process) window.instgrm.Embeds.process();
      if (window.twttr?.widgets?.load) window.twttr.widgets.load();
      if (window.FB?.XFBML?.parse) window.FB.XFBML.parse();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [html]);

  // Detectar tipo de red social para mostrar botón de acceso directo
  const getSocialInfo = () => {
    if (!html) return null;
    
    if (html.includes('instagram.com') || html.includes('instgrm')) {
      return {
        type: 'instagram',
        url: 'https://www.instagram.com/hospitalverdi/',
        icon: ExternalLink,
        label: 'Ver en Instagram',
        color: 'bg-gradient-to-r from-purple-500 to-pink-500'
      };
    }
    
    if (html.includes('facebook.com') || html.includes('fb-post')) {
      return {
        type: 'facebook',
        url: 'https://www.facebook.com/HospitalVerdiCevallosBalda',
        icon: ExternalLink,
        label: 'Ver en Facebook',
        color: 'bg-blue-600'
      };
    }
    
    if (html.includes('twitter.com') || html.includes('x.com')) {
      return {
        type: 'twitter',
        url: 'https://twitter.com/HospitalVerdi',
        icon: MessageCircle,
        label: 'Ver en X',
        color: 'bg-black'
      };
    }
    
    return null;
  };

  const socialInfo = getSocialInfo();

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className={className} 
        dangerouslySetInnerHTML={{ __html: html }} 
      />
      
      {/* Botón de acceso directo a red social */}
      {showDirectAccess && socialInfo && (
        <div className="absolute bottom-4 right-4 z-10">
          <a
            href={socialInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2 ${socialInfo.color} text-white rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm font-medium`}
          >
            <socialInfo.icon size={16} />
            {socialInfo.label}
            <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
