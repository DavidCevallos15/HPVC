import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Newspaper, CalendarDays, MessageSquare,
  Settings, LogOut, ChevronLeft, ChevronRight, Stethoscope, BookOpen,
  Image, FileSpreadsheet, Globe2
} from 'lucide-react';

const navItems = [
  { to: '/',             Icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/noticias',     Icon: Newspaper,       label: 'Noticias' },
  { to: '/documentos',   Icon: BookOpen,        label: 'Documentos Clínicos' },
  { to: '/poa',          Icon: FileSpreadsheet, label: 'Plan Operativo Anual' },
  { to: '/horarios',     Icon: CalendarDays,    label: 'Matriz de Guardias' },
  { to: '/medicos',      Icon: Stethoscope,     label: 'Médicos' },
  { to: '/contacto',     Icon: MessageSquare,   label: 'Mensajes', roles: ['SUPERADMIN'] },
  { to: '/configuracion/portada', Icon: Image,  label: 'Imagen del Mes' },
  { to: '/configuracion/carrusel', Icon: Image, label: 'Carrusel Principal' },
  { to: '/secciones-publicas', Icon: Globe2, label: 'Secciones públicas' },
  { to: '/configuracion',Icon: Settings,        label: 'Configuración' },
];

export default function Sidebar({ unreadMessages = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} flex min-h-screen shrink-0 flex-col border-r border-[#dfe8e3] bg-[#fbfcf9] text-dark shadow-[8px_0_28px_rgba(46,80,70,0.05)] transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e5ece8] p-4">
        {!collapsed && (
          <div>
            <div className="font-bold text-sm font-heading leading-none text-dark">HPVC</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-secondary">Gestión hospitalaria</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto rounded-btn p-1.5 text-gray transition-colors hover:bg-primary-pale hover:text-primary">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User */}
      {!collapsed && user && (
        <div className="border-b border-[#e5ece8] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-pale text-sm font-bold text-secondary">
              {user.nombre?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-dark">{user.nombre}</div>
              <div className="truncate text-xs text-gray">{user.rol?.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {navItems
          .filter(({ roles }) => !roles || roles.includes(user?.rol))
          .map(({ to, Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-pale text-primary shadow-[inset_3px_0_0_#2E7D6F]'
                  : 'text-[#53665f] hover:bg-[#f1f5f1] hover:text-primary'
              }`
            }>
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
            {to === '/contacto' && unreadMessages > 0 && (
              <span className={`${collapsed ? 'absolute -right-1 -top-1 min-w-4 px-1 text-[9px]' : 'ml-auto min-w-5 px-1.5 text-[10px]'} flex h-5 items-center justify-center rounded-full bg-accent font-bold text-dark shadow-sm`}>
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-[#e5ece8] p-2">
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm text-gray transition-colors hover:bg-red-50 hover:text-error">
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
