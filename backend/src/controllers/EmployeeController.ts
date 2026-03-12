/**
 * Controller untuk endpoint karyawan
 */

import { Request, Response } from "express";
import * as EmployeeService from "../services/EmployeeService";

export const getAllEmployees = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await EmployeeService.getAllEmployees();
    res.status(200).json(result);
  } catch (error) {
    console.error("[Controller] Error mengambil karyawan:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Error tidak diketahui",
    });
  }
};

export const getEmployeeById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "ID karyawan tidak valid",
        error: "VALIDATION_ERROR",
      });
      return;
    }

    const result = await EmployeeService.getEmployeeById(id);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error("[Controller] Error mengambil karyawan:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Error tidak diketahui",
    });
  }
};

// Karyawan yang belum absen hari ini
export const getEmployeesWithoutAttendanceToday = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await EmployeeService.getEmployeesWithoutAttendanceToday();
    res.status(200).json(result);
  } catch (error) {
    console.error("[Controller] Error mengambil data:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Error tidak diketahui",
    });
  }
};

// Total hadir per karyawan dalam sebulan
export const getMonthlyAttendanceCount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const year = req.query.year
      ? parseInt(req.query.year as string, 10)
      : undefined;
    const month = req.query.month
      ? parseInt(req.query.month as string, 10)
      : undefined;

    if (year && (year < 2000 || year > 2100)) {
      res.status(400).json({
        success: false,
        message: "Tahun harus antara 2000 dan 2100",
        error: "VALIDATION_ERROR",
      });
      return;
    }

    if (month && (month < 1 || month > 12)) {
      res.status(400).json({
        success: false,
        message: "Bulan harus antara 1 dan 12",
        error: "VALIDATION_ERROR",
      });
      return;
    }

    const result = await EmployeeService.getMonthlyAttendanceCount(year, month);
    res.status(200).json(result);
  } catch (error) {
    console.error("[Controller] Error mengambil statistik:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Error tidak diketahui",
    });
  }
};

export const createEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, department } = req.body;

    if (!name || !email || !department) {
      res.status(400).json({
        success: false,
        message: "Field wajib: name, email, dan department harus diisi",
        error: "VALIDATION_ERROR",
      });
      return;
    }

    const result = await EmployeeService.createEmployee(
      name,
      email,
      department,
    );

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("[Controller] Error membuat karyawan:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Error tidak diketahui",
    });
  }
};

export default {
  getAllEmployees,
  getEmployeeById,
  getEmployeesWithoutAttendanceToday,
  getMonthlyAttendanceCount,
  createEmployee,
};
