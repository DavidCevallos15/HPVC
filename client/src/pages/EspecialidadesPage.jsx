import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Baby, Scissors, Heart, Bone, Activity, Layers, Brain, Eye, Smile, FlaskConical, ChevronRight, Users, CheckCircle, Bed, TestTube, Cross, PhoneCall } from 'lucide-react';
import api from '../api/axios';

const ICON_MAP = { Stethoscope, Baby, Scissors, Heart, Bone, Activity, Layers, Brain, Eye, Smile, FlaskConical };

export default function EspecialidadesPage() {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/especialidades').then(r => setEspecialidades(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-16">
        <div className="container mx-auto px-6">
          <nav className="text-primary-pale text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span className="mx-2">/</span>
            <span>Especialidades</span>
          </nav>
          <h1 className="text-4xl font-bold font-heading">Especialidades Médicas</h1>
          <p className="text-primary-pale mt-2 max-w-xl">
            Contamos con un equipo de profesionales especializados para brindar atención integral a toda la comunidad manabita.
          </p>
        </div>
      </div>

      {/* Cartera de Servicios */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-heading text-dark mb-4">Cartera de Servicios Institucional</h2>
            <p className="text-gray max-w-2xl mx-auto">Capacidad resolutiva e infraestructura médica a su servicio.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[{
              titulo: "Consulta Externa y Emergencia",
              icono: <PhoneCall size={24} className="text-primary" />,
              items: [
                "Emergencia: 11 boxes de atención.",
                "Consulta Externa (42 consultorios): Traumatología, Cirugía General, Cirugía Pediátrica, Cirugía Plástica, Cirugía Cardiotoráxica, Urología, Neurocirugía, Oftalmología, Otorrinolaringología, Cirugía Vascular, Proctología, Medicina Interna, Nutrición, Psicología, Fisiatría, Odontología."
              ]
            }, {
              titulo: "Hospitalización y Cuidados",
              icono: <Bed size={24} className="text-primary" />,
              items: [
                "Hospitalización (190 camas): Medicina Interna (60), Cirugía General (55), Gineco-Obstetricia (40), Pediatría (35).",
                "Terapia Intensiva (6 camas): 3 adultos y 3 pediátricas.",
                "Neonatología: 8 básicos, 7 intermedios, 5 intensivos."
              ]
            }, {
              titulo: "Servicios de Apoyo y Diagnóstico",
              icono: <TestTube size={24} className="text-primary" />,
              items: [
                "Servicios de apoyo: Laboratorio clínico Lac 2 (24 horas), Imagenología: rayos X, ecografía, mamografía, tomografía (24 horas).",
                "Servicios de Apoyo Terapéutico: Medicina transfusional (24h), Banco de Leche, Farmacia, Endoscopía, Colonoscopía, Eco-cardiografía, Holter, MAPA, Electroencefalograma. Gabinete de dermatología, fototerapia y electrocauterio."
              ]
            }, {
              titulo: "Centro Quirúrgico y Obstétrico",
              icono: <Cross size={24} className="text-primary" />,
              items: [
                "Centro Obstétrico: 2 salas de parto, 1 quirófano (para cesáreas).",
                "Centro Quirúrgico: 4 quirófanos operativos."
              ]
            }, {
              titulo: "Rehabilitación",
              icono: <Activity size={24} className="text-primary" />,
              items: [
                "Rehabilitación integral: Terapia física, Terapia respiratoria, Terapia de lenguaje."
              ]
            }].map((categoria, idx) => (
              <div key={idx} className="bg-white p-6 rounded-card shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-pale rounded-xl flex items-center justify-center shrink-0">
                    {categoria.icono}
                  </div>
                  <h3 className="font-bold text-lg text-dark leading-tight">{categoria.titulo}</h3>
                </div>
                <ul className="space-y-3">
                  {categoria.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray">
                      <CheckCircle size={16} className="text-accent shrink-0 mt-0.5" />
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Especialidades de la BD */}
      <div className="container mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-heading text-dark mb-4">Listado de Especialidades</h2>
          <p className="text-gray max-w-2xl mx-auto">Conozca toda nuestra oferta de especialistas dispuestos a brindarle atención oportuna.</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-card animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {especialidades.map((esp) => {
              const Icon = ICON_MAP[esp.icono] || Stethoscope;
              return (
                <div key={esp.id}
                  className="group bg-white border border-gray-100 hover:border-primary rounded-card p-6 shadow-card hover:shadow-hero transition-all duration-200 hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-card bg-primary-pale group-hover:bg-primary flex items-center justify-center shrink-0 transition-colors">
                      <Icon size={24} className="text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold font-heading text-dark group-hover:text-primary transition-colors text-base leading-tight mb-1">{esp.nombre}</h2>
                      {esp.descripcion && <p className="text-gray text-sm leading-relaxed line-clamp-2">{esp.descripcion}</p>}
                      {esp._count?.medicos > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-secondary font-medium">
                          <Users size={12} /> {esp._count.medicos} médico{esp._count.medicos > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-primary-pale rounded-card p-8 text-center">
          <h3 className="font-bold font-heading text-primary text-xl mb-2">¿Necesita un médico especialista?</h3>
          <p className="text-gray mb-4 text-sm">Consulte la disponibilidad de nuestros médicos y sus horarios de atención.</p>
          <Link to="/directorio" className="btn-primario inline-flex">
            Ver Directorio Médico <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
