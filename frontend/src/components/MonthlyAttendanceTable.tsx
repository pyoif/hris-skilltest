/**
 * Tabel Jumlah Absen Per Bulan
 */

import { useEffect, useState } from 'react';
import { BarChart3, User, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../services/api';

interface MonthlyStatistic {
  employeeId: number;
  employeeName: string;
  totalDays: number;
}

interface MonthlyAttendanceTableProps {
  refreshTrigger?: number;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function MonthlyAttendanceTable({ refreshTrigger }: MonthlyAttendanceTableProps) {
  const [statistics, setStatistics] = useState<MonthlyStatistic[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (targetYear: number, targetMonth: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getMonthlyAttendanceCount(targetYear, targetMonth);

      if (response.success && response.data) {
        setStatistics(response.data.statistics);
        setYear(response.data.year);
        setMonth(response.data.month);
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
    fetchData(year, month);
  }, [refreshTrigger]);

  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;

    if (newMonth < 1) {
      newMonth = 12;
      newYear = year - 1;
    }

    fetchData(newYear, newMonth);
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear = year + 1;
    }

    fetchData(newYear, newMonth);
  };

  // Hitung total hari kerja dalam bulan (tidak termasuk weekend)
  const getWorkingDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    let workingDays = 0;

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    return workingDays;
  };

  const workingDays = getWorkingDaysInMonth(year, month);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Statistik Kehadiran Bulanan</h2>
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
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Statistik Kehadiran Bulanan</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-red-500">
          <p>{error}</p>
          <button
            onClick={() => fetchData(year, month)}
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">Statistik Kehadiran Bulanan</h2>
        </div>
        <button
          onClick={() => fetchData(year, month)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Navigasi Bulan */}
      <div className="flex items-center justify-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Bulan sebelumnya"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center min-w-[180px]">
          <span className="font-semibold text-gray-800">
            {MONTHS[month - 1]} {year}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            {workingDays} hari kerja
          </div>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Bulan berikutnya"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {statistics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-medium text-gray-600">Tidak ada data kehadiran</p>
          <p className="text-sm text-gray-400 mt-1">Belum ada absensi tercatat di bulan ini</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Total <span className="font-semibold text-blue-600">{statistics.length}</span> karyawan
          </p>

          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Karyawan
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Hadir
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Persentase
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {statistics.map((stat) => {
                  const percentage = workingDays > 0
                    ? Math.round((stat.totalDays / workingDays) * 100)
                    : 0;

                  let progressColor = 'bg-emerald-500';
                  let textColor = 'text-emerald-600';
                  if (percentage < 75) {
                    progressColor = 'bg-amber-500';
                    textColor = 'text-amber-600';
                  }
                  if (percentage < 50) {
                    progressColor = 'bg-red-500';
                    textColor = 'text-red-600';
                  }

                  return (
                    <tr key={stat.employeeId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{stat.employeeName}</div>
                            <div className="text-xs text-gray-500">ID: {stat.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-gray-800">{stat.totalDays}</span>
                        <span className="text-gray-400 text-sm"> / {workingDays} hari</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-semibold ${textColor}`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`${progressColor} h-2.5 rounded-full transition-all duration-300`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default MonthlyAttendanceTable;
