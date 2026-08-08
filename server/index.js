/* ============================================================
   ALMARWA TOUR TRAVEL - EXPRESS API SERVER
   ============================================================ */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config();
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { existsSync, mkdirSync } from 'fs';
import db from './db.js';
import supabaseAdapter from './db_supabase.js';
import { generateToken, authMiddleware, roleMiddleware } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
const uploadsDir = join(__dirname, 'uploads');
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Multer upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak diizinkan. Gunakan JPG, PNG, atau PDF.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ===== HELPER: Activity Log =====
async function logActivity(userId, userName, aksi, deskripsi, target = null, targetId = null) {
  try {
    await db.insert('activity_logs', {
      user_id: userId,
      user_nama: userName,
      aksi,
      deskripsi,
      target,
      target_id: targetId
    });
  } catch (e) { console.error('logActivity error:', e.message); }
}

// ===== HELPER: Create Notification =====
async function createNotification(userId, judul, pesan, tipe = 'info') {
  try {
    await db.insert('notifikasi', {
      user_id: userId,
      judul,
      pesan,
      tipe,
      dibaca: false
    });
  } catch (e) { console.error('createNotification error:', e.message); }
}

// =====================================================
// AUTH ROUTES
// =====================================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nama, email, no_hp, password } = req.body;
    if (!nama || !email || !no_hp || !password) {
      return res.status(400).json({ error: 'Semua field wajib diisi.' });
    }

    const existing = await db.getWhere('users', { email });
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Insert into DB (Supabase Table / Local JSON)
    const user = await db.insert('users', {
      nama, email, no_hp,
      password: hashedPassword,
      role: 'jamaah'
    });

    // Also sync to Supabase Auth (Authentication -> Users dashboard)
    await supabaseAdapter.createAuthUser(email, password, nama, no_hp);

    const token = generateToken(user);
    await createNotification(user.id, 'Selamat Datang!', `Assalamu'alaikum ${nama}, selamat datang di Almarwa Tour & Travel. Jelajahi paket umroh kami dan daftarkan diri Anda.`, 'success');

    // Format WhatsApp confirmation link
    const waNumber = no_hp.replace(/^0/, '62').replace(/[^0-9]/g, '');
    const waMessage = encodeURIComponent(`Assalamu'alaikum ${nama},\n\nTerima kasih telah mendaftar di Almarwa Tour & Travel.\nAkun Email: ${email}\nStatus: Aktif & Terverifikasi.\n\nSemoga perjalanan umroh Anda diberkahi Allah SWT.`);
    const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

    res.status(201).json({
      message: 'Registrasi berhasil!',
      token,
      whatsapp_url: waUrl,
      user: { id: user.id, nama: user.nama, email: user.email, role: user.role, no_hp: user.no_hp }
    });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server.', detail: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const users = await db.getWhere('users', { email });
    if (users.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const user = users[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login berhasil!',
      token,
      user: { id: user.id, nama: user.nama, email: user.email, role: user.role, no_hp: user.no_hp }
    });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server.', detail: err.message });
  }
});

// Get current user profile
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await db.getById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// =====================================================
// PUBLIC ROUTES (No auth required)
// =====================================================

// Get active packages
app.get('/api/public/paket', async (req, res) => {
  const paket = await db.getWhere('paket_umroh', { status: 'active' });
  res.json(paket);
});

// Get single package
app.get('/api/public/paket/:id', async (req, res) => {
  const paket = await db.getById('paket_umroh', parseInt(req.params.id));
  if (!paket) return res.status(404).json({ error: 'Paket tidak ditemukan.' });
  const keberangkatan = await db.getWhere('keberangkatan', { paket_id: paket.id });
  res.json({ ...paket, keberangkatan });
});

// Get departures
app.get('/api/public/keberangkatan', async (req, res) => {
  const departures = await db.getAll('keberangkatan');
  const result = await Promise.all(departures.map(async k => {
    const paket = await db.getById('paket_umroh', k.paket_id);
    return { ...k, paket_nama: paket ? paket.nama : '-', paket_harga: paket ? paket.harga : 0 };
  }));
  res.json(result);
});

// Get facilities
app.get('/api/public/fasilitas', async (req, res) => {
  res.json(await db.getAll('fasilitas'));
});

// Get gallery
app.get('/api/public/galeri', async (req, res) => {
  res.json(await db.getAll('galeri'));
});

// Get active testimonials
app.get('/api/public/testimoni', async (req, res) => {
  res.json(await db.getWhere('testimoni', { status: 'active' }));
});

// Get active FAQs
app.get('/api/public/faq', async (req, res) => {
  const faqs = await db.getWhere('faq', { status: 'active' });
  faqs.sort((a, b) => a.urutan - b.urutan);
  res.json(faqs);
});

