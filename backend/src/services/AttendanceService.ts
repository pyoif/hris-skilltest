/**
 * Service untuk logika bisnis absensi
 */

import {
  Attendance,
  AttendanceType,
  AttendanceReport,
  ApiResponse,
} from "../models";
import * as AttendanceRepository from "../repositories/AttendanceRepository";
import * as EmployeeRepository from "../repositories/EmployeeRepository";

const ERROR_MESSAGES = {
  EMPLOYEE_NOT_FOUND: "Karyawan tidak ditemukan",
  ALREADY_CHECKED_IN:
    "Karyawan sudah clock in hari ini. Hanya boleh 1 IN per hari.",
  ALREADY_CHECKED_OUT:
    "Karyawan sudah clock out hari ini. Hanya boleh 1 OUT per hari.",
  NO_CHECK_IN: "Tidak bisa clock OUT sebelum clock IN",
  INVALID_ATTENDANCE_TYPE: "Tipe absensi tidak valid. Harus IN atau OUT",
};

const validateEmployee = async (employeeId: number): Promise<void> => {
  const exists = await EmployeeRepository.exists(employeeId);
  if (!exists) {
    throw new Error(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND);
  }
};

/**
 * Buat record absensi dengan validasi aturan bisnis
 * - Hanya 1 IN dan 1 OUT per hari
 * - OUT harus setelah IN
 */
export const createAttendance = async (
  employeeId: number,
  type: AttendanceType,
): Promise<ApiResponse<Attendance>> => {
  try {
    await validateEmployee(employeeId);

    if (type !== AttendanceType.IN && type !== AttendanceType.OUT) {
      return {
        success: false,
        message: ERROR_MESSAGES.INVALID_ATTENDANCE_TYPE,
        error: ERROR_MESSAGES.INVALID_ATTENDANCE_TYPE,
      };
    }

    if (type === AttendanceType.IN) {
      const hasIn = await AttendanceRepository.hasInToday(employeeId);
      if (hasIn) {
        return {
          success: false,
          message: ERROR_MESSAGES.ALREADY_CHECKED_IN,
          error: ERROR_MESSAGES.ALREADY_CHECKED_IN,
        };
      }
    } else if (type === AttendanceType.OUT) {
      const hasOut = await AttendanceRepository.hasOutToday(employeeId);
      if (hasOut) {
        return {
          success: false,
          message: ERROR_MESSAGES.ALREADY_CHECKED_OUT,
          error: ERROR_MESSAGES.ALREADY_CHECKED_OUT,
        };
      }

      const hasIn = await AttendanceRepository.hasInToday(employeeId);
      if (!hasIn) {
        return {
          success: false,
          message: ERROR_MESSAGES.NO_CHECK_IN,
          error: ERROR_MESSAGES.NO_CHECK_IN,
        };
      }
    }

    const attendance = await AttendanceRepository.create(employeeId, type);

    return {
      success: true,
      message: `Berhasil mencatat ${type} untuk karyawan ${employeeId}`,
      data: attendance,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error tidak diketahui";
    return {
      success: false,
      message: `Gagal mencatat absensi: ${message}`,
      error: message,
    };
  }
};

/**
 * Ambil laporan absensi dalam rentang tanggal
 */
export const getAttendanceReport = async (
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<AttendanceReport[]>> => {
  try {
    const end = endDate || new Date().toISOString().split("T")[0];
    const start =
      startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    const report = await AttendanceRepository.getReport(start, end);

    return {
      success: true,
      message: `Ditemukan ${report.length} record absensi`,
      data: report,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error tidak diketahui";
    return {
      success: false,
      message: `Gagal mengambil laporan absensi: ${message}`,
      error: message,
    };
  }
};

/**
 * Ambil data absensi terbaru
 */
export const getRecentAttendance = async (
  limit: number = 50,
): Promise<ApiResponse<AttendanceReport[]>> => {
  try {
    const records = await AttendanceRepository.getRecentAttendance(limit);

    return {
      success: true,
      message: `Ditemukan ${records.length} record absensi terbaru`,
      data: records,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error tidak diketahui";
    return {
      success: false,
      message: `Gagal mengambil data absensi: ${message}`,
      error: message,
    };
  }
};

/**
 * Ambil absensi hari ini untuk karyawan tertentu
 */
export const getTodayAttendance = async (
  employeeId: number,
): Promise<ApiResponse<Attendance[]>> => {
  try {
    const records =
      await AttendanceRepository.findTodayByEmployeeId(employeeId);

    return {
      success: true,
      message: `Ditemukan ${records.length} record absensi hari ini`,
      data: records,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error tidak diketahui";
    return {
      success: false,
      message: `Gagal mengambil absensi hari ini: ${message}`,
      error: message,
    };
  }
};

export default {
  createAttendance,
  getAttendanceReport,
  getRecentAttendance,
  getTodayAttendance,
};
