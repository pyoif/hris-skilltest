/**
 * Routes untuk karyawan
 */

import { Router } from 'express';
import * as EmployeeController from '../controllers/EmployeeController';

const router = Router();

// GET /api/employees - Daftar semua karyawan
router.get('/', EmployeeController.getAllEmployees);

// GET /api/employees/without-attendance-today - Karyawan yang belum absen
router.get('/without-attendance-today', EmployeeController.getEmployeesWithoutAttendanceToday);

// GET /api/employees/monthly-attendance - Total hadir per bulan
router.get('/monthly-attendance', EmployeeController.getMonthlyAttendanceCount);

// GET /api/employees/:id - Detail karyawan
router.get('/:id', EmployeeController.getEmployeeById);

// POST /api/employees - Tambah karyawan baru
router.post('/', EmployeeController.createEmployee);

export default router;
