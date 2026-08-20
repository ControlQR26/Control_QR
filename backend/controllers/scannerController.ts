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
 * Obtiene la fecha y hora de Colombia (UTC-5) utilizando Intl.DateTimeFormat nativo de Node.js / V8.
 * Convierte cualquier timestamp UTC a la hora local exacta de Colombia ('America/Bogota').
 */
function getColombiaDateTime(date: Date = new Date()) {
  const timeZone = 'America/Bogota';

  const dateStr = new Intl.DateTimeFormat('es-CO', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);

  const timeStr = new Intl.DateTimeFormat('es-CO', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date).replace(/\s+/g, ' ');

  const horaActualStr = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);

  const hoyIso = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);

  const weekdayStr = new Intl.DateTimeFormat('es-CO', {
    timeZone,
    weekday: 'long'
  }).format(date).toLowerCase();

  let diaActualStr: 'domingo' | 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' = 'lunes';
  if (weekdayStr.includes('domingo')) diaActualStr = 'domingo';
  else if (weekdayStr.includes('lunes')) diaActualStr = 'lunes';
  else if (weekdayStr.includes('martes')) diaActualStr = 'martes';
  else if (weekdayStr.includes('mi')) diaActualStr = 'miércoles';
  else if (weekdayStr.includes('jueves')) diaActualStr = 'jueves';
  else if (weekdayStr.includes('viernes')) diaActualStr = 'viernes';
  else if (weekdayStr.includes('s')) diaActualStr = 'sábado';

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
    const { qrData, metodo = 'QR' } = req.body;

    if (!qrData) {
      return res.status(400).json({ success: false, error: 'Código QR no recibido.' });
    }

    let parsedQR;
    try {
      parsedQR = JSON.parse(qrData);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Formato de QR inválido.' });
    }

    const { studentId, codigoEstudiantil, documento } = parsedQR;

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, error: 'Identificador de estudiante inválido en QR.' });
    }

    const student = await Student.findById(studentId).populate('guardianId');
    if (!student) {
      return res.status(404).json({ success: false, error: 'El estudiante no se encuentra registrado en el sistema.' });
    }

    const ahora = new Date();
    const { dateStr, timeStr, horaActualStr, hoyIso, diaActualStr, esFinSemana } = getColombiaDateTime(ahora);

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

    if (esFestivo || esFinSemana) {
      const motivo = esFestivo ? 'Día Festivo Colombiano' : 'Fin de semana';
      await AccessLog.create({
        studentId: student._id,
        fecha: ahora,
        hora: horaActualStr,
        timestamp: ahora,
        metodo,
        estado: 'sin clase programada',
        mensaje: `Intento de ingreso en día no académico/hábil (${motivo}): ${student.nombres} ${student.apellidos}`,
      });

      return res.json({
        success: false,
        status: 'sin clase programada',
        student: {
          nombres: student.nombres,
          apellidos: student.apellidos,
          codigoEstudiantil: student.codigoEstudiantil,
          estado: student.estado
        },
        error: `Acceso restringido: Hoy es un día no académico o inhábil (${motivo}).`
      });
    }

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

    if (!activeSchedule) {
      logEstado = 'sin clase programada';
      mensajeLog = `Estudiante ${student.nombres} ingresó sin clase programada en este horario.`;
    } else {
      subjectId = activeSchedule.subjectId._id;
      teacherId = activeSchedule.teacherId._id;
      aula = activeSchedule.aula;
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
      
      let subjectObj = activeSchedule?.subjectId as any;
      let teacherObj = activeSchedule?.teacherId as any;

      if (activeSchedule) {
        if (subjectObj && !subjectObj.nombre) {
          subjectObj = await Subject.findById(activeSchedule.subjectId);
        }
        if (teacherObj && !teacherObj.nombres) {
          teacherObj = await Teacher.findById(activeSchedule.teacherId);
        }

        const subjectName = subjectObj?.nombre || 'Clase programada';
        const teacherName = teacherObj ? `${teacherObj.nombres} ${teacherObj.apellidos}` : 'Docente asignado';
        msgAcudiente += ` Actualmente tiene programada la materia ${subjectName} con el docente ${teacherName} en el aula ${aula || 'No asignada'}.`;
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

    if (activeSchedule) {
      let teacher = activeSchedule.teacherId as any;
      let subject = activeSchedule.subjectId as any;
      if (teacher && !teacher.nombres) {
        teacher = await Teacher.findById(activeSchedule.teacherId);
      }
      if (subject && !subject.nombre) {
        subject = await Subject.findById(activeSchedule.subjectId);
      }

      if (teacher) {
        const subjectName = subject?.nombre || 'Clase';
        const msgDocente = `Se ha registrado el ingreso del estudiante ${student.nombres} ${student.apellidos} el día ${dateStr} a las ${timeStr} para la asignatura ${subjectName}.`;

        let estadoDocente: 'enviada' | 'simulada' = 'simulada';
        if (teacher.telegramChatId) {
          const sent = await sendTelegramMessage(
            teacher.telegramChatId,
            `<b>[ControlQR] Ingreso a tu Clase</b>\n\n${msgDocente}`
          );
          if (sent) {
            estadoDocente = 'enviada';
          }
        }

        const notifDocente = await Notification.create({
          tipoDestinatario: 'docente',
          destinatario: teacher.telegramChatId ? `Telegram: ${teacher.telegramChatId}` : teacher.correo,
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
        subject: (activeSchedule.subjectId as any).nombre,
        teacher: `${(activeSchedule.teacherId as any).nombres} ${(activeSchedule.teacherId as any).apellidos}`,
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
