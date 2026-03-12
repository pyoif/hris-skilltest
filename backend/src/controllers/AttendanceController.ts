/**
 * Controller untuk endpoint absensi
 */

import { Request, Response } from "express";
import { AttendanceType } from "../models";
import * as AttendanceService from "../services/AttendanceService";

export const createAttendance = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { employee_id, type } = req.body;

    if (!employee_id || !type) {
      res.status(400).json({
        success: false,
        message: "Field wajib: employee_id dan type harus diisi",
        error: "VALIDATION_ERROR",
      });
      return;
    }

    const employeeId = parseInt(employee_id, 10);
    if (isNaN(employeeId)) {
      res.status(400).json({
        success: false,
        message: "employee_id harus berupa angka yang valid",
        error: "VALIDATION_ERROR",
      });
      return;
    }

    const upperType = type.toUpperCase();
    if (upperType !== "IN" && upperType !== "OUT") {
      res.status(400).json({
        success: false,
        message: "type harus IN atau OUT",
        error: "VALIDATION_ERROR",
      });
      return;
    }

    const result = await AttendanceService.createAttendance(
      employeeId,
      upperType as AttendanceType,
    );

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("[Controller] Error membuat absensi:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Error tidak diketahui",
    });
  }
};

export const getAttendanceReport = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (
      startDate &&
      typeof startDate === "string" &&
      !dateRegex.test(startDate)
    ) {
      res.status(400).json({
        success: false,
        message: "Format startDate harus YYYY-MM-DD",
        error: "VALIDATION_ERROR",
      });
      return;
    }

    if (endDate && typeof endDate === "string" && !dateRegex.test(endDate)) {
      res.status(400).json({
        success: false,
        message: "Format endDate harus YYYY-MM-DD",
        error: "VALIDATION_ERROR",
      });
      return;
    }

    const result = await AttendanceService.getAttendanceReport(
      startDate as string | undefined,
      endDate as string | undefined,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("[Controller] Error mengambil laporan:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Error tidak diketahui",
    });
  }
};

export const getRecentAttendance = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const result = await AttendanceService.getRecentAttendance(limit);

    res.status(200).json(result);
  } catch (error) {
    console.error("[Controller] Error mengambil data terbaru:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Error tidak diketahui",
    });
  }
};

export const getTodayAttendance = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);

    if (isNaN(employeeId)) {
      res.status(400).json({
        success: false,
        message: "ID karyawan tidak valid",
        error: "VALIDATION_ERROR",
      });
      return;
    }

    const result = await AttendanceService.getTodayAttendance(employeeId);

    res.status(200).json(result);
  } catch (error) {
    console.error("[Controller] Error mengambil absensi hari ini:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error instanceof Error ? error.message : "Error tidak diketahui",
    });
  }
};

export default {
  createAttendance,
  getAttendanceReport,
  getRecentAttendance,
  getTodayAttendance,
};
