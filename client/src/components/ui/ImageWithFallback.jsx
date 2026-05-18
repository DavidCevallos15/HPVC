import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import Skeleton from './Skeleton';

export default function ImageWithFallback({ src, alt, className, containerClassName }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName || className || ''}`}>
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {hasError ? (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400">
          <ImageIcon size={32} className="opacity-50" />
          <span className="text-xs mt-2 font-medium">No disponible</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${className || ''} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 object-cover`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
