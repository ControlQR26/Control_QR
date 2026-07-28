"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function NewStudentPage() {
  const router = useRouter();
  const [guardians, setGuardians] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    tipoDocumento: 'C.C.',
    numeroDocumento: '',
    codigoEstudiantil: '',
    correoInstitucional: '',
    programaAcademico: 'Grado 11°',
    curso: 1,
    estado: 'activo',
    guardianId: '',
  });

  useEffect(() => {
    const fetchGuardians = async () => {
      try {
        const res = await fetch('/api/guardians');
        const data = await res.json();
        if (data.success) {
          setGuardians(data.guardians);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchGuardians();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Estudiante creado correctamente con QR generado.');
        router.push('/students');
      } else {
        toast.error(data.error || 'Error al guardar el estudiante.');
      }
    } catch (err) {
      toast.error('Error de comunicación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Registrar Nuevo Estudiante"
        description="Agregue un nuevo estudiante al sistema para generarle su QR de acceso automáticamente."
      />

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Nombres</label>
              <input
                type="text"
                required
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Juan Carlos"
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Apellidos</label>
              <input
                type="text"
                required
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Pérez Gómez"
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Tipo de Documento</label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="C.C.">Cédula de Ciudadanía (C.C.)</option>
                <option value="T.I.">Tarjeta de Identidad (T.I.)</option>
                <option value="C.E.">Cédula de Extranjería (C.E.)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Número de Documento</label>
              <input
                type="text"
                required
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleChange}
                placeholder="1012345678"
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Código Estudiantil</label>
              <input
                type="text"
                required
                name="codigoEstudiantil"
                value={formData.codigoEstudiantil}
                onChange={handleChange}
                placeholder="20261001"
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Correo Institucional</label>
              <input
                type="email"
                required
                name="correoInstitucional"
                value={formData.correoInstitucional}
                onChange={handleChange}
                placeholder="jcperez78@colegio.edu.co"
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Programa Académico</label>
              <input
                type="text"
                required
                name="programaAcademico"
                value={formData.programaAcademico}
                onChange={handleChange}
                placeholder="Grado 11°"
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Curso</label>
              <input
                type="number"
                required
                min={1}
                max={12}
                name="curso"
                value={formData.curso}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Asignar Acudiente</label>
              <select
                name="guardianId"
                value={formData.guardianId}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Seleccione un acudiente...</option>
                {guardians.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.nombreCompleto} ({g.parentesco})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push('/students')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Registrar Estudiante
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
