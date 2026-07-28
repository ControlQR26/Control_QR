import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  HeartHandshake, 
  GraduationCap, 
  BookOpen, 
  CalendarDays, 
  QrCode, 
  History, 
  Bell,
  LogOut,
  X
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  currentPath: string;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ currentPath, mobileOpen = false, setMobileOpen }: SidebarProps) {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Estudiantes', path: '/students', icon: Users },
    { name: 'Acudientes', path: '/guardians', icon: HeartHandshake },
    { name: 'Docentes', path: '/teachers', icon: GraduationCap },
    { name: 'Materias', path: '/subjects', icon: BookOpen },
    { name: 'Horarios', path: '/schedules', icon: CalendarDays },
    { name: 'Escanear QR', path: '/scanner', icon: QrCode, highlight: true },
    { name: 'Historial', path: '/access-logs', icon: History },
    { name: 'Notificaciones', path: '/notifications', icon: Bell },
  ];

  return (
    <>
      {/* Overlay para móviles */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-emerald-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 lg:static lg:flex flex-col justify-between w-64 bg-emerald-950 text-white min-h-screen border-r border-emerald-900/60 shadow-xl transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div>
          {/* Header/Logo con paleta institucional (Verde + Amarillo) */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-emerald-900/60 bg-emerald-950/80">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black text-xl shadow-md border border-yellow-300">
                C
              </div>
              <div>
                <h1 className="font-extrabold text-base leading-none text-white tracking-tight">ControlQR</h1>
                <span className="text-[10px] text-yellow-400 font-bold tracking-wider uppercase">CONTROL ACCESO</span>
              </div>
            </div>
            
            {/* Botón cerrar para móviles */}
            <button 
              onClick={() => setMobileOpen?.(false)}
              className="lg:hidden p-1 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen?.(false)}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all gap-3 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md border-l-4 border-yellow-400'
                      : item.highlight
                      ? 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 hover:bg-yellow-400/20'
                      : 'text-emerald-100/70 hover:bg-emerald-900/70 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-yellow-300' : item.highlight ? 'text-yellow-400' : 'text-emerald-300/70'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Sign Out */}
        <div className="p-4 border-t border-emerald-900/60 bg-emerald-950/50">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-200/80 hover:bg-red-950/40 hover:text-red-300 transition-colors gap-3 border border-transparent hover:border-red-900/30"
          >
            <LogOut className="h-5 w-5 text-emerald-400" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