// Get contact info
app.get('/api/public/kontak', async (req, res) => {
  const kontak = await db.getAll('kontak');
  res.json(kontak[0] || {});
});

// Get site settings
app.get('/api/public/settings', async (req, res) => {
  const settings = await db.getAll('site_settings');
  res.json(settings[0] || {});
});

// Get active promos
app.get('/api/public/promo', async (req, res) => {
  res.json(await db.getWhere('promo', { status: 'active' }));
});

// =====================================================
// JAMAAH ROUTES
// =====================================================

// Get jamaah's registration(s)
app.get('/api/jamaah/pendaftaran', authMiddleware, roleMiddleware('jamaah'), async (req, res) => {
  try {
    const rawList = await db.getWhere('pendaftaran', { user_id: parseInt(req.user.id) });
    const pendaftaran = Array.isArray(rawList) ? rawList : [];
    const result = await Promise.all(pendaftaran.map(async p => {
      const paket = await db.getById('paket_umroh', p.paket_id);
      const keberangkatan = await db.getById('keberangkatan', p.keberangkatan_id);
      const dokumenRaw = await db.getWhere('dokumen_jamaah', { pendaftaran_id: p.id });
      const pembayaranRaw = await db.getWhere('pembayaran', { pendaftaran_id: p.id });
      const dokumen = Array.isArray(dokumenRaw) ? dokumenRaw : [];
      const pembayaran = Array.isArray(pembayaranRaw) ? pembayaranRaw : [];
      const totalBayar = pembayaran.filter(b => b.status === 'Terverifikasi').reduce((sum, b) => sum + (parseInt(b.jumlah) || 0), 0);
      const totalPendingBayar = pembayaran.filter(b => b.status === 'Menunggu Verifikasi').reduce((sum, b) => sum + (parseInt(b.jumlah) || 0), 0);
      const hargaPaket = paket ? paket.harga : 0;
      return {
        ...p,
        paket_nama: paket ? paket.nama : '-',
        paket_harga: hargaPaket,
        tanggal_berangkat: keberangkatan ? keberangkatan.tanggal_berangkat : '-',
        tanggal_pulang: keberangkatan ? keberangkatan.tanggal_pulang : '-',
        dokumen,
        pembayaran,
        total_bayar: totalBayar,
        total_pending_bayar: totalPendingBayar,
        sisa_bayar: Math.max(0, hargaPaket - totalBayar),
        sisa_bayar_est: Math.max(0, hargaPaket - (totalBayar + totalPendingBayar))
      };
    }));
    result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    res.json(result);
  } catch (err) {
    console.error('Gagal GET pendaftaran:', err);
    res.status(500).json({ error: 'Gagal memuat pendaftaran.', detail: err.message });
  }
});

// Create registration
app.post('/api/jamaah/pendaftaran', authMiddleware, roleMiddleware('jamaah'), async (req, res) => {
  try {
    const body = req.body;
    
    // Normalize jenis_kelamin for database constraint
    let jk = body.jenis_kelamin;
    if (jk === 'L' || jk === 'Laki-laki') jk = 'Laki-laki';
    else if (jk === 'P' || jk === 'Perempuan') jk = 'Perempuan';

    const data = {
      user_id: parseInt(req.user.id),
      paket_id: parseInt(body.paket_id),
      keberangkatan_id: parseInt(body.keberangkatan_id),
      nama_paspor: body.nama_paspor || req.user.nama,
      nik: body.nik || '',
      no_kk: body.no_kk || null,
      no_paspor: body.no_paspor || null,
      tempat_lahir: body.tempat_lahir || null,
      tanggal_lahir: body.tanggal_lahir || null,
      jenis_kelamin: jk || null,
      alamat: body.alamat || null,
      provinsi: body.provinsi || null,
      kota: body.kota || null,
      kecamatan: body.kecamatan || null,
      kelurahan: body.kelurahan || null,
      status_nikah: body.status_nikah || null,
      pekerjaan: body.pekerjaan || null,
      nama_darurat: body.nama_darurat || body.kontak_darurat_nama || null,
      hub_darurat: body.hub_darurat || body.kontak_darurat_hubungan || null,
      hp_darurat: body.hp_darurat || body.kontak_darurat_hp || null,
      jumlah_jamaah: parseInt(body.jumlah_jamaah || 1),
      status: 'Menunggu Verifikasi'
    };

    const pendaftaran = await db.insert('pendaftaran', data);

    // Update quota count in keberangkatan
    if (data.keberangkatan_id) {
      const keberangkatan = await db.getById('keberangkatan', data.keberangkatan_id);
      if (keberangkatan) {
        await db.update('keberangkatan', keberangkatan.id, {
          terisi: (keberangkatan.terisi || 0) + (data.jumlah_jamaah || 1)
        });
      }
    }

    // Notify admin
    const adminsRaw = await db.getWhere('users', { role: 'admin' });
    const admins = Array.isArray(adminsRaw) ? adminsRaw : [];
    for (const admin of admins) {
      await createNotification(admin.id, 'Pendaftaran Baru', `Jamaah baru telah mendaftar: ${data.nama_paspor}.`, 'info');
    }

    // Notify jamaah
    await createNotification(req.user.id, 'Pendaftaran Berhasil', 'Pendaftaran umroh Anda telah diterima. Silakan lengkapi dokumen yang diperlukan.', 'success');

    await logActivity(req.user.id, req.user.nama, 'Mendaftar umroh', `${req.user.nama} mendaftar umroh`, 'pendaftaran', pendaftaran ? pendaftaran.id : null);

    res.status(201).json({ message: 'Pendaftaran berhasil!', data: pendaftaran });
  } catch (err) {
    console.error('Gagal mendaftar POST error:', err);
    res.status(500).json({ error: 'Gagal mendaftar.', detail: err.message });
  }
});

