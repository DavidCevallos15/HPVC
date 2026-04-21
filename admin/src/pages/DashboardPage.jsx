import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Stethoscope, MessageSquare, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Noticias publicadas',   value: stats.noticiasPub,        total: stats.totalNoticias, Icon: Newspaper,     color: 'bg-blue-500',   link: '/noticias' },
    { label: 'Médicos activos',       value: stats.totalMedicos,       total: null,                Icon: Stethoscope,   color: 'bg-secondary',  link: '/medicos' },
    { label: 'Especialidades',        value: stats.totalEspecialidades, total: null,               Icon: TrendingUp,    color: 'bg-primary',    link: '/medicos' },
    { label: 'Mensajes sin leer',     value: stats.mensajesNoLeidos,   total: null,                Icon: MessageSquare, color: 'bg-amber-500',  link: '/contacto' },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenido de vuelta, <strong>{user?.nombre}</strong>.</p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cards.map(({ label, value, total, Icon, color, link }) => (
            <Link key={label} to={link}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
                {total != null && (
                  <span className="text-xs text-gray-400">{value}/{total}</span>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 mt-1 group-hover:text-primary transition-colors">{label}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold font-heading text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/noticias/nueva"
            className="flex items-center gap-3 p-4 bg-primary-pale hover:bg-primary hover:text-white rounded-xl group transition-all">
            <Newspaper size={20} className="text-primary group-hover:text-white" />
            <div>
              <div className="font-semibold text-sm group-hover:text-white text-dark">Nueva Noticia</div>
              <div className="text-xs text-gray group-hover:text-white/80">Publicar artículo</div>
            </div>
          </Link>
          <Link to="/horarios"
            className="flex items-center gap-3 p-4 bg-secondary-pale hover:bg-secondary hover:text-white rounded-xl group transition-all">
            <CheckCircle size={20} className="text-secondary group-hover:text-white" />
            <div>
              <div className="font-semibold text-sm group-hover:text-white text-dark">Subir Horarios</div>
              <div className="text-xs text-gray group-hover:text-white/80">Importar Excel</div>
            </div>
          </Link>
          <Link to="/contacto"
            className="flex items-center gap-3 p-4 bg-amber-50 hover:bg-amber-500 hover:text-white rounded-xl group transition-all">
            <MessageSquare size={20} className="text-amber-500 group-hover:text-white" />
            <div>
              <div className="font-semibold text-sm group-hover:text-white text-dark">Ver Mensajes</div>
              <div className="text-xs text-gray group-hover:text-white/80">Inbox contacto</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
