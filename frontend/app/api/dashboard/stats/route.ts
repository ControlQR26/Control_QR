import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Student } from '@/models/Student';
import { Guardian } from '@/models/Guardian';
import { Teacher } from '@/models/Teacher';
import { Subject } from '@/models/Subject';
import { AccessLog } from '@/models/AccessLog';
import { Notification } from '@/models/Notification';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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

    // Ingresos de hoy en zona horaria Colombia (UTC-5)
    const colNow = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const y = colNow.getUTCFullYear();
    const m = colNow.getUTCMonth();
    const d = colNow.getUTCDate();
    const hoyInicio = new Date(Date.UTC(y, m, d, 5, 0, 0, 0));
    const hoyFin = new Date(Date.UTC(y, m, d + 1, 4, 59, 59, 999));

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

    return NextResponse.json({
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
      charts: {
        logsPorEstado,
        logsUltimosDias,
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
