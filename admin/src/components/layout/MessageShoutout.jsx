import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BellRing, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MessageShoutout({ message, onClose }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.aside
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="fixed right-4 top-4 z-[80] w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-[#dbe8e2] bg-[#fffdf8] text-[#243b36] shadow-[0_24px_70px_rgba(46,80,70,0.2)]"
          role="status"
          aria-live="polite"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-secondary" />
          <div className="p-4 pl-5">
            <div className="flex items-start gap-3">
              <div className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary-pale text-secondary">
                <BellRing size={19} />
                <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-[#fffdf8] bg-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                      Nuevo mensaje ciudadano
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold">{message.nombre}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1 text-[#8a9892] transition hover:bg-primary-pale hover:text-primary"
                    aria-label="Cerrar notificación"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#66756f]">
                  {message.asunto}
                </p>
                <Link
                  to="/contacto"
                  onClick={onClose}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary transition hover:text-primary-dark"
                >
                  Abrir bandeja <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
          <motion.div
            className="h-0.5 origin-left bg-secondary"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 9, ease: 'linear' }}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
