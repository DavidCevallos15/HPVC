import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, FileText, FlaskConical, MessageSquare, ArrowRight,
  Clock, ShieldCheck, User, ChevronRight
} from 'lucide-react';

const servicios = [
  {
    id: 1,
    titulo: 'Agendamiento de Citas',
    descripcion: 'Reserva tus consultas médicas de forma rápida y segura. Gestiona tus citas con especialistas y servicios de atención primaria.',
    icono: Calendar,
    color: '#D6E6F5',
    colorHover: '#B8D4F0',
    ruta: '/citas',
    destacado: true
  },
  {
    id: 2,
    titulo: 'Consulta de Receta Electrónica',
    descripcion: 'Accede a tus recetas médicas digitales. Consulta, descarga y comparte tus prescripciones con farmacias autorizadas.',
    icono: FileText,
    color: '#D4F0E3',
    colorHover: '#B8E8D0',
    ruta: '/recetas',
    destacado: false
  },
  {
    id: 3,
    titulo: 'Resultados de Laboratorio',
    descripcion: 'Consulta tus exámenes de laboratorio en línea. Accede a tus resultados de forma segura y confidencial.',
    icono: FlaskConical,
    color: '#E8F4FD',
    colorHover: '#D0E8F8',
    ruta: '/laboratorio',
    destacado: false
  },
  {
    id: 4,
    titulo: 'Buzón de Sugerencias',
    descripcion: 'Envía tus comentarios, sugerencias y reportes directamente a nuestra administración. Tu opinión nos ayuda a mejorar.',
    icono: MessageSquare,
    color: '#F0E6F5',
    colorHover: '#E0D0E8',
    ruta: '/contacto',
    destacado: false
  }
];

export default function ServiciosPacientePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-[#003A70] to-[#005BAC] text-white py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
              Portal del Ciudadano
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-heading leading-tight mb-6">
              Servicios al Paciente
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
              Accede a todos nuestros servicios digitales en un solo lugar. Gestiona tu salud de manera eficiente y segura desde cualquier dispositivo.
            </p>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold font-heading text-dark mb-4">
              Servicios Disponibles
            </h2>
            <p className="text-gray text-lg max-w-2xl">
              Selecciona el servicio que necesitas. Todos nuestros servicios están diseñados para brindarte la mejor experiencia.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {servicios.map((servicio, index) => {
              const Icono = servicio.icono;
              const isDestacado = servicio.destacado;
              
              return (
                <motion.div
                  key={servicio.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`
                    relative overflow-hidden rounded-2xl p-8 md:p-10
                    transition-all duration-300 ease-out
                    hover:shadow-2xl hover:-translate-y-1
                    ${isDestacado ? 'md:col-span-2' : ''}
                  `}
                  style={{
                    backgroundColor: servicio.color,
                  }}
                  whileHover={{
                    backgroundColor: servicio.colorHover,
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Light effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center
                        transition-all duration-300 ease-out
                        ${isDestacado ? 'bg-white shadow-lg' : 'bg-white/70'}
                      `}>
                        <Icono 
                          size={32} 
                          className="text-[#003A70]"
                          strokeWidth={2}
                        />
                      </div>
                      {isDestacado && (
                        <span className="px-3 py-1 bg-[#003A70] text-white text-xs font-bold rounded-full uppercase tracking-wider">
                          Más Popular
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl md:text-3xl font-semibold font-heading text-dark mb-4">
                      {servicio.titulo}
                    </h3>
                    
                    <p className="text-gray-700 text-base leading-relaxed mb-8">
                      {servicio.descripcion}
                    </p>

                    <Link
                      to={servicio.ruta}
                      className="inline-flex items-center gap-2 text-[#003A70] font-semibold group"
                    >
                      <span>Acceder al servicio</span>
                      <ChevronRight 
                        size={20} 
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Additional Info Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-card border border-neutral-100"
            >
              <div className="w-12 h-12 bg-[#D6E6F5] rounded-xl flex items-center justify-center mb-4">
                <Clock size={24} className="text-[#003A70]" />
              </div>
              <h4 className="font-semibold text-dark mb-2">Disponible 24/7</h4>
              <p className="text-gray text-sm">Accede a nuestros servicios en cualquier momento del día.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-card border border-neutral-100"
            >
              <div className="w-12 h-12 bg-[#D4F0E3] rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck size={24} className="text-[#007A4D]" />
              </div>
              <h4 className="font-semibold text-dark mb-2">100% Seguro</h4>
              <p className="text-gray text-sm">Tus datos están protegidos con los más altos estándares de seguridad.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-card border border-neutral-100"
            >
              <div className="w-12 h-12 bg-[#E8F4FD] rounded-xl flex items-center justify-center mb-4">
                <User size={24} className="text-[#003A70]" />
              </div>
              <h4 className="font-semibold text-dark mb-2">Fácil de Usar</h4>
              <p className="text-gray text-sm">Interfaz intuitiva diseñada para todos los usuarios.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
