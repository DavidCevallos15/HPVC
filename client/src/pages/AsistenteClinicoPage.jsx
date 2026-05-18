import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import Skeleton from '../components/ui/Skeleton';
import { Search, FileText, Brain, Stethoscope, ArrowRight, Sparkles } from 'lucide-react';

export default function AsistenteClinicoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setHasSearched(true);
      // Simulate API call delay
      setTimeout(() => {
        setIsSearching(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-[#003A70] to-[#005BAC] text-white py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
              Inteligencia Clínica
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-heading leading-tight mb-6">
              Asistente Clínico
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
              Accede a nuestra biblioteca clínica y sistema de búsqueda semántica. Encuentra información médica actualizada y protocolos del Hospital Provincial Dr. Verdi Cevallos Balda.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Search Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-neutral-100">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" 
                    size={24}
                  />
                  <Input
                    type="text"
                    placeholder="Busca protocolos clínicos, guías médicas, síntomas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`
                      h-14 pl-14 pr-32 text-base
                      focus-visible:ring-2 focus-visible:ring-[#005BAC] focus-visible:ring-offset-2
                      transition-all duration-200 ease-out
                    `}
                  />
                  <button
                    type="submit"
                    disabled={!searchQuery.trim() || isSearching}
                    className={`
                      absolute right-2 top-1/2 -translate-y-1/2
                      h-10 px-6 bg-[#003A70] hover:bg-[#005BAC]
                      text-white font-semibold rounded-lg
                      transition-all duration-200 ease-out
                      disabled:opacity-50 disabled:cursor-not-allowed
                      hover:shadow-lg hover:-translate-y-0.5
                      flex items-center gap-2
                    `}
                  >
                    {isSearching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        Buscar
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Search Suggestions */}
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">Sugerencias:</span>
                {['Protocolos de emergencia', 'Guías de diagnóstico', 'Tratamientos estándar'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearchQuery(suggestion)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-gray-700 text-sm rounded-full transition-all duration-200 ease-out"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {isSearching && (
              <div className="mt-12 space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="text-[#005BAC] animate-pulse" size={24} />
                  <p className="text-gray-600 font-medium">Procesando consulta semántica...</p>
                </div>
                
                {/* Skeleton Cards */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-card border border-neutral-100">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <div className="flex gap-2 mt-4">
                          <Skeleton className="h-8 w-24 rounded-full" />
                          <Skeleton className="h-8 w-20 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!hasSearched && !isSearching && (
              <div className="mt-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D6E6F5] rounded-full mb-6">
                  <Brain size={40} className="text-[#003A70]" />
                </div>
                <h3 className="text-2xl font-semibold font-heading text-dark mb-4">
                  Biblioteca Clínica Inteligente
                </h3>
                <p className="text-gray max-w-xl mx-auto mb-8">
                  Nuestro sistema utiliza inteligencia artificial para buscar y encontrar información médica relevante. 
                  Escribe tu consulta arriba para comenzar.
                </p>
                
                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                  <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-100">
                    <div className="w-12 h-12 bg-[#D6E6F5] rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <FileText size={24} className="text-[#003A70]" />
                    </div>
                    <h4 className="font-semibold text-dark mb-2">Protocolos Actualizados</h4>
                    <p className="text-gray text-sm">Accede a los protocolos más recientes aprobados por el hospital.</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-100">
                    <div className="w-12 h-12 bg-[#D4F0E3] rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Stethoscope size={24} className="text-[#007A4D]" />
                    </div>
                    <h4 className="font-semibold text-dark mb-2">Búsqueda Semántica</h4>
                    <p className="text-gray text-sm">Encuentra información relacionada incluso con términos similares.</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-100">
                    <div className="w-12 h-12 bg-[#E8F4FD] rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Sparkles size={24} className="text-[#005BAC]" />
                    </div>
                    <h4 className="font-semibold text-dark mb-2">Respuestas Rápidas</h4>
                    <p className="text-gray text-sm">Obtén respuestas precisas en segundos gracias a nuestro motor RAG.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results State (placeholder) */}
            {hasSearched && !isSearching && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold font-heading text-dark">
                    Resultados para "{searchQuery}"
                  </h3>
                  <span className="text-sm text-gray-500">Se encontraron 0 resultados</span>
                </div>
                
                <div className="bg-white rounded-xl p-12 shadow-card border border-neutral-100 text-center">
                  <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No se encontraron resultados para tu búsqueda. Intenta con otros términos o contacta al departamento médico.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
