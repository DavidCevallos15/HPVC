import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/ui/PageTransition';
import { Building2 } from 'lucide-react';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import SeccionNoDisponiblePage from './pages/SeccionNoDisponiblePage';
import PageViewTracker from './components/PageViewTracker';

const HomePage            = lazy(() => import('./pages/HomePage'));
const EspecialidadesPage  = lazy(() => import('./pages/EspecialidadesPage'));
const DirectorioPage      = lazy(() => import('./pages/DirectorioPage'));
const NoticiasPage        = lazy(() => import('./pages/NoticiasPage'));
const NoticiaDetallePage  = lazy(() => import('./pages/NoticiaDetallePage'));
const ContactoPage        = lazy(() => import('./pages/ContactoPage'));
const DocumentosPage      = lazy(() => import('./pages/DocumentosPage'));
const RecorridoVirtualPage = lazy(() => import('./pages/RecorridoVirtualPage'));
const AccesosPage         = lazy(() => import('./pages/AccesosPage'));
const SubcentrosPage      = lazy(() => import('./pages/SubcentrosPage'));
const AcercaPage          = lazy(() => import('./pages/AcercaPage'));
const HorariosPage        = lazy(() => import('./pages/HorariosPage'));
const ServiciosPacientePage = lazy(() => import('./pages/ServiciosPacientePage'));
const AsistenteClinicoPage = lazy(() => import('./pages/AsistenteClinicoPage'));
const InstitucionPage     = lazy(() => import('./pages/InstitucionPage'));
const ServiciosPage       = lazy(() => import('./pages/ServiciosPage'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SectionRoute({ section, children }) {
  const { isSectionEnabled, sectionsLoading } = useConfig();

  if (sectionsLoading) return <PageLoader />;
  if (!isSectionEnabled(section)) return <SeccionNoDisponiblePage />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<SectionRoute section="inicio"><HomePage /></SectionRoute>} />
          <Route path="/especialidades" element={<SectionRoute section="especialidades"><EspecialidadesPage /></SectionRoute>} />
          <Route path="/directorio" element={<SectionRoute section="directorio"><DirectorioPage /></SectionRoute>} />
          <Route path="/noticias" element={<SectionRoute section="noticias"><NoticiasPage /></SectionRoute>} />
          <Route path="/noticias/:slug" element={<SectionRoute section="noticias"><NoticiaDetallePage /></SectionRoute>} />
          <Route path="/contacto" element={<SectionRoute section="contacto"><ContactoPage /></SectionRoute>} />
          <Route path="/documentos" element={<SectionRoute section="documentos"><DocumentosPage /></SectionRoute>} />
          <Route path="/recorrido-virtual" element={<SectionRoute section="recorrido_virtual"><RecorridoVirtualPage /></SectionRoute>} />
          <Route path="/accesos" element={<SectionRoute section="accesos"><AccesosPage /></SectionRoute>} />
          <Route path="/subcentros" element={<SectionRoute section="subcentros"><SubcentrosPage /></SectionRoute>} />
          <Route path="/acerca" element={<SectionRoute section="acerca"><AcercaPage /></SectionRoute>} />
          <Route path="/horarios" element={<SectionRoute section="horarios"><HorariosPage /></SectionRoute>} />
          <Route path="/servicios-paciente" element={<SectionRoute section="servicios_paciente"><ServiciosPacientePage /></SectionRoute>} />
          <Route path="/asistente-clinico" element={<SectionRoute section="asistente_clinico"><AsistenteClinicoPage /></SectionRoute>} />
          <Route path="/institucion" element={<SectionRoute section="institucion"><InstitucionPage /></SectionRoute>} />
          <Route path="/servicios" element={<SectionRoute section="servicios"><ServiciosPage /></SectionRoute>} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
              <Building2 size={64} className="text-neutral-300" />
              <h2 className="text-3xl font-semibold font-heading text-dark">Página no encontrada</h2>
              <p className="text-gray">La ruta que buscas no existe.</p>
              <a href="/" className="btn-primario mt-2">← Volver al inicio</a>
            </div>
          } />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <PageViewTracker />
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </main>
          <Footer />
          <ChatbotWidget />
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
}
