-- ============================================================
-- ALMARWA TOUR & TRAVEL - SUPABASE / POSTGRESQL SCHEMA & SEED DATA
-- ============================================================
-- Petunjuk Penggunaan:
-- 1. Buka Dashboard Supabase Anda (https://supabase.com/dashboard)
-- 2. Pilih Proyek Anda -> Buka menu "SQL Editor" di sidebar kiri
-- 3. Klik "New query", paste seluruh isi script SQL ini, lalu klik "Run"
-- ============================================================

-- Aktifkan ekstensi UUID & pgcrypto jika diperlukan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function otomatis update timestamp `updated_at`
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- 1. TABEL: users (Pengguna, Jamaah, Admin, Owner)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  no_hp VARCHAR(50),
  role VARCHAR(20) NOT NULL DEFAULT 'jamaah' CHECK (role IN ('jamaah', 'admin', 'owner')),
  foto VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- ============================================================
-- 2. TABEL: paket_umroh
-- ============================================================
CREATE TABLE IF NOT EXISTS paket_umroh (
  id BIGSERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  harga NUMERIC(15, 2) NOT NULL,
  durasi VARCHAR(50) NOT NULL,
  hotel_mekkah VARCHAR(255) NOT NULL,
  hotel_madinah VARCHAR(255) NOT NULL,
  maskapai VARCHAR(255) NOT NULL,
  kota_keberangkatan VARCHAR(255) DEFAULT 'Jakarta',
  deskripsi TEXT,
  fasilitas TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  is_populer BOOLEAN DEFAULT FALSE,
  foto VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_paket_modtime BEFORE UPDATE ON paket_umroh FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- ============================================================
-- 3. TABEL: keberangkatan (Jadwal Keberangkatan)
-- ============================================================
CREATE TABLE IF NOT EXISTS keberangkatan (
  id BIGSERIAL PRIMARY KEY,
  paket_id BIGINT NOT NULL REFERENCES paket_umroh(id) ON DELETE CASCADE,
  tanggal_berangkat DATE NOT NULL,
  tanggal_pulang DATE NOT NULL,
  kuota INT NOT NULL DEFAULT 45,
  terisi INT NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Pendaftaran Dibuka',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_keberangkatan_modtime BEFORE UPDATE ON keberangkatan FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- ============================================================
-- 4. TABEL: pendaftaran (Pendaftaran Umroh Jamaah)
-- ============================================================
CREATE TABLE IF NOT EXISTS pendaftaran (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paket_id BIGINT NOT NULL REFERENCES paket_umroh(id) ON DELETE RESTRICT,
  keberangkatan_id BIGINT NOT NULL REFERENCES keberangkatan(id) ON DELETE RESTRICT,
  nama_paspor VARCHAR(255) NOT NULL,
  nik VARCHAR(20) NOT NULL,
  no_kk VARCHAR(20),
  no_paspor VARCHAR(50),
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  jenis_kelamin VARCHAR(20) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  alamat TEXT,
  provinsi VARCHAR(100),
  kota VARCHAR(100),
  kecamatan VARCHAR(100),
  kelurahan VARCHAR(100),
  status_nikah VARCHAR(50),
  pekerjaan VARCHAR(100),
  nama_darurat VARCHAR(255),
  hub_darurat VARCHAR(50),
  hp_darurat VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Menunggu Verifikasi',
  jumlah_jamaah INT DEFAULT 1,
  catatan_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_pendaftaran_modtime BEFORE UPDATE ON pendaftaran FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- ============================================================
-- 5. TABEL: dokumen_jamaah
-- ============================================================
CREATE TABLE IF NOT EXISTS dokumen_jamaah (
  id BIGSERIAL PRIMARY KEY,
  pendaftaran_id BIGINT NOT NULL REFERENCES pendaftaran(id) ON DELETE CASCADE,
  jenis VARCHAR(50) NOT NULL CHECK (jenis IN ('KTP', 'KK', 'Paspor', 'Foto', 'Buku Nikah', 'Vaksin')),
  file_path TEXT,
  status VARCHAR(50) DEFAULT 'Belum Diperiksa',
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_dokumen_modtime BEFORE UPDATE ON dokumen_jamaah FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- ============================================================
-- 6. TABEL: pembayaran
-- ============================================================
CREATE TABLE IF NOT EXISTS pembayaran (
  id BIGSERIAL PRIMARY KEY,
  pendaftaran_id BIGINT NOT NULL REFERENCES pendaftaran(id) ON DELETE CASCADE,
  jenis VARCHAR(50) NOT NULL CHECK (jenis IN ('DP', 'Cicilan', 'Pelunasan')),
  jumlah NUMERIC(15, 2) NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  bukti TEXT,
  status VARCHAR(50) DEFAULT 'Menunggu Verifikasi',
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_pembayaran_modtime BEFORE UPDATE ON pembayaran FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- ============================================================
-- 7. TABEL: fasilitas
-- ============================================================
CREATE TABLE IF NOT EXISTS fasilitas (
  id BIGSERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. TABEL: galeri
-- ============================================================
CREATE TABLE IF NOT EXISTS galeri (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  tipe VARCHAR(20) DEFAULT 'foto' CHECK (tipe IN ('foto', 'video')),
  url TEXT,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. TABEL: testimoni
-- ============================================================
CREATE TABLE IF NOT EXISTS testimoni (
  id BIGSERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  asal VARCHAR(255),
  isi TEXT NOT NULL,
  rating INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  paket VARCHAR(255),
  tahun VARCHAR(10),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. TABEL: faq
-- ============================================================
CREATE TABLE IF NOT EXISTS faq (
  id BIGSERIAL PRIMARY KEY,
  pertanyaan TEXT NOT NULL,
  jawaban TEXT NOT NULL,
  urutan INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. TABEL: notifikasi
-- ============================================================
CREATE TABLE IF NOT EXISTS notifikasi (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  judul VARCHAR(255) NOT NULL,
  pesan TEXT NOT NULL,
  tipe VARCHAR(50) DEFAULT 'info',
  dibaca BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. TABEL: activity_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  user_nama VARCHAR(255),
  aksi VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  target VARCHAR(255),
  target_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. TABEL: kontak
-- ============================================================
CREATE TABLE IF NOT EXISTS kontak (
  id BIGSERIAL PRIMARY KEY,
  alamat TEXT,
  telepon VARCHAR(50),
  whatsapp VARCHAR(50),
  email VARCHAR(255),
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  jam_operasional VARCHAR(255),
  maps_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. TABEL: promo
-- ============================================================
CREATE TABLE IF NOT EXISTS promo (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  potongan NUMERIC(15, 2) NOT NULL,
  kode VARCHAR(50) UNIQUE NOT NULL,
  berlaku_sampai DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. TABEL: site_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id BIGSERIAL PRIMARY KEY,
  nama_travel VARCHAR(255) DEFAULT 'Almarwa Tour & Travel',
  tagline VARCHAR(500) DEFAULT 'Umroh & Haji Plus - Melayani Sepenuh Hati',
  deskripsi TEXT,
  logo VARCHAR(500) DEFAULT '/logo.png',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEX UNTUK PERFORMA QUERY CEPAT
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_pendaftaran_user ON pendaftaran(user_id);
CREATE INDEX IF NOT EXISTS idx_pendaftaran_status ON pendaftaran(status);
CREATE INDEX IF NOT EXISTS idx_dokumen_pendaftaran ON dokumen_jamaah(pendaftaran_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_pendaftaran ON pembayaran(pendaftaran_id);
CREATE INDEX IF NOT EXISTS idx_notifikasi_user ON notifikasi(user_id);

-- ============================================================
-- SEED DATA AWAL (DEMO ACCOUNTS & CONTENT)
-- ============================================================

-- 1. Demo Users (Password hash bcrypt untuk: admin123, owner123, jamaah123)
INSERT INTO users (nama, email, password, no_hp, role) VALUES
('Administrator', 'admin@almarwa.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567890', 'admin'),
('Owner Almarwa', 'owner@almarwa.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567891', 'owner'),
('Ahmad Fauzi', 'jamaah@almarwa.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567892', 'jamaah')
ON CONFLICT (email) DO NOTHING;

-- 2. Paket Umroh
INSERT INTO paket_umroh (nama, harga, durasi, hotel_mekkah, hotel_madinah, maskapai, kota_keberangkatan, deskripsi, fasilitas, is_populer) VALUES
('Paket Ekonomi', 25000000, '9 Hari', 'Al Kiswah Tower ★★★', 'Al Eiman Royal ★★★', 'Saudi Airlines', 'Jakarta', 'Paket umroh ekonomis dengan pelayanan terbaik.', 'Tiket Pesawat PP,Hotel ★★★,Makan 3x sehari,Visa Umroh,Transportasi AC,Muthawif,Air Zamzam 5L', FALSE),
('Paket Regular', 32000000, '9 Hari', 'Pullman ZamZam ★★★★', 'Millennium Al Aqeeq ★★★★', 'Garuda Indonesia', 'Jakarta', 'Paket umroh regular dekat Masjidil Haram.', 'Tiket Pesawat PP,Hotel ★★★★,Makan 3x sehari,Visa Umroh,Transportasi Full AC,Muthawif,Air Zamzam 10L,City Tour', TRUE),
('Paket VIP', 45000000, '12 Hari', 'Swissotel Makkah ★★★★★', 'The Oberoi Madina ★★★★★', 'Garuda Indonesia', 'Jakarta', 'Paket umroh VIP eksklusif hotel bintang 5 terbaik.', 'Tiket Pesawat PP Business,Hotel ★★★★★,Makan Menu VIP,Visa Umroh,Transportasi VIP,Muthawif Pribadi,Air Zamzam 20L', FALSE),
('Paket Ramadhan', 38000000, '14 Hari', 'Hilton Suites Makkah ★★★★★', 'Pullman Madinah ★★★★', 'Saudi Airlines', 'Jakarta', 'Paket umroh spesial Ramadhan di Tanah Suci.', 'Tiket Pesawat PP,Hotel ★★★★★,Makan 3x + Sahur Buka,Visa Umroh,Transportasi AC,Air Zamzam 10L', FALSE)
ON CONFLICT DO NOTHING;

-- 3. Keberangkatan
INSERT INTO keberangkatan (paket_id, tanggal_berangkat, tanggal_pulang, kuota, terisi, status) VALUES
(1, '2026-09-15', '2026-09-23', 45, 38, 'Hampir Penuh'),
(2, '2026-09-20', '2026-09-28', 45, 30, 'Pendaftaran Dibuka'),
(3, '2026-10-05', '2026-10-16', 30, 12, 'Pendaftaran Dibuka'),
(2, '2026-10-15', '2026-10-23', 45, 20, 'Pendaftaran Dibuka')
ON CONFLICT DO NOTHING;

-- 4. Site Settings & Kontak
INSERT INTO site_settings (nama_travel, tagline, deskripsi) VALUES
('Almarwa Tour & Travel', 'Umroh & Haji Plus - Melayani Sepenuh Hati', 'Biro perjalanan umroh dan haji plus terpercaya.')
ON CONFLICT DO NOTHING;

INSERT INTO kontak (alamat, telepon, whatsapp, email, instagram, jam_operasional) VALUES
('Jl. Raya Jakarta No. 123, Jakarta Selatan', '021-5551234', '081234567890', 'info@almarwa.com', '@almarwatour', 'Senin - Sabtu: 08:00 - 17:00 WIB')
ON CONFLICT DO NOTHING;

-- ============================================================
-- DISABLE ROW LEVEL SECURITY (RLS) AGAR NODE.JS BE BISA INSERT/UPDATE
-- ============================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE paket_umroh DISABLE ROW LEVEL SECURITY;
ALTER TABLE keberangkatan DISABLE ROW LEVEL SECURITY;
ALTER TABLE pendaftaran DISABLE ROW LEVEL SECURITY;
ALTER TABLE dokumen_jamaah DISABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran DISABLE ROW LEVEL SECURITY;
ALTER TABLE fasilitas DISABLE ROW LEVEL SECURITY;
ALTER TABLE galeri DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimoni DISABLE ROW LEVEL SECURITY;
ALTER TABLE faq DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE kontak DISABLE ROW LEVEL SECURITY;
ALTER TABLE promo DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

