import { Request, Response } from 'express';
import dbConnect from '../lib/db';
import { Student } from '../models/Student';
import { Schedule } from '../models/Schedule';
import { AccessLog } from '../models/AccessLog';
import { Notification } from '../models/Notification';
import mongoose from 'mongoose';
import { sendTelegramMessage } from '../lib/telegram';

function getFormatTime(date: Date) {
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getFormatDate(date: Date) {
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
    const festivos2026 = [
      '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03',
      '2026-05-01', '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29',
      '2026-07-13', '2026-07-20', '2026-08-07', '2026-08-17', '2026-10-12',
      '2026-11-02', '2026-11-16', '2026-12-08', '2026-12-25'
    ];

    const hoyIso = ahora.toISOString().split('T')[0];
    const diaNum = ahora.getDay();
    const esFinSemana = (diaNum === 0 || diaNum === 6);
    const esFestivo = festivos2026.includes(hoyIso);

    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const horaActualStr = `${horas}:${minutos}`;

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

    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const;
    const diaActualStr = diasSemana[diaNum];

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

    if (student.guardianId) {
      const guardian = student.guardianId as any;
      let msgAcudiente = `Se informa que el estudiante ${student.nombres} ${student.apellidos} ingresó a la institución el día ${getFormatDate(ahora)} a las ${getFormatTime(ahora)}.`;
      
      if (activeSchedule) {
        const subject = activeSchedule.subjectId as any;
        const teacher = activeSchedule.teacherId as any;
        msgAcudiente += ` Actualmente tiene programada la materia ${subject.nombre} con el docente ${teacher.nombres} ${teacher.apellidos} en el aula ${aula || 'No asignada'}.`;
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
      const teacher = activeSchedule.teacherId as any;
      const subject = activeSchedule.subjectId as any;
      const msgDocente = `Se ha registrado el ingreso del estudiante ${student.nombres} ${student.apellidos} el día ${getFormatDate(ahora)} a las ${getFormatTime(ahora)} para la asignatura ${subject.nombre}.`;

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
