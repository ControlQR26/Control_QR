"use client";

import { useSession } from 'next-auth/react';
import { Bell, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TopbarProps {
  onMenuToggle?: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-emerald-100/80 bg-white px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Botón de Menú Hamburguesa para Móviles y Reloj */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded-xl transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="text-xs sm:text-sm font-semibold text-emerald-900/70 capitalize hidden md:block">
          {currentTime || 'Cargando fecha...'}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notificaciones indicator */}
        <button className="relative p-2 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-yellow-400 border border-emerald-900 shadow-xs"></span>
        </button>

        <div className="h-8 w-px bg-emerald-100" />

        {/* Perfil del Administrador */}
        <div className="flex items-center gap-2 sm:gap-3 bg-emerald-50/60 px-3 py-1.5 rounded-full border border-emerald-100/80">
          <div className="h-8 w-8 rounded-full bg-yellow-400 text-emerald-950 flex items-center justify-center font-black text-sm shadow-xs border border-yellow-300">
            A
          </div>
          <div className="text-left hidden sm:block pr-1">
            <p className="text-xs sm:text-sm font-extrabold text-emerald-950 leading-none">
              Administrador
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
