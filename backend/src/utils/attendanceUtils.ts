/**
 * Utilitas untuk menentukan status kehadiran
 *
 * Aturan:
 * - Jam masuk normal: 09:00
 * - Jika IN > 09:15 → Terlambat
 * - Jika tidak ada OUT → Tidak Lengkap
 */

import { AttendanceStatus } from "../models";

const NORMAL_CHECKIN_HOUR = 9;
const NORMAL_CHECKIN_MINUTE = 0;
const LATE_THRESHOLD_MINUTE = 15; // Toleransi 15 menit

const getLateThresholdTime = (date: Date): Date => {
  const threshold = new Date(date);
  threshold.setHours(NORMAL_CHECKIN_HOUR, LATE_THRESHOLD_MINUTE, 0, 0);
  return threshold;
};

/**
 * Tentukan status kehadiran berdasarkan jam masuk dan keluar
 */
export const determineAttendanceStatus = (
  timeIn: Date | string | null,
  timeOut: Date | string | null,
): AttendanceStatus => {
  if (!timeIn) {
    return AttendanceStatus.INCOMPLETE;
  }

  const checkInTime = typeof timeIn === "string" ? new Date(timeIn) : timeIn;

  // Tidak ada clock out
  if (!timeOut) {
    return AttendanceStatus.INCOMPLETE;
  }

  const lateThreshold = getLateThresholdTime(checkInTime);

  // Terlambat jika masuk setelah 09:15
  if (checkInTime > lateThreshold) {
    return AttendanceStatus.LATE;
  }

  return AttendanceStatus.ON_TIME;
};

/**
 * Hitung menit keterlambatan
 */
export const calculateLateMinutes = (timeIn: Date | string): number => {
  const checkInTime = typeof timeIn === "string" ? new Date(timeIn) : timeIn;
  const lateThreshold = getLateThresholdTime(checkInTime);

  if (checkInTime <= lateThreshold) {
    return 0;
  }

  const diffMs = checkInTime.getTime() - lateThreshold.getTime();
  return Math.ceil(diffMs / (1000 * 60));
};

/**
 * Hitung durasi kerja dalam jam
 */
export const calculateWorkDuration = (
  timeIn: Date | string | null,
  timeOut: Date | string | null,
): number => {
  if (!timeIn || !timeOut) {
    return 0;
  }

  const checkInTime = typeof timeIn === "string" ? new Date(timeIn) : timeIn;
  const checkOutTime =
    typeof timeOut === "string" ? new Date(timeOut) : timeOut;

  const diffMs = checkOutTime.getTime() - checkInTime.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
};

/**
 * Format waktu untuk ditampilkan (HH:MM)
 */
export const formatTime = (date: Date | string | null): string => {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Format tanggal (YYYY-MM-DD)
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};

/**
 * Cek apakah sedang jam kerja
 */
export const isWithinWorkingHours = (): boolean => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 6 && hour < 18;
};

/**
 * Warna untuk status kehadiran
 */
export const getStatusColor = (status: AttendanceStatus): string => {
  switch (status) {
    case AttendanceStatus.ON_TIME:
      return "green";
    case AttendanceStatus.LATE:
      return "orange";
    case AttendanceStatus.INCOMPLETE:
      return "red";
    default:
      return "gray";
  }
};

export default {
  determineAttendanceStatus,
  calculateLateMinutes,
  calculateWorkDuration,
  formatTime,
  formatDate,
  isWithinWorkingHours,
  getStatusColor,
  NORMAL_CHECKIN_HOUR,
  LATE_THRESHOLD_MINUTE,
};
