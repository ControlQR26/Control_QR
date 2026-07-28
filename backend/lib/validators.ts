import * as z from 'zod';

export const StudentSchema = z.object({
  nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  tipoDocumento: z.string().min(2, 'Seleccione un tipo de documento'),
  numeroDocumento: z.string().min(5, 'El número de documento debe tener al menos 5 caracteres'),
  codigoEstudiantil: z.string().min(4, 'El código estudiantil debe tener al menos 4 caracteres'),
  correoInstitucional: z.string().email('Debe ser un correo electrónico válido'),
  programaAcademico: z.string().min(2, 'Seleccione un programa académico'),
  curso: z.coerce.number().min(1, 'El curso debe ser al menos 1').max(12, 'El curso máximo es 12'),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
  foto: z.string().optional(),
  guardianId: z.string().min(1, 'Debe asignar un acudiente').optional().or(z.literal('')),
});

export const GuardianSchema = z.object({
  nombreCompleto: z.string().min(5, 'El nombre completo debe tener al menos 5 caracteres'),
  parentesco: z.string().min(3, 'Defina el parentesco (Ej: Padre, Madre, Tío)'),
  correo: z.string().email('Debe ser un correo electrónico válido'),
  telefono: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos'),
});

export const TeacherSchema = z.object({
  nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  correo: z.string().email('Debe ser un correo electrónico válido'),
  telefono: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos'),
  programa: z.string().min(2, 'Escriba la facultad o programa académico'),
});

export const SubjectSchema = z.object({
  nombre: z.string().min(3, 'El nombre de la materia debe tener al menos 3 caracteres'),
  codigo: z.string().min(3, 'El código de la materia debe tener al menos 3 caracteres'),
  docenteId: z.string().min(1, 'Debe seleccionar un docente'),
  programaAcademico: z.string().min(2, 'Escriba el programa académico'),
  cursoSugerido: z.coerce.number().min(1, 'El curso debe ser al menos 1'),
});

export const ScheduleSchema = z.object({
  studentId: z.string().min(1, 'Debe seleccionar un estudiante'),
  subjectId: z.string().min(1, 'Debe seleccionar una materia'),
  dia: z.enum(['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']),
  horaInicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora de inicio inválida (HH:MM)'),
  horaFin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora de finalización inválida (HH:MM)'),
  aula: z.string().optional(),
});
