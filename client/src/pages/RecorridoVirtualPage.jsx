import React from 'react';
import { PlayCircle, Map, ExternalLink } from 'lucide-react';
import MedicalTour from '../components/MedicalTour';

export default function RecorridoVirtualPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary-dark text-white pt-16 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary opacity-20 blur-3xl rounded-full scale-150 transform -translate-y-1/2"></div>
        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-medium text-accent mb-6 border border-white/10 uppercase tracking-widest">
            <PlayCircle size={14} /> Visita Interactiva
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight">
            Recorrido Virtual 360°
          </h1>
          <p className="text-primary-pale text-lg md:text-xl leading-relaxed">
            Conozca nuestras renovadas instalaciones, consulte la ubicación de las áreas médicas y familiarícese con el hospital antes de su visita.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-2 md:p-4">
          
          {/* Contenedor del Recorrido Virtual */}
          <div className="relative w-full aspect-video min-h-[500px] bg-gray-200 rounded-xl overflow-hidden group">
            <MedicalTour />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {[
            { tag: "Ubicación", title: "Entradas Principales", desc: "La entrada peatonal está en la Av. Universitaria. La emergencia por Av. Los Álamos." },
            { tag: "Accesibilidad", title: "Rutas Accesibles", desc: "Contamos con rampas y ascensores panorámicos en todos los pabellones para pacientes en silla de ruedas." },
            { tag: "Servicios", title: "Área de Laboratorio", desc: "El laboratorio y centro de toma de muestras se ubica en la planta baja, bloque B, junto a información." },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">{item.tag}</div>
              <h4 className="text-lg font-bold font-heading text-dark mb-3">{item.title}</h4>
              <p className="text-gray leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
