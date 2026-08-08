/* ============================================================
   ALMARWA TOUR TRAVEL - DATABASE (SQLite + Seed Data)
   ============================================================ */
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

import supabaseAdapter from './db_supabase.js';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = join(__dirname, 'uploads');
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

// Use better-sqlite3 if available, otherwise fallback to sql.js
let db;
let dbType = 'memory'; // 'better-sqlite3' or 'memory' (sql.js-like)

// Simple in-memory database implementation
class InMemoryDB {
  constructor() {
    this.tables = {};
    this.autoIncrements = {};
  }
}

// We'll use a simple JSON-based file store for persistence
const DB_FILE = join(__dirname, 'almarwa_data.json');

class SimpleDB {
  constructor() {
    this.data = {
      users: [],
      paket_umroh: [],
      keberangkatan: [],
      pendaftaran: [],
      dokumen_jamaah: [],
      pembayaran: [],
      fasilitas: [],
      galeri: [],
      testimoni: [],
      faq: [],
      notifikasi: [],
      activity_logs: [],
      kontak: [],
      promo: [],
      site_settings: []
    };
    this.autoInc = {};
    this.load();
  }

  load() {
    try {
      if (existsSync(DB_FILE)) {
        const raw = require('fs').readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed.data };
        this.autoInc = parsed.autoInc || {};
      } else {
        this.seed();
        this.save();
      }
    } catch (e) {
      console.log('Creating fresh database...');
      this.seed();
      this.save();
    }
  }

  save() {
    try {
      require('fs').writeFileSync(DB_FILE, JSON.stringify({ data: this.data, autoInc: this.autoInc }, null, 2));
    } catch (e) {
      console.error('Failed to save database:', e.message);
    }
  }

  getNextId(table) {
    if (!this.autoInc[table]) this.autoInc[table] = 0;
    this.autoInc[table]++;
    return this.autoInc[table];
  }

  // CRUD operations (supports both Supabase & Local JSON)
  async getAll(table) {
    if (supabaseAdapter.isAvailable()) {
      return await supabaseAdapter.getAll(table);
    }
    return this.data[table] || [];
  }

  async getById(table, id) {
    if (supabaseAdapter.isAvailable()) {
      return await supabaseAdapter.getById(table, id);
    }
    return (this.data[table] || []).find(r => r.id === parseInt(id)) || null;
  }

  async getWhere(table, conditions) {
    if (supabaseAdapter.isAvailable()) {
      return await supabaseAdapter.getWhere(table, conditions);
    }
    return (this.data[table] || []).filter(row => {
      return Object.entries(conditions).every(([key, val]) => row[key] === val);
    });
  }

  async insert(table, record) {
    if (supabaseAdapter.isAvailable()) {
      return await supabaseAdapter.insert(table, record);
    }
    if (!this.data[table]) this.data[table] = [];
    const id = this.getNextId(table);
    const newRecord = { id, ...record, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    this.data[table].push(newRecord);
    this.save();
    return newRecord;
  }

  async update(table, id, updates) {
    if (supabaseAdapter.isAvailable()) {
      return await supabaseAdapter.update(table, id, updates);
    }
    const idx = (this.data[table] || []).findIndex(r => r.id === parseInt(id));
    if (idx === -1) return null;
    this.data[table][idx] = { ...this.data[table][idx], ...updates, updated_at: new Date().toISOString() };
    this.save();
    return this.data[table][idx];
  }

  async delete(table, id) {
    if (supabaseAdapter.isAvailable()) {
      return await supabaseAdapter.delete(table, id);
    }
    const idx = (this.data[table] || []).findIndex(r => r.id === parseInt(id));
    if (idx === -1) return false;
    this.data[table].splice(idx, 1);
    this.save();
    return true;
  }

  // Seed demo data
  seed() {
    const bcrypt = require('bcryptjs');

    // ---- Users ----
    const salt = bcrypt.genSaltSync(10);
    this.data.users = [
      {
        id: 1, nama: 'Administrator', email: 'admin@almarwa.com',
        password: bcrypt.hashSync('admin123', salt),
        no_hp: '081234567890', role: 'admin',
        created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
      },
      {
        id: 2, nama: 'Owner Almarwa', email: 'owner@almarwa.com',
        password: bcrypt.hashSync('owner123', salt),
        no_hp: '081234567891', role: 'owner',
        created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
      },
      {
        id: 3, nama: 'Ahmad Fauzi', email: 'jamaah@almarwa.com',
        password: bcrypt.hashSync('jamaah123', salt),
        no_hp: '081234567892', role: 'jamaah',
        created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z'
      },
      {
        id: 4, nama: 'Siti Aisyah', email: 'aisyah@example.com',
        password: bcrypt.hashSync('jamaah123', salt),
        no_hp: '081234567893', role: 'jamaah',
        created_at: '2026-06-05T00:00:00Z', updated_at: '2026-06-05T00:00:00Z'
      },
      {
        id: 5, nama: 'Muhammad Rizki', email: 'rizki@example.com',
        password: bcrypt.hashSync('jamaah123', salt),
        no_hp: '081234567894', role: 'jamaah',
        created_at: '2026-06-10T00:00:00Z', updated_at: '2026-06-10T00:00:00Z'
      }
    ];
    this.autoInc.users = 5;

    // ---- Paket Umroh ----
    this.data.paket_umroh = [
      {
        id: 1, nama: 'Paket Ekonomi', harga: 25000000, durasi: '9 Hari',
        hotel_mekkah: 'Al Kiswah Tower ★★★', hotel_madinah: 'Al Eiman Royal ★★★',
        maskapai: 'Saudi Airlines', kota_keberangkatan: 'Jakarta',
        deskripsi: 'Paket umroh ekonomis dengan pelayanan terbaik. Cocok untuk jamaah yang ingin beribadah dengan budget terjangkau.',
        fasilitas: 'Tiket Pesawat PP,Hotel ★★★,Makan 3x sehari,Visa Umroh,Transportasi AC,Tour Leader,Muthawif,Manasik Umroh,Air Zamzam 5L,Bagasi 20kg',
        status: 'active', is_populer: false, foto: null,
        created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z'
      },
      {
        id: 2, nama: 'Paket Regular', harga: 32000000, durasi: '9 Hari',
        hotel_mekkah: 'Pullman ZamZam ★★★★', hotel_madinah: 'Millennium Al Aqeeq ★★★★',
        maskapai: 'Garuda Indonesia', kota_keberangkatan: 'Jakarta',
        deskripsi: 'Paket umroh regular dengan hotel bintang 4 dekat Masjidil Haram. Nyaman dan berkualitas.',
        fasilitas: 'Tiket Pesawat PP,Hotel ★★★★,Makan 3x sehari (Menu Indonesia),Visa Umroh,Transportasi Full AC,Tour Leader Berpengalaman,Muthawif,Manasik Umroh 2x,Air Zamzam 10L,City Tour,Bagasi 30kg,Handling Airport',
        status: 'active', is_populer: true, foto: null,
        created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z'
      },
      {
        id: 3, nama: 'Paket VIP', harga: 45000000, durasi: '12 Hari',
        hotel_mekkah: 'Swissotel Makkah ★★★★★', hotel_madinah: 'The Oberoi Madina ★★★★★',
        maskapai: 'Garuda Indonesia', kota_keberangkatan: 'Jakarta',
        deskripsi: 'Paket umroh VIP eksklusif dengan hotel bintang 5 terbaik, fasilitas premium, dan layanan personal.',
        fasilitas: 'Tiket Pesawat PP (Business Class),Hotel ★★★★★ (Dekat Haram),Makan 3x sehari (Menu VIP),Visa Umroh,Transportasi VIP,Tour Leader Senior,Muthawif Pribadi,Manasik Umroh 3x,Air Zamzam 20L,City Tour Premium,Oleh-oleh Eksklusif,Bagasi 40kg,Fast Track Airport,Laundry Service',
        status: 'active', is_populer: false, foto: null,
        created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z'
      },
      {
        id: 4, nama: 'Paket Ramadhan', harga: 38000000, durasi: '14 Hari',
        hotel_mekkah: 'Hilton Suites Makkah ★★★★★', hotel_madinah: 'Pullman Madinah ★★★★',
        maskapai: 'Saudi Airlines', kota_keberangkatan: 'Jakarta',
        deskripsi: 'Paket umroh spesial Ramadhan. Rasakan ibadah di Tanah Suci selama bulan suci Ramadhan.',
        fasilitas: 'Tiket Pesawat PP,Hotel ★★★★-★★★★★,Makan 3x + Sahur & Buka Puasa,Visa Umroh,Transportasi AC,Tour Leader,Muthawif,Manasik Umroh 2x,Air Zamzam 10L,Itikaf Guide,Bagasi 30kg',
        status: 'active', is_populer: false, foto: null,
        created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z'
      }
    ];
    this.autoInc.paket_umroh = 4;

    // ---- Keberangkatan ----
    this.data.keberangkatan = [
      {
        id: 1, paket_id: 1, tanggal_berangkat: '2026-09-15', tanggal_pulang: '2026-09-23',
        kuota: 45, terisi: 38, status: 'Hampir Penuh',
        created_at: '2026-01-20T00:00:00Z', updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 2, paket_id: 2, tanggal_berangkat: '2026-09-20', tanggal_pulang: '2026-09-28',
        kuota: 45, terisi: 30, status: 'Pendaftaran Dibuka',
        created_at: '2026-01-20T00:00:00Z', updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 3, paket_id: 3, tanggal_berangkat: '2026-10-05', tanggal_pulang: '2026-10-16',
        kuota: 30, terisi: 12, status: 'Pendaftaran Dibuka',
        created_at: '2026-01-20T00:00:00Z', updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 4, paket_id: 2, tanggal_berangkat: '2026-10-15', tanggal_pulang: '2026-10-23',
        kuota: 45, terisi: 20, status: 'Pendaftaran Dibuka',
        created_at: '2026-02-10T00:00:00Z', updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 5, paket_id: 4, tanggal_berangkat: '2027-03-10', tanggal_pulang: '2027-03-23',
        kuota: 40, terisi: 5, status: 'Pendaftaran Dibuka',
        created_at: '2026-03-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 6, paket_id: 1, tanggal_berangkat: '2026-08-10', tanggal_pulang: '2026-08-18',
        kuota: 45, terisi: 45, status: 'Berangkat',
        created_at: '2026-01-05T00:00:00Z', updated_at: '2026-08-10T00:00:00Z'
      }
    ];
    this.autoInc.keberangkatan = 6;

    // ---- Pendaftaran ----
    this.data.pendaftaran = [
      {
        id: 1, user_id: 3, paket_id: 2, keberangkatan_id: 2,
        nama_paspor: 'AHMAD FAUZI', nik: '3201010101010001',
        no_kk: '3201012345678901', no_paspor: 'A1234567',
        tempat_lahir: 'Jakarta', tanggal_lahir: '1985-03-15',
        jenis_kelamin: 'Laki-laki', alamat: 'Jl. Merdeka No. 123',
        provinsi: 'DKI Jakarta', kota: 'Jakarta Selatan',
        kecamatan: 'Kebayoran Baru', kelurahan: 'Senayan',
        status_nikah: 'Menikah', pekerjaan: 'Wiraswasta',
        nama_darurat: 'Siti Fatimah', hub_darurat: 'Istri', hp_darurat: '081234567999',
        status: 'Data Diverifikasi',
        jumlah_jamaah: 1,
        catatan_admin: 'Data lengkap dan valid.',
        created_at: '2026-06-15T00:00:00Z', updated_at: '2026-07-01T00:00:00Z'
      },
      {
        id: 2, user_id: 4, paket_id: 2, keberangkatan_id: 2,
        nama_paspor: 'SITI AISYAH', nik: '3201010101010002',
        no_kk: '3201012345678902', no_paspor: 'B2345678',
        tempat_lahir: 'Bandung', tanggal_lahir: '1990-07-20',
        jenis_kelamin: 'Perempuan', alamat: 'Jl. Asia Afrika No. 45',
        provinsi: 'Jawa Barat', kota: 'Bandung',
        kecamatan: 'Sumur Bandung', kelurahan: 'Braga',
        status_nikah: 'Menikah', pekerjaan: 'Guru',
        nama_darurat: 'Budi Santoso', hub_darurat: 'Suami', hp_darurat: '081234567888',
        status: 'Menunggu Verifikasi',
        jumlah_jamaah: 1,
        catatan_admin: null,
        created_at: '2026-07-01T00:00:00Z', updated_at: '2026-07-01T00:00:00Z'
      },
      {
        id: 3, user_id: 5, paket_id: 3, keberangkatan_id: 3,
        nama_paspor: 'MUHAMMAD RIZKI', nik: '3201010101010003',
        no_kk: '3201012345678903', no_paspor: 'C3456789',
        tempat_lahir: 'Surabaya', tanggal_lahir: '1988-12-05',
        jenis_kelamin: 'Laki-laki', alamat: 'Jl. Pahlawan No. 67',
        provinsi: 'Jawa Timur', kota: 'Surabaya',
        kecamatan: 'Genteng', kelurahan: 'Genteng',
        status_nikah: 'Belum Menikah', pekerjaan: 'Dokter',
        nama_darurat: 'Hj. Mariam', hub_darurat: 'Ibu', hp_darurat: '081234567777',
        status: 'Terdaftar',
        jumlah_jamaah: 1,
        catatan_admin: 'Jamaah VIP, dokumen lengkap.',
        created_at: '2026-07-10T00:00:00Z', updated_at: '2026-07-15T00:00:00Z'
      }
    ];
    this.autoInc.pendaftaran = 3;

    // Helper SVG Sample Images for Document & Payment Previews
    const sampleKTP = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" rx="15" fill="%230284c7"/><rect x="15" y="15" width="370" height="220" rx="10" fill="%23e0f2fe"/><text x="200" y="40" font-family="sans-serif" font-weight="bold" font-size="14" fill="%230369a1" text-anchor="middle">PROVINSI DKI JAKARTA - KTP REPUBLIK INDONESIA</text><rect x="30" y="65" width="90" height="120" fill="%2394a3b8" rx="5"/><circle cx="75" cy="110" r="30" fill="%23cbd5e1"/><path d="M 45 170 Q 75 135 105 170 Z" fill="%23cbd5e1"/><text x="140" y="80" font-family="monospace" font-weight="bold" font-size="14" fill="%230f172a">NIK : 3201010101010001</text><text x="140" y="105" font-family="sans-serif" font-size="11" fill="%23334155">Nama : JAMAAH ALMARWA</text><text x="140" y="125" font-family="sans-serif" font-size="11" fill="%23334155">Tempat/Tgl Lahir : JAKARTA, 15-03-1985</text><text x="140" y="145" font-family="sans-serif" font-size="11" fill="%23334155">Jenis Kelamin : LAKI-LAKI</text><text x="140" y="165" font-family="sans-serif" font-size="11" fill="%23334155">Agama : ISLAM</text><text x="140" y="185" font-family="sans-serif" font-size="11" fill="%23334155">Status Perkawinan: KAWIN</text><text x="140" y="205" font-family="sans-serif" font-size="11" fill="%23334155">Kewarganegaraan : WNI</text></svg>';

    const samplePaspor = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" rx="15" fill="%23065f46"/><rect x="15" y="15" width="370" height="230" rx="10" fill="%23ecfdf5"/><text x="200" y="45" font-family="serif" font-weight="bold" font-size="16" fill="%23047857" text-anchor="middle">PASPOR / PASSPORT - REPUBLIK INDONESIA</text><rect x="30" y="70" width="100" height="130" fill="%23a7f3d0" rx="5"/><circle cx="80" cy="120" r="32" fill="%23059669"/><path d="M 48 185 Q 80 145 112 185 Z" fill="%23059669"/><text x="150" y="85" font-family="sans-serif" font-size="11" fill="%23064e3b">Type: P | Country: IDN</text><text x="150" y="105" font-family="sans-serif" font-weight="bold" font-size="12" fill="%23064e3b">No. Paspor : A1234567</text><text x="150" y="130" font-family="sans-serif" font-size="12" fill="%23047857">Nama / Name : JAMAAH ALMARWA</text><text x="150" y="155" font-family="sans-serif" font-size="11" fill="%23064e3b">Tgl Lahir : 15 MAR 1985</text><text x="150" y="175" font-family="sans-serif" font-size="11" fill="%23064e3b">Tgl Pengeluaran : 10 JAN 2024</text><text x="150" y="195" font-family="sans-serif" font-size="11" fill="%23064e3b">Tgl Habis Berlaku : 10 JAN 2034</text><rect x="30" y="215" width="340" height="20" fill="%23d1fae5" rx="3"/><text x="40" y="229" font-family="monospace" font-size="10" fill="%23065f46">P&lt;IDNFAUZI&lt;&lt;AHMAD&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text></svg>';

    const sampleKK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280"><rect width="400" height="280" rx="10" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="3"/><rect x="10" y="10" width="380" height="260" fill="%23f8fafc"/><text x="200" y="35" font-family="sans-serif" font-weight="bold" font-size="14" fill="%231e293b" text-anchor="middle">KARTU KELUARGA</text><text x="200" y="55" font-family="monospace" font-size="12" fill="%230284c7" text-anchor="middle">No. 3201012345678901</text><rect x="25" y="70" width="350" height="180" fill="%23ffffff" stroke="%23e2e8f0"/><line x1="25" y1="95" x2="375" y2="95" stroke="%23cbd5e1"/><text x="35" y="87" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23475569">No</text><text x="60" y="87" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23475569">Nama Lengkap</text><text x="200" y="87" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23475569">NIK</text><text x="300" y="87" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23475569">J. Kelamin</text><text x="35" y="115" font-family="sans-serif" font-size="10" fill="%23334155">1</text><text x="60" y="115" font-family="sans-serif" font-size="10" fill="%23334155">AHMAD FAUZI</text><text x="200" y="115" font-family="monospace" font-size="10" fill="%23334155">3201010101010001</text><text x="300" y="115" font-family="sans-serif" font-size="10" fill="%23334155">LAKI-LAKI</text><text x="35" y="135" font-family="sans-serif" font-size="10" fill="%23334155">2</text><text x="60" y="135" font-family="sans-serif" font-size="10" fill="%23334155">SITI FATIMAH</text><text x="200" y="135" font-family="monospace" font-size="10" fill="%23334155">3201010101010009</text><text x="300" y="135" font-family="sans-serif" font-size="10" fill="%23334155">PEREMPUAN</text></svg>';

    const sampleFoto = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23dc2626"/><circle cx="150" cy="150" r="70" fill="%23f8fafc"/><path d="M 60 380 Q 150 250 240 380 Z" fill="%23f8fafc"/><text x="150" y="380" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23ffffff" text-anchor="middle">PASFOTO 4x6</text></svg>';

    const sampleBukti = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="450" viewBox="0 0 320 450"><rect width="320" height="450" rx="10" fill="%23ffffff" stroke="%23d81b60" stroke-width="2"/><rect x="15" y="15" width="290" height="60" fill="%23d81b60" rx="5"/><text x="160" y="42" font-family="sans-serif" font-weight="bold" font-size="16" fill="%23ffffff" text-anchor="middle">BUKTI TRANSFER BANK</text><text x="160" y="60" font-family="sans-serif" font-size="10" fill="%23fecddf" text-anchor="middle">PT ALMARWA TOUR &amp; TRAVEL</text><text x="30" y="110" font-family="sans-serif" font-size="11" fill="%2364748b">Tanggal : 20-06-2026 10:15 WIB</text><text x="30" y="130" font-family="sans-serif" font-size="11" fill="%2364748b">Bank Pengirim : BANK BCA</text><text x="30" y="150" font-family="sans-serif" font-size="11" fill="%2364748b">No. Rekening : 123-***-789</text><text x="30" y="170" font-family="sans-serif" font-size="11" fill="%2364748b">Nama Pengirim : AHMAD FAUZI</text><line x1="30" y1="190" x2="290" y2="190" stroke="%23e2e8f0"/><text x="30" y="220" font-family="sans-serif" font-size="11" fill="%2364748b">Bank Tujuan : BANK BCA</text><text x="30" y="240" font-family="sans-serif" font-size="11" fill="%2364748b">Rekening Tujuan : 123-456-7890</text><text x="30" y="260" font-family="sans-serif" font-size="11" fill="%2364748b">a.n : PT ALMARWA TOUR TRAVEL</text><line x1="30" y1="280" x2="290" y2="280" stroke="%23e2e8f0"/><text x="30" y="310" font-family="sans-serif" font-size="12" font-weight="bold" fill="%230f172a">JUMLAH TRANSFER :</text><text x="30" y="340" font-family="sans-serif" font-weight="extrabold" font-size="20" fill="%23d81b60">Rp 10.000.000</text><rect x="30" y="370" width="260" height="35" fill="%23dcfce7" rx="5"/><text x="160" y="392" font-family="sans-serif" font-weight="bold" font-size="12" fill="%2315803d" text-anchor="middle">STATUS : BERHASIL / SUCCESS</text></svg>';

    // ---- Dokumen Jamaah ----
    this.data.dokumen_jamaah = [
      { id: 1, pendaftaran_id: 1, jenis: 'KTP', file_path: sampleKTP, status: 'Valid', catatan: 'Nomor NIK sesuai KTP asli', created_at: '2026-06-15T00:00:00Z', updated_at: '2026-07-01T00:00:00Z' },
      { id: 2, pendaftaran_id: 1, jenis: 'KK', file_path: sampleKK, status: 'Valid', catatan: 'Kartu Keluarga terverifikasi', created_at: '2026-06-15T00:00:00Z', updated_at: '2026-07-01T00:00:00Z' },
      { id: 3, pendaftaran_id: 1, jenis: 'Paspor', file_path: samplePaspor, status: 'Valid', catatan: 'Masa berlaku paspor > 6 bulan', created_at: '2026-06-15T00:00:00Z', updated_at: '2026-07-01T00:00:00Z' },
      { id: 4, pendaftaran_id: 1, jenis: 'Foto', file_path: sampleFoto, status: 'Valid', catatan: 'Pasfoto 4x6 latar belakang sesuai', created_at: '2026-06-15T00:00:00Z', updated_at: '2026-07-01T00:00:00Z' },
      { id: 5, pendaftaran_id: 2, jenis: 'KTP', file_path: sampleKTP, status: 'Belum Diperiksa', catatan: null, created_at: '2026-07-01T00:00:00Z', updated_at: '2026-07-01T00:00:00Z' },
      { id: 6, pendaftaran_id: 2, jenis: 'Paspor', file_path: samplePaspor, status: 'Belum Diperiksa', catatan: null, created_at: '2026-07-01T00:00:00Z', updated_at: '2026-07-01T00:00:00Z' },
      { id: 7, pendaftaran_id: 3, jenis: 'KTP', file_path: sampleKTP, status: 'Valid', catatan: null, created_at: '2026-07-10T00:00:00Z', updated_at: '2026-07-15T00:00:00Z' },
      { id: 8, pendaftaran_id: 3, jenis: 'Paspor', file_path: samplePaspor, status: 'Valid', catatan: null, created_at: '2026-07-10T00:00:00Z', updated_at: '2026-07-15T00:00:00Z' },
      { id: 9, pendaftaran_id: 3, jenis: 'KK', file_path: sampleKK, status: 'Valid', catatan: null, created_at: '2026-07-10T00:00:00Z', updated_at: '2026-07-15T00:00:00Z' },
      { id: 10, pendaftaran_id: 3, jenis: 'Foto', file_path: sampleFoto, status: 'Valid', catatan: null, created_at: '2026-07-10T00:00:00Z', updated_at: '2026-07-15T00:00:00Z' }
    ];
    this.autoInc.dokumen_jamaah = 10;

    // ---- Pembayaran ----
    this.data.pembayaran = [
      {
        id: 1, pendaftaran_id: 1, jenis: 'DP', jumlah: 10000000,
        tanggal: '2026-06-20', bukti: sampleBukti, status: 'Terverifikasi',
        catatan: 'Pembayaran DP via transfer BCA',
        created_at: '2026-06-20T00:00:00Z', updated_at: '2026-06-21T00:00:00Z'
      },
      {
        id: 2, pendaftaran_id: 1, jenis: 'Cicilan', jumlah: 12000000,
        tanggal: '2026-07-15', bukti: sampleBukti, status: 'Terverifikasi',
        catatan: 'Cicilan ke-1 via transfer Mandiri',
        created_at: '2026-07-15T00:00:00Z', updated_at: '2026-07-16T00:00:00Z'
      },
      {
        id: 3, pendaftaran_id: 1, jenis: 'Pelunasan', jumlah: 10000000,
        tanggal: '2026-08-01', bukti: sampleBukti, status: 'Menunggu Verifikasi',
        catatan: 'Pelunasan sisa pembayaran',
        created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 4, pendaftaran_id: 2, jenis: 'DP', jumlah: 10000000,
        tanggal: '2026-07-05', bukti: sampleBukti, status: 'Terverifikasi',
        catatan: 'DP umroh',
        created_at: '2026-07-05T00:00:00Z', updated_at: '2026-07-06T00:00:00Z'
      },
      {
        id: 5, pendaftaran_id: 3, jenis: 'DP', jumlah: 15000000,
        tanggal: '2026-07-12', bukti: sampleBukti, status: 'Terverifikasi',
        catatan: 'DP Paket VIP',
        created_at: '2026-07-12T00:00:00Z', updated_at: '2026-07-13T00:00:00Z'
      },
      {
        id: 6, pendaftaran_id: 3, jenis: 'Pelunasan', jumlah: 30000000,
        tanggal: '2026-07-25', bukti: sampleBukti, status: 'Terverifikasi',
        catatan: 'Pelunasan VIP',
        created_at: '2026-07-25T00:00:00Z', updated_at: '2026-07-26T00:00:00Z'
      }
    ];
    this.autoInc.pembayaran = 6;

    // ---- Fasilitas ----
    this.data.fasilitas = [
      { id: 1, nama: 'Tiket Pesawat PP', icon: 'Plane', deskripsi: 'Tiket pesawat pulang pergi dengan maskapai terpercaya', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 2, nama: 'Hotel Berbintang', icon: 'Building', deskripsi: 'Hotel dekat Masjidil Haram dan Masjid Nabawi', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 3, nama: 'Transportasi AC', icon: 'Bus', deskripsi: 'Bus ber-AC full selama perjalanan', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 4, nama: 'Visa Umroh', icon: 'FileCheck', deskripsi: 'Pengurusan visa umroh resmi', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 5, nama: 'Makan 3x Sehari', icon: 'UtensilsCrossed', deskripsi: 'Menu makanan Indonesia dan Arab', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 6, nama: 'Tour Leader', icon: 'UserCheck', deskripsi: 'Tour leader berpengalaman mendampingi perjalanan', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 7, nama: 'Muthawif', icon: 'BookOpen', deskripsi: 'Pembimbing ibadah berpengalaman', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 8, nama: 'Manasik Umroh', icon: 'GraduationCap', deskripsi: 'Pelatihan manasik sebelum keberangkatan', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 9, nama: 'Air Zamzam', icon: 'Droplets', deskripsi: 'Air zamzam untuk dibawa pulang', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 10, nama: 'Handling Airport', icon: 'Luggage', deskripsi: 'Pengurusan bagasi dan proses di bandara', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
    ];
    this.autoInc.fasilitas = 10;

    // ---- Galeri ----
    this.data.galeri = [
      { id: 1, judul: 'Keberangkatan Jamaah Maret 2026', tipe: 'foto', url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80', deskripsi: 'Momen penuh haru keberangkatan kloter jamaah Almarwa Tour & Travel di Bandara.', created_at: '2026-03-15T00:00:00Z', updated_at: '2026-03-15T00:00:00Z' },
      { id: 2, judul: 'Ibadah Tawaf di Masjidil Haram', tipe: 'foto', url: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=800&q=80', deskripsi: 'Jamaah melaksanakan ibadah tawaf mengelilingi Ka\'bah dengan khusyuk dan khidmat.', created_at: '2026-03-20T00:00:00Z', updated_at: '2026-03-20T00:00:00Z' },
      { id: 3, judul: 'Keindahan Masjid Nabawi Madinah', tipe: 'foto', url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80', deskripsi: 'Jamaah berada di pelataran Masjid Nabawi Madinah Al-Munawwarah.', created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
      { id: 4, judul: 'City Tour Ziarah Madinah', tipe: 'foto', url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80', deskripsi: 'Kunjungan jamaah ke lokasi ziarah bersejarah Jabal Uhud dan Masjid Quba.', created_at: '2026-04-05T00:00:00Z', updated_at: '2026-04-05T00:00:00Z' },
      { id: 5, judul: 'Kebersamaan Jamaah saat Buka Bersama', tipe: 'foto', url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80', deskripsi: 'Momen kehangatan dan kebersamaan antar jamaah selama perjalanan umroh.', created_at: '2026-04-10T00:00:00Z', updated_at: '2026-04-10T00:00:00Z' }
    ];
    this.autoInc.galeri = 5;

    // ---- Testimoni ----
    this.data.testimoni = [
      { id: 1, nama: 'Hj. Nurjanah', asal: 'Jakarta', foto: null, isi: 'Alhamdulillah perjalanan umroh bersama Almarwa sangat nyaman. Pelayanan dari awal sampai akhir sangat memuaskan. Hotel dekat dengan Masjidil Haram, makanan enak, dan pembimbing sangat sabar.', rating: 5, paket: 'Paket Regular', tahun: '2026', status: 'active', created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
      { id: 2, nama: 'H. Bambang Sutrisno', asal: 'Bandung', foto: null, isi: 'Saya dan istri sangat puas dengan layanan Almarwa Tour Travel. Jadwal teratur, tidak terburu-buru, dan dibimbing oleh ustadz yang sangat kompeten. InsyaAllah akan berangkat lagi.', rating: 5, paket: 'Paket VIP', tahun: '2026', status: 'active', created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z' },
      { id: 3, nama: 'Dewi Rahmawati', asal: 'Surabaya', foto: null, isi: 'Masyaallah, pengalaman yang tak terlupakan. Semuanya tertata rapi, mulai dari visa, hotel, sampai transportasi. Terima kasih Almarwa sudah mengantarkan kami ke Baitullah.', rating: 5, paket: 'Paket Regular', tahun: '2025', status: 'active', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
      { id: 4, nama: 'H. Abdullah', asal: 'Semarang', foto: null, isi: 'Pelayanan prima, hotel strategis, dan makanan sesuai selera Indonesia. Almarwa benar-benar travel yang amanah dan terpercaya.', rating: 5, paket: 'Paket Ekonomi', tahun: '2025', status: 'active', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' }
    ];
    this.autoInc.testimoni = 4;

    // ---- FAQ ----
    this.data.faq = [
      { id: 1, pertanyaan: 'Apa saja persyaratan untuk daftar umroh?', jawaban: 'Persyaratan utama: KTP, Kartu Keluarga (KK), Paspor yang masih berlaku minimal 6 bulan, Foto berwarna ukuran 4x6 dengan latar belakang putih, dan Surat keterangan sehat dari dokter.', urutan: 1, status: 'active', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 2, pertanyaan: 'Bagaimana cara melakukan pembayaran?', jawaban: 'Pembayaran dapat dilakukan melalui transfer bank ke rekening resmi Almarwa Tour Travel (BCA/Mandiri/BNI/BSI). Pembayaran bisa dilakukan secara DP terlebih dahulu minimal Rp 10.000.000, kemudian dilanjutkan dengan cicilan atau pelunasan.', urutan: 2, status: 'active', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 3, pertanyaan: 'Apakah ada manasik umroh sebelum keberangkatan?', jawaban: 'Ya, kami mengadakan manasik umroh minimal 1-3 kali sebelum keberangkatan (tergantung paket yang dipilih). Manasik dipimpin oleh ustadz berpengalaman yang akan membimbing tata cara ibadah umroh.', urutan: 3, status: 'active', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 4, pertanyaan: 'Berapa lama proses pengurusan visa?', jawaban: 'Proses pengurusan visa umroh biasanya memakan waktu 7-14 hari kerja setelah semua dokumen lengkap diterima oleh kami.', urutan: 4, status: 'active', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 5, pertanyaan: 'Apakah bisa membatalkan pendaftaran?', jawaban: 'Pembatalan pendaftaran dapat dilakukan dengan ketentuan: lebih dari 30 hari sebelum keberangkatan dikenakan biaya administrasi 10%, 15-30 hari sebelumnya dikenakan 25%, dan kurang dari 15 hari dikenakan 50% dari total biaya.', urutan: 5, status: 'active', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 6, pertanyaan: 'Apa perbedaan Paket Ekonomi, Regular, dan VIP?', jawaban: 'Perbedaan utama terletak pada kelas hotel (bintang 3/4/5), maskapai penerbangan, jarak hotel ke Masjidil Haram, jenis menu makanan, dan fasilitas tambahan seperti city tour dan laundry service. Semua paket sudah termasuk ibadah yang sama.', urutan: 6, status: 'active', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
    ];
    this.autoInc.faq = 6;

    // ---- Notifikasi ----
    this.data.notifikasi = [
      { id: 1, user_id: 3, judul: 'Pendaftaran Berhasil', pesan: 'Pendaftaran umroh Anda telah diterima. Silakan lengkapi dokumen yang diperlukan.', tipe: 'success', dibaca: true, created_at: '2026-06-15T00:00:00Z', updated_at: '2026-06-15T00:00:00Z' },
      { id: 2, user_id: 3, judul: 'Data Diverifikasi', pesan: 'Data pendaftaran Anda telah diverifikasi oleh admin. Status: Data Diverifikasi.', tipe: 'info', dibaca: true, created_at: '2026-07-01T00:00:00Z', updated_at: '2026-07-01T00:00:00Z' },
      { id: 3, user_id: 3, judul: 'Pembayaran Diterima', pesan: 'Pembayaran DP sebesar Rp 10.000.000 telah kami terima. Terima kasih.', tipe: 'success', dibaca: false, created_at: '2026-07-02T00:00:00Z', updated_at: '2026-07-02T00:00:00Z' },
      { id: 4, user_id: 1, judul: 'Pendaftaran Baru', pesan: 'Jamaah baru telah mendaftar: Siti Aisyah - Paket Regular.', tipe: 'info', dibaca: false, created_at: '2026-07-01T00:00:00Z', updated_at: '2026-07-01T00:00:00Z' },
      { id: 5, user_id: 1, judul: 'Dokumen Baru', pesan: 'Siti Aisyah telah mengupload dokumen KTP dan Paspor. Silakan verifikasi.', tipe: 'warning', dibaca: false, created_at: '2026-07-01T00:00:00Z', updated_at: '2026-07-01T00:00:00Z' },
      { id: 6, user_id: 4, judul: 'Pendaftaran Berhasil', pesan: 'Pendaftaran umroh Anda telah diterima. Silakan lengkapi dokumen yang diperlukan.', tipe: 'success', dibaca: false, created_at: '2026-07-01T00:00:00Z', updated_at: '2026-07-01T00:00:00Z' }
    ];
    this.autoInc.notifikasi = 6;

    // ---- Activity Logs ----
    this.data.activity_logs = [
      { id: 1, user_id: 1, user_nama: 'Administrator', aksi: 'Menambahkan paket', deskripsi: 'Menambahkan Paket Ramadhan', target: 'paket_umroh', target_id: 4, created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z' },
      { id: 2, user_id: 1, user_nama: 'Administrator', aksi: 'Menambahkan jadwal', deskripsi: 'Menambahkan jadwal keberangkatan 15 September 2026', target: 'keberangkatan', target_id: 1, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
      { id: 3, user_id: 1, user_nama: 'Administrator', aksi: 'Memverifikasi jamaah', deskripsi: 'Memverifikasi data Ahmad Fauzi - Paket Regular', target: 'pendaftaran', target_id: 1, created_at: '2026-07-01T00:00:00Z', updated_at: '2026-07-01T00:00:00Z' },
      { id: 4, user_id: 1, user_nama: 'Administrator', aksi: 'Memverifikasi pembayaran', deskripsi: 'Memverifikasi DP Ahmad Fauzi sebesar Rp 10.000.000', target: 'pembayaran', target_id: 1, created_at: '2026-06-21T00:00:00Z', updated_at: '2026-06-21T00:00:00Z' },
      { id: 5, user_id: 1, user_nama: 'Administrator', aksi: 'Mengubah status keberangkatan', deskripsi: 'Mengubah status keberangkatan 10 Agustus 2026 menjadi Berangkat', target: 'keberangkatan', target_id: 6, created_at: '2026-08-10T00:00:00Z', updated_at: '2026-08-10T00:00:00Z' },
      { id: 6, user_id: 1, user_nama: 'Administrator', aksi: 'Memverifikasi dokumen', deskripsi: 'Memverifikasi KTP, KK, Paspor, Foto milik Muhammad Rizki', target: 'dokumen_jamaah', target_id: 3, created_at: '2026-07-15T00:00:00Z', updated_at: '2026-07-15T00:00:00Z' }
    ];
    this.autoInc.activity_logs = 6;

    // ---- Kontak ----
    this.data.kontak = [
      {
        id: 1,
        whatsapp: '6281234567890',
        email: 'info@almarwatour.com',
        alamat: 'Jl. KH. Ahmad Dahlan No. 123, Kebayoran Baru, Jakarta Selatan 12110',
        google_maps: 'https://maps.google.com/?q=-6.2088,106.8456',
        instagram: 'almarwatourtravel',
        facebook: 'AlmarwaTourTravel',
        tiktok: '@almarwatour',
        created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
      }
    ];
    this.autoInc.kontak = 1;

    // ---- Promo ----
    this.data.promo = [
      {
        id: 1, judul: 'Early Bird Ramadhan 2027', deskripsi: 'Diskon Rp 2.000.000 untuk pendaftaran Paket Ramadhan sebelum 31 Desember 2026.',
        potongan: 2000000, kode: 'RAMADHAN2027', berlaku_sampai: '2026-12-31', status: 'active',
        created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 2, judul: 'Promo Keluarga', deskripsi: 'Diskon Rp 1.500.000 per orang untuk pendaftaran minimal 3 jamaah dalam satu keluarga.',
        potongan: 1500000, kode: 'KELUARGA', berlaku_sampai: '2027-03-31', status: 'active',
        created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z'
      }
    ];
    this.autoInc.promo = 2;

    // ---- Site Settings ----
    this.data.site_settings = [
      {
        id: 1, nama_travel: 'Almarwa Tour & Travel',
        tagline: 'Umroh & Haji Plus - Melayani Sepenuh Hati',
        deskripsi: 'Almarwa Tour & Travel adalah biro perjalanan umroh dan haji plus yang berpengalaman dan terpercaya. Kami berkomitmen memberikan pelayanan terbaik kepada setiap jamaah dengan penuh keikhlasan dan profesionalisme.',
        logo: null,
        created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
      }
    ];
    this.autoInc.site_settings = 1;

    console.log('✅ Database seeded with demo data successfully!');
  }
}

const database = new SimpleDB();
export default database;