// Upload document
app.post('/api/jamaah/dokumen', authMiddleware, roleMiddleware('jamaah'), upload.single('file'), async (req, res) => {
  try {
    const { pendaftaran_id, jenis } = req.body;
    if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan.' });

    // Verify ownership
    const pendaftaran = await db.getById('pendaftaran', parseInt(pendaftaran_id));
    if (!pendaftaran || pendaftaran.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Akses ditolak.' });
    }

    // Check if doc already exists, update it
    const existingRaw = await db.getWhere('dokumen_jamaah', { pendaftaran_id: parseInt(pendaftaran_id), jenis });
    const existing = Array.isArray(existingRaw) ? existingRaw : [];
    if (existing.length > 0) {
      await db.update('dokumen_jamaah', existing[0].id, {
        file_path: '/uploads/' + req.file.filename,
        status: 'Belum Diperiksa'
      });
    } else {
      await db.insert('dokumen_jamaah', {
        pendaftaran_id: parseInt(pendaftaran_id),
        jenis,
        file_path: '/uploads/' + req.file.filename,
        status: 'Belum Diperiksa',
        catatan: null
      });
    }

    // Notify admin
    const adminsRaw = await db.getWhere('users', { role: 'admin' });
    const admins = Array.isArray(adminsRaw) ? adminsRaw : [];
    for (const admin of admins) {
      await createNotification(admin.id, 'Dokumen Baru', `${req.user.nama} mengupload dokumen ${jenis}.`, 'warning');
    }

    res.json({ message: `Dokumen ${jenis} berhasil diupload.` });
  } catch (err) {
    res.status(500).json({ error: 'Gagal upload dokumen.', detail: err.message });
  }
});

// Upload payment proof
app.post('/api/jamaah/pembayaran', authMiddleware, roleMiddleware('jamaah'), upload.single('bukti'), async (req, res) => {
  try {
    const { pendaftaran_id, jenis, jumlah, catatan } = req.body;

    const pendaftaran = await db.getById('pendaftaran', parseInt(pendaftaran_id));
    if (!pendaftaran || pendaftaran.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Akses ditolak.' });
    }

    const pembayaran = await db.insert('pembayaran', {
      pendaftaran_id: parseInt(pendaftaran_id),
      jenis,
      jumlah: parseInt(jumlah),
      tanggal: new Date().toISOString().split('T')[0],
      bukti: req.file ? '/uploads/' + req.file.filename : null,
      status: 'Menunggu Verifikasi',
      catatan: catatan || null
    });

    // Notify admin
    const adminsRaw = await db.getWhere('users', { role: 'admin' });
    const admins = Array.isArray(adminsRaw) ? adminsRaw : [];
    for (const admin of admins) {
      await createNotification(admin.id, 'Pembayaran Baru', `${req.user.nama} melakukan pembayaran ${jenis} sebesar Rp ${parseInt(jumlah).toLocaleString('id-ID')}.`, 'info');
    }

    res.status(201).json({ message: 'Pembayaran berhasil dicatat.', data: pembayaran });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mencatat pembayaran.', detail: err.message });
  }
});

// Get notifications
app.get('/api/notifikasi', authMiddleware, async (req, res) => {
  const notifRaw = await db.getWhere('notifikasi', { user_id: parseInt(req.user.id) });
  const notif = Array.isArray(notifRaw) ? notifRaw : [];
  notif.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(notif);
});

