import React, { useEffect, useRef } from 'react';

export default function EmbedRenderer({ html, className }) {
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

  return (
    <div 
      ref={containerRef}
      className={className} 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}
