import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Newspaper, CalendarDays, MessageSquare,
  Settings, LogOut, ChevronLeft, ChevronRight, Stethoscope,
} from 'lucide-react';

const navItems = [
  { to: '/',             Icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/noticias',     Icon: Newspaper,       label: 'Noticias' },
  { to: '/horarios',     Icon: CalendarDays,    label: 'Horarios Excel' },
  { to: '/medicos',      Icon: Stethoscope,     label: 'Médicos' },
  { to: '/contacto',     Icon: MessageSquare,   label: 'Mensajes' },
  { to: '/configuracion',Icon: Settings,        label: 'Configuración' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} flex flex-col bg-primary-dark text-white transition-all duration-300 shrink-0 min-h-screen`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div>
            <div className="font-bold text-sm font-heading leading-none">HPVC</div>
            <div className="text-accent text-xs">Admin Panel</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-btn hover:bg-white/10 transition-colors">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-primary-dark text-sm">
              {user.nombre?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.nombre}</div>
              <div className="text-xs text-primary-pale truncate">{user.rol?.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {navItems.map(({ to, Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-primary-pale hover:bg-white/10 hover:text-white'
              }`
            }>
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-white/10">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-btn text-sm text-primary-pale hover:bg-red-500/20 hover:text-error transition-colors">
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
