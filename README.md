Sistem pencatatan absensi karyawan berbasis web. Proyek ini terdiri dari dua bagian: backend REST API menggunakan Express.js dengan PostgreSQL, dan frontend menggunakan React + Vite.

Proyek ini ditujukan untuk response Technical test pada PT Akses Mandiri pada 11 Maret 2026 berupa take home test, dan bukan untuk tujuan production.

## Struktur Proyek

Proyek ini menggunakan struktur clean architecture yang biasa saya gunakan pada proyek proyek freelance

```
hris-technical-test/
├── backend/
│   └── src/
│       ├── config/         # Konfigurasi koneksi database
│       ├── controllers/    # Request handlers
│       ├── routes/         # Definisi route
│       ├── services/       # Business logic
│       ├── repositories/   # Operasi database (raw SQL)
│       ├── models/         # Type definitions
│       ├── utils/          # Fungsi utilitas
│       └── scripts/        # Inisialisasi database
└── frontend/
    └── src/
        ├── components/     # UI components (termasuk shadcn/ui)
        ├── hooks/          # Custom hooks
        ├── services/       # API client (native fetch)
        ├── types/          # TypeScript types
        └── utils/          # Fungsi utilitas
```

## Tech Stack

**Backend**

- Express.js sebagai web framework
- PostgreSQL sebagai database
- node-postgres (pg) untuk connection pooling dan transaction wrapper
- TypeScript

**Frontend**

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- react-day-picker + date-fns

## Cara Menjalankan

### Kebutuhan

- Node.js 18
- PostgreSQL 14
- npm, yarn, atau bun

### 1. Buat Database

```bash
createdb hris_attendance
```

Atau lewat psql:

```bash
psql -U postgres -c "CREATE DATABASE hris_attendance;"
```

### 2. Jalankan Backend

```bash
cd backend

# Install dependencies
npm install

# Salin file .env dan sesuaikan dengan konfigurasi lokal
cp .env.example .env

# Inisialisasi schema dan data awal
npm run init-db

# Jalankan development server
npm run dev
```

Backend berjalan di `http://localhost:3001`.

Variabel yang perlu disesuaikan di `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=hris_attendance
```

### 3. Jalankan Frontend

```bash
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend berjalan di `http://localhost:3000`.

## API Endpoints

### Absensi

| Method | Endpoint                 | Keterangan                            |
| ------ | ------------------------ | ------------------------------------- |
| POST   | `/api/attendance`        | Catat absensi (type: IN atau OUT)     |
| GET    | `/api/attendance/report` | Laporan absensi dengan filter tanggal |
| GET    | `/api/attendance/recent` | Data absensi terbaru                  |

### Karyawan

| Method | Endpoint                                  | Keterangan                                 |
| ------ | ----------------------------------------- | ------------------------------------------ |
| GET    | `/api/employees`                          | Daftar semua karyawan                      |
| GET    | `/api/employees/without-attendance-today` | Karyawan yang belum absen hari ini         |
| GET    | `/api/employees/monthly-attendance`       | Total kehadiran per karyawan dalam sebulan |

## Skema Database

```sql
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Mencegah duplikasi: satu karyawan hanya boleh IN sekali dan OUT sekali per hari
    CONSTRAINT unique_attendance_per_day
        EXCLUDE USING GIST (
            employee_id WITH =,
            type WITH =,
            DATE(timestamp) WITH =
        )
);
```

Skema juga menggunakan ekstensi `btree_gist` untuk mendukung constraint EXCLUDE di atas.

## Logika Status Kehadiran

Setiap record absensi yang sudah memiliki IN dan OUT akan dievaluasi dengan aturan berikut:

- Jam normal masuk adalah 09:00
- Jika clock-in lebih dari 09:15, statusnya "Terlambat"
- Jika clock-out tidak tercatat, statusnya "Tidak Lengkap"
- Selain itu, statusnya "Tepat Waktu"

Kode dapat dibaca di folder utils frontend

## license

Seluruh kode, struktur, dan implementasi dalam proyek ini dibuat oleh Arif Alamsyah (pyoif) secara mandiri sebagai respon terhadap technical test yang diberikan oleh PT Akses Mandiri, diselesaikan pada tanggal 12 Maret 2026.

Proyek ini bersifat tertutup dan tidak dimaksudkan untuk distribusi, publikasi, maupun penggunaan ulang dalam bentuk apapun. Hak penggunaan hanya dimiliki oleh pembuat (Arif Alamsyah) dan pihak penilai dari PT Akses Mandiri dalam konteks proses rekrutmen yang bersangkutan.

Dilarang keras untuk menyalin, memodifikasi, mendistribusikan, mempublikasikan, atau menggunakan sebagian maupun seluruh bagian dari kode ini untuk tujuan apapun di luar konteks di atas, tanpa izin tertulis dari pembuat.

Copyright (c) 2026 Arif Alamsyah (pyoif). All rights reserved.
