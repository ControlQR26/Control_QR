import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from './controllers/studentController';
import {
  getGuardians,
  getGuardianById,
  createGuardian,
  updateGuardian,
  deleteGuardian
} from './controllers/guardianController';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
} from './controllers/teacherController';
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} from './controllers/subjectController';
import {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from './controllers/scheduleController';
import { getAccessLogs } from './controllers/accessLogController';
import { getNotifications } from './controllers/notificationController';
import { validateScan } from './controllers/scannerController';
import { seedDatabase } from './controllers/seedController';
import { getDashboardStats } from './controllers/dashboardController';

const router = Router();

// Students API
router.get('/students', getStudents);
router.post('/students', createStudent);
router.get('/students/:id', getStudentById);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Guardians API
router.get('/guardians', getGuardians);
router.post('/guardians', createGuardian);
router.get('/guardians/:id', getGuardianById);
router.put('/guardians/:id', updateGuardian);
router.delete('/guardians/:id', deleteGuardian);

// Teachers API
router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);
router.get('/teachers/:id', getTeacherById);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

// Subjects API
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.get('/subjects/:id', getSubjectById);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// Schedules API
router.get('/schedules', getSchedules);
router.post('/schedules', createSchedule);
router.get('/schedules/:id', getScheduleById);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

// Access Logs API
router.get('/access-logs', getAccessLogs);

// Notifications API
router.get('/notifications', getNotifications);

// Scanner Validation API
router.post('/scanner/validate', validateScan);

// Seed API
router.get('/seed', seedDatabase);

// Dashboard Statistics API
router.get('/dashboard/stats', getDashboardStats);

export default router;
