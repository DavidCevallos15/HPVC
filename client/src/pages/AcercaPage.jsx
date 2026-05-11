import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, Shield, Users, Award } from 'lucide-react';
import logoMsp from '../assets/logo-msp-remove.png';
import escudoEcuador from '../assets/escudo-del-ecuador-nombre.jpg';

// ─── Valores institucionales ──────────────────────────────────────────────────
const valores = [
  { icon: Heart,  title: 'Calidad y Calidez',  desc: 'Atención centrada en el paciente con calidez humana y excelencia técnica.' },
  { icon: Shield, title: 'Ética y Transparencia', desc: 'Uso eficiente y transparente de los recursos públicos bajo principios bioéticos.' },
  { icon: Users,  title: 'Equidad Social',     desc: 'Salud accesible para toda la ciudadanía, sin distinción de ninguna clase.' },
  { icon: Award,  title: 'Investigación y Docencia', desc: 'Formación continua del talento humano y avance del conocimiento médico.' },
];

export default function AcercaPage() {
  return (
    <div className="min-h-screen bg-gray-light">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-16">
        <div className="container mx-auto px-6">
          <nav className="text-primary-pale text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span className="mx-2">/</span>
            <span>Acerca de Nosotros</span>
          </nav>
          <h1 className="text-4xl font-bold font-heading">Acerca de Nosotros</h1>
          <p className="text-primary-pale mt-2">Institución pública de salud al servicio de Manabí y el Ecuador.</p>
        </div>
      </div>

      {/* ── Placa institucional (fiel a la foto) ── */}
      <section className="container mx-auto px-6 py-14">
        <div className="max-w-3xl mx-auto">

          {/* Tarjeta principal estilo placa */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">

            {/* Encabezado de la placa */}
            <div className="flex flex-col items-center py-10 px-8 border-b-4 border-primary">
              <p className="text-dark text-sm font-semibold tracking-widest uppercase mb-1">HOSPITAL</p>
              <h2 className="text-4xl font-black text-primary font-heading text-center leading-tight mb-4">
                VERDI CEVALLOS
              </h2>
              <div className="flex items-center gap-3">
                <img src={logoMsp} alt="Ministerio de Salud Pública" className="h-20 w-auto object-contain" />
              </div>
            </div>

            {/* Misión */}
            <div className="px-8 py-8 border-b border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="bg-primary text-white px-8 py-2 rounded-full flex items-center gap-2 shadow-sm">
                  <Target size={16} />
                  <span className="font-bold text-base tracking-wide">Misión</span>
                </div>
              </div>
              <p className="text-dark text-center leading-relaxed text-base">
                Prestar servicios de salud con calidad y calidez en el ámbito de la asistencia
                especializada, a través de su cartera de servicios, cumpliendo con la responsabilidad
                de promoción, prevención, recuperación, rehabilitación de la salud integral, docencia
                e investigación, conforme a las políticas del Ministerio de Salud Pública y el trabajo
                en red, en el marco de la justicia y equidad social.
              </p>
            </div>

            {/* Visión */}
            <div className="px-8 py-8 border-b border-gray-100 bg-gray-50/60">
              <div className="flex justify-center mb-4">
                <div className="bg-primary text-white px-8 py-2 rounded-full flex items-center gap-2 shadow-sm">
                  <Eye size={16} />
                  <span className="font-bold text-base tracking-wide">Visión</span>
                </div>
              </div>
              <p className="text-dark text-center leading-relaxed text-base">
                Ser reconocidos por la ciudadanía como hospitales accesibles que prestan una atención
                de calidad que satisface las necesidades y expectativas de la población bajo principios
                fundamentales de la salud pública y bioética, utilizando la tecnología y los recursos
                públicos de forma eficiente y transparente.
              </p>
            </div>

            {/* Pie de la placa */}
            <div className="flex flex-col items-center py-8 px-8 bg-white">
              <p className="font-bold text-primary text-lg mb-4 tracking-wide">
                Ministerio de Salud Pública
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={escudoEcuador}
                  alt="Escudo del Ecuador"
                  className="h-50 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-gray font-semibold tracking-widest uppercase mt-3">
                REPÚBLICA DEL ECUADOR
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Valores institucionales ── */}
      <section className="bg-white py-14">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold font-heading text-dark">Nuestros Valores</h2>
            <p className="text-gray mt-2 max-w-lg mx-auto">
              Principios que guían cada acción de nuestro equipo de salud.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {valores.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="flex flex-col items-center text-center p-6 rounded-card border border-gray-100 hover:border-primary/30 hover:shadow-card transition-all duration-200 group">
                <div className="w-12 h-12 rounded-xl bg-primary-pale flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-200">
                  <Icon size={22} className="text-primary group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="font-bold text-dark mb-2">{title}</h3>
                <p className="text-sm text-gray leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA contacto ── */}
      <section className="bg-gradient-to-r from-primary to-primary-light py-12">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-2xl font-bold font-heading mb-3">¿Necesita más información?</h2>
          <p className="text-primary-pale mb-6">
            Nuestro equipo está disponible para atenderle de lunes a viernes de 08h00 a 17h00.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contacto" className="bg-white text-primary font-semibold px-6 py-2.5 rounded-btn hover:bg-gray-50 transition-colors">
              Formulario de Contacto
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
