"use client";

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Search, Edit3, Trash2, Loader2, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    programa: '',
    telegramChatId: '',
  });

  const fetchTeachers = async (search = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teachers?search=${search}`);
      const data = await res.json();
      if (data.success) {
        setTeachers(data.teachers);
      }
    } catch (e) {
      toast.error('Error de red al cargar docentes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditClick = (t: any) => {
    setIsEditing(t._id);
    setForm({
      nombres: t.nombres,
      apellidos: t.apellidos,
      correo: t.correo,
      telefono: t.telefono,
      programa: t.programa,
      telegramChatId: t.telegramChatId || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(null);
    setForm({ nombres: '', apellidos: '', correo: '', telefono: '', programa: '', telegramChatId: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEditing ? `/api/teachers/${isEditing}` : '/api/teachers';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? 'Docente actualizado.' : 'Docente registrado.');
        handleCancel();
        fetchTeachers(searchTerm);
      } else {
        toast.error(data.error || 'Error al guardar.');
      }
    } catch (e) {
      toast.error('Error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desea eliminar este docente?')) return;
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Docente eliminado.');
        fetchTeachers(searchTerm);
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
        title="Gestión de Docentes"
        description="Listado y registro de docentes asignados a programas."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Izquierda */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            {isEditing ? 'Editar Docente' : 'Registrar Docente'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Nombres</label>
              <input
                type="text"
                required
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                placeholder="Sandra Patricia"
                className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Apellidos</label>
              <input
                type="text"
                required
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                placeholder="López"
                className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                name="correo"
                value={form.correo}
                onChange={handleChange}
                placeholder="sandra.lopez@sena.edu.co"
                className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Teléfono</label>
              <input
                type="text"
                required
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="3112223344"
                className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Programa / Facultad</label>
              <input
                type="text"
                required
                name="programa"
                value={form.programa}
                onChange={handleChange}
                placeholder="Tecnologías de la Información"
                className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Telegram Chat ID (Opcional)</label>
              <input
                type="text"
                name="telegramChatId"
                value={form.telegramChatId}
                onChange={handleChange}
                placeholder="Ej: 987654321"
                className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              <form onSubmit={(e) => { e.preventDefault(); fetchTeachers(searchTerm); }} className="relative w-72">
                <Search className="absolute inset-y-0 left-0 pl-3 pt-2 h-7 w-7 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar docente..."
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
            ) : teachers.length === 0 ? (
              <p className="text-center py-12 text-sm text-gray-500">No hay docentes registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Programa / Facultad</th>
                      <th className="px-6 py-3">Contacto</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {teachers.map((t) => (
                      <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{t.nombres} {t.apellidos}</td>
                        <td className="px-6 py-4 text-gray-500">{t.programa}</td>
                        <td className="px-6 py-4 text-gray-500">
                          <p>{t.correo}</p>
                          <p className="font-semibold">{t.telefono}</p>
                          {t.telegramChatId && (
                            <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                              💬 Telegram: {t.telegramChatId}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditClick(t)} className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-emerald-600 transition-colors">
                              <Edit3 className="h-4.5 w-4.5" />
                            </button>
                            <button onClick={() => handleDelete(t._id)} className="p-1 hover:bg-red-50 rounded text-gray-600 hover:text-red-600 transition-colors">
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
