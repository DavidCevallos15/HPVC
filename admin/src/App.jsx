import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './components/layout/AdminLayout';

import LoginPage         from './pages/LoginPage';
import DashboardPage     from './pages/DashboardPage';
import NoticiasAdminPage from './pages/NoticiasAdminPage';
import NoticiaFormPage   from './pages/NoticiaFormPage';
import HorariosPage      from './pages/HorariosPage';
import ContactoAdminPage from './pages/ContactoAdminPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import MedicosAdminPage  from './pages/MedicosAdminPage';
import MedicoFormPage    from './pages/MedicoFormPage';
import DocumentosAdminPage from './pages/DocumentosAdminPage';
import ImagenMesAdminPage  from './pages/ImagenMesAdminPage';
import HeroCarouselAdminPage from './pages/HeroCarouselAdminPage';
import PoaAdminPage        from './pages/PoaAdminPage';
import SeccionesPublicasAdminPage from './pages/SeccionesPublicasAdminPage';

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function AnimatedRoutes() {
  return (
    <Routes>
      {/* Login público */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas dentro del layout */}
      <Route path="/" element={
        <PrivateRoute>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="noticias"             element={<NoticiasAdminPage />} />
        <Route path="noticias/nueva"        element={<NoticiaFormPage />} />
        <Route path="noticias/editar/:id"   element={<NoticiaFormPage />} />
        <Route path="horarios"             element={<HorariosPage />} />
        <Route path="contacto"             element={<ContactoAdminPage />} />
        <Route path="configuracion"        element={<ConfiguracionPage />} />
        <Route path="secciones-publicas"   element={<SeccionesPublicasAdminPage />} />
        <Route path="configuracion/portada" element={<ImagenMesAdminPage />} />
        <Route path="configuracion/carrusel" element={<HeroCarouselAdminPage />} />
        <Route path="medicos"              element={<MedicosAdminPage />} />
        <Route path="medicos/nuevo"        element={<MedicoFormPage />} />
        <Route path="medicos/editar/:id"   element={<MedicoFormPage />} />
        <Route path="documentos"           element={<DocumentosAdminPage />} />
        <Route path="poa"                  element={<PoaAdminPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <AnimatedRoutes />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
