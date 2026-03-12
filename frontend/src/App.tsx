/**
 * Aplikasi HRIS Attendance
 */

import { useEffect, useState } from 'react';
import { Building2, RefreshCw } from 'lucide-react';
import AttendanceForm from './components/AttendanceForm';
import AttendanceTable from './components/AttendanceTable';
import EmployeesNotAttending from './components/EmployeesNotAttending';
import MonthlyAttendanceTable from './components/MonthlyAttendanceTable';
import Alert from './components/Alert';
import { useAttendance } from './hooks/useAttendance';
import { useEmployees } from './hooks/useEmployees';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    records,
    loading: attendanceLoading,
    error,
    success,
    fetchRecords,
    createAttendance,
    clearMessages,
  } = useAttendance();

  const { employees } = useEmployees();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSubmit = async (employeeId: number, type: 'IN' | 'OUT') => {
    const result = await createAttendance(employeeId, type);

    if (result) {
      // Trigger refresh untuk komponen lain
      setRefreshKey(prev => prev + 1);

      setTimeout(() => {
        clearMessages();
      }, 3000);
    }

    return result;
  };

  const handleRefreshAll = () => {
    fetchRecords();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white py-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Building2 className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Sistem Absensi HRIS</h1>
        </div>
        <p className="text-gray-400">Technical Test - Junior Developer</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Alert Messages */}
        {error && (
          <Alert type="error" message={error} onClose={clearMessages} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={clearMessages} />
        )}

        {/* Form Absensi */}
        <AttendanceForm
          employees={employees}
          onSubmit={handleSubmit}
          loading={attendanceLoading}
        />

        {/* Tabel Data Absensi */}
        <AttendanceTable
          records={records}
          loading={attendanceLoading}
          onDataChange={handleRefreshAll}
        />

        {/* Karyawan Belum Absen */}
        <EmployeesNotAttending refreshTrigger={refreshKey} />

        {/* Statistik Kehadiran Bulanan */}
        <MonthlyAttendanceTable refreshTrigger={refreshKey} />

        {/* Info Aturan */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Aturan Absensi</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Jam masuk normal: <strong>09:00</strong></li>
            <li>Jika clock in setelah <strong>09:15</strong>, status: <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Terlambat</span></li>
            <li>Jika tidak ada clock out, status: <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Tidak Lengkap</span></li>
            <li>Hanya <strong>1 Clock In dan 1 Clock Out</strong> per hari per karyawan</li>
            <li>Clock <strong>OUT</strong> harus setelah Clock <strong>IN</strong></li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-4 text-sm">
        <p>Technical Test HRIS - Express.js + PostgreSQL + React</p>
      </footer>
    </div>
  );
}

export default App;
