/**
 * Type definitions untuk frontend
 */

export type AttendanceType = "IN" | "OUT";

// Status kehadiran
export type AttendanceStatus = "Tepat Waktu" | "Terlambat" | "Tidak Lengkap";

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: number;
  employeeId: number;
  type: AttendanceType;
  timestamp: string;
  createdAt: string;
}

export interface AttendanceReport {
  employeeId: number;
  employeeName: string;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  status: AttendanceStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface CreateAttendanceRequest {
  employee_id: number;
  type: AttendanceType;
}
