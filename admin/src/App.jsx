import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
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
              <Route path="configuracion/portada" element={<ImagenMesAdminPage />} />
              <Route path="configuracion/carrusel" element={<HeroCarouselAdminPage />} />
              <Route path="medicos"              element={<MedicosAdminPage />} />
              <Route path="medicos/nuevo"        element={<MedicoFormPage />} />
              <Route path="medicos/editar/:id"   element={<MedicoFormPage />} />
              <Route path="documentos"           element={<DocumentosAdminPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