// Mark notification as read
app.put('/api/notifikasi/:id/read', authMiddleware, async (req, res) => {
  const notif = await db.getById('notifikasi', parseInt(req.params.id));
  if (!notif || notif.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Akses ditolak.' });
  }
  await db.update('notifikasi', notif.id, { dibaca: true });
  res.json({ message: 'Notifikasi ditandai sudah dibaca.' });
});

// Mark all notifications as read
app.put('/api/notifikasi/read-all', authMiddleware, async (req, res) => {
  const notifs = await db.getWhere('notifikasi', { user_id: parseInt(req.user.id) });
  for (const n of notifs) {
    await db.update('notifikasi', n.id, { dibaca: true });
  }
  res.json({ message: 'Semua notifikasi ditandai sudah dibaca.' });
});

// =====================================================
// ADMIN ROUTES
// =====================================================

// --- Dashboard Stats ---
app.get('/api/admin/stats', authMiddleware, roleMiddleware('admin', 'owner'), async (req, res) => {
  try {
    const allJamaah = await db.getWhere('users', { role: 'jamaah' });
    const allPendaftaran = await db.getAll('pendaftaran');
    const allPembayaran = await db.getAll('pembayaran');
    const allPaket = await db.getAll('paket_umroh');
    const allKeberangkatan = await db.getAll('keberangkatan');

    const menungguVerifikasi = allPendaftaran.filter(p => p.status === 'Menunggu Verifikasi');
    const totalPendapatan = allPembayaran.filter(p => p.status === 'Terverifikasi').reduce((s, p) => s + (parseInt(p.jumlah) || 0), 0);
    const belumLunas = allPendaftaran.filter(p => {
      const bayar = allPembayaran.filter(b => b.pendaftaran_id === p.id && b.status === 'Terverifikasi').reduce((s, b) => s + (parseInt(b.jumlah) || 0), 0);
      const paket = allPaket.find(pk => pk.id === p.paket_id);
      return paket && bayar < paket.harga;
    });

    const totalKuota = allKeberangkatan.reduce((s, k) => s + (parseInt(k.kuota) || 0), 0);
    const totalTerisi = allKeberangkatan.reduce((s, k) => s + (parseInt(k.terisi) || 0), 0);

    // Monthly registration stats (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const count = allPendaftaran.filter(p => p.created_at && p.created_at.startsWith(monthKey)).length;
      const revenue = allPembayaran.filter(p => p.status === 'Terverifikasi' && p.created_at && p.created_at.startsWith(monthKey)).reduce((s, p) => s + (parseInt(p.jumlah) || 0), 0);
      monthlyStats.push({ bulan: monthKey, jamaah: count, pendapatan: revenue });
    }

    // Package popularity
    const paketStats = allPaket.map(p => ({
      nama: p.nama,
      total: allPendaftaran.filter(pd => pd.paket_id === p.id).length
    }));

    res.json({
      totalJamaah: allJamaah.length,
      jamaahBaru: allJamaah.filter(j => {
        const d = new Date(j.created_at);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
      totalPendaftaran: allPendaftaran.length,
      menungguVerifikasi: menungguVerifikasi.length,
      totalPaket: allPaket.filter(p => p.status === 'active').length,
      totalKeberangkatan: allKeberangkatan.length,
      totalKuota,
      totalTerisi,
      kuotaTersisa: totalKuota - totalTerisi,
      totalPendapatan,
      belumLunas: belumLunas.length,
      monthlyStats,
      paketStats
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat statistik.', detail: err.message });
  }
});

// --- Paket CRUD ---
app.get('/api/admin/paket', authMiddleware, roleMiddleware('admin', 'owner'), async (req, res) => {
  res.json(await db.getAll('paket_umroh'));
});

app.post('/api/admin/paket', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const data = { ...req.body, harga: parseInt(req.body.harga), durasi_hari: parseInt(req.body.durasi_hari) };
  const paket = await db.insert('paket_umroh', data);
  await logActivity(req.user.id, req.user.nama, 'Menambahkan paket', `Menambahkan ${req.body.nama}`, 'paket_umroh', paket.id);
  res.status(201).json({ message: 'Paket berhasil ditambahkan.', data: paket });
});

app.put('/api/admin/paket/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const data = { ...req.body };
  if (data.harga) data.harga = parseInt(data.harga);
  if (data.durasi_hari) data.durasi_hari = parseInt(data.durasi_hari);
  const updated = await db.update('paket_umroh', parseInt(req.params.id), data);
  if (!updated) return res.status(404).json({ error: 'Paket tidak ditemukan.' });
  await logActivity(req.user.id, req.user.nama, 'Mengubah paket', `Mengubah ${updated.nama}`, 'paket_umroh', updated.id);
  res.json({ message: 'Paket berhasil diperbarui.', data: updated });
});

app.delete('/api/admin/paket/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const paket = await db.getById('paket_umroh', parseInt(req.params.id));
  if (!paket) return res.status(404).json({ error: 'Paket tidak ditemukan.' });
  await db.delete('paket_umroh', parseInt(req.params.id));
  await logActivity(req.user.id, req.user.nama, 'Menghapus paket', `Menghapus ${paket.nama}`, 'paket_umroh', paket.id);
  res.json({ message: 'Paket berhasil dihapus.' });
});

