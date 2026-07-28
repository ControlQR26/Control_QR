"use client";

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Search, Loader2, CalendarRange, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AccessLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState('todos');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/access-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (e) {
      toast.error('Error de red al cargar el historial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filterState === 'todos') return true;
    return log.estado === filterState;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial de Ingresos"
        description="Consulte el registro histórico detallado de ingresos de estudiantes a la institución."
      />

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Selector de filtros */}
        <div className="flex gap-2">
          {['todos', 'validado', 'sin clase programada', 'estudiante inactivo'].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterState(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize ${
                filterState === opt
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <button 
          onClick={fetchLogs} 
          className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium border border-gray-200 transition-colors w-full md:w-auto justify-center"
        >
          Refrescar Historial
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <p className="text-center py-12 text-sm text-gray-500 bg-white rounded-xl border border-gray-200">No hay registros de ingreso que coincidan con el filtro.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Estudiante</th>
                  <th className="px-6 py-3">Fecha y Hora</th>
                  <th className="px-6 py-3">Método</th>
                  <th className="px-6 py-3">Clase Detectada</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {log.studentId ? (
                        <>
                          <p>{log.studentId.nombres} {log.studentId.apellidos}</p>
                          <p className="text-[10px] text-gray-400 font-mono">CC: {log.studentId.numeroDocumento}</p>
                        </>
                      ) : (
                        'Desconocido'
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 flex items-center gap-1">
                          <CalendarRange className="h-3 w-3 text-gray-400" />
                          {new Date(log.fecha).toLocaleDateString('es-CO')}
                        </span>
                        <span className="flex items-center gap-1 text-[10px]">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {log.hora}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-mono font-bold">{log.metodo}</span>
                    </td>
                    <td className="px-6 py-4">
                      {log.subjectId ? (
                        <>
                          <p className="font-semibold text-gray-800">{log.subjectId.nombre}</p>
                          {log.teacherId && <p className="text-[10px] text-gray-400">Prof. {log.teacherId.nombres} {log.teacherId.apellidos}</p>}
                        </>
                      ) : (
                        <p className="text-gray-400 italic">Ninguna</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.estado === 'validado'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : log.estado === 'sin clase programada'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {log.estado === 'validado' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {log.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={log.mensaje}>{log.mensaje}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
