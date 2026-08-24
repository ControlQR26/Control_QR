import { Request, Response } from 'express';
import dbConnect from '../lib/db';
import { Student } from '../models/Student';
import { Guardian } from '../models/Guardian';
import { Teacher } from '../models/Teacher';
import { Subject } from '../models/Subject';
import { Schedule } from '../models/Schedule';
import { AccessLog } from '../models/AccessLog';
import { Notification } from '../models/Notification';
import mongoose from 'mongoose';
import { sendTelegramMessage } from '../lib/telegram';

process.env.TZ = 'America/Bogota';

/**
 * Obtiene la fecha y hora de Colombia (UTC-5) de forma pura, determinística e inmune a entornos de servidor.
 * No depende de bibliotecas ICU, toLocaleTimeString o Intl locales del sistema operativo.
 */
function getColombiaDateTime(date: Date = new Date()) {
  const COLOMBIA_OFFSET_MS = 5 * 60 * 60 * 1000;
  const colDate = new Date(date.getTime() - COLOMBIA_OFFSET_MS);

  const year = colDate.getUTCFullYear();
  const month = colDate.getUTCMonth(); // 0-indexed
  const day = colDate.getUTCDate();
  const hours24 = colDate.getUTCHours();
  const minutes = colDate.getUTCMinutes();
  const dayOfWeek = colDate.getUTCDay(); // 0=domingo, 1=lunes...

  const dd = String(day).padStart(2, '0');
  const mm = String(month + 1).padStart(2, '0');
  const dateStr = `${dd}/${mm}/${year}`;

  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 < 12 ? 'a. m.' : 'p. m.';
  const timeStr = `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
  const horaActualStr = `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const hoyIso = `${year}-${mm}-${dd}`;

  const diasSemana: ('domingo' | 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado')[] = [
    'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
  ];
  const diaActualStr = diasSemana[dayOfWeek];
  const esFinSemana = (diaActualStr === 'domingo' || diaActualStr === 'sábado');

  return {
    dateStr,
    timeStr,
    horaActualStr,
    hoyIso,
    diaActualStr,
    esFinSemana
  };
}

