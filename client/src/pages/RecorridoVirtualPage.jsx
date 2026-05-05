import React from 'react';
import { PlayCircle, Map, ExternalLink } from 'lucide-react';
import MedicalTour from '../components/MedicalTour';

export default function RecorridoVirtualPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      {/* El contenedor principal ocupa el alto restante de la pantalla debajo del navbar (64px) */}
      <div className="flex-1 relative overflow-hidden">
        <MedicalTour />
      </div>
    </div>
  );
}
