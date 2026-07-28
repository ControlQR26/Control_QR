"use client";

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Loader2, BellRing, UserCheck, CalendarDays, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      toast.error('Error de red al cargar notificaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Centro de Notificaciones Simuladas"
        description="Consulte el flujo de alertas y mensajes generados por el sistema de control de acceso estudiantil."
        action={
          <button 
            onClick={fetchNotifications} 
            className="flex items-center gap-2 text-xs text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg font-medium shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          No se han disparado notificaciones de ingresos en la sesión actual.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  notif.tipoDestinatario === 'acudiente'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'bg-purple-50 text-purple-700 border border-purple-100'
                }`}>
                  {notif.tipoDestinatario}
                </span>
                <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(notif.fecha).toLocaleString('es-CO')}
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {notif.mensaje}
              </p>

              <div className="flex justify-between items-center text-xs text-gray-500 pt-1 border-t border-gray-50">
                <span>Destinatario: <span className="font-semibold text-gray-700">{notif.destinatario}</span></span>
                <span className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full border ${
                  notif.estado === 'enviada'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    notif.estado === 'enviada' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}></span>
                  {notif.estado === 'enviada' ? 'Enviada (Telegram)' : 'Simulada'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
