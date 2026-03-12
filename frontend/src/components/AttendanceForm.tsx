/**
 * Form Absensi
 */

import { useState, useCallback } from 'react';
import { LogIn, LogOut, User, Loader2, Search } from 'lucide-react';
import { Employee } from '../types';

interface AttendanceFormProps {
  employees: Employee[];
  onSubmit: (employeeId: number, type: 'IN' | 'OUT') => Promise<boolean>;
  loading: boolean;
}

function AttendanceForm({ employees, onSubmit, loading }: AttendanceFormProps) {
  const [employeeInput, setEmployeeInput] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'IN' | 'OUT' | null>(null);

  // Parse employee ID dari input (bisa "1" atau "Nama (Dept)")
  const parseEmployeeId = (input: string): number | null => {
    if (!input) return null;
    
    // Coba parse angka langsung
    const directId = parseInt(input, 10);
    if (!isNaN(directId)) {
      return directId;
    }
    
    // Coba parse dari format "Nama (Dept)"
    const match = input.match(/^(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    return null;
  };

  const selectedEmployeeId = parseEmployeeId(employeeInput);
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  const handleSubmit = useCallback(
    async (type: 'IN' | 'OUT') => {
      const id = parseEmployeeId(employeeInput);
      
      if (id === null) {
        alert('Masukkan Employee ID yang valid');
        return;
      }

      // Validasi employee exists
      const exists = employees.some(emp => emp.id === id);
      if (!exists) {
        alert('Employee ID tidak ditemukan');
        return;
      }

      setSelectedType(type);
      await onSubmit(id, type);
      setSelectedType(null);
    },
    [employeeInput, employees, onSubmit]
  );

  // Handle input change
  const handleInputChange = (value: string) => {
    setEmployeeInput(value);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Form Absensi</h2>
      </div>
      
      <div className="mb-5">
        <label htmlFor="employee-input" className="block text-sm font-medium text-gray-700 mb-2">
          Employee ID
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            id="employee-input"
            type="text"
            list="employee-list"
            value={employeeInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Ketik Employee ID (contoh: 1)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
            autoComplete="off"
          />
          <datalist id="employee-list">
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id.toString()}>
                {emp.name} ({emp.department})
              </option>
            ))}
          </datalist>
        </div>
        
        {/* Info karyawan yang dipilih */}
        {selectedEmployee && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{selectedEmployee.name}</div>
                <div className="text-sm text-gray-500">
                  ID: {selectedEmployee.id} • {selectedEmployee.department}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Pesan jika ID tidak valid */}
        {employeeInput && !selectedEmployee && (
          <p className="mt-2 text-sm text-red-500">
            Employee ID tidak ditemukan
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-all ${
            loading && selectedType === 'IN'
              ? 'bg-emerald-400 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={() => handleSubmit('IN')}
          disabled={loading || !selectedEmployee}
        >
          {loading && selectedType === 'IN' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>CLOCK IN</span>
            </>
          )}
        </button>

        <button
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-all ${
            loading && selectedType === 'OUT'
              ? 'bg-red-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 active:scale-[0.98]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={() => handleSubmit('OUT')}
          disabled={loading || !selectedEmployee}
        >
          {loading && selectedType === 'OUT' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              <span>CLOCK OUT</span>
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Ketik Employee ID atau pilih dari daftar, lalu klik Clock In/Out untuk mencatat kehadiran.
      </p>
    </div>
  );
}

export default AttendanceForm;
