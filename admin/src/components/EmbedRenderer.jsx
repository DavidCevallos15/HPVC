import React, { useEffect, useRef } from 'react';
import { ExternalLink, MessageCircle } from 'lucide-react';

/**
 * Parsea el iframe y devuelve { src, width, height }
 */
function parseIframeAttrs(html) {
  if (!html) return null;
  const srcMatch  = html.match(/src=["']([^"']+)["']/i);
  const hMatch    = html.match(/height=["']?(\d+)["']?/i);
  const wMatch    = html.match(/width=["']?(\d+)["']?/i);
  if (!srcMatch) return null;
  return {
    src:    srcMatch[1],
    height: hMatch  ? parseInt(hMatch[1],  10) : 500,
    width:  wMatch  ? parseInt(wMatch[1],  10) : 500,
  };
}

function extractSocialUrl(html) {
  if (!html) return '';
  const hrefMatch = html.match(/href=["']?([^&"'\s>]+)["']?/i);
  if (hrefMatch) {
    try { return decodeURIComponent(hrefMatch[1].replace(/["']/g, '')); } catch (_) {}
  }
  return '';
}

export default function EmbedRenderer({ html, className = '', showDirectAccess = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!html || !containerRef.current) return;
    const container = containerRef.current;
    Array.from(container.querySelectorAll('script')).forEach((old) => {
      const s = document.createElement('script');
      Array.from(old.attributes).forEach(a => s.setAttribute(a.name, a.value));
      s.textContent = old.textContent;
      old.parentNode?.replaceChild(s, old);
    });
    const tid = setTimeout(() => {
      try {
        if (window.instgrm?.Embeds?.process) window.instgrm.Embeds.process();
        if (window.twttr?.widgets?.load)     window.twttr.widgets.load(container);
      } catch (_) {}
    }, 800);
    return () => clearTimeout(tid);
  }, [html]);

  const isFacebook  = html && (html.includes('facebook.com') || html.includes('fb-post') || html.includes('fb-video'));
  const isInstagram = html && (html.includes('instagram.com') || html.includes('instgrm'));
  const isTwitter   = html && (html.includes('twitter.com')  || html.includes('x.com'));

  const getSocialInfo = () => {
    if (!html) return null;
    const url = extractSocialUrl(html);
    if (isFacebook)  return { url: url || 'https://www.facebook.com/HospitalVerdiCevallosBalda', icon: ExternalLink,    label: 'Ver en Facebook',  color: 'bg-[#1877F2] hover:bg-[#166FE5]' };
    if (isInstagram) return { url: url || 'https://www.instagram.com/', icon: ExternalLink,    label: 'Ver en Instagram', color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500' };
    if (isTwitter)   return { url: url || 'https://twitter.com/',        icon: MessageCircle,   label: 'Ver en X',         color: 'bg-neutral-900 hover:bg-black' };
    return null;
  };
  const socialInfo = getSocialInfo();

  /* ── Caso especial: iframe de Facebook → ancho nativo sin comprimir ── */
  if (isFacebook && html.trim().startsWith('<iframe')) {
    const attrs = parseIframeAttrs(html);
    const nativeW = attrs?.width  ?? 500;
    const nativeH = attrs?.height ?? 500; // Usar la altura exacta que calculó Facebook
    return (
      <div className={`flex flex-col w-full bg-white rounded-xl border border-neutral-100 overflow-hidden ${className}`}>
        <div
          style={{ overflowX: 'hidden', overflowY: 'visible', background: '#f9fafb' }}
          className="w-full flex justify-center"
        >
          {attrs ? (
            <iframe
              src={attrs.src}
              width="100%"
              height={nativeH}
              style={{ border: 'none', display: 'block', width: '100%', maxWidth: `${nativeW}px` }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="Publicación de Facebook"
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: html }} ref={containerRef} className="w-full" />
          )}
        </div>
        {showDirectAccess && socialInfo && <SocialButton info={socialInfo} />}
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full bg-neutral-50 rounded-xl overflow-hidden border border-neutral-100 ${className}`}>
      <div
        ref={containerRef}
        className="w-full overflow-hidden flex justify-center items-center"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {showDirectAccess && socialInfo && <SocialButton info={socialInfo} />}
    </div>
  );
}

function SocialButton({ info }) {
  return (
    <div className="p-3 bg-white border-t border-neutral-100 flex justify-end">
      <a
        href={info.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 px-4 py-1.5 ${info.color} text-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-[1.02] text-xs font-semibold`}
      >
        <info.icon size={14} />
        {info.label}
        <ExternalLink size={12} />
      </a>
    </div>
  );
}
