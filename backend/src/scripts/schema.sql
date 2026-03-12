CREATE EXTENSION btree_gist;
-- HRIS Attendance Database Schema
-- Schema untuk aplikasi absensi karyawan

-- ============================================
-- Tabel: employees
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabel: attendance
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_attendance_employee 
        FOREIGN KEY (employee_id) 
        REFERENCES employees(id) 
        ON DELETE CASCADE,
    
    -- Constraint: Hanya 1 IN dan 1 OUT per karyawan per hari
    CONSTRAINT unique_attendance_per_day 
        EXCLUDE USING GIST (
            employee_id WITH =,
            type WITH =,
            DATE(timestamp) WITH =
        )
);

-- ============================================
-- Index untuk optimasi query
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(DATE(timestamp));
CREATE INDEX IF NOT EXISTS idx_attendance_type ON attendance(type);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date_type 
    ON attendance(employee_id, DATE(timestamp), type);

-- ============================================
-- Sample Data
-- ============================================
INSERT INTO employees (name, email, department) VALUES
    ('Budi Santoso', 'budi.santoso@company.com', 'Engineering'),
    ('Siti Rahayu', 'siti.rahayu@company.com', 'Marketing'),
    ('Ahmad Wijaya', 'ahmad.wijaya@company.com', 'Finance'),
    ('Dewi Lestari', 'dewi.lestari@company.com', 'HR'),
    ('Eko Prasetyo', 'eko.prasetyo@company.com', 'Engineering')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Query untuk referensi
-- ============================================

-- Query 1: Karyawan yang belum absen hari ini
-- SELECT e.id, e.name, e.email, e.department
-- FROM employees e
-- LEFT JOIN attendance a ON e.id = a.employee_id 
--     AND DATE(a.timestamp) = CURRENT_DATE
--     AND a.type = 'IN'
-- WHERE a.id IS NULL
-- ORDER BY e.id;

-- Query 2: Total hadir per karyawan dalam sebulan
-- SELECT 
--     e.id as employee_id,
--     e.name as employee_name,
--     COUNT(DISTINCT DATE(a.timestamp)) as total_days
-- FROM employees e
-- LEFT JOIN attendance a ON e.id = a.employee_id 
--     AND EXTRACT(YEAR FROM a.timestamp) = 2024
--     AND EXTRACT(MONTH FROM a.timestamp) = 1
--     AND a.type = 'IN'
-- GROUP BY e.id, e.name
-- ORDER BY e.id;

-- ============================================
-- Trigger untuk update timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
