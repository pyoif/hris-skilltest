/**
 * HRIS Backend - Main Application
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import attendanceRoutes from './routes/attendanceRoutes';
import employeeRoutes from './routes/employeeRoutes';
import { testConnection, closePool } from './config/database';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'HRIS Backend berjalan',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/employees', employeeRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
    error: 'NOT_FOUND',
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal error',
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n[Server] Mematikan server...');
  try {
    await closePool();
    console.log('[Server] Koneksi database ditutup');
    process.exit(0);
  } catch (error) {
    console.error('[Server] Error saat shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    console.log('[Server] Menguji koneksi database...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('[Server] Gagal koneksi ke database');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`[Server] HRIS Backend berjalan di port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/health`);
      console.log(`[Server] API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('[Server] Gagal menjalankan server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
