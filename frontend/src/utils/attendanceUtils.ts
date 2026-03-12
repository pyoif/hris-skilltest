/**
 * Utilitas untuk menentukan status kehadiran
 *
 */

import { AttendanceStatus } from "../types";

const NORMAL_CHECKIN_HOUR = 9;
const LATE_THRESHOLD_MINUTE = 15;

function getLateThresholdTime(date: Date): Date {
  const threshold = new Date(date);
  threshold.setHours(NORMAL_CHECKIN_HOUR, LATE_THRESHOLD_MINUTE, 0, 0);
  return threshold;
}

/**
 * Tentukan status kehadiran
 */
export function determineAttendanceStatus(
  timeIn: string | null,
  timeOut: string | null,
): AttendanceStatus {
  if (!timeIn) {
    return "Tidak Lengkap";
  }

  const checkInTime = new Date(timeIn);

  if (!timeOut) {
    return "Tidak Lengkap";
  }

  const lateThreshold = getLateThresholdTime(checkInTime);

  if (checkInTime > lateThreshold) {
    return "Terlambat";
  }

  return "Tepat Waktu";
}

/**
 * Format waktu
 */
export function formatTime(dateString: string | null): string {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format tanggal panjang
 */
export function formatDateLong(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Warna untuk status
 */
export function getStatusColor(status: AttendanceStatus): string {
  const colors: Record<AttendanceStatus, string> = {
    "Tepat Waktu": "#10B981",
    Terlambat: "#F59E0B",
    "Tidak Lengkap": "#EF4444",
  };
  return colors[status] || "#6B7280";
}

/**
 * Warna background untuk badge status
 */
export function getStatusBgColor(status: AttendanceStatus): string {
  const colors: Record<AttendanceStatus, string> = {
    "Tepat Waktu": "#D1FAE5",
    Terlambat: "#FEF3C7",
    "Tidak Lengkap": "#FEE2E2",
  };
  return colors[status] || "#F3F4F6";
}
