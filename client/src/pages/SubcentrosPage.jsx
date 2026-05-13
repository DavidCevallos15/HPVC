import React from 'react';
import { MapPin, ExternalLink, Building2, HeartPulse, ShieldCheck, ArrowRight } from 'lucide-react';

const TIPOS_CENTROS = [
  {
    tipo: 'Tipo A',
    descripcion: 'Unidades básicas de salud que brindan atención ambulatoria, prevención y promoción de la salud en comunidades rurales y urbanas.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  {
    tipo: 'Tipo B',
    descripcion: 'Centros con mayor capacidad resolutiva, incluyen servicios de medicina general, odontología, maternidad y emergencias menores.',
    color: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-800',
  },
  {
    tipo: 'Tipo C',
    descripcion: 'Centros de mayor complejidad con hospitalización básica, quirófanos y unidades de atención especializada ambulatoria.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-800',
  },
];

export default function SubcentrosPage() {
  return (
    <div className="min-h-[70vh] bg-neutral-50">

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary to-primary-light text-white py-14">
        <div className="container mx-auto px-6">
          <span className="inline-flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest mb-3">
            <MapPin size={14} /> Red Pública Integral de Salud
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold font-heading mt-1">
            Centros de Salud
          </h1>
          <p className="text-primary-pale mt-3 max-w-2xl text-base leading-relaxed">
            Consulta la red de <strong className="text-white">Centros de Salud Tipo A, B y C</strong> más cercanos a tu ubicación.
            La información oficial y actualizada está disponible en el GeoVisualizador del Ministerio de Salud Pública del Ecuador.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 space-y-10">

        {/* Tarjetas de tipos */}
        <div>
          <h2 className="text-xl font-semibold text-dark font-heading mb-6">Tipos de Centros de Salud</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TIPOS_CENTROS.map(({ tipo, descripcion, color, bg, border, text, badge }) => (
              <div key={tipo} className={`rounded-2xl border ${border} ${bg} p-6 flex flex-col gap-3 hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md`}>
                <div className={`inline-flex items-center gap-2 ${badge} text-xs font-bold px-3 py-1.5 rounded-full self-start`}>
                  <Building2 size={12} />
                  Centro de Salud {tipo}
                </div>
                <p className={`text-sm leading-relaxed ${text}`}>{descripcion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Principal — GeoSalud MSP */}
        <div className="relative bg-gradient-to-br from-[#0B1120] to-primary-dark rounded-3xl overflow-hidden shadow-2xl">
          {/* Decoración */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-3xl opacity-20 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">

            {/* Ícono central */}
            <div className="shrink-0 w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
              <HeartPulse size={44} className="text-accent" />
            </div>

            {/* Texto */}
            <div className="flex-1 text-white text-center md:text-left">
              <span className="inline-block px-3 py-1 bg-accent/20 border border-accent/40 rounded-full text-accent text-xs font-bold uppercase tracking-widest mb-3">
                Fuente Oficial
              </span>
              <h2 className="text-2xl md:text-3xl font-semibold font-heading leading-tight mb-2">
                GeoSalud MSP — GeoVisualizador
              </h2>
              <p className="text-primary-pale text-sm md:text-base leading-relaxed max-w-lg">
                Consulta en tiempo real todos los Centros de Salud Tipo A, B y C de Ecuador.
                El único mapa oficial del <strong className="text-white">Ministerio de Salud Pública</strong> con datos verificados y actualizados.
              </p>
            </div>

            {/* Botón */}
            <div className="shrink-0">
              <a
                href="https://geosalud.msp.gob.ec/geovisualizador/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-accent text-primary-dark font-bold py-4 px-8 rounded-xl shadow-xl hover:bg-yellow-400 hover:-translate-y-1 transition-all duration-200 active:scale-95 text-base"
              >
                <MapPin size={20} />
                Abrir GeoSalud MSP
                <ExternalLink size={16} />
              </a>
              <p className="text-primary-pale/60 text-xs text-center mt-3">
                geosalud.msp.gob.ec
              </p>
            </div>

          </div>
        </div>

        {/* Info adicional */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-pale flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-dark text-sm mb-1">¿Por qué usamos el GeoVisualizador oficial?</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                El GeoVisualizador de GeoSalud MSP es la plataforma oficial del Ministerio de Salud Pública del Ecuador.
                Contiene la red completa de unidades de salud pública con información actualizada sobre ubicación, horarios y servicios disponibles.
                Es el único sistema verificado y oficial para consultar los Centros de Salud Tipo A, B y C de la provincia de Manabí y todo el Ecuador.
              </p>
              <a
                href="https://geosalud.msp.gob.ec/geovisualizador/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary text-sm font-medium mt-3 hover:underline"
              >
                Visitar GeoSalud MSP <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
