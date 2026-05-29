import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone, Mail, Clock } from 'lucide-react';
import logoMsp from '../../assets/logo-msp-remove.png';
import logoNuevoEcuador from '../../assets/Footer.png';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const navLinks = [
  { label: 'Inicio', to: '/' },
  { 
    label: 'Servicios', 
    to: '/servicios',
    children: [
      { label: 'Especialidades Médicas', to: '/especialidades' },
      { label: 'Directorio de Médicos', to: '/directorio' },
      { label: 'Horarios de Atención', to: '/horarios' },
    ]
  },
  { 
    label: 'Institución', 
    to: '/institucion',
    children: [
      { label: 'Recorrido Virtual', to: '/recorrido-virtual' },
      { label: 'Noticias y Actualidad', to: '/noticias' },
      { label: 'Documentos y Transparencia', to: '/documentos' },
      { label: 'GeoSalud MSP', to: '/subcentros' },
    ]
  },
  { 
    label: 'Accesos Directos', 
    to: '/accesos',
    children: [
      { label: 'Quipux', to: 'https://www.gestiondocumental.gob.ec/' },
      { label: 'Correo Zimbra', to: 'https://mail.hpvc.gob.ec/' },
      { label: 'Drive Zonal', to: 'https://nube.mspz4.gob.ec/login' },
      { label: 'Drive 13d01 MSP', to: 'https://app.13d01.mspz4.gob.ec/' },
      { label: 'Consulta de Citas Verdi', to: 'http://186.47.77.45:8082/consulta_cita/' },
      { label: 'Sistema de Información Hosp.', to: 'http://186.47.77.45:8082/syshpvc/' },
      { label: 'PahoFlu', to: 'https://sive.msp.gob.ec/Account/Login?ReturnUrl=%2F' },
      { label: 'Agendamiento MSP', to: 'https://agendamiento.msp.gob.ec/login' },
      { label: 'PRAS', to: 'https://sgrdacaa.msp.gob.ec/' },
      { label: 'Apps MSP', to: 'https://app.13d01.mspz4.gob.ec/' },
      { label: 'Portal Trámites', to: 'https://www.gob.ec/' },
      { label: 'Contacto Ciudadano', to: 'https://www.contactociudadano.gob.ec/' },
      { label: 'SNI Público', to: 'https://sni.msp.gob.ec/app/home/' },
      { label: 'Ver todos los Accesos →', to: '/accesos' },
    ]
  },
  { label: 'Contáctenos', to: '/contacto' },
];
import { useConfig } from '../../context/ConfigContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { config } = useConfig();
  const timeoutRef = React.useRef(null);

  const handleMouseEnter = (label) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdown(null);
    }, 50);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDropdown(null);
  }, [location]);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-white text-xs py-2 hidden md:block">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <span className="font-medium opacity-90">{}</span>
          <div className="flex items-center gap-5">
            <a href={`mailto:${config.hospital_email || 'hospital.portoviejo@mspz4.gob.ec'}`} className="flex items-center gap-1.5 hover:text-accent transition-colors font-medium">
              <Mail size={12} /> {config.hospital_email || 'hospital.portoviejo@mspz4.gob.ec'}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-[100] transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'
      }`}>
        <div className="container mx-auto px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logoMsp} 
              alt="Logo MSP" 
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-110" 
            />
            <img
              src={logoNuevoEcuador}
              alt="Logo Gobierno del Nuevo Ecuador"
              className="hidden sm:block h-10 w-auto object-contain"
            />
            <div className="leading-tight flex flex-col justify-center">

            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative"
                  onMouseEnter={() => handleMouseEnter(link.label)}
                  onMouseLeave={handleMouseLeave}>
                  <Link to={link.to} className={`flex items-center gap-1 px-3 py-2 rounded-btn text-sm font-medium transition-colors duration-150 ${
                    location.pathname === link.to || dropdown === link.label ? 'text-primary bg-primary-pale' : 'text-dark hover:text-primary hover:bg-neutral-50'
                  }`}>
                    {link.label}
                  </Link>
                  {dropdown === link.label && (
                    <div className="absolute top-full left-0 pt-2 w-64 z-50 animate-dropdown-quick">
                      <div className="bg-white rounded-card shadow-sm border border-neutral-200 py-1 overflow-hidden">
                        {link.children.map((child) => {
                          const isExternal = child.to.startsWith('http');
                          return (
                            <Link key={child.label} to={child.to}
                              target={isExternal ? "_blank" : undefined}
                              rel={isExternal ? "noopener noreferrer" : undefined}
                              className={`block px-4 py-2.5 text-sm transition-colors duration-150 ${
                                child.label === 'Sistemas Nacionales (MSP)' || child.label === 'Ver todos los Accesos'
                                  ? 'font-bold text-primary border-b border-neutral-100'
                                  : 'text-dark hover:bg-primary-pale hover:text-primary'
                              }`}>
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link key={link.to} to={link.to}
                  className={`px-3 py-2 rounded-btn text-sm font-medium transition-colors ${
                    location.pathname === link.to ? 'text-primary bg-primary-pale' : 'text-dark hover:text-primary hover:bg-neutral-50'
                  }`}>
                  {link.label}
                </Link>
              )
            )}
            <Link to="/horarios"
              className="ml-2 btn-primario text-sm py-2 px-4 inline-flex items-center gap-2">
              <Clock size={16} /> Horarios
            </Link>
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-btn text-dark hover:bg-neutral-100 transition-colors">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden border-t border-neutral-100 bg-white pb-4 px-6 animate-fade-in">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <div className="flex items-center justify-between border-b border-neutral-50">
                    <Link to={link.to} className="py-3 text-sm font-medium text-dark flex-grow hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                    <button onClick={() => setDropdown(dropdown === link.label ? null : link.label)}
                      className="p-3 text-dark hover:bg-neutral-50 rounded-md">
                      <ChevronDown size={14} className={`transition-transform ${dropdown === link.label ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {dropdown === link.label && link.children.map((child) => {
                    const isExternal = child.to.startsWith('http');
                    return (
                      <Link key={child.label} to={child.to}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className={`block pl-4 py-2 text-sm transition-colors ${
                          child.label === 'Sistemas Nacionales (MSP)' || child.label === 'Ver todos los Accesos'
                            ? 'font-bold text-primary' 
                            : 'text-gray hover:text-primary'
                        }`}>
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <Link key={link.to} to={link.to}
                  className="block py-3 text-sm font-medium text-dark border-b border-neutral-50 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              )
            )}
            <Link to="/horarios" className="btn-primario w-full mt-4 text-sm justify-center inline-flex items-center gap-2">
              <Clock size={16} /> Ver Horarios
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
