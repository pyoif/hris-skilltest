/**
 * Routes untuk absensi
 */

import { Router } from 'express';
import * as AttendanceController from '../controllers/AttendanceController';

const router = Router();

// POST /api/attendance - Catat absensi IN/OUT
router.post('/', AttendanceController.createAttendance);

// GET /api/attendance/report - Laporan absensi
router.get('/report', AttendanceController.getAttendanceReport);

// GET /api/attendance/recent - Data absensi terbaru
router.get('/recent', AttendanceController.getRecentAttendance);

// GET /api/attendance/today/:employeeId - Absensi hari ini
router.get('/today/:employeeId', AttendanceController.getTodayAttendance);

export default router;
