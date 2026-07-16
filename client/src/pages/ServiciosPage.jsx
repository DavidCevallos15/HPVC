import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Stethoscope, FlaskConical, ScanLine, Baby, Footprints, ChevronRight, Phone, Clock, Users, Building2 } from 'lucide-react';
import emergenciaImg from '../assets/EMERGENCIA.jpeg';
import consultaExternaImg from '../assets/CONSULTA-EXTERNA.jpeg';
import laboratorioClinicoImg from '../assets/LABORATORIO-CLINICO.jpeg';
import imagenologiaImg from '../assets/IMAGENOLOGIA.jpeg';
import bancoLecheImg from '../assets/BANCO-DE-LECHE.jpeg';
import pieDiabeticoImg from '../assets/PIE-DIABETICO.jpeg';

const servicios = [
  {
    id: 'emergencias',
    titulo: 'Emergencias 24/7',
    descripcion: 'Atención urgente permanente con equipo médico especializado y áreas de estabilización.',
    icono: Activity,
    imagen: emergenciaImg,
    size: 'col-span-1 md:col-span-2 row-span-2',
  },
  {
    id: 'consulta-externa',
    titulo: 'Consulta Externa',
    descripcion: 'Atención programada integral en múltiples especialidades médicas.',
    icono: Stethoscope,
    imagen: consultaExternaImg,
    size: 'col-span-1 md:col-span-1 row-span-1',
  },
  {
    id: 'laboratorio',
    titulo: 'Laboratorio Clínico',
    descripcion: 'Análisis y diagnósticos de alta precisión',
    icono: FlaskConical,
    imagen: laboratorioClinicoImg,
    color: 'from-accent to-accent-light',
    size: 'col-span-1 md:col-span-1 row-span-1',
  },
  {
    id: 'imagenologia',
    titulo: 'Imagenología',
    descripcion: 'Rayos X, ecografías y estudios diagnósticos',
    icono: ScanLine,
    imagen: imagenologiaImg,
    color: 'from-primary to-primary-light',
    size: 'col-span-1 md:col-span-1 row-span-1',
  },
  {
    id: 'banco-leche',
    titulo: 'Banco de Leche',
    descripcion: 'Unidad especializada en lactancia materna',
    icono: Baby,
    imagen: bancoLecheImg,
    color: 'from-accent to-accent-light',
    size: 'col-span-1 md:col-span-1 row-span-1',
  },
  {
    id: 'pie-diabetico',
    titulo: 'Pie Diabético',
    descripcion: 'Atención especializada en podología',
    icono: Footprints,
    imagen: pieDiabeticoImg,
    color: 'from-primary to-primary-light',
    size: 'col-span-1 md:col-span-1 row-span-1',
  },
];

export default function ServiciosPage() {
  return (
    <div className="min-h-screen bg-gray-light">

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white pt-24 md:pt-32 pb-20 md:pb-28">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
          <nav className="text-primary-pale text-xs md:text-sm mb-4 flex items-center gap-2">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span>Servicios Principales</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-semibold font-heading">Servicios Médicos</h1>
          <p className="text-primary-pale mt-3 max-w-2xl text-sm md:text-base">
            Conozca las principales áreas de atención de nuestra institución para el cuidado de la comunidad.
          </p>
        </div>
      </div>

      {/* Quick Access Links */}
      <section className="container mx-auto px-4 sm:px-6 -mt-12 md:-mt-16 relative z-10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link to="/especialidades" className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-neutral-100 flex flex-col items-center text-center gap-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
            <div className="w-14 h-14 bg-primary-pale rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
              <Stethoscope size={28} className="text-primary group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-dark text-lg group-hover:text-primary transition-colors">Especialidades Médicas</h3>
              <p className="text-sm text-gray mt-2">Conozca toda nuestra oferta médica.</p>
            </div>
          </Link>
          
          <Link to="/directorio" className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-neutral-100 flex flex-col items-center text-center gap-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
            <div className="w-14 h-14 bg-primary-pale rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
              <Users size={28} className="text-primary group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-dark text-lg group-hover:text-primary transition-colors">Directorio Médico</h3>
              <p className="text-sm text-gray mt-2">Busque a nuestros especialistas.</p>
            </div>
          </Link>

          <Link to="/horarios" className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-neutral-100 flex flex-col items-center text-center gap-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
            <div className="w-14 h-14 bg-primary-pale rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
              <Clock size={28} className="text-primary group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-dark text-lg group-hover:text-primary transition-colors">Horarios de Atención</h3>
              <p className="text-sm text-gray mt-2">Consulte disponibilidad y turnos.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Bento Grid - Solo Informativo */}
      <section className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold font-heading text-dark mb-3">Áreas Destacadas</h2>
          <div className="w-20 h-1 bg-primary mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {servicios.map((servicio) => {
            const Icon = servicio.icono;
            const hasImage = servicio.imagen;
            return (
              <div
                key={servicio.id}
                className={`${servicio.size} relative overflow-hidden rounded-3xl shadow-sm border border-neutral-100 flex flex-col group`}
              >
                {hasImage && (
                  <>
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${servicio.imagen})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </>
                )}
                {!hasImage && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${servicio.color}`} />
                )}
                <div className="relative p-6 md:p-8 h-full flex flex-col justify-end">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200 ${hasImage ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/20'}`}>
                    <Icon size={28} md:size={32} className="text-white" />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-semibold font-heading mb-2 text-white`}>
                    {servicio.titulo}
                  </h3>
                  <p className={`text-sm md:text-base leading-relaxed text-white/90`}>
                    {servicio.descripcion}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Banner de Cartera de Servicios */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-primary-light rounded-3xl p-8 md:p-12 text-center text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Building2 size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-semibold font-heading mb-4">Cartera de Servicios Institucional</h2>
            <p className="text-primary-pale text-base md:text-lg mb-8 max-w-2xl mx-auto">
              Conozca a detalle la infraestructura y capacidad resolutiva oficial de nuestro hospital, incluyendo número de camas, quirófanos y más.
            </p>
            <Link to="/institucion" className="bg-white text-primary font-semibold px-8 py-3 rounded-btn inline-flex items-center gap-2 hover:bg-neutral-50 transition-colors shadow-sm">
              Ver Información Completa <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
