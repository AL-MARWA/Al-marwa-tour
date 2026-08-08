-- ============================================================
-- ALMARWA TOUR TRAVEL - MySQL Database Schema
-- ============================================================
-- Gunakan file ini untuk membuat database MySQL di production.
-- Jalankan di phpMyAdmin atau MySQL CLI:
--   mysql -u root -p < schema_mysql.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS almarwa_tour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE almarwa_tour;

-- ============================================================
-- TABEL: users
-- ============================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  no_hp VARCHAR(20),
  role ENUM('admin', 'owner', 'jamaah') NOT NULL DEFAULT 'jamaah',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: paket_umroh
-- ============================================================
CREATE TABLE paket_umroh (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  harga BIGINT NOT NULL,
  durasi VARCHAR(50),
  hotel_mekkah VARCHAR(255),
  hotel_madinah VARCHAR(255),
  maskapai VARCHAR(255),
  kota_keberangkatan VARCHAR(100),
  deskripsi TEXT,
  fasilitas TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  is_populer BOOLEAN DEFAULT FALSE,
  foto VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_paket_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: keberangkatan
-- ============================================================
CREATE TABLE keberangkatan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paket_id INT NOT NULL,
  tanggal_berangkat DATE NOT NULL,
  tanggal_pulang DATE NOT NULL,
  kuota INT NOT NULL DEFAULT 45,
  terisi INT NOT NULL DEFAULT 0,
  status ENUM('Pendaftaran Dibuka', 'Hampir Penuh', 'Penuh', 'Persiapan Keberangkatan', 'Berangkat', 'Selesai') DEFAULT 'Pendaftaran Dibuka',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (paket_id) REFERENCES paket_umroh(id) ON DELETE CASCADE,
  INDEX idx_keberangkatan_paket (paket_id),
  INDEX idx_keberangkatan_status (status),
  INDEX idx_keberangkatan_tanggal (tanggal_berangkat)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: pendaftaran
-- ============================================================
CREATE TABLE pendaftaran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  paket_id INT NOT NULL,
  keberangkatan_id INT NOT NULL,
  -- Data Pribadi
  nama_paspor VARCHAR(255) NOT NULL,
  nik VARCHAR(16),
  no_kk VARCHAR(16),
  no_paspor VARCHAR(20),
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  jenis_kelamin ENUM('Laki-laki', 'Perempuan'),
  alamat TEXT,
  provinsi VARCHAR(100),
  kota VARCHAR(100),
  kecamatan VARCHAR(100),
  kelurahan VARCHAR(100),
  status_nikah ENUM('Belum Menikah', 'Menikah', 'Cerai'),
  pekerjaan VARCHAR(100),
  -- Data Darurat
  nama_darurat VARCHAR(255),
  hub_darurat VARCHAR(100),
  hp_darurat VARCHAR(20),
  -- Status & Catatan
  status ENUM('Menunggu Verifikasi', 'Data Diverifikasi', 'Data Perlu Diperbaiki', 'Terdaftar', 'Siap Berangkat', 'Selesai') DEFAULT 'Menunggu Verifikasi',
  jumlah_jamaah INT DEFAULT 1,
  catatan_admin TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (paket_id) REFERENCES paket_umroh(id) ON DELETE CASCADE,
  FOREIGN KEY (keberangkatan_id) REFERENCES keberangkatan(id) ON DELETE CASCADE,
  INDEX idx_pendaftaran_user (user_id),
  INDEX idx_pendaftaran_paket (paket_id),
  INDEX idx_pendaftaran_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: dokumen_jamaah
-- ============================================================
CREATE TABLE dokumen_jamaah (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pendaftaran_id INT NOT NULL,
  jenis ENUM('KTP', 'KK', 'Paspor', 'Foto', 'Lainnya') NOT NULL,
  file_path VARCHAR(500),
  status ENUM('Belum Diperiksa', 'Valid', 'Tidak Valid', 'Perlu Diperbaiki') DEFAULT 'Belum Diperiksa',
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pendaftaran_id) REFERENCES pendaftaran(id) ON DELETE CASCADE,
  INDEX idx_dokumen_pendaftaran (pendaftaran_id),
  INDEX idx_dokumen_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: pembayaran
-- ============================================================
CREATE TABLE pembayaran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pendaftaran_id INT NOT NULL,
  jenis ENUM('DP', 'Cicilan', 'Pelunasan') NOT NULL,
  jumlah BIGINT NOT NULL,
  tanggal DATE NOT NULL,
  bukti VARCHAR(500),
  status ENUM('Menunggu Verifikasi', 'Terverifikasi', 'Ditolak') DEFAULT 'Menunggu Verifikasi',
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pendaftaran_id) REFERENCES pendaftaran(id) ON DELETE CASCADE,
  INDEX idx_pembayaran_pendaftaran (pendaftaran_id),
  INDEX idx_pembayaran_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: fasilitas
-- ============================================================
CREATE TABLE fasilitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: galeri
-- ============================================================
CREATE TABLE galeri (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  tipe ENUM('foto', 'video') DEFAULT 'foto',
  url VARCHAR(500),
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: testimoni
-- ============================================================
CREATE TABLE testimoni (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  asal VARCHAR(100),
  foto VARCHAR(500),
  isi TEXT NOT NULL,
  rating INT DEFAULT 5,
  paket VARCHAR(255),
  tahun VARCHAR(4),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_testimoni_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: faq
-- ============================================================
CREATE TABLE faq (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pertanyaan TEXT NOT NULL,
  jawaban TEXT NOT NULL,
  urutan INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: notifikasi
-- ============================================================
CREATE TABLE notifikasi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  judul VARCHAR(255) NOT NULL,
  pesan TEXT NOT NULL,
  tipe ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  dibaca BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifikasi_user (user_id),
  INDEX idx_notifikasi_dibaca (dibaca)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: activity_logs
-- ============================================================
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_nama VARCHAR(255),
  aksi VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  target VARCHAR(100),
  target_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_activity_user (user_id),
  INDEX idx_activity_created (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: kontak
-- ============================================================
CREATE TABLE kontak (
  id INT AUTO_INCREMENT PRIMARY KEY,
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  alamat TEXT,
  google_maps VARCHAR(500),
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  tiktok VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: promo
-- ============================================================
CREATE TABLE promo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  potongan BIGINT DEFAULT 0,
  kode VARCHAR(50),
  berlaku_sampai DATE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_promo_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- TABEL: site_settings
-- ============================================================
CREATE TABLE site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_travel VARCHAR(255),
  tagline VARCHAR(500),
  deskripsi TEXT,
  logo VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA (Demo Accounts)
-- ============================================================
-- Password: admin123 / owner123 / jamaah123
-- BCrypt hash for 'admin123': $2a$10$... (generate via bcryptjs)

INSERT INTO users (nama, email, password, no_hp, role) VALUES
('Administrator', 'admin@almarwa.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567890', 'admin'),
('Owner Almarwa', 'owner@almarwa.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567891', 'owner'),
('Ahmad Fauzi', 'jamaah@almarwa.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567892', 'jamaah');

-- NOTE: The bcrypt hashes above are placeholders.
-- For production, re-hash passwords using bcryptjs or a similar library.
-- The JSON-based database (server/db.js) handles this automatically for development.

INSERT INTO site_settings (nama_travel, tagline, deskripsi) VALUES
('Almarwa Tour & Travel', 'Umroh & Haji Plus - Melayani Sepenuh Hati', 'Almarwa Tour & Travel adalah biro perjalanan umroh dan haji plus yang berpengalaman dan terpercaya.');
