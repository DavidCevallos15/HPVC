import React from 'react';
import { MapPin } from 'lucide-react';

export default function SubcentrosPage() {
  return (
    <section className="py-14 bg-gray-50 min-h-[70vh]">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 text-secondary text-sm font-semibold uppercase tracking-widest">
            <MapPin size={14} />
            Red de Salud
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-dark mt-2">
            Subcentros de Salud Cercanos
          </h1>
          <p className="text-gray mt-3 max-w-3xl">
            Consulta en el mapa los subcentros de salud cercanos para identificar la unidad
            de atención que mejor se adapte a tu ubicación.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-2 md:p-3 overflow-hidden">
          <div className="w-full h-[420px] md:h-[560px] rounded-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d31913.10078015594!2d-80.44544001696156!3d-1.0584062632181306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1ssubcentro%20de%20salud!5e0!3m2!1ses-419!2sec!4v1776092299154!5m2!1ses-419!2sec"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de subcentros de salud cercanos"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
