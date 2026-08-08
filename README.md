# 🕋 Almarwa Tour & Travel - Website Umroh & Haji Plus

Website full-stack untuk **Almarwa Tour & Travel** — biro perjalanan umroh & haji plus dengan branding dominan **Pink**, **Gold**, dan **Putih**.

## 🎯 Fitur Utama

- **Landing Page** — Hero section, paket umroh, jadwal, fasilitas, galeri, testimoni, FAQ, kontak
- **3 Role User** — Jamaah, Admin, Owner
- **Pendaftaran Umroh** — Multi-step form, upload dokumen, pembayaran
- **Dashboard Admin** — CRUD paket, jadwal, verifikasi jamaah & dokumen, manajemen pembayaran
- **Dashboard Owner** — Statistik, grafik, monitoring, export laporan Excel/PDF
- **Notifikasi** — Sistem notifikasi untuk admin dan jamaah
- **Activity Log** — Audit trail semua aktivitas admin
- **Responsive Design** — Desktop, tablet, dan mobile

## 🔧 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Lucide Icons, Chart.js |
| Backend | Node.js, Express.js |
| Database | JSON-file store (dev) + MySQL schema (production) |
| Auth | JWT + bcrypt + Role-Based Access Control |

## 📦 Instalasi & Menjalankan di Localhost

### Prasyarat
- **Node.js** v18+ (direkomendasikan v20+)
- **npm** v9+

### Langkah 1: Install Dependencies

```bash
cd "d:\PINDAHKAN\MBA A\AL MARWA"
npm install
```

### Langkah 2: Jalankan Backend Server

```bash
npm run server
```
Server akan berjalan di `http://localhost:5000`

### Langkah 3: Jalankan Frontend (Terminal baru)

```bash
npm run dev
```
Frontend akan berjalan di `http://localhost:3000`

### Langkah 4: Buka Browser

Akses `http://localhost:3000`

## 👤 Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@almarwa.com | admin123 |
| Owner | owner@almarwa.com | owner123 |
| Jamaah | jamaah@almarwa.com | jamaah123 |

## 📁 Struktur Folder

```
al-marwa-tour/
├── index.html                    # Entry HTML
├── package.json                  # Dependencies
├── vite.config.js                # Vite + proxy config
├── tailwind.config.js            # Tailwind CSS config
├── server/
│   ├── index.js                  # Express REST API
│   ├── db.js                     # Database + seed data
│   ├── schema_mysql.sql          # MySQL migration schema
│   ├── middleware/
│   │   └── auth.js               # JWT & RBAC middleware
│   └── uploads/                  # Uploaded documents
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Main app + auth context
│   ├── index.css                 # Almarwa design system
│   └── pages/
│       ├── LandingPage.jsx       # Public landing page
│       ├── AuthPage.jsx          # Login & Register
│       ├── JamaahDashboard.jsx   # Jamaah portal
│       ├── AdminDashboard.jsx    # Admin portal
│       └── OwnerDashboard.jsx    # Owner portal
```

## 🗄️ Setup Database MySQL (Production)

### Menggunakan phpMyAdmin

1. Buka phpMyAdmin
2. Buat database baru: `almarwa_tour`
3. Import file `server/schema_mysql.sql`
4. Sesuaikan koneksi database di `server/db.js`

### Menggunakan MySQL CLI

```bash
mysql -u root -p < server/schema_mysql.sql
```

## 🚀 Deployment ke Hosting

### Shared Hosting (cPanel)

1. Build frontend: `npm run build`
2. Upload folder `dist/` ke `public_html/`
3. Upload folder `server/` ke direktori terpisah
4. Setup Node.js App di cPanel
5. Import `schema_mysql.sql` ke MySQL database
6. Konfigurasi environment variables

### VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# Clone/upload project
cd /var/www/almarwa
npm install
npm run build

# Install PM2
npm install -g pm2
pm2 start server/index.js --name almarwa

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/almarwa
```

## 🔒 Keamanan

- Password di-hash menggunakan bcrypt
- JWT token untuk autentikasi
- Role-Based Access Control (Jamaah/Admin/Owner)
- Validasi upload file (JPG, PNG, PDF, max 5MB)
- CORS protection
- Input validation

## 📊 API Endpoints

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | /api/auth/register | Register user baru | No |
| POST | /api/auth/login | Login | No |
| GET | /api/public/paket | Daftar paket aktif | No |
| GET | /api/public/keberangkatan | Jadwal keberangkatan | No |
| GET | /api/public/faq | FAQ | No |
| POST | /api/jamaah/pendaftaran | Daftar umroh | Jamaah |
| POST | /api/jamaah/dokumen | Upload dokumen | Jamaah |
| POST | /api/jamaah/pembayaran | Kirim pembayaran | Jamaah |
| GET | /api/admin/stats | Dashboard statistics | Admin/Owner |
| POST | /api/admin/paket | Tambah paket | Admin |
| PUT | /api/admin/jamaah/:id/status | Update status jamaah | Admin |
| PUT | /api/admin/dokumen/:id/verify | Verifikasi dokumen | Admin |
| GET | /api/owner/activity-log | Activity log | Owner |
| GET | /api/export/jamaah | Export data jamaah | Admin/Owner |

---

**Almarwa Tour & Travel** — _Umroh & Haji Plus, Melayani Sepenuh Hati_ 🕋