// --- Keberangkatan CRUD ---
app.get('/api/admin/keberangkatan', authMiddleware, roleMiddleware('admin', 'owner'), async (req, res) => {
  const departures = await db.getAll('keberangkatan');
  const result = await Promise.all(departures.map(async k => {
    const paket = await db.getById('paket_umroh', k.paket_id);
    return { ...k, paket_nama: paket ? paket.nama : '-' };
  }));
  res.json(result);
});

app.post('/api/admin/keberangkatan', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const data = { ...req.body, paket_id: parseInt(req.body.paket_id), kuota: parseInt(req.body.kuota), terisi: parseInt(req.body.terisi || 0) };
  const k = await db.insert('keberangkatan', data);
  await logActivity(req.user.id, req.user.nama, 'Menambahkan jadwal', `Jadwal keberangkatan ${data.tanggal_berangkat}`, 'keberangkatan', k.id);
  res.status(201).json({ message: 'Jadwal berhasil ditambahkan.', data: k });
});

app.put('/api/admin/keberangkatan/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const data = { ...req.body };
  if (data.paket_id) data.paket_id = parseInt(data.paket_id);
  if (data.kuota) data.kuota = parseInt(data.kuota);
  if (data.terisi !== undefined) data.terisi = parseInt(data.terisi);
  const updated = await db.update('keberangkatan', parseInt(req.params.id), data);
  if (!updated) return res.status(404).json({ error: 'Jadwal tidak ditemukan.' });
  await logActivity(req.user.id, req.user.nama, 'Mengubah jadwal', `Mengubah jadwal ${updated.tanggal_berangkat}`, 'keberangkatan', updated.id);
  res.json({ message: 'Jadwal berhasil diperbarui.', data: updated });
});

app.delete('/api/admin/keberangkatan/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const k = await db.getById('keberangkatan', parseInt(req.params.id));
  await db.delete('keberangkatan', parseInt(req.params.id));
  await logActivity(req.user.id, req.user.nama, 'Menghapus jadwal', `Menghapus jadwal ${k?.tanggal_berangkat}`, 'keberangkatan', parseInt(req.params.id));
  res.json({ message: 'Jadwal berhasil dihapus.' });
});

// --- Jamaah / Pendaftaran Management ---
app.get('/api/admin/jamaah', authMiddleware, roleMiddleware('admin', 'owner'), async (req, res) => {
  const allPendaftaran = await db.getAll('pendaftaran');
  const result = await Promise.all(allPendaftaran.map(async p => {
    const user = await db.getById('users', p.user_id);
    const paket = await db.getById('paket_umroh', p.paket_id);
    const keberangkatan = await db.getById('keberangkatan', p.keberangkatan_id);
    const dokumen = await db.getWhere('dokumen_jamaah', { pendaftaran_id: p.id });
    const pembayaran = await db.getWhere('pembayaran', { pendaftaran_id: p.id });
    const totalBayar = pembayaran.filter(b => b.status === 'Terverifikasi').reduce((s, b) => s + (parseInt(b.jumlah) || 0), 0);
    const totalPendingBayar = pembayaran.filter(b => b.status === 'Menunggu Verifikasi').reduce((s, b) => s + (parseInt(b.jumlah) || 0), 0);
    const dokumenLengkap = dokumen.length >= 4 && dokumen.every(d => d.status === 'Valid');

    return {
      ...p,
      user_email: user ? user.email : '-',
      paket_nama: paket ? paket.nama : '-',
      paket_harga: paket ? paket.harga : 0,
      tanggal_berangkat: keberangkatan ? keberangkatan.tanggal_berangkat : '-',
      dokumen,
      pembayaran,
      total_bayar: totalBayar,
      total_pending_bayar: totalPendingBayar,
      sisa_bayar: paket ? Math.max(0, paket.harga - totalBayar) : 0,
      status_bayar: paket ? (totalBayar >= paket.harga ? 'Lunas' : (totalBayar > 0 || totalPendingBayar > 0) ? 'DP/Cicilan' : 'Belum Bayar') : '-',
      dokumen_lengkap: dokumenLengkap
    };
  }));
  result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  res.json(result);
});

