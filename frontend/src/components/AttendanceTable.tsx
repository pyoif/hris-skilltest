/**
 * Tabel Data Absensi
 */

import { useState, useEffect } from 'react';
import { Table, Clock, CheckCircle, AlertTriangle, XCircle, User, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { AttendanceReport, AttendanceStatus } from '../types';
import { formatTime, formatDateLong } from '../utils/attendanceUtils';
import { DateRangePicker } from './ui/date-range-picker';
import * as api from '../services/api';

interface AttendanceTableProps {
  records: AttendanceReport[];
  loading: boolean;
  onDataChange?: () => void;
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const config: Record<AttendanceStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    'Tepat Waktu': {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    'Terlambat': {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    'Tidak Lengkap': {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const { bg, text, icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
      {icon}
      {status}
    </span>
  );
}

// Default range tanggal: 30 days terakhir
function getDefaultRange(): DateRange {
  const to = new Date();
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return { from, to };
}

function AttendanceTable({ records: initialRecords, loading: initialLoading, onDataChange }: AttendanceTableProps) {
  const [records, setRecords] = useState<AttendanceReport[]>(initialRecords);
  const [loading, setLoading] = useState(initialLoading);
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultRange());
  const [isFiltered, setIsFiltered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRecords(initialRecords);
    setLoading(initialLoading);
  }, [initialRecords, initialLoading]);

  const handleFilter = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setError('Pilih tanggal mulai dan tanggal akhir');
      return;
    }

    setLoading(true);
    setError(null);

    const startDate = format(dateRange.from, 'yyyy-MM-dd');
    const endDate = format(dateRange.to, 'yyyy-MM-dd');

    try {
      const response = await api.getAttendanceReport(startDate, endDate);

      if (response.success && response.data) {
        setRecords(response.data);
        setIsFiltered(true);
      } else {
        setError(response.message || 'Gagal memfilter data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setDateRange(getDefaultRange());
    setIsFiltered(false);
    setError(null);
    if (onDataChange) {
      onDataChange();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Table className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Data Absensi</h2>
        </div>
        <div className="flex items-center justify-center py-12 text-gray-500">
          <div className="animate-pulse">Memuat data absensi...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Data Absensi</h2>
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Reset Filter
            </button>
          )}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showFilter
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter Tanggal
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Rentang Tanggal
              </label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>

            <button
              onClick={handleFilter}
              disabled={!dateRange?.from || !dateRange?.to}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Terapkan
            </button>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}

      {/* Info */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Menampilkan <span className="font-semibold">{records.length}</span> record
          {isFiltered && dateRange?.from && dateRange?.to && (
            <span className="text-blue-600 ml-1">
              ({format(dateRange.from, 'dd MMM yyyy')} s/d {format(dateRange.to, 'dd MMM yyyy')})
            </span>
          )}
        </p>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Table className="w-12 h-12 text-gray-300 mb-3" />
          <p>Belum ada data absensi.</p>
          <p className="text-sm text-gray-400 mt-1">
            {isFiltered
              ? 'Tidak ada data pada rentang tanggal yang dipilih'
              : 'Catat absensi pertama menggunakan form di atas!'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  Karyawan
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  Tanggal
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  Clock In
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  Clock Out
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => (
                <tr key={`${record.employeeId}-${record.date}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{record.employeeName}</div>
                        <div className="text-xs text-gray-500">ID: {record.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDateLong(record.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <Clock className="w-4 h-4" />
                      {formatTime(record.timeIn)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-red-500 font-medium">
                      <Clock className="w-4 h-4" />
                      {formatTime(record.timeOut)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendanceTable;
