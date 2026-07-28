"use client";

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Search, Edit3, Trash2, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    nombre: '',
    codigo: '',
    docenteId: '',
    programaAcademico: '',
    cursoSugerido: 1,
  });

  const fetchSubjects = async (search = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/subjects?search=${search}`);
      const data = await res.json();
      if (data.success) {
        setSubjects(data.subjects);
      }
    } catch (e) {
      toast.error('Error de red al cargar asignaturas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();

    const fetchTeachers = async () => {
      try {
        const res = await fetch('/api/teachers');
        const data = await res.json();
        if (data.success) {
          setTeachers(data.teachers);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchTeachers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (s: any) => {
    setIsEditing(s._id);
    setForm({
      nombre: s.nombre,
      codigo: s.codigo,
      docenteId: s.docenteId?._id || '',
      programaAcademico: s.programaAcademico,
      cursoSugerido: s.cursoSugerido,
    });
  };

  const handleCancel = () => {
    setIsEditing(null);
    setForm({ nombre: '', codigo: '', docenteId: '', programaAcademico: '', cursoSugerido: 1 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEditing ? `/api/subjects/${isEditing}` : '/api/subjects';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? 'Asignatura actualizada.' : 'Asignatura registrada.');
        handleCancel();
        fetchSubjects(searchTerm);
      } else {
        toast.error(data.error || 'Error al guardar.');
      }
    } catch (e) {
      toast.error('Error de comunicación.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desea eliminar esta asignatura?')) return;
    try {
      const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Asignatura eliminada.');
        fetchSubjects(searchTerm);
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
        title="Gestión de Asignaturas"
        description="Defina las materias, asigne docentes titulares y relacione cursos."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Izquierda */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            {isEditing ? 'Editar Materia' : 'Registrar Materia'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Nombre de Materia</label>
              <input
                type="text"
                required
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Bases de Datos Relacionales"
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Código de Materia</label>
              <input
                type="text"
                required
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                placeholder="BD-101"
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Docente Asignado</label>
              <select
                required
                name="docenteId"
                value={form.docenteId}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Seleccione docente...</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.nombres} {t.apellidos}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Programa Académico</label>
              <input
                type="text"
                required
                name="programaAcademico"
                value={form.programaAcademico}
                onChange={handleChange}
                placeholder="Grado 11°"
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Curso Sugerido</label>
              <input
                type="number"
                required
                min={1}
                name="cursoSugerido"
                value={form.cursoSugerido}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabla Derecha */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <form onSubmit={(e) => { e.preventDefault(); fetchSubjects(searchTerm); }} className="relative w-72">
                <Search className="absolute inset-y-0 left-0 pl-3 pt-2 h-7 w-7 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar materia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 block w-full rounded-lg border border-gray-300 py-1.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </form>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : subjects.length === 0 ? (
              <p className="text-center py-12 text-sm text-gray-500">No hay materias registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Código</th>
                      <th className="px-6 py-3">Materia</th>
                      <th className="px-6 py-3">Docente Titular</th>
                      <th className="px-6 py-3">Programa / Curso</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subjects.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-950">{s.codigo}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{s.nombre}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {s.docenteId ? `${s.docenteId.nombres} ${s.docenteId.apellidos}` : 'No asignado'}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          <p>{s.programaAcademico}</p>
                          <p className="font-semibold text-[10px]">Curso {s.cursoSugerido}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditClick(s)} className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-emerald-600 transition-colors">
                              <Edit3 className="h-4.5 w-4.5" />
                            </button>
                            <button onClick={() => handleDelete(s._id)} className="p-1 hover:bg-red-50 rounded text-gray-600 hover:text-red-600 transition-colors">
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
