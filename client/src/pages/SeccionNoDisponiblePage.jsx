import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Clock3, Home, PhoneCall } from 'lucide-react';

export default function SeccionNoDisponiblePage() {
  return (
    <section className="relative isolate min-h-[68vh] overflow-hidden bg-slate-50 px-6 py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-72 bg-[linear-gradient(135deg,#003A70_0%,#00558f_55%,#007A4D_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-20 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-white/15 blur-3xl"
      />

      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-slate-900/15">
          <div className="h-2 bg-[linear-gradient(90deg,#003A70_0%,#007A4D_100%)]" />
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#D6E6F5] text-[#003A70]">
              <Clock3 size={38} strokeWidth={1.8} aria-hidden="true" />
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#007A4D]">
              Portal institucional HPVC
            </p>
            <h1 className="font-heading text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              Sección temporalmente no disponible
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">
              Esta sección del portal institucional se encuentra temporalmente deshabilitada.
              Por favor, vuelva a intentarlo más tarde o utilice los canales oficiales de
              contacto del hospital.
            </p>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#003A70] px-5 py-3 text-sm font-semibold text-white transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#00558f] focus:outline-none focus:ring-2 focus:ring-[#003A70] focus:ring-offset-2"
              >
                <Home size={18} aria-hidden="true" />
                Volver al inicio
              </Link>
              <Link
                to="/contacto"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#007A4D] hover:text-[#007A4D] focus:outline-none focus:ring-2 focus:ring-[#007A4D] focus:ring-offset-2"
              >
                <PhoneCall size={18} aria-hidden="true" />
                Canales de contacto
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 text-xs font-medium text-slate-500">
            <Building2 size={15} aria-hidden="true" />
            Hospital Provincial Dr. Verdi Cevallos Balda
          </div>
        </div>
      </div>
    </section>
  );
}
