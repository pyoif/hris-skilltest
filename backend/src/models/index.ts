/**
 * Model dan Interface untuk aplikasi
 */

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AttendanceType {
  IN = "IN",
  OUT = "OUT",
}

export interface Attendance {
  id: number;
  employeeId: number;
  type: AttendanceType;
  timestamp: Date;
  createdAt: Date;
}

export interface AttendanceReport {
  employeeId: number;
  employeeName: string;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  status: AttendanceStatus;
}

// Status kehadiran: Tepat Waktu, Terlambat, Tidak Lengkap
export enum AttendanceStatus {
  ON_TIME = "Tepat Waktu",
  LATE = "Terlambat",
  INCOMPLETE = "Tidak Lengkap",
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface CreateAttendanceDto {
  employeeId: number;
  type: AttendanceType;
}

export interface AttendanceReportQuery {
  startDate?: string;
  endDate?: string;
}