// Get single jamaah detail
app.get('/api/admin/jamaah/:id', authMiddleware, roleMiddleware('admin', 'owner'), async (req, res) => {
  const p = await db.getById('pendaftaran', parseInt(req.params.id));
  if (!p) return res.status(404).json({ error: 'Data tidak ditemukan.' });
  const user = await db.getById('users', p.user_id);
  const paket = await db.getById('paket_umroh', p.paket_id);
  const keberangkatan = await db.getById('keberangkatan', p.keberangkatan_id);
  const dokumen = await db.getWhere('dokumen_jamaah', { pendaftaran_id: p.id });
  const pembayaran = await db.getWhere('pembayaran', { pendaftaran_id: p.id });
  const totalBayar = pembayaran.filter(b => b.status === 'Terverifikasi').reduce((s, b) => s + (parseInt(b.jumlah) || 0), 0);
  res.json({
    ...p,
    user_email: user ? user.email : '-',
    user_hp: user ? user.no_hp : '-',
    paket,
    keberangkatan,
    dokumen,
    pembayaran,
    total_bayar: totalBayar,
    sisa_bayar: paket ? paket.harga - totalBayar : 0
  });
});

// Update jamaah status
app.put('/api/admin/jamaah/:id/status', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const { status, catatan_admin } = req.body;
  const updates = { status };
  if (catatan_admin !== undefined) updates.catatan_admin = catatan_admin;
  const updated = await db.update('pendaftaran', parseInt(req.params.id), updates);
  if (!updated) return res.status(404).json({ error: 'Data tidak ditemukan.' });

  // Notify jamaah
  await createNotification(updated.user_id, 'Status Diperbarui', `Status pendaftaran Anda telah diubah menjadi: ${status}.`, 'info');
  await logActivity(req.user.id, req.user.nama, 'Mengubah status jamaah', `Status ${updated.nama_paspor} → ${status}`, 'pendaftaran', updated.id);

  res.json({ message: 'Status berhasil diperbarui.', data: updated });
});

// Verify document
app.put('/api/admin/dokumen/:id/verify', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const { status, catatan } = req.body;
  const updated = await db.update('dokumen_jamaah', parseInt(req.params.id), { status, catatan: catatan || null });
  if (!updated) return res.status(404).json({ error: 'Dokumen tidak ditemukan.' });

  // If invalid, notify jamaah
  if (status === 'Tidak Valid' || status === 'Perlu Diperbaiki') {
    const pendaftaran = await db.getById('pendaftaran', updated.pendaftaran_id);
    if (pendaftaran) {
      await createNotification(pendaftaran.user_id, 'Dokumen Perlu Diperbaiki', `Dokumen ${updated.jenis} Anda ${status.toLowerCase()}. ${catatan ? 'Catatan: ' + catatan : ''}`, 'warning');
    }
  }

  await logActivity(req.user.id, req.user.nama, 'Memverifikasi dokumen', `Dokumen ${updated.jenis} → ${status}`, 'dokumen_jamaah', updated.id);
  res.json({ message: 'Dokumen berhasil diverifikasi.', data: updated });
});

// --- Pembayaran Management ---
app.get('/api/admin/pembayaran', authMiddleware, roleMiddleware('admin', 'owner'), async (req, res) => {
  const allPembayaran = await db.getAll('pembayaran');
  const result = await Promise.all(allPembayaran.map(async p => {
    const pendaftaran = await db.getById('pendaftaran', p.pendaftaran_id);
    const paket = pendaftaran ? await db.getById('paket_umroh', pendaftaran.paket_id) : null;
    const allPendaftarPayments = pendaftaran ? await db.getWhere('pembayaran', { pendaftaran_id: pendaftaran.id }) : [];
    const totalVerified = allPendaftarPayments.filter(b => b.status === 'Terverifikasi').reduce((s, b) => s + (parseInt(b.jumlah) || 0), 0);
    const hargaPaket = paket ? paket.harga : 0;
    const sisa = Math.max(0, hargaPaket - totalVerified);

    return {
      ...p,
      nama_jamaah: pendaftaran ? pendaftaran.nama_paspor : '-',
      paket_nama: paket ? paket.nama : '-',
      paket_harga: hargaPaket,
      total_bayar: totalVerified,
      sisa_bayar: sisa
    };
  }));
  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(result);
});

