import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';

const MAX_IMAGES = 10;
const AUTOPLAY_INTERVAL = 5000; // 5 segundos

export default function ImageCarousel({ images = [], autoplay = true, showIndicators = true }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Filtrar imágenes válidas y limitar al máximo
  const validImages = images.filter(img => img && img.url).slice(0, MAX_IMAGES);
  
  // Si no hay imágenes válidas, no renderizar nada
  if (validImages.length === 0) {
    return null;
  }

  // Resetear índice si las imágenes cambian
  useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0);
    }
  }, [validImages.length, currentIndex]);

  // Autoplay
  useEffect(() => {
    if (autoplay && !isPaused && validImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
      }, AUTOPLAY_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoplay, isPaused, validImages.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div 
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl bg-neutral-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Contenedor principal */}
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
        {/* Imágenes */}
        <div className="relative w-full h-full">
          {validImages.map((image, index) => (
            <div
              key={image.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt || `Imagen ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              
              {/* Overlay opcional para mejor legibilidad */}
              {index === currentIndex && image.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-white text-lg md:text-xl font-semibold">
                    {image.title}
                  </h3>
                  {image.description && (
                    <p className="text-white/90 text-sm mt-1 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Flechas de navegación - solo mostrar si hay más de una imagen */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-800 p-2 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-800 p-2 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
              aria-label="Siguiente imagen"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Indadores - solo mostrar si hay más de una imagen */}
        {showIndicators && validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white text-neutral-800 scale-110' 
                    : 'bg-white/50 text-white hover:bg-white/70'
                } p-1 rounded-full`}
                aria-label={`Ir a imagen ${index + 1}`}
              >
                <Circle 
                  size={index === currentIndex ? 8 : 6} 
                  fill={index === currentIndex ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contador de imágenes - opcional */}
      {validImages.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {validImages.length}
        </div>
      )}
    </div>
  );
}
