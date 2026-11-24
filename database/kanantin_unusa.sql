-- =====================================================================
-- SKEMA DATABASE MYSQL / PHPMYADMIN: KANANTIN UNUSA
-- Siap di-import ke phpMyAdmin (XAMPP) saat tahap integrasi backend PHP
-- =====================================================================

CREATE DATABASE IF NOT EXISTS kanantin_unusa
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kanantin_unusa;

-- 1. Tabel Pengguna (Pembeli, Penjual Kantin, Admin)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role ENUM('pembeli', 'penjual', 'admin') NOT NULL DEFAULT 'pembeli',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Tenant Kantin (Kampus A: 9, Kampus B: 5, Kampus C: 3)
CREATE TABLE tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  campus ENUM('Kampus A', 'Kampus B', 'Kampus C') NOT NULL,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  owner_name VARCHAR(120) NOT NULL,
  owner_user_id INT NULL,
  operating_hours VARCHAR(100) DEFAULT 'Senin-Jumat, 07.00-16.00 WIB',
  description TEXT,
  status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tenant_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Tabel Menu Tenant
CREATE TABLE menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  category ENUM('Makanan', 'Minuman', 'Jajan') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url VARCHAR(255) NULL,
  status ENUM('Aktif', 'Menunggu Verifikasi', 'Tidak Aktif') DEFAULT 'Menunggu Verifikasi',
  is_verified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_menu_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 4. Tabel Ulasan Menu (Gaya Google Maps & Detail Atribut Shopee)
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  menu_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  rasa_makanan ENUM('Kurang enak', 'Cukup', 'Enak') NOT NULL,
  penyajian_makanan ENUM('Kurang rapi', 'Cukup', 'Rapi') NOT NULL,
  kebersihan_makanan ENUM('Kurang bersih', 'Cukup', 'Bersih') NOT NULL,
  porsi_makanan ENUM('Kurang', 'Pas', 'Banyak') NOT NULL,
  kesesuaian_harga ENUM('Kurang sesuai', 'Cukup', 'Sesuai') NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rev_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_menu FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Tabel Survei Kepuasan Tenant (Untuk Monev Admin)
CREATE TABLE surveys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT NOT NULL,
  skor_penyajian TINYINT NOT NULL CHECK (skor_penyajian BETWEEN 1 AND 5),
  skor_layanan TINYINT NOT NULL CHECK (skor_layanan BETWEEN 1 AND 5),
  skor_kebersihan TINYINT NOT NULL CHECK (skor_kebersihan BETWEEN 1 AND 5),
  skor_kecepatan TINYINT NOT NULL CHECK (skor_kecepatan BETWEEN 1 AND 5),
  saran TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_srv_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_srv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contoh Data Awal
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('irsyad.prasista', 'irsyad.prasista@student.unusa.ac.id', '$2y$10$examplehash1', 'IRSYAD PRASISTA R.', 'pembeli'),
('warungbusiti', 'siti.aminah@kantin.unusa.ac.id', '$2y$10$examplehash2', 'Siti Aminah', 'penjual'),
('adminkantin', 'admin@unusa.ac.id', '$2y$10$examplehash3', 'Admin Kantin UNUSA', 'admin');
