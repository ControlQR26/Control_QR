import { Request, Response } from 'express';
import dbConnect from '../lib/db';
import { Student } from '../models/Student';
import { Guardian } from '../models/Guardian';
import { Teacher } from '../models/Teacher';
import { Subject } from '../models/Subject';
import { AccessLog } from '../models/AccessLog';
import { Notification } from '../models/Notification';

export async function getDashboardStats(req: Request, res: Response) {
  try {
    await dbConnect();

    const [
      studentsCount,
      teachersCount,
      subjectsCount,
      guardiansCount,
      totalAccessLogs,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Subject.countDocuments(),
      Guardian.countDocuments(),
      AccessLog.countDocuments(),
    ]);

    // Ingresos de hoy
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);
    const hoyFin = new Date();
    hoyFin.setHours(23, 59, 59, 999);

    const logsHoyCount = await AccessLog.countDocuments({
      timestamp: { $gte: hoyInicio, $lte: hoyFin }
    });

    // Últimos 5 ingresos con información del estudiante y materia
    const recentLogs = await AccessLog.find()
      .populate('studentId')
      .populate('subjectId')
      .sort({ timestamp: -1 })
      .limit(5);

    // Últimas 5 notificaciones generadas
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Métrica de ingresos por estado
    const logsPorEstado = await AccessLog.aggregate([
      { $group: { _id: '$estado', count: { $sum: 1 } } }
    ]);

    // Métrica de ingresos por día de la última semana
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);
    
    const logsUltimosDias = await AccessLog.aggregate([
      { $match: { timestamp: { $gte: hace7dias } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.json({
      success: true,
      stats: {
        students: studentsCount,
        teachers: teachersCount,
        subjects: subjectsCount,
        guardians: guardiansCount,
        totalLogs: totalAccessLogs,
        todayLogs: logsHoyCount,
      },
      recentLogs,
      recentNotifications,
      logsPorEstado,
      logsUltimosDias,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
