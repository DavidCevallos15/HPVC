import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import logoMsp from '../../assets/logo-msp-remove.png';
import logoNuevoEcuador from '../../assets/logo-nuevo-ecuador.svg';

const footerLinks = {
  'Servicios': [
    { label: 'Especialidades Médicas', to: '/especialidades', section: 'especialidades' },
    { label: 'Directorio Médico', to: '/directorio', section: 'directorio' },
    { label: 'Horarios de Atención', to: '/horarios', section: 'horarios' },
    { label: 'Recorrido Virtual', to: '/recorrido-virtual', section: 'recorrido_virtual' },
  ],
  'Institución': [
    { label: 'Acerca de Nosotros', to: '/acerca', section: 'acerca' },
    { label: 'Noticias y Actualidad', to: '/noticias', section: 'noticias' },
    { label: 'Documentos Académicos', to: '/documentos', section: 'documentos' },
    { label: 'Contáctenos', to: '/contacto', section: 'contacto' },
  ],
};

export default function Footer() {
  const { config, isSectionEnabled } = useConfig();

  return (
    <footer className="bg-primary-dark text-white border-t border-primary relative overflow-hidden">
      {/* Elemento decorativo sutil de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-10">

          {/* Branding e Info - 4 columnas */}
          <div className="xl:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm">
                <img src={logoMsp} alt="Logotipo MSP" className="w-full h-full object-contain" />
              </div>
              <div className="max-w-[180px]">
                <div className="font-bold text-sm leading-tight text-white">
                  {config.hospital_nombre || 'Hospital Provincial de Portoviejo Dr. Verdi Cevallos Balda'}
                </div>
                <div className="text-accent text-[10px] tracking-wider mt-1 uppercase font-semibold opacity-80">Ministerio de Salud Pública</div>
              </div>
            </div>
            <p className="text-primary-pale text-sm leading-relaxed mb-6 max-w-sm">
              Institución pública de salud al servicio de la provincia de Manabí, comprometida con la excelencia médica y el bienestar de la comunidad.
            </p>
            
            {/* Redes Sociales */}
            <div className="flex gap-3 mb-8">
              {[
                { label: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.04c-5.5 0-10 4.48-10 10 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.52-4.5-10-10-10z"/></svg>, href: 'https://www.facebook.com/p/Hospital-General-Dr-Verdi-Cevallos-Balda-61570730374806/', title: 'Facebook' },
                { label: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.4 5.6 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.6 18.4 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 011.25 1.25A1.25 1.25 0 0117.25 8 1.25 1.25 0 0116 6.75a1.25 1.25 0 011.25-1.25zM12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5zm0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z"/></svg>, href: 'https://www.instagram.com/hospitalverdi/', title: 'Instagram' },
                { label: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, href: '//x.com/HospitalVerdi', title: 'Twitter/X' },
              ].map(({ label, href, title }) => (
                <a key={title} href={href} target="_blank" rel="noopener noreferrer" aria-label={title}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary border border-white/10 flex items-center justify-center transition-colors text-white text-xs font-bold shadow-sm hover:shadow-md">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Enlaces de Navegación - 4 columnas */}
          <div className="xl:col-span-4 grid grid-cols-2 gap-6">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="font-semibold text-white mb-5 text-sm tracking-wide">{title}</h4>
                <ul className="space-y-3">
                  {links.filter(l => isSectionEnabled(l.section)).map((l) => (
                    <li key={l.label}>
                      {l.to ? (
                        <Link to={l.to} className="text-primary-pale hover:text-accent text-sm transition-colors flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary-light rounded-full" />
                          {l.label}
                        </Link>
                      ) : (
                        <a href={l.href} target="_blank" rel="noopener noreferrer"
                          className="text-primary-pale hover:text-accent text-sm transition-colors flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary-light rounded-full" />
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mapa e Info de Contacto Rápido - 4 columnas */}
          <div className="xl:col-span-4 flex flex-col h-full">
            <h4 className="font-semibold text-white mb-5 text-sm tracking-wide">Ubicación</h4>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2 mb-3">
                <MapPin size={14} className="text-accent shrink-0 mt-0.5" />
                <span className="text-primary-pale text-sm leading-snug">
                  Calle 12 de Marzo y Rocafuerte, Portoviejo, Ecuador, 130105
                </span>
              </div>
              <a
                href="https://geosalud.msp.gob.ec/geovisualizador/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full text-xs font-semibold mb-1 py-2 px-3 rounded-lg bg-accent/20 border border-accent/40 hover:bg-accent/30 transition-colors text-accent gap-1.5"
              >
                <MapPin size={12} /> GeoSalud MSP Oficial
              </a>
            </div>
            <ul className="space-y-2 mt-auto">
              <li className="flex items-start gap-2 text-sm text-primary-pale">
                <MapPin size={14} className="mt-0.5 shrink-0 text-accent" />
                <span>{config.hospital_direccion || 'Calle 12 de Marzo y Rocafuerte, Portoviejo, Ecuador, 130105'}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-pale">
                <Mail size={14} className="shrink-0 text-accent" />
                <a href={`mailto:${config.hospital_email}`} className="hover:text-white transition-colors">{config.hospital_email || 'hospital.portoviejo@mspz4.gob.ec '}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/20 border-t border-white/10 py-5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-pale/70">
          <span>© {new Date().getFullYear()} {config.hospital_nombre || 'Hospital Provincial Verdi Cevallos Balda'}. Todos los derechos reservados.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center">
              <img src={logoNuevoEcuador} alt="El Nuevo Ecuador" className="h-8 w-auto brightness-0 invert opacity-90" />
            </span>
            <span className="w-px h-3 bg-white/20" />
<span>
  <a href="https://www.salud.gob.ec/">Ministerio de Salud Pública</a>
</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
