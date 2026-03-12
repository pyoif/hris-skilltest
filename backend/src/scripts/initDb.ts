/**
 * Script inisialisasi database
 */

import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
};

const dbName = process.env.DB_DATABASE || "hris_attendance";

const createDatabaseIfNotExists = async (): Promise<void> => {
  const pool = new Pool({
    ...dbConfig,
    database: "postgres",
  });

  try {
    const result = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );

    if (result.rows.length === 0) {
      console.log(`[Init] Membuat database: ${dbName}`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`[Init] Database berhasil dibuat`);
    } else {
      console.log(`[Init] Database sudah ada: ${dbName}`);
    }
  } catch (error) {
    console.error("[Init] Error membuat database:", error);
    throw error;
  } finally {
    await pool.end();
  }
};

const initializeSchema = async (): Promise<void> => {
  const pool = new Pool({
    ...dbConfig,
    database: dbName,
  });

  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    console.log("[Init] Menjalankan schema...");
    await pool.query(schemaSQL);
    console.log("[Init] Schema berhasil diinisialisasi");
  } catch (error) {
    console.error("[Init] Error inisialisasi schema:", error);
    throw error;
  } finally {
    await pool.end();
  }
};

const main = async (): Promise<void> => {
  console.log("[Init] Memulai inisialisasi database...");
  console.log(`[Init] Database: ${dbName}`);
  console.log(`[Init] Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log("");

  try {
    await createDatabaseIfNotExists();
    await initializeSchema();

    console.log("");
    console.log("[Init] Inisialisasi database selesai!");
    console.log("[Init] Jalankan aplikasi dengan: npm run dev");
  } catch (error) {
    console.error("");
    console.error("[Init] Inisialisasi database gagal!");
    console.error("[Init] Periksa koneksi database dan coba lagi.");
    process.exit(1);
  }
};

main();
