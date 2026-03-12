/**
 * Konfigurasi Database
 * Menggunakan connection pooling
 */

import { Pool, PoolClient, QueryResult } from "pg";
import dotenv from "dotenv";

dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  min: number;
  max: number;
  idleTimeoutMillis: number;
}

const getDatabaseConfig = (): DatabaseConfig => ({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "hris_attendance",
  min: parseInt(process.env.DB_POOL_MIN || "2", 10),
  max: parseInt(process.env.DB_POOL_MAX || "10", 10),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || "30000", 10),
});

const pool = new Pool(getDatabaseConfig());

pool.on("connect", () => {
  console.log("[DB] Klien baru terhubung ke pool");
});

pool.on("remove", () => {
  console.log("[DB] Klien dilepas dari pool");
});

pool.on("error", (err) => {
  console.error("[DB] Error pada klien idle:", err);
});

/**
 * Jalankan query menggunakan koneksi dari pool
 */
export const query = async <T = any>(
  text: string,
  params: any[] = [],
): Promise<QueryResult<T>> => {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  console.log(`[DB] Query dieksekusi dalam ${duration}ms`);

  return result;
};

/**
 * Ambil koneksi dari pool untuk transaksi
 */
export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

/**
 * Wrapper untuk transaksi database
 * Otomatis handle BEGIN, COMMIT, dan ROLLBACK
 */
export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await getClient();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[DB] Transaksi di-rollback:", error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Tutup semua koneksi di pool
 */
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log("[DB] Pool koneksi ditutup");
};

/**
 * Test koneksi database
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query("SELECT NOW()");
    console.log("[DB] Koneksi berhasil");
    return true;
  } catch (error) {
    console.error("[DB] Koneksi gagal:", error);
    return false;
  }
};

export default {
  query,
  getClient,
  transaction,
  closePool,
  testConnection,
  pool,
};
