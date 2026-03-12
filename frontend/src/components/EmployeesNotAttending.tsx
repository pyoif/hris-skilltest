/**
 * Tabel Karyawan yang Belum Absen Hari Ini
 */

import { useEffect, useState } from 'react';
import { UserX, User, Calendar, RefreshCw } from 'lucide-react';
import { Employee } from '../types';
import * as api from '../services/api';

interface EmployeesNotAttendingProps {
  refreshTrigger?: number;
}

function EmployeesNotAttending({ refreshTrigger }: EmployeesNotAttendingProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [date, setDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getEmployeesWithoutAttendanceToday();

      if (response.success && response.data) {
        setEmployees(response.data.employees);
        setDate(response.data.date);
      } else {
        setError(response.message || 'Gagal mengambil data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <UserX className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Karyawan Belum Absen</h2>
        </div>
        <div className="flex items-center justify-center py-8 text-gray-500">
          <div className="animate-pulse">Memuat data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <UserX className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Karyawan Belum Absen</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-red-500">
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <UserX className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-800">Karyawan Belum Absen</h2>
        </div>
        <button
          onClick={fetchData}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(date)}</span>
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <UserX className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="font-medium text-emerald-600">Semua karyawan sudah absen!</p>
          <p className="text-sm text-gray-400 mt-1">Tidak ada karyawan yang terlambat hari ini</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            <span className="font-semibold text-amber-600">{employees.length}</span> karyawan belum melakukan Clock In
          </p>

          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Karyawan
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Departemen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{employee.name}</div>
                          <div className="text-xs text-gray-500">ID: {employee.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {employee.department}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default EmployeesNotAttending;
