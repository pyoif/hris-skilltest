/**
 * Hook untuk mengelola data absensi
 */

import { useState, useCallback } from "react";
import { AttendanceReport, AttendanceType } from "../types";
import * as api from "../services/api";

interface UseAttendanceReturn {
  records: AttendanceReport[];
  loading: boolean;
  error: string | null;
  success: string | null;
  fetchRecords: () => Promise<void>;
  createAttendance: (
    employeeId: number,
    type: AttendanceType,
  ) => Promise<boolean>;
  clearMessages: () => void;
}

export function useAttendance(): UseAttendanceReturn {
  const [records, setRecords] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getRecentAttendance();

      if (response.success && response.data) {
        setRecords(response.data);
      } else {
        setError(response.message || "Gagal mengambil data absensi");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  const createAttendance = useCallback(
    async (employeeId: number, type: AttendanceType): Promise<boolean> => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await api.createAttendance(employeeId, type);

        if (response.success) {
          setSuccess(response.message || `Berhasil mencatat Clock ${type}`);
          await fetchRecords();
          return true;
        } else {
          setError(response.message || `Gagal mencatat Clock ${type}`);
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchRecords],
  );

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    records,
    loading,
    error,
    success,
    fetchRecords,
    createAttendance,
    clearMessages,
  };
}

export default useAttendance;
