/**
 * Repository untuk data absensi
 */

import { PoolClient } from "pg";
import { query, transaction } from "../config/database";
import {
  Attendance,
  AttendanceType,
  AttendanceReport,
  AttendanceStatus,
} from "../models";
import { determineAttendanceStatus } from "../utils/attendanceUtils";

interface AttendanceRow {
  id: number;
  employee_id: number;
  type: string;
  timestamp: Date;
  created_at: Date;
}

interface AttendanceReportRow {
  employee_id: number;
  employee_name: string;
  date: string;
  time_in: Date | null;
  time_out: Date | null;
}

const mapRowToAttendance = (row: AttendanceRow): Attendance => ({
  id: row.id,
  employeeId: row.employee_id,
  type: row.type as AttendanceType,
  timestamp: row.timestamp,
  createdAt: row.created_at,
});

export const findById = async (id: number): Promise<Attendance | null> => {
  const result = await query<AttendanceRow>(
    "SELECT id, employee_id, type, timestamp, created_at FROM attendance WHERE id = $1",
    [id],
  );
  return result.rows[0] ? mapRowToAttendance(result.rows[0]) : null;
};

export const findTodayByEmployeeId = async (
  employeeId: number,
): Promise<Attendance[]> => {
  const result = await query<AttendanceRow>(
    `SELECT id, employee_id, type, timestamp, created_at 
     FROM attendance 
     WHERE employee_id = $1 AND DATE(timestamp) = CURRENT_DATE
     ORDER BY timestamp`,
    [employeeId],
  );
  return result.rows.map(mapRowToAttendance);
};

export const findByEmployeeIdDateAndType = async (
  employeeId: number,
  date: Date,
  type: AttendanceType,
): Promise<Attendance | null> => {
  const result = await query<AttendanceRow>(
    `SELECT id, employee_id, type, timestamp, created_at 
     FROM attendance 
     WHERE employee_id = $1 AND DATE(timestamp) = DATE($2) AND type = $3
     LIMIT 1`,
    [employeeId, date, type],
  );
  return result.rows[0] ? mapRowToAttendance(result.rows[0]) : null;
};

export const hasInToday = async (employeeId: number): Promise<boolean> => {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(
       SELECT 1 FROM attendance 
       WHERE employee_id = $1 AND DATE(timestamp) = CURRENT_DATE AND type = 'IN'
     ) as exists`,
    [employeeId],
  );
  return result.rows[0].exists;
};

export const hasOutToday = async (employeeId: number): Promise<boolean> => {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(
       SELECT 1 FROM attendance 
       WHERE employee_id = $1 AND DATE(timestamp) = CURRENT_DATE AND type = 'OUT'
     ) as exists`,
    [employeeId],
  );
  return result.rows[0].exists;
};

export const create = async (
  employeeId: number,
  type: AttendanceType,
  timestamp: Date = new Date(),
): Promise<Attendance> => {
  return transaction(async (client: PoolClient) => {
    const result = await client.query<AttendanceRow>(
      `INSERT INTO attendance (employee_id, type, timestamp) 
       VALUES ($1, $2, $3) 
       RETURNING id, employee_id, type, timestamp, created_at`,
      [employeeId, type, timestamp],
    );
    return mapRowToAttendance(result.rows[0]);
  });
};

// Laporan absensi dalam rentang tanggal
export const getReport = async (
  startDate: string,
  endDate: string,
): Promise<AttendanceReport[]> => {
  const result = await query<AttendanceReportRow>(
    `SELECT 
       e.id as employee_id,
       e.name as employee_name,
       DATE(in_att.timestamp) as date,
       in_att.timestamp as time_in,
       out_att.timestamp as time_out
     FROM employees e
     INNER JOIN attendance in_att ON e.id = in_att.employee_id 
       AND in_att.type = 'IN'
       AND DATE(in_att.timestamp) BETWEEN $1 AND $2
     LEFT JOIN attendance out_att ON e.id = out_att.employee_id 
       AND out_att.type = 'OUT'
       AND DATE(out_att.timestamp) = DATE(in_att.timestamp)
     ORDER BY DATE(in_att.timestamp) DESC, e.id`,
    [startDate, endDate],
  );

  return result.rows.map((row) => ({
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    date: row.date,
    timeIn: row.time_in ? row.time_in.toISOString() : null,
    timeOut: row.time_out ? row.time_out.toISOString() : null,
    status: determineAttendanceStatus(row.time_in, row.time_out),
  }));
};

export const findAll = async (): Promise<Attendance[]> => {
  const result = await query<AttendanceRow>(
    "SELECT id, employee_id, type, timestamp, created_at FROM attendance ORDER BY timestamp DESC",
  );
  return result.rows.map(mapRowToAttendance);
};

// Ambil data absensi terbaru dengan info karyawan
export const getRecentAttendance = async (
  limit: number = 50,
): Promise<AttendanceReport[]> => {
  const result = await query<AttendanceReportRow>(
    `SELECT 
       e.id as employee_id,
       e.name as employee_name,
       DATE(in_att.timestamp) as date,
       in_att.timestamp as time_in,
       out_att.timestamp as time_out
     FROM employees e
     INNER JOIN attendance in_att ON e.id = in_att.employee_id 
       AND in_att.type = 'IN'
     LEFT JOIN attendance out_att ON e.id = out_att.employee_id 
       AND out_att.type = 'OUT'
       AND DATE(out_att.timestamp) = DATE(in_att.timestamp)
     ORDER BY in_att.timestamp DESC
     LIMIT $1`,
    [limit],
  );

  return result.rows.map((row) => ({
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    date: row.date,
    timeIn: row.time_in ? row.time_in.toISOString() : null,
    timeOut: row.time_out ? row.time_out.toISOString() : null,
    status: determineAttendanceStatus(row.time_in, row.time_out),
  }));
};

export default {
  findById,
  findTodayByEmployeeId,
  findByEmployeeIdDateAndType,
  hasInToday,
  hasOutToday,
  create,
  getReport,
  findAll,
  getRecentAttendance,
};
