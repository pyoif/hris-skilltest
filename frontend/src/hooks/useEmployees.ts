/**
 * Hook untuk mengelola data karyawan
 */

import { useState, useCallback, useEffect } from "react";
import { Employee } from "../types";
import * as api from "../services/api";

interface UseEmployeesReturn {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
}

export function useEmployees(): UseEmployeesReturn {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getEmployees();

      if (response.success && response.data) {
        setEmployees(response.data);
      } else {
        setError(response.message || "Gagal mengambil data karyawan");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
  };
}

export default useEmployees;
