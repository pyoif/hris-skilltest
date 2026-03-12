/**
 * API Service - Menggunakan native fetch
 */

import {
  ApiResponse,
  AttendanceReport,
  Employee,
  AttendanceType,
} from "../types";

const API_BASE_URL = "/api";

const defaultHeaders = {
  "Content-Type": "application/json",
};

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP Error: ${response.status}`,
        error: data.error || "Unknown error",
      };
    }

    return data;
  } catch (error) {
    console.error("[API] Error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal koneksi ke server",
      error: "NETWORK_ERROR",
    };
  }
}

// POST /api/attendance - Catat absensi
export async function createAttendance(
  employeeId: number,
  type: AttendanceType,
): Promise<ApiResponse<void>> {
  return fetchApi<void>("/attendance", {
    method: "POST",
    body: JSON.stringify({ employee_id: employeeId, type }),
  });
}

// GET /api/attendance/report - Laporan absensi
export async function getAttendanceReport(
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<AttendanceReport[]>> {
  const params = new URLSearchParams();

  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const queryString = params.toString();
  const endpoint = queryString
    ? `/attendance/report?${queryString}`
    : "/attendance/report";

  return fetchApi<AttendanceReport[]>(endpoint);
}

// GET /api/attendance/recent - Data absensi terbaru
export async function getRecentAttendance(
  limit: number = 50,
): Promise<ApiResponse<AttendanceReport[]>> {
  return fetchApi<AttendanceReport[]>(`/attendance/recent?limit=${limit}`);
}

// GET /api/employees - Daftar karyawan
export async function getEmployees(): Promise<ApiResponse<Employee[]>> {
  return fetchApi<Employee[]>("/employees");
}

// GET /api/employees/:id - Detail karyawan
export async function getEmployeeById(
  id: number,
): Promise<ApiResponse<Employee>> {
  return fetchApi<Employee>(`/employees/${id}`);
}

// GET /api/employees/without-attendance-today - Karyawan yang belum absen
export async function getEmployeesWithoutAttendanceToday(): Promise<
  ApiResponse<{ date: string; employees: Employee[] }>
> {
  return fetchApi<{ date: string; employees: Employee[] }>(
    "/employees/without-attendance-today",
  );
}

// GET /api/employees/monthly-attendance - Total hadir per bulan
export async function getMonthlyAttendanceCount(
  year?: number,
  month?: number,
): Promise<
  ApiResponse<{
    year: number;
    month: number;
    statistics: {
      employeeId: number;
      employeeName: string;
      totalDays: number;
    }[];
  }>
> {
  const params = new URLSearchParams();

  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());

  const queryString = params.toString();
  const endpoint = queryString
    ? `/employees/monthly-attendance?${queryString}`
    : "/employees/monthly-attendance";

  return fetchApi(endpoint);
}

// POST /api/employees - Tambah karyawan baru
export async function createEmployee(
  name: string,
  email: string,
  department: string,
): Promise<ApiResponse<Employee>> {
  return fetchApi<Employee>("/employees", {
    method: "POST",
    body: JSON.stringify({ name, email, department }),
  });
}
