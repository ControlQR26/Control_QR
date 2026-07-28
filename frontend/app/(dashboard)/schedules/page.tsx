"use client";

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Trash2, Loader2, Save, Calendar, CalendarDays, Grid, List } from 'lucide-react';
import { toast } from 'sonner';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Modos de Vista: 'semanal' o 'mensual'
  const [viewMode, setViewMode] = useState<'semanal' | 'mensual'>('semanal');

  const diasOrden = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

  const fetchStudentsAndSubjects = async () => {
    try {
      const [resStud, resSubj] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/subjects'),
      ]);
      const dataStud = await resStud.json();
      const dataSubj = await resSubj.json();

      if (dataStud.success) setStudents(dataStud.students);
      if (dataSubj.success) setSubjects(dataSubj.subjects);
    } catch (e) {
      toast.error('Error al conectar con la API.');
    }
  };

  const fetchSchedules = async (studentId: string) => {
    if (!studentId) {
      setSchedules([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/schedules?studentId=${studentId}`);
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules);
      }
    } catch (e) {
      toast.error('Error al cargar horarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndSubjects();
  }, []);

  useEffect(() => {
    fetchSchedules(selectedStudent);
  }, [selectedStudent]);

  // Form State
  const [form, setForm] = useState({
    subjectId: '',
    dia: 'lunes',
    horaInicio: '08:00',
    horaFin: '10:00',
    aula: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.warning('Debe seleccionar un estudiante primero.');
      return;
    }
    const selectedSubjectObj = subjects.find(s => s._id === form.subjectId);
    if (!selectedSubjectObj || !selectedSubjectObj.docenteId) {
      toast.error('La materia seleccionada no tiene un docente asignado.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        studentId: selectedStudent,
        subjectId: form.subjectId,
        teacherId: selectedSubjectObj.docenteId._id,
        dia: form.dia,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        aula: form.aula,
      };

      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Horario programado exitosamente.');
        setForm({ subjectId: '', dia: 'lunes', horaInicio: '08:00', horaFin: '10:00', aula: '' });
        fetchSchedules(selectedStudent);
      } else {
        toast.error(data.error || 'Error al guardar horario.');
      }
    } catch (e) {
      toast.error('Error de comunicación.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desea eliminar esta franja horaria?')) return;
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Horario removido.');
        fetchSchedules(selectedStudent);
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Error.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Horarios"
        description="Gestione los horarios individuales de clases de cada estudiante para la validación del ingreso."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Selector y Formulario Izquierda (col-span-4) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Seleccionar Estudiante</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Seleccione estudiante...</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.nombres} {s.apellidos} ({s.codigoEstudiantil})
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Agregar Bloque Horario</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Materia / Asignatura</label>
                  <select
                    required
                    name="subjectId"
                    value={form.subjectId}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Seleccione materia...</option>
                    {subjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.nombre} ({sub.codigo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Día de la Semana</label>
                  <select
                    name="dia"
                    value={form.dia}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="lunes">Lunes</option>
                    <option value="martes">Martes</option>
                    <option value="miércoles">Miércoles</option>
                    <option value="jueves">Jueves</option>
                    <option value="viernes">Viernes</option>
                    <option value="sábado">Sábado</option>
                    <option value="domingo">Domingo</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Hora Inicio</label>
                    <input
                      type="text"
                      required
                      name="horaInicio"
                      value={form.horaInicio}
                      onChange={handleChange}
                      placeholder="07:00"
                      className="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Hora Fin</label>
                    <input
                      type="text"
                      required
                      name="horaFin"
                      value={form.horaFin}
                      onChange={handleChange}
                      placeholder="09:00"
                      className="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Aula (Opcional)</label>
                  <input
                    type="text"
                    name="aula"
                    value={form.aula}
                    onChange={handleChange}
                    placeholder="Bloque A - Piso 2"
                    className="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Asignar Horario
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Calendario / Agenda Derecha (col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header del Calendario con Toggle de vista */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-gray-900">
                  {viewMode === 'semanal' ? 'Horario Académico Semanal' : 'Calendario Académico Mensual (Simulado)'}
                </h2>
              </div>

              {selectedStudent && (
                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setViewMode('semanal')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      viewMode === 'semanal'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Semanal
                  </button>
                  <button
                    onClick={() => setViewMode('mensual')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      viewMode === 'mensual'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Grid className="h-3.5 w-3.5" />
                    Mensual
                  </button>
                </div>
              )}
            </div>

            {!selectedStudent ? (
              <div className="text-center py-24 text-xs text-gray-400">
                Seleccione un estudiante en la barra lateral para visualizar y editar su horario.
              </div>
            ) : loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-24 text-xs text-gray-400">
                Este estudiante no cuenta con clases o asignaturas vinculadas actualmente.
              </div>
            ) : viewMode === 'semanal' ? (
              
              /* VISTA MATRIZ SEMANAL (Lunes a Viernes) */
              <div className="p-4 space-y-4">
                {diasOrden.slice(0, 5).map((dia) => {
                  const clasesDia = schedules.filter(sch => sch.dia.toLowerCase() === dia);
                  return (
                    <div key={dia} className="border border-slate-200/60 rounded-xl bg-slate-50/50 overflow-hidden flex flex-col sm:flex-row min-h-[80px]">
                      {/* Day Label */}
                      <div className="bg-slate-100 py-3 sm:py-0 px-4 text-center sm:text-left sm:w-32 flex items-center justify-center sm:justify-center border-b sm:border-b-0 sm:border-r border-slate-200/50 shrink-0">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{dia}</span>
                      </div>
                      
                      {/* Classes List */}
                      <div className="p-3 flex-1 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
                        {clasesDia.length === 0 ? (
                          <div className="text-gray-400 italic text-xs py-2 pl-2">Sin clases programadas</div>
                        ) : (
                          clasesDia.map((sch) => (
                            <div key={sch._id} className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm hover:border-emerald-300 transition-colors relative group flex-1 min-w-[200px] max-w-[300px]">
                              <p className="font-bold text-xs text-slate-800 leading-tight pr-6">{sch.subjectId?.nombre}</p>
                              <p className="text-[10px] text-gray-500 font-semibold font-mono mt-1">{sch.horaInicio} - {sch.horaFin}</p>
                              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                                <span className="truncate max-w-[120px]" title={sch.teacherId ? `${sch.teacherId.nombres} ${sch.teacherId.apellidos}` : ''}>
                                  Prof. {sch.teacherId?.nombres}
                                </span>
                                <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{sch.aula || 'N/A'}</span>
                              </div>
                              
                              <button 
                                onClick={() => handleDelete(sch._id)} 
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-500 rounded transition-opacity"
                                title="Eliminar clase"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            ) : (

              /* VISTA CALENDARIO MENSUAL SIMULADO (Julio 2026) */
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase">Julio 2026</span>
                  <span className="text-[10px] text-gray-400 font-medium">Clases recurrentes mapeadas al mes académico</span>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Encabezados de días */}
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <div key={i} className="text-[10px] font-bold text-gray-400 py-1">{d}</div>
                  ))}

                  {/* Celdas del calendario (Julio 2026 empieza en Miércoles = offset de 2 días vacíos) */}
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-transparent aspect-square"></div>
                  ))}

                  {/* Días 1 al 31 */}
                  {Array.from({ length: 31 }).map((_, i) => {
                    const diaMes = i + 1;
                    
                    // Calcular el día de la semana correspondiente
                    // 1 de Julio 2026 es Miércoles
                    const diasSemanaNombres = ['miércoles', 'jueves', 'viernes', 'sábado', 'domingo', 'lunes', 'martes'];
                    const diaSemanaNombre = diasSemanaNombres[i % 7];

                    const clasesDeEsteDia = schedules.filter(sch => sch.dia.toLowerCase() === diaSemanaNombre);
                    const tieneClases = clasesDeEsteDia.length > 0;

                    // Detectar si el día es un festivo nacional en Colombia
                    const fechaCompletaIso = `2026-07-${String(diaMes).padStart(2, '0')}`;
                    const esFestivoNacional = ['2026-07-13', '2026-07-20'].includes(fechaCompletaIso);

                    return (
                      <div 
                        key={diaMes} 
                        className={`relative aspect-square border border-slate-100 rounded-md p-1 flex flex-col justify-between text-left group transition-colors ${
                          esFestivoNacional
                            ? 'bg-red-50/70 border-red-100 text-red-700'
                            : tieneClases
                            ? 'bg-emerald-50/40 border-emerald-100/60 hover:bg-emerald-50/60'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-[10px] font-bold ${esFestivoNacional ? 'text-red-600' : 'text-slate-700'}`}>
                          {diaMes}
                        </span>

                        {esFestivoNacional ? (
                          <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter truncate leading-none">
                            Festivo
                          </span>
                        ) : tieneClases ? (
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            {clasesDeEsteDia.slice(0, 2).map((c, idx) => (
                              <span key={idx} className="text-[8px] bg-emerald-600 text-white font-bold px-1 py-0.5 rounded truncate leading-none" title={`${c.subjectId?.nombre} (${c.horaInicio})`}>
                                {c.subjectId?.codigo}
                              </span>
                            ))}
                            {clasesDeEsteDia.length > 2 && (
                              <span className="text-[7px] text-slate-400 font-bold">+{clasesDeEsteDia.length - 2} más</span>
                            )}

                            {/* HOVER TOOLTIP FOR DETAIL */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-950/95 backdrop-blur text-white rounded-xl p-3 shadow-2xl border border-slate-800 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform scale-95 origin-bottom group-hover:scale-100 flex flex-col gap-2">
                              <p className="text-[10px] font-bold text-slate-400 border-b border-slate-800 pb-1 mb-1">
                                Clases del {diaMes} de Julio
                              </p>
                              <div className="space-y-3 text-left">
                                {clasesDeEsteDia.map((c) => (
                                  <div key={c._id} className="space-y-1">
                                    <p className="font-bold text-xs text-emerald-400 leading-tight">
                                      {c.subjectId?.nombre} ({c.subjectId?.codigo})
                                    </p>
                                    <div className="flex justify-between text-[10px] text-slate-300 font-medium">
                                      <span>🕒 {c.horaInicio} - {c.horaFin}</span>
                                      <span className="font-bold text-emerald-300">📍 {c.aula || 'N/A'}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 italic">
                                      Docente: {c.teacherId?.nombres} {c.teacherId?.apellidos}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950"></div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

            )}
          </div>
        </div>
      </div>
    </div>
  );
}

