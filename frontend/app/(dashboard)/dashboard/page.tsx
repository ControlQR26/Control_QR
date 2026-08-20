"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Activity, 
  ArrowUpRight, 
  Clock, 
  UserCheck, 
  BellRing,
  RefreshCw,
  QrCode
} from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import Link from 'next/link';
import { toast } from 'sonner';

interface Stats {
  students: number;
  teachers: number;
  subjects: number;
  guardians: number;
  totalLogs: number;
  todayLogs: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentLogs(data.recentLogs);
        setRecentNotifications(data.recentNotifications);
      } else {
        toast.error('Error al cargar estadísticas.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error de red.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const kpis = [
    { title: 'Estudiantes Registrados', value: stats?.students || 0, icon: Users, color: 'text-blue-600 bg-blue-50', link: '/students' },
    { title: 'Docentes Registrados', value: stats?.teachers || 0, icon: GraduationCap, color: 'text-purple-600 bg-purple-50', link: '/teachers' },
    { title: 'Materias Programadas', value: stats?.subjects || 0, icon: BookOpen, color: 'text-amber-600 bg-amber-50', link: '/subjects' },
    { title: 'Ingresos de Hoy', value: stats?.todayLogs || 0, icon: Activity, color: 'text-emerald-600 bg-emerald-50', link: '/access-logs' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard General" 
        description="Métricas generales del control de acceso estudiantil." 
        action={
          <button onClick={fetchStats} className="flex items-center gap-2 text-sm bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors font-medium text-gray-700 shadow-sm">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link key={idx} href={kpi.link} className="block bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div className={`p-2 sm:p-3 rounded-lg ${kpi.color}`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-2 sm:mt-4">{kpi.value}</p>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mt-1">{kpi.title}</h3>
            </Link>
          );
        })}
      </div>

      {/* Main Widgets Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Últimos Ingresos */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              Últimos Ingresos Registrados
            </h2>
            <Link href="/access-logs" className="text-xs font-semibold text-emerald-600 hover:underline">
              Ver Todos
            </Link>
          </div>

          <div className="space-y-4">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay ingresos registrados el día de hoy.
              </div>
            ) : (
              recentLogs.map((log) => (
                <div key={log._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {log.studentId?.nombres?.charAt(0) || 'E'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 break-words">
                        {log.studentId ? `${log.studentId.nombres} ${log.studentId.apellidos}` : 'Estudiante Desconocido'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 shrink-0" /> {log.hora} - {log.studentId?.codigoEstudiantil}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end shrink-0 pl-12 sm:pl-0">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold leading-none border ${
                      log.estado === 'validado' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : log.estado === 'sin clase programada'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {log.estado}
                    </span>
                    {log.subjectId && (
                      <p className="text-[10px] text-gray-400 mt-1">{log.subjectId.nombre}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Últimas Notificaciones */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
              <BellRing className="h-5 w-5 text-emerald-600" />
              Notificaciones Generadas (Simulador)
            </h2>
            <Link href="/notifications" className="text-xs font-semibold text-emerald-600 hover:underline">
              Ver Historial
            </Link>
          </div>

          <div className="space-y-4">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No se han disparado notificaciones aún.
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div key={notif._id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      notif.tipoDestinatario === 'acudiente'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {notif.tipoDestinatario}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(notif.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {notif.mensaje}
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>Destinatario: <span className="font-semibold text-gray-600">{notif.destinatario}</span></span>
                    <span className={`font-bold ${notif.estado === 'enviada' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {notif.estado === 'enviada' ? 'Enviada' : 'Simulada'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Floating Action Button for Scan */}
      <div className="fixed bottom-6 right-6">
        <Link href="/scanner" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all scale-100 hover:scale-105">
          <QrCode className="h-5 w-5" />
          Escanear QR
        </Link>
      </div>

    </div>
  );
}
