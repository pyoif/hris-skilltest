/**
 * Service untuk logika bisnis karyawan
 */

import { Employee, ApiResponse } from "../models";
import * as EmployeeRepository from "../repositories/EmployeeRepository";

export const getAllEmployees = async (): Promise<ApiResponse<Employee[]>> => {
  try {
    const employees = await EmployeeRepository.findAll();

    return {
      success: true,
      message: `Ditemukan ${employees.length} karyawan`,
      data: employees,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error tidak diketahui";
    return {
      success: false,
      message: `Gagal mengambil data karyawan: ${message}`,
      error: message,
    };
  }
};

export const getEmployeeById = async (
  id: number,
): Promise<ApiResponse<Employee>> => {
  try {
    const employee = await EmployeeRepository.findById(id);

    if (!employee) {
      return {
        success: false,
        message: "Karyawan tidak ditemukan",
        error: "Karyawan tidak ditemukan",
      };
    }

    return {
      success: true,
      message: "Karyawan ditemukan",
      data: employee,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error tidak diketahui";
    return {
      success: false,
      message: `Gagal mengambil data karyawan: ${message}`,
      error: message,
    };
  }
};

// Karyawan yang belum absen hari ini
export const getEmployeesWithoutAttendanceToday = async (): Promise<
  ApiResponse<{
    date: string;
    employees: Employee[];
  }>
> => {
  try {
    const employees =
      await EmployeeRepository.findEmployeesWithoutAttendanceToday();
    const today = new Date().toISOString().split("T")[0];

    return {
      success: true,
      message: `Ditemukan ${employees.length} karyawan yang belum absen hari ini`,
      data: {
        date: today,
        employees,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error tidak diketahui";
    return {
      success: false,
      message: `Gagal mengambil data: ${message}`,
      error: message,
    };
  }
};

// Hitung total hadir per karyawan dalam sebulan
export const getMonthlyAttendanceCount = async (
  year?: number,
  month?: number,
): Promise<
  ApiResponse<{
    year: number;
    month: number;
    statistics: {
      employeeId: number;
      employeeName: string;
      totalDays: number;
    }[];
  }>
> => {
  try {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const statistics = await EmployeeRepository.countAttendanceByMonth(
      targetYear,
      targetMonth,
    );

    return {
      success: true,
      message: `Ditemukan statistik kehadiran untuk ${statistics.length} karyawan`,
      data: {
        year: targetYear,
        month: targetMonth,
        statistics,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error tidak diketahui";
    return {
      success: false,
      message: `Gagal mengambil statistik kehadiran: ${message}`,
      error: message,
    };
  }
};

export const createEmployee = async (
  name: string,
  email: string,
  department: string,
): Promise<ApiResponse<Employee>> => {
  try {
    const employee = await EmployeeRepository.create({
      name,
      email,
      department,
    });

    return {
      success: true,
      message: "Karyawan berhasil dibuat",
      data: employee,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error tidak diketahui";
    return {
      success: false,
      message: `Gagal membuat karyawan: ${message}`,
      error: message,
    };
  }
};

export default {
  getAllEmployees,
  getEmployeeById,
  getEmployeesWithoutAttendanceToday,
  getMonthlyAttendanceCount,
  createEmployee,
};