app.post('/api/admin/pembayaran', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const pembayaran = await db.insert('pembayaran', {
    ...req.body,
    pendaftaran_id: parseInt(req.body.pendaftaran_id),
    jumlah: parseInt(req.body.jumlah),
    tanggal: req.body.tanggal || new Date().toISOString().split('T')[0]
  });
  await logActivity(req.user.id, req.user.nama, 'Menambahkan pembayaran', `Pembayaran ${req.body.jenis} Rp ${parseInt(req.body.jumlah).toLocaleString('id-ID')}`, 'pembayaran', pembayaran.id);
  res.status(201).json({ message: 'Pembayaran berhasil dicatat.', data: pembayaran });
});

app.put('/api/admin/pembayaran/:id/verify', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const { status } = req.body;
  const updated = await db.update('pembayaran', parseInt(req.params.id), { status });
  if (!updated) return res.status(404).json({ error: 'Pembayaran tidak ditemukan.' });

  // Notify jamaah
  const pendaftaran = await db.getById('pendaftaran', updated.pendaftaran_id);
  if (pendaftaran) {
    await createNotification(pendaftaran.user_id, 'Pembayaran Diverifikasi', `Pembayaran ${updated.jenis} sebesar Rp ${updated.jumlah.toLocaleString('id-ID')} telah ${status.toLowerCase()}.`, 'success');
  }

  await logActivity(req.user.id, req.user.nama, 'Memverifikasi pembayaran', `Pembayaran ID ${updated.id} → ${status}`, 'pembayaran', updated.id);
  res.json({ message: 'Status pembayaran berhasil diperbarui.', data: updated });
});

// --- Content Management ---
// Testimoni
app.get('/api/admin/testimoni', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json(db.getAll('testimoni'));
});

app.post('/api/admin/testimoni', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const t = db.insert('testimoni', req.body);
  logActivity(req.user.id, req.user.nama, 'Menambahkan testimoni', `Testimoni dari ${req.body.nama}`, 'testimoni', t.id);
  res.status(201).json({ message: 'Testimoni berhasil ditambahkan.', data: t });
});

app.put('/api/admin/testimoni/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const updated = db.update('testimoni', parseInt(req.params.id), req.body);
  res.json({ message: 'Testimoni berhasil diperbarui.', data: updated });
});

app.delete('/api/admin/testimoni/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
  db.delete('testimoni', parseInt(req.params.id));
  res.json({ message: 'Testimoni berhasil dihapus.' });
});

// FAQ
app.get('/api/admin/faq', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json(db.getAll('faq'));
});

app.post('/api/admin/faq', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const f = db.insert('faq', req.body);
  res.status(201).json({ message: 'FAQ berhasil ditambahkan.', data: f });
});

app.put('/api/admin/faq/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const updated = db.update('faq', parseInt(req.params.id), req.body);
  res.json({ message: 'FAQ berhasil diperbarui.', data: updated });
});

app.delete('/api/admin/faq/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
  db.delete('faq', parseInt(req.params.id));
  res.json({ message: 'FAQ berhasil dihapus.' });
});

// Promo
app.get('/api/admin/promo', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json(db.getAll('promo'));
});

app.post('/api/admin/promo', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const p = db.insert('promo', { ...req.body, potongan: parseInt(req.body.potongan) });
  res.status(201).json({ message: 'Promo berhasil ditambahkan.', data: p });
});

app.put('/api/admin/promo/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const updated = db.update('promo', parseInt(req.params.id), req.body);
  res.json({ message: 'Promo berhasil diperbarui.', data: updated });
});

// Galeri Foto Jamaah
app.get('/api/admin/galeri', authMiddleware, roleMiddleware('admin', 'owner'), async (req, res) => {
  res.json(await db.getAll('galeri'));
});

app.post('/api/admin/galeri', authMiddleware, roleMiddleware('admin'), upload.single('foto'), async (req, res) => {
  try {
    const { judul, deskripsi, tipe, url } = req.body;
    let fotoUrl = url || '';
    if (req.file) {
      fotoUrl = '/uploads/' + req.file.filename;
    }
    if (!judul || (!fotoUrl && !req.file)) {
      return res.status(400).json({ error: 'Judul/caption dan foto (file atau URL) wajib diisi.' });
    }
    const item = await db.insert('galeri', {
      judul,
      deskripsi: deskripsi || '',
      tipe: tipe || 'foto',
      url: fotoUrl,
      created_at: new Date().toISOString()
    });
    await logActivity(req.user.id, req.user.nama, 'Menambahkan foto galeri', `Menambahkan foto: ${judul}`, 'galeri', item.id);
    res.status(201).json({ message: 'Foto galeri berhasil ditambahkan.', data: item });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambahkan foto galeri.', detail: err.message });
  }
});

