"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { toast } from 'sonner';
import { Loader2, QrCode, Download, Edit3, CheckCircle, XCircle } from 'lucide-react';
import CarnetDigital from '@/components/shared/carnet-digital';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<any>(null);
  const [guardians, setGuardians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit State
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    tipoDocumento: '',
    numeroDocumento: '',
    codigoEstudiantil: '',
    correoInstitucional: '',
    programaAcademico: '',
    curso: 1,
    estado: 'activo',
    guardianId: '',
  });

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/students/${studentId}`);
      const data = await res.json();
      if (data.success) {
        setStudent(data.student);
        setFormData({
          nombres: data.student.nombres,
          apellidos: data.student.apellidos,
          tipoDocumento: data.student.tipoDocumento,
          numeroDocumento: data.student.numeroDocumento,
          codigoEstudiantil: data.student.codigoEstudiantil,
          correoInstitucional: data.student.correoInstitucional,
          programaAcademico: data.student.programaAcademico,
          curso: data.student.curso,
          estado: data.student.estado,
          guardianId: data.student.guardianId?._id || '',
        });
      } else {
        toast.error('No se pudo encontrar el estudiante.');
      }
    } catch (e) {
      toast.error('Error de red.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
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
  }, [studentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Estudiante actualizado y QR regenerado si aplica.');
        setIsEditing(false);
        fetchStudent();
      } else {
        toast.error(data.error || 'Error al guardar los cambios.');
      }
    } catch (e) {
      toast.error('Error de red.');
    } finally {
      setSaving(false);
    }
  };

  const downloadQR = async () => {
    const carnetEl = document.getElementById('carnet-digital-card');
    if (!carnetEl) {
      toast.error('No se pudo encontrar el carnet digital.');
      return;
    }
    
    try {
      toast.info('Generando carnet digital en alta definición...');
      const { toPng } = await import('html-to-image');
      
      const dataUrl = await toPng(carnetEl, {
        quality: 1.0,
        pixelRatio: 3, // Ultra HD de alta resolución
        cacheBust: true,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `carnet_digital_${student?.nombres}_${student?.codigoEstudiantil}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Carnet digital descargado en HD correctamente.');
    } catch (e) {
      console.error(e);
      toast.error('Error al generar la imagen del carnet.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={`Detalle de Estudiante: ${student?.nombres} ${student?.apellidos}`}
        description="Carnet QR e información académica detallada."
        action={
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className="flex items-center gap-2 text-sm bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium text-gray-700 shadow-sm transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            {isEditing ? 'Ver Carnet' : 'Editar Datos'}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Izquierdo: Carnet Digital */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <CarnetDigital student={student} />

          {student?.qrCode && (
            <button 
              onClick={downloadQR}
              className="mt-4 flex items-center gap-2 text-sm bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-emerald-700 transition-colors w-full justify-center"
              style={{ maxWidth: '380px' }}
            >
              <Download className="h-4 w-4" />
              Descargar Carnet Digital
            </button>
          )}
        </div>

        {/* Lado Derecho: Formulario o Detalles */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Nombres</label>
                    <input
                      type="text"
                      required
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                      className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Tipo de Documento</label>
                    <select
                      name="tipoDocumento"
                      value={formData.tipoDocumento}
                      onChange={handleChange}
                      className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="C.C.">C.C.</option>
                      <option value="T.I.">T.I.</option>
                      <option value="C.E.">C.E.</option>
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
                      className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                      className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                      className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                      className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Curso</label>
                    <input
                      type="number"
                      required
                      name="curso"
                      value={formData.curso}
                      onChange={handleChange}
                      className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Asignar Acudiente</label>
                    <select
                      name="guardianId"
                      value={formData.guardianId}
                      onChange={handleChange}
                      className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                      className="block w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Información del Estudiante</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="min-w-0">
                    <p className="text-gray-400">Nombres completos</p>
                    <p className="font-semibold text-gray-800 break-words">{student?.nombres} {student?.apellidos}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400">Correo institucional</p>
                    <p className="font-semibold text-gray-800 break-all">{student?.correoInstitucional}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400">Programa académico</p>
                    <p className="font-semibold text-gray-800 break-words">{student?.programaAcademico}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400">Curso</p>
                    <p className="font-semibold text-gray-800">Curso {student?.curso}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400">Estado de matrícula</p>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold mt-1 ${
                      student?.estado === 'activo'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {student?.estado === 'activo' ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-red-600" />}
                      {student?.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Información del Acudiente</h3>
                {student?.guardianId ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="min-w-0">
                      <p className="text-gray-400">Nombre completo</p>
                      <p className="font-semibold text-gray-800 break-words">{student.guardianId.nombreCompleto}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400">Parentesco</p>
                      <p className="font-semibold text-gray-800">{student.guardianId.parentesco}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400">Correo de contacto</p>
                      <p className="font-semibold text-gray-800 break-all">{student.guardianId.correo}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400">Teléfono</p>
                      <p className="font-semibold text-gray-800">{student.guardianId.telefono}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No tiene un acudiente asignado actualmente.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
