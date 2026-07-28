import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import logoMsp from '../assets/logo-msp-remove.png';
import logoNuevoEcuador from '../assets/Footer.png';
import logoNuevoEcuadorFooter from '../assets/logo-nuevo-ecuador.svg';
import hospitalBackground from '../assets/background-hero-section.jpeg';

const HOSPITAL_URL = 'https://hpvc.gob.ec';
const HOSPITAL_EMAIL = 'hospital.portoviejo@mspz4.gob.ec';

const accessProfiles = {
  administrativo: {
    label: 'Personal administrativo',
    descriptor: 'Gestión y administración institucional',
    Icon: BriefcaseBusiness,
    accent: 'Administrativo',
  },
  operativo: {
    label: 'Personal operativo',
    descriptor: 'Operación y servicios institucionales',
    Icon: Activity,
    accent: 'Operativo',
  },
};

function formatConsultationDate(date) {
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'full',
    timeStyle: 'short',
    hour12: true,
  }).format(date);
}

function ExternalNavbar() {
  return (
    <>
      <div className="hidden bg-primary py-2 text-xs text-white md:block">
        <div className="container mx-auto flex items-center justify-end px-6">
          <a
            className="flex items-center gap-2 font-medium opacity-95 transition-colors hover:text-accent"
            href={`mailto:${HOSPITAL_EMAIL}`}
          >
            <Mail size={13} /> {HOSPITAL_EMAIL}
          </a>
        </div>
      </div>

      <nav className="relative z-20 border-b border-primary/10 bg-white shadow-md">
        <div className="container mx-auto flex h-16 items-center px-4 sm:px-6">
          <a className="flex min-w-0 items-center gap-3" href={HOSPITAL_URL} aria-label="Ir al portal del hospital">
            <img src={logoMsp} alt="Ministerio de Salud Pública" className="h-11 w-auto object-contain" />
            <img src={logoNuevoEcuador} alt="Gobierno del Nuevo Ecuador" className="hidden h-9 w-auto object-contain sm:block" />
          </a>
        </div>
      </nav>
    </>
  );
}

function ExternalFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-primary bg-primary-dark text-white">
      <div className="pointer-events-none absolute -right-20 -top-44 h-96 w-96 rounded-full bg-primary opacity-30 blur-3xl" />
      <div className="container relative mx-auto grid gap-9 px-6 py-11 md:grid-cols-[1.2fr_.8fr] md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
              <img src={logoMsp} alt="Logotipo MSP" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Hospital Provincial Dr. Verdi Cevallos Balda</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Ministerio de Salud Pública</p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-primary-pale">
            Control de acceso institucional. Esta página forma parte de los servicios digitales del hospital.
          </p>
        </div>

        <div className="space-y-3 text-sm text-primary-pale md:justify-self-end">
          <div className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-accent" /> Calle 12 de Marzo y Rocafuerte, Portoviejo, Ecuador</div>
          <a className="flex items-center gap-2 transition-colors hover:text-white" href={`mailto:${HOSPITAL_EMAIL}`}><Mail size={16} className="shrink-0 text-accent" /> {HOSPITAL_EMAIL}</a>
        </div>
      </div>
      <div className="border-t border-white/10 bg-black/20">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-6 py-4 text-center text-xs text-primary-pale/80 sm:flex-row sm:text-left">
          <span>© {new Date().getFullYear()} Hospital Provincial Dr. Verdi Cevallos Balda.</span>
          <a href="https://www.salud.gob.ec/" className="flex items-center gap-3 transition-opacity hover:opacity-100">
            <img src={logoNuevoEcuadorFooter} alt="El Nuevo Ecuador" className="h-7 w-auto brightness-0 invert opacity-90" />
            <span>Ministerio de Salud Pública</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function AccessVerificationPage({ profile = 'administrativo' }) {
  const details = accessProfiles[profile] || accessProfiles.administrativo;
  const [consultedAt, setConsultedAt] = useState(() => new Date());
  const ProfileIcon = details.Icon;

  useEffect(() => {
    document.title = `Acceso ${details.accent.toLowerCase()} | Hospital Dr. Verdi Cevallos Balda`;
    const timer = window.setInterval(() => setConsultedAt(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, [details.accent]);

  const formattedDate = useMemo(() => formatConsultationDate(consultedAt), [consultedAt]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 font-body text-dark">
      <ExternalNavbar />

      <main className="relative flex flex-1 items-center overflow-hidden py-9 sm:py-12 lg:py-16">
        <img src={hospitalBackground} alt="Instalaciones del Hospital Dr. Verdi Cevallos Balda" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/95 via-primary/90 to-[#005BAC]/82" />
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute bottom-[-180px] right-[-100px] h-[410px] w-[410px] rounded-full border-[28px] border-accent/20" />

        <div className="container relative z-10 mx-auto w-full px-4 sm:px-6">
          <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[24px] border border-white/35 bg-white/96 shadow-2xl backdrop-blur-sm lg:grid-cols-[.88fr_1.12fr]">
            <aside className="relative overflow-hidden bg-primary p-7 text-white sm:p-9 lg:p-11">
              <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-accent/20 blur-2xl" />
              <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full border-[18px] border-white/10" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary-pale">
                  <ShieldCheck size={15} className="text-accent" /> Control de acceso
                </span>

                <div className="mt-9 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary shadow-lg">
                  <ProfileIcon size={31} strokeWidth={1.8} />
                </div>
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-accent">Categoría de acceso</p>
                <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{details.label}</h1>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-pale">{details.descriptor}</p>
              </div>

              <div className="relative mt-10 border-t border-white/15 pt-5 text-sm text-primary-pale">
                <p className="font-semibold text-white">Acceso institucional</p>
                <p className="mt-1 leading-relaxed">Presente su identificación institucional al personal responsable de control.</p>
              </div>
            </aside>

            <section className="bg-white p-7 sm:p-9 lg:p-11">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-pale text-secondary">
                  <BadgeCheck size={25} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">Verificación completada</p>
                  <p className="mt-1 text-sm text-gray">Validación de enlace institucional</p>
                </div>
              </div>

              <div className="mt-9">
                <p className="text-sm font-medium text-primary">Bienvenido/a</p>
                <h2 className="mt-2 text-3xl font-bold leading-tight text-dark sm:text-4xl">Su código QR institucional ha sido reconocido.</h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-gray">
                  Acceso aceptado para <strong className="font-semibold text-primary">{details.label.toLowerCase()}</strong>.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-secondary/20 bg-secondary-pale/45 p-4 sm:flex sm:items-center sm:gap-4 sm:p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-white"><ShieldCheck size={23} /></div>
                <div className="mt-3 sm:mt-0">
                  <p className="font-semibold text-secondary">Estado: acceso aceptado</p>
                  <p className="mt-0.5 text-sm text-gray">Corresponde a la categoría institucional indicada.</p>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-gray">Tipo de personal</p>
                  <p className="mt-1 font-semibold text-dark">{details.label}</p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-gray"><Clock3 size={13} /> Consulta realizada</p>
                  <p className="mt-1 text-sm font-medium capitalize text-dark">{formattedDate}</p>
                </div>
              </div>

              <a href={HOSPITAL_URL} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-light">
                Ir al portal institucional <ArrowUpRight size={16} />
              </a>
            </section>
          </div>

          <p className="mx-auto mt-5 flex max-w-3xl items-center justify-center gap-1.5 text-center text-xs leading-relaxed text-white/85">
            <ChevronRight size={14} className="shrink-0 text-accent" /> Este código identifica una categoría de acceso y debe complementarse con la identificación institucional correspondiente.
          </p>
        </div>
      </main>

      <ExternalFooter />
    </div>
  );
}