app.put('/api/admin/galeri/:id', authMiddleware, roleMiddleware('admin'), upload.single('foto'), async (req, res) => {
  try {
    const { judul, deskripsi, tipe, url } = req.body;
    const existing = await db.getById('galeri', parseInt(req.params.id));
    if (!existing) return res.status(404).json({ error: 'Foto galeri tidak ditemukan.' });

    let fotoUrl = existing.url;
    if (req.file) {
      fotoUrl = '/uploads/' + req.file.filename;
    } else if (url !== undefined && url !== '') {
      fotoUrl = url;
    }

    const updated = await db.update('galeri', parseInt(req.params.id), {
      judul: judul || existing.judul,
      deskripsi: deskripsi !== undefined ? deskripsi : existing.deskripsi,
      tipe: tipe || existing.tipe,
      url: fotoUrl,
      updated_at: new Date().toISOString()
    });
    await logActivity(req.user.id, req.user.nama, 'Mengubah foto galeri', `Mengubah foto: ${updated.judul}`, 'galeri', updated.id);
    res.json({ message: 'Foto galeri berhasil diperbarui.', data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui foto galeri.', detail: err.message });
  }
});

app.delete('/api/admin/galeri/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const existing = await db.getById('galeri', parseInt(req.params.id));
    if (!existing) return res.status(404).json({ error: 'Foto galeri tidak ditemukan.' });
    await db.delete('galeri', parseInt(req.params.id));
    await logActivity(req.user.id, req.user.nama, 'Menghapus foto galeri', `Menghapus foto: ${existing.judul}`, 'galeri', existing.id);
    res.json({ message: 'Foto galeri berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus foto galeri.', detail: err.message });
  }
});


// Kontak
app.put('/api/admin/kontak', authMiddleware, roleMiddleware('admin'), (req, res) => {
  const existing = db.getAll('kontak');
  if (existing.length > 0) {
    const updated = db.update('kontak', existing[0].id, req.body);
    res.json({ message: 'Kontak berhasil diperbarui.', data: updated });
  } else {
    const k = db.insert('kontak', req.body);
    res.json({ message: 'Kontak berhasil ditambahkan.', data: k });
  }
  logActivity(req.user.id, req.user.nama, 'Mengubah kontak', 'Memperbarui informasi kontak', 'kontak', null);
});

// =====================================================
// OWNER ROUTES
// =====================================================

// Activity log
app.get('/api/owner/activity-log', authMiddleware, roleMiddleware('owner', 'admin'), async (req, res) => {
  const rawLogs = await db.getAll('activity_logs');
  const logs = Array.isArray(rawLogs) ? [...rawLogs] : [];
  logs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  res.json(logs);
});

// =====================================================
// EXPORT ROUTES (CSV/PDF data)
// =====================================================

app.get('/api/export/jamaah', authMiddleware, roleMiddleware('admin', 'owner'), (req, res) => {
  const allPendaftaran = db.getAll('pendaftaran');
  const data = allPendaftaran.map(p => {
    const paket = db.getById('paket_umroh', p.paket_id);
    const pembayaran = db.getWhere('pembayaran', { pendaftaran_id: p.id });
    const totalBayar = pembayaran.filter(b => b.status === 'Terverifikasi').reduce((s, b) => s + b.jumlah, 0);
    return {
      id: p.id,
      nama: p.nama_paspor,
      nik: p.nik,
      no_paspor: p.no_paspor,
      paket: paket ? paket.nama : '-',
      harga: paket ? paket.harga : 0,
      total_bayar: totalBayar,
      sisa: paket ? paket.harga - totalBayar : 0,
      status: p.status,
      tanggal_daftar: p.created_at
    };
  });
  res.json(data);
});

app.get('/api/export/pembayaran', authMiddleware, roleMiddleware('admin', 'owner'), (req, res) => {
  const allPembayaran = db.getAll('pembayaran').map(p => {
    const pendaftaran = db.getById('pendaftaran', p.pendaftaran_id);
    return { ...p, nama_jamaah: pendaftaran ? pendaftaran.nama_paspor : '-' };
  });
  res.json(allPembayaran);
});

// =====================================================
// SERVE FRONTEND (production)
// =====================================================
app.use(express.static(join(__dirname, '..', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║    🕋  ALMARWA TOUR & TRAVEL - API Server  🕋     ║');
  console.log('║       Umroh & Haji Plus - Melayani Sepenuh Hati   ║');
  console.log('╠═══════════════════════════════════════════════════╣');
  console.log(`║    Server running on http://localhost:${PORT}        ║`);
  console.log('║                                                   ║');
  console.log('║    Demo Accounts:                                 ║');
  console.log('║    Admin:  admin@almarwa.com / admin123           ║');
  console.log('║    Owner:  owner@almarwa.com / owner123           ║');
  console.log('║    Jamaah: jamaah@almarwa.com / jamaah123         ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('');
});

export default app;