export async function validateScan(req: Request, res: Response) {
  try {
    await dbConnect();
    const { qrData, metodo = 'QR', clientTimeStr, clientDateStr, clientHora24 } = req.body;

    if (!qrData) {
      return res.status(400).json({ success: false, error: 'Código QR o dato de estudiante no recibido.' });
    }

    // 1. Identificación flexible del estudiante (JSON, ObjectId, Código o Documento)
    let student: any = null;
    let parsedQR: any = null;

    if (typeof qrData === 'object' && qrData !== null) {
      parsedQR = qrData;
    } else if (typeof qrData === 'string') {
      const trimmed = qrData.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          parsedQR = JSON.parse(trimmed);
        } catch (e) {
          // Ignorar error y buscar como texto plano
        }
      }
    }

    if (parsedQR) {
      const studentId = parsedQR.studentId || parsedQR._id || parsedQR.id;
      const codigo = parsedQR.codigoEstudiantil || parsedQR.codigo;
      const doc = parsedQR.documento || parsedQR.numeroDocumento;

      if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
        student = await Student.findById(studentId).populate('guardianId');
      }
      if (!student && codigo) {
        student = await Student.findOne({
          codigoEstudiantil: { $regex: new RegExp(`^${String(codigo).trim()}$`, 'i') }
        }).populate('guardianId');
      }
      if (!student && doc) {
        student = await Student.findOne({
          numeroDocumento: { $regex: new RegExp(`^${String(doc).trim()}$`, 'i') }
        }).populate('guardianId');
      }
    }

    // Búsqueda directa por texto si no se encontró por JSON
    if (!student && typeof qrData === 'string') {
      const rawText = qrData.trim();
      
      // Intentar por ObjectId de MongoDB (24 caracteres hexadecimales)
      if (mongoose.Types.ObjectId.isValid(rawText) && rawText.length === 24) {
        student = await Student.findById(rawText).populate('guardianId');
      }
      
      // Intentar por Código Estudiantil
      if (!student) {
        student = await Student.findOne({
          codigoEstudiantil: { $regex: new RegExp(`^${rawText}$`, 'i') }
        }).populate('guardianId');
      }

      // Intentar por Número de Documento
      if (!student) {
        student = await Student.findOne({
          numeroDocumento: { $regex: new RegExp(`^${rawText}$`, 'i') }
        }).populate('guardianId');
      }
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'El estudiante no se encuentra registrado en el sistema con el carnet o código presentado.'
      });
    }

    const ahora = new Date();
    const colombiaInfo = getColombiaDateTime(ahora);
    
    const dateStr = colombiaInfo.dateStr;
    const timeStr = colombiaInfo.timeStr;
    const horaActualStr = colombiaInfo.horaActualStr;
    const { hoyIso, diaActualStr, esFinSemana } = colombiaInfo;

    const festivos2026 = [
      '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03',
      '2026-05-01', '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29',
      '2026-07-13', '2026-07-20', '2026-08-07', '2026-08-17', '2026-10-12',
      '2026-11-02', '2026-11-16', '2026-12-08', '2026-12-25'
    ];

    const esFestivo = festivos2026.includes(hoyIso);

    if (student.estado !== 'activo') {
      await AccessLog.create({
        studentId: student._id,
        fecha: ahora,
        hora: horaActualStr,
        timestamp: ahora,
        metodo,
        estado: 'estudiante inactivo',
        mensaje: `Intento de ingreso de estudiante inactivo: ${student.nombres} ${student.apellidos}`,
      });

      return res.json({
        success: false,
        status: 'estudiante inactivo',
        student: {
          nombres: student.nombres,
          apellidos: student.apellidos,
          codigoEstudiantil: student.codigoEstudiantil,
          estado: student.estado
        },
        error: 'El estudiante está inactivo en el sistema. Ingreso rechazado.'
      });
    }

    // 2. Búsqueda de Horario y Docente Activo o Asignado
    const activeSchedule = await Schedule.findOne({
      studentId: student._id,
      dia: diaActualStr,
      horaInicio: { $lte: horaActualStr },
      horaFin: { $gte: horaActualStr }
    }).populate('subjectId teacherId');

    let logEstado: 'validado' | 'sin clase programada' = 'validado';
    let subjectId = undefined;
    let teacherId = undefined;
    let aula = undefined;
    let mensajeLog = `Ingreso exitoso del estudiante ${student.nombres} ${student.apellidos}`;

    let assignedTeacher: any = null;
    let assignedSubject: any = null;

    if (activeSchedule) {
      subjectId = (activeSchedule.subjectId as any)?._id;
      teacherId = (activeSchedule.teacherId as any)?._id;
      aula = activeSchedule.aula;
      assignedTeacher = activeSchedule.teacherId;
      assignedSubject = activeSchedule.subjectId;
    } else {
      logEstado = 'sin clase programada';
      if (esFestivo || esFinSemana) {
        const motivo = esFestivo ? 'Día Festivo' : 'Fin de semana';
        mensajeLog = `Ingreso en día no académico (${motivo}): ${student.nombres} ${student.apellidos}`;
      } else {
        mensajeLog = `Estudiante ${student.nombres} ingresó sin clase programada en este horario.`;
      }

      // Buscar si el estudiante tiene asignado un horario hoy o en su carga académica para notificar al docente
      const todaySchedule = await Schedule.findOne({
        studentId: student._id,
        dia: diaActualStr
      }).populate('subjectId teacherId');

      if (todaySchedule) {
        assignedTeacher = todaySchedule.teacherId;
        assignedSubject = todaySchedule.subjectId;
        teacherId = (todaySchedule.teacherId as any)?._id;
        subjectId = (todaySchedule.subjectId as any)?._id;
      } else {
        const anySchedule = await Schedule.findOne({
          studentId: student._id
        }).populate('subjectId teacherId');
        if (anySchedule) {
          assignedTeacher = anySchedule.teacherId;
          assignedSubject = anySchedule.subjectId;
          teacherId = (anySchedule.teacherId as any)?._id;
          subjectId = (anySchedule.subjectId as any)?._id;
        }
      }
    }

    const accessLog = await AccessLog.create({
      studentId: student._id,
      fecha: ahora,
      hora: horaActualStr,
      timestamp: ahora,
      metodo,
      subjectId,
      teacherId,
      aula,
      estado: logEstado,
      mensaje: mensajeLog,
    });

    const notificationsCreated = [];

    // 3. Notificación al Acudiente (Siempre que exista el acudiente)
    let guardian: any = null;
    if (student.guardianId) {
      if (typeof student.guardianId === 'object' && (student.guardianId as any).nombreCompleto) {
        guardian = student.guardianId;
      } else {
        guardian = await Guardian.findById(student.guardianId);
      }
    }

    if (guardian) {
      let msgAcudiente = `Se informa que el estudiante ${student.nombres} ${student.apellidos} ingresó a la institución el día ${dateStr} a las ${timeStr}.`;
      
      let subjectName = '';
      let teacherName = '';

      if (assignedSubject) {
        const subObj = typeof assignedSubject === 'object' && assignedSubject.nombre 
          ? assignedSubject 
          : await Subject.findById(assignedSubject);
        subjectName = subObj?.nombre || '';
      }

      if (assignedTeacher) {
        const teachObj = typeof assignedTeacher === 'object' && assignedTeacher.nombres 
          ? assignedTeacher 
          : await Teacher.findById(assignedTeacher);
        if (teachObj) {
          teacherName = `${teachObj.nombres} ${teachObj.apellidos}`;
        }
      }

      if (activeSchedule) {
        msgAcudiente += ` Actualmente tiene programada la materia ${subjectName || 'Clase programada'} con el docente ${teacherName || 'Docente asignado'} en el aula ${aula || 'No asignada'}.`;
      } else if (esFestivo || esFinSemana) {
        const motivo = esFestivo ? 'Día Festivo' : 'Fin de semana';
        msgAcudiente += ` El ingreso se registró en jornada no académica (${motivo}).`;
      } else {
        msgAcudiente += ` El ingreso se registró sin clase programada en este horario.`;
      }

      let estadoNotif: 'enviada' | 'simulada' = 'simulada';
      if (guardian.telegramChatId) {
        const sent = await sendTelegramMessage(
          guardian.telegramChatId,
          `<b>[ControlQR] Alerta de Ingreso Estudiantil</b>\n\n${msgAcudiente}`
        );
        if (sent) {
          estadoNotif = 'enviada';
        }
      }

      const notifGuardian = await Notification.create({
        tipoDestinatario: 'acudiente',
        destinatario: guardian.telegramChatId ? `Telegram: ${guardian.telegramChatId}` : (guardian.correo || guardian.telefono),
        mensaje: msgAcudiente,
        fecha: ahora,
        estado: estadoNotif,
        accessLogId: accessLog._id,
      });
      notificationsCreated.push(notifGuardian);
    }

    // 4. Notificación al Docente (Si existe docente asignado o en horario)
    if (assignedTeacher) {
      let teacherObj = typeof assignedTeacher === 'object' && assignedTeacher.nombres 
        ? assignedTeacher 
        : await Teacher.findById(assignedTeacher);

      if (teacherObj) {
        let subjectName = 'Clase';
        if (assignedSubject) {
          const subObj = typeof assignedSubject === 'object' && assignedSubject.nombre 
            ? assignedSubject 
            : await Subject.findById(assignedSubject);
          if (subObj?.nombre) subjectName = subObj.nombre;
        }

        const msgDocente = `Se ha registrado el ingreso del estudiante ${student.nombres} ${student.apellidos} el día ${dateStr} a las ${timeStr} para la asignatura ${subjectName}.`;

        let estadoDocente: 'enviada' | 'simulada' = 'simulada';
        if (teacherObj.telegramChatId) {
          const sent = await sendTelegramMessage(
            teacherObj.telegramChatId,
            `<b>[ControlQR] Ingreso a tu Clase</b>\n\n${msgDocente}`
          );
          if (sent) {
            estadoDocente = 'enviada';
          }
        }

        const notifDocente = await Notification.create({
          tipoDestinatario: 'docente',
          destinatario: teacherObj.telegramChatId ? `Telegram: ${teacherObj.telegramChatId}` : teacherObj.correo,
          mensaje: msgDocente,
          fecha: ahora,
          estado: estadoDocente,
          accessLogId: accessLog._id,
        });
        notificationsCreated.push(notifDocente);
      }
    }

    return res.json({
      success: true,
      status: logEstado,
      student: {
        id: student._id,
        nombres: student.nombres,
        apellidos: student.apellidos,
        codigoEstudiantil: student.codigoEstudiantil,
        programaAcademico: student.programaAcademico,
        foto: student.foto,
      },
      schedule: activeSchedule ? {
        subject: (activeSchedule.subjectId as any)?.nombre,
        teacher: `${(activeSchedule.teacherId as any)?.nombres || ''} ${(activeSchedule.teacherId as any)?.apellidos || ''}`.trim(),
        aula: activeSchedule.aula,
        horaInicio: activeSchedule.horaInicio,
        horaFin: activeSchedule.horaFin,
      } : null,
      accessLog,
      notifications: notificationsCreated
    });

  } catch (error: any) {
    console.error('Error validating scan:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

