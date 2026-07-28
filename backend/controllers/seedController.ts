import { Request, Response } from 'express';
import dbConnect from '../lib/db';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { Guardian } from '../models/Guardian';
import { Teacher } from '../models/Teacher';
import { Subject } from '../models/Subject';
import { Schedule } from '../models/Schedule';
import { AccessLog } from '../models/AccessLog';
import { Notification } from '../models/Notification';
import bcrypt from 'bcryptjs';
import { generateQRDataUrl } from '../lib/qr';

export async function seedDatabase(req: Request, res: Response) {
  try {
    await dbConnect();
    const force = req.query.force === 'true';

    const existingStudents = await Student.find({});
    if (existingStudents.length > 0 && !force) {
      return res.json({
        success: true,
        message: 'La base de datos ya contiene información. Se omitió la inicialización para proteger tus datos. Usa /api/seed?force=true si deseas reiniciarla por completo.'
      });
    }

    // Limpiar base de datos
    await User.deleteMany({});
    await Student.deleteMany({});
    await Guardian.deleteMany({});
    await Teacher.deleteMany({});
    await Subject.deleteMany({});
    await Schedule.deleteMany({});
    await AccessLog.deleteMany({});
    await Notification.deleteMany({});

    // Crear Administrador
    const hashedPassword = await bcrypt.hash('admin1234', 10);
    const admin = await User.create({
      name: 'Administrador SENA',
      email: 'Administrador',
      password: hashedPassword,
      role: 'admin',
    });

    // Crear Acudientes
    const g1 = await Guardian.create({
      nombreCompleto: 'María Inés Rodríguez',
      parentesco: 'Madre',
      correo: 'maria.rodriguez@gmail.com',
      telefono: '3157654321',
    });

    const g2 = await Guardian.create({
      nombreCompleto: 'Carlos Julio Gómez',
      parentesco: 'Padre',
      correo: 'carlos.gomez@gmail.com',
      telefono: '3109876543',
    });

    const g3 = await Guardian.create({
      nombreCompleto: 'Patricia Díaz Castro',
      parentesco: 'Madre',
      correo: 'patricia.diaz@gmail.com',
      telefono: '3204567890',
    });

    const g4 = await Guardian.create({
      nombreCompleto: 'Andrés Felipe Mendoza',
      parentesco: 'Padre',
      correo: 'andres.mendoza@gmail.com',
      telefono: '3151112233',
    });

    // Crear Docentes
    const t1 = await Teacher.create({
      nombres: 'Carlos',
      apellidos: 'Rodríguez',
      correo: 'carlos.rodriguez@sena.edu.co',
      telefono: '3001234567',
      programa: 'Análisis y Desarrollo de Software (ADSO)',
    });

    const t2 = await Teacher.create({
      nombres: 'Sandra Patricia',
      apellidos: 'López',
      correo: 'sandra.lopez@sena.edu.co',
      telefono: '3112223344',
      programa: 'Tecnologías de la Información',
    });

    // Crear Materias
    const s1 = await Subject.create({
      nombre: 'Bases de Datos Relacionales',
      codigo: 'BD-101',
      docenteId: t1._id,
      programaAcademico: 'ADSO',
      cursoSugerido: 2,
    });

    const s2 = await Subject.create({
      nombre: 'Desarrollo Frontend con React',
      codigo: 'FE-202',
      docenteId: t2._id,
      programaAcademico: 'ADSO',
      cursoSugerido: 3,
    });

    const s3 = await Subject.create({
      nombre: 'Arquitectura de Software',
      codigo: 'AS-303',
      docenteId: t1._id,
      programaAcademico: 'ADSO',
      cursoSugerido: 4,
    });

    // Crear Estudiantes
    const studentData = [
      {
        nombres: 'Juan Carlos',
        apellidos: 'Pérez Gómez',
        tipoDocumento: 'C.C.',
        numeroDocumento: '1012345678',
        codigoEstudiantil: '20261001',
        correoInstitucional: 'jcperez78@colegio.edu.co',
        programaAcademico: 'Grado 11°',
        curso: 2,
        estado: 'activo' as const,
        guardianId: g1._id,
      },
      {
        nombres: 'Laura Camila',
        apellidos: 'Díaz Rodríguez',
        tipoDocumento: 'T.I.',
        numeroDocumento: '1023456789',
        codigoEstudiantil: '20261002',
        correoInstitucional: 'lcdiaz89@colegio.edu.co',
        programaAcademico: 'Grado 10°',
        curso: 2,
        estado: 'activo' as const,
        guardianId: g3._id,
      },
      {
        nombres: 'Mateo',
        apellidos: 'Gómez Castro',
        tipoDocumento: 'C.C.',
        numeroDocumento: '1034567890',
        codigoEstudiantil: '20261003',
        correoInstitucional: 'mgomez90@colegio.edu.co',
        programaAcademico: 'Grado 11°',
        curso: 3,
        estado: 'activo' as const,
        guardianId: g2._id,
      },
      {
        nombres: 'Sofía Valentina',
        apellidos: 'Mendoza Rincón',
        tipoDocumento: 'C.C.',
        numeroDocumento: '1045678901',
        codigoEstudiantil: '20261004',
        correoInstitucional: 'svmendoza01@colegio.edu.co',
        programaAcademico: 'Grado 9°',
        curso: 3,
        estado: 'inactivo' as const,
        guardianId: g4._id,
      }
    ];

    const students = [];
    for (const data of studentData) {
      const student = await Student.create({ ...data });
      const qrRealData = JSON.stringify({
        studentId: student._id.toString(),
        codigoEstudiantil: student.codigoEstudiantil,
        documento: student.numeroDocumento,
      });
      const qrCodeUrl = await generateQRDataUrl(qrRealData);
      student.qrCode = qrCodeUrl;
      await student.save();
      students.push(student);
    }

    // Crear Horarios Intercalados (Lunes a Viernes)
    // Juan Carlos Pérez
    await Schedule.create({
      studentId: students[0]._id,
      subjectId: s1._id,
      teacherId: t1._id,
      dia: 'lunes',
      horaInicio: '06:00',
      horaFin: '13:00',
      aula: 'Bloque A - Piso 2',
    });

    await Schedule.create({
      studentId: students[0]._id,
      subjectId: s2._id,
      teacherId: t2._id,
      dia: 'martes',
      horaInicio: '13:00',
      horaFin: '22:00',
      aula: 'Bloque B - Lab 3',
    });

    // Laura Camila Díaz
    await Schedule.create({
      studentId: students[1]._id,
      subjectId: s1._id,
      teacherId: t1._id,
      dia: 'lunes',
      horaInicio: '06:00',
      horaFin: '13:00',
      aula: 'Bloque A - Piso 2',
    });

    await Schedule.create({
      studentId: students[1]._id,
      subjectId: s1._id,
      teacherId: t1._id,
      dia: 'jueves',
      horaInicio: '13:00',
      horaFin: '22:00',
      aula: 'Bloque A - Piso 2',
    });

    // Mateo Gómez
    await Schedule.create({
      studentId: students[2]._id,
      subjectId: s3._id,
      teacherId: t1._id,
      dia: 'miércoles',
      horaInicio: '06:00',
      horaFin: '22:00',
      aula: 'Bloque A - Lab 1',
    });

    await Schedule.create({
      studentId: students[2]._id,
      subjectId: s2._id,
      teacherId: t2._id,
      dia: 'viernes',
      horaInicio: '13:00',
      horaFin: '22:00',
      aula: 'Bloque B - Lab 2',
    });

    return res.json({
      success: true,
      message: 'Base de datos poblada exitosamente con datos semilla.',
      admin: { email: admin.email, pass: 'admin123' },
      studentsCount: students.length,
      guardiansCount: 4,
      teachersCount: 2,
      subjectsCount: 3,
    });
  } catch (error: any) {
    console.error('Error seeding DB:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
