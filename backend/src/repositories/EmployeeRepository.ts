/**
 * Repository untuk data karyawan
 */

import { query } from "../config/database";
import { Employee } from "../models";

interface EmployeeRow {
  id: number;
  name: string;
  email: string;
  department: string;
  created_at: Date;
  updated_at: Date;
}

const mapRowToEmployee = (row: EmployeeRow): Employee => ({
  id: row.id,
  name: row.name,
  email: row.email,
  department: row.department,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findAll = async (): Promise<Employee[]> => {
  const result = await query<EmployeeRow>(
    "SELECT id, name, email, department, created_at, updated_at FROM employees ORDER BY id",
  );
  return result.rows.map(mapRowToEmployee);
};

export const findById = async (id: number): Promise<Employee | null> => {
  const result = await query<EmployeeRow>(
    "SELECT id, name, email, department, created_at, updated_at FROM employees WHERE id = $1",
    [id],
  );
  return result.rows[0] ? mapRowToEmployee(result.rows[0]) : null;
};

export const create = async (
  employee: Omit<Employee, "id" | "createdAt" | "updatedAt">,
): Promise<Employee> => {
  const result = await query<EmployeeRow>(
    `INSERT INTO employees (name, email, department) 
     VALUES ($1, $2, $3) 
     RETURNING id, name, email, department, created_at, updated_at`,
    [employee.name, employee.email, employee.department],
  );
  return mapRowToEmployee(result.rows[0]);
};

export const exists = async (id: number): Promise<boolean> => {
  const result = await query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM employees WHERE id = $1) as exists",
    [id],
  );
  return result.rows[0].exists;
};

// Query: Karyawan yang belum absen hari ini
export const findEmployeesWithoutAttendanceToday = async (): Promise<
  Employee[]
> => {
  const result = await query<EmployeeRow>(
    `SELECT e.id, e.name, e.email, e.department, e.created_at, e.updated_at
     FROM employees e
     LEFT JOIN attendance a ON e.id = a.employee_id 
       AND DATE(a.timestamp) = CURRENT_DATE
       AND a.type = 'IN'
     WHERE a.id IS NULL
     ORDER BY e.id`,
  );
  return result.rows.map(mapRowToEmployee);
};

// Query: Hitung total hadir per karyawan dalam sebulan
export const countAttendanceByMonth = async (
  year: number,
  month: number,
): Promise<
  {
    employeeId: number;
    employeeName: string;
    totalDays: number;
  }[]
> => {
  const result = await query<{
    employee_id: number;
    employee_name: string;
    total_days: number;
  }>(
    `SELECT 
       e.id as employee_id,
       e.name as employee_name,
       COUNT(DISTINCT DATE(a.timestamp)) as total_days
     FROM employees e
     LEFT JOIN attendance a ON e.id = a.employee_id 
       AND EXTRACT(YEAR FROM a.timestamp) = $1
       AND EXTRACT(MONTH FROM a.timestamp) = $2
       AND a.type = 'IN'
     GROUP BY e.id, e.name
     ORDER BY e.id`,
    [year, month],
  );

  return result.rows.map((row) => ({
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    totalDays: parseInt(row.total_days.toString(), 10),
  }));
};

export default {
  findAll,
  findById,
  create,
  exists,
  findEmployeesWithoutAttendanceToday,
  countAttendanceByMonth,
};
