"use client";

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import Link from 'next/link';
import { Plus, Search, Eye, Edit, Trash2, RefreshCw, BadgeAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async (search = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/students?search=${search}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      } else {
        toast.error('Error al cargar estudiantes.');
      }
    } catch (e) {
      toast.error('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(searchTerm);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este estudiante? Se perderán sus datos asociados.')) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Estudiante eliminado correctamente.');
        fetchStudents(searchTerm);
      } else {
        toast.error(data.error || 'No se pudo eliminar el estudiante.');
      }
    } catch (e) {
      toast.error('Ocurrió un error.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Estudiantes"
        description="Listado general y administración de carnets estudiantiles."
        action={
          <Link href="/students/new" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-sm">
            <Plus className="h-4 w-4" />
            Nuevo Estudiante
          </Link>
        }
      />

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, código o CC..."
            className="pl-9 block w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </form>

        <button 
          onClick={() => fetchStudents(searchTerm)} 
          className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium border border-gray-200 transition-colors w-full md:w-auto justify-center"
        >
          <RefreshCw className="h-4 w-4" />
          Refrescar Lista
        </button>
      </div>

      {/* Grid o Tabla de Estudiantes */}
      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 shadow-sm">
          No se encontraron estudiantes registrados.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3">Estudiante</th>
                  <th className="px-6 py-3">Código</th>
                  <th className="px-6 py-3">Documento</th>
                  <th className="px-6 py-3">Programa Académico</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                          {student.nombres.charAt(0)}{student.apellidos.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.nombres} {student.apellidos}</p>
                          <p className="text-xs text-gray-500">{student.correoInstitucional}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">{student.codigoEstudiantil}</td>
                    <td className="px-6 py-4 text-gray-500">{student.tipoDocumento} {student.numeroDocumento}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">{student.programaAcademico}</span>
                      <span className="text-gray-400 text-xs block">Curso {student.curso}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        student.estado === 'activo'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {student.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/students/${student._id}`} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-emerald-600 transition-colors" title="Ver Detalle y Carnet">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(student._id)} className="p-1.5 hover:bg-red-50 rounded text-gray-600 hover:text-red-600 transition-colors" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
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
