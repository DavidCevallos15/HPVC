import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Baby, Scissors, Heart, Bone, Activity, Layers, Brain, Eye, Smile, FlaskConical, ChevronRight, CheckCircle, Bed, TestTube, Cross, PhoneCall, Search, ChevronLeft, User, Building, Briefcase, Package, Archive, Wrench, Users } from 'lucide-react';
import api from '../api/axios';

const getIconForSpecialty = (nombre, dbIcon) => {
   const n = nombre.toLowerCase();
   if (n.includes('pediatr') || n.includes('neonat')) return Baby;
   if (n.includes('cirug') || n.includes('quir') || n.includes('parto')) return Scissors;
   if (n.includes('cardio') || n.includes('vascular')) return Heart;
   if (n.includes('trauma') || n.includes('ortop')) return Bone;
   if (n.includes('neuro') || n.includes('psiquia') || n.includes('psicol')) return Brain;
   if (n.includes('oftal') || n.includes('optom')) return Eye;
   if (n.includes('odont') || n.includes('maxilo')) return Smile;
   if (n.includes('laboratorio') || n.includes('patolog') || n.includes('sangre')) return FlaskConical;
   if (n.includes('emergencia') || n.includes('uci') || n.includes('triage') || n.includes('intensiv')) return Activity;
   if (n.includes('gastro') || n.includes('nutri') || n.includes('endocrin')) return TestTube;
   if (n.includes('gineco') || n.includes('obste')) return Users;
   
   if (n.includes('admin') || n.includes('gerencia') || n.includes('direcci') || n.includes('financiero') || n.includes('juridica')) return Briefcase;
   if (n.includes('farmacia') || n.includes('bodega') || n.includes('compras')) return Package;
   if (n.includes('archivo') || n.includes('estadist') || n.includes('informacion')) return Archive;
   if (n.includes('mantenimiento') || n.includes('tics')) return Wrench;
   if (n.includes('enfermeria') || n.includes('epidemiologia')) return Cross;
   
   if (dbIcon === 'building') return Building;
   if (dbIcon === 'user') return User;
   return Stethoscope;
};

export default function EspecialidadesPage() {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    api.get('/public/especialidades').then(r => setEspecialidades(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Filtrado y paginación
  const filtered = especialidades.filter(e => e.nombre.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white pt-24 md:pt-32 pb-12 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="text-primary-pale text-xs md:text-sm mb-4 flex items-center gap-2">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span>Especialidades</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-semibold font-heading">Especialidades Médicas</h1>
          <p className="text-primary-pale mt-2 max-w-xl text-sm md:text-base">
            Contamos con un equipo de profesionales especializados para brindar atención integral a toda la comunidad manabita.
          </p>
        </div>
      </div>


      {/* Grid Especialidades de la BD */}
      <div className="container mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold font-heading text-dark mb-3 md:mb-4">Listado de Especialidades y Áreas</h2>
          <p className="text-gray max-w-2xl mx-auto mb-5 md:mb-6 text-sm md:text-base">Busque y conozca toda nuestra oferta médica e institucional.</p>
          
          <div className="max-w-xl mx-auto relative mb-6 md:mb-8">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-neutral-400 size-[18px] md:size-5" />
             </div>
             <input type="text" placeholder="Buscar especialidad o área..." value={search} onChange={handleSearchChange}
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-white border border-neutral-200 rounded-xl md:rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-dark text-sm md:text-base" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[...Array(9)].map((_, i) => <div key={`skeleton-${i}`} className="h-24 bg-neutral-100 rounded-card animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {currentItems.map((esp) => {
                const Icon = getIconForSpecialty(esp.nombre, esp.icono);
                return (
                  <div key={esp.id} className="group bg-white border border-neutral-100 hover:border-primary rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center gap-3">
                    <div className="size-12 rounded-full bg-primary-pale group-hover:bg-primary flex items-center justify-center transition-colors">
                      <Icon size={24} className="text-primary group-hover:text-white transition-colors" />
                    </div>
                    <h2 className="font-semibold font-heading text-dark group-hover:text-primary transition-colors text-base leading-tight">
                      {esp.nombre}
                    </h2>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
               <div className="text-center py-10 text-neutral-400">
                  <p>No se encontraron áreas ni especialidades.</p>
               </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border border-neutral-200 disabled:opacity-50 hover:bg-neutral-50 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={`page-${i}`}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`size-10 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-primary text-white' : 'bg-white border border-neutral-200 text-gray hover:bg-neutral-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white border border-neutral-200 disabled:opacity-50 hover:bg-neutral-50 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-14 max-w-4xl mx-auto bg-primary-pale rounded-card p-8 text-center">
          <h3 className="font-semibold font-heading text-primary text-xl mb-2">¿Necesita un médico especialista?</h3>
          <p className="text-gray mb-4 text-sm">Consulte la disponibilidad de nuestros médicos y áreas.</p>
          <Link to="/directorio" className="btn-primario inline-flex">
            Ver Directorio Médico <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
