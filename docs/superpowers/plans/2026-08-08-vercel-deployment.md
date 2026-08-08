# Vercel Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Vercel deployment routing and migrate local file uploads to Supabase Storage.

**Architecture:** A `vercel.json` configuration file will route API traffic to the Express backend. The backend will be modified to use `multer.memoryStorage()` and upload files directly to a Supabase bucket via `@supabase/supabase-js`.

**Tech Stack:** Express, Vite, Supabase JS Client, Vercel

## Global Constraints

- Vercel serverless environment is read-only (no local disk writes).
- Supabase storage bucket name is `uploads`.

---

### Task 1: Vercel Configuration

**Files:**
- Create: `vercel.json`

**Interfaces:**
- Consumes: N/A
- Produces: Configuration file for Vercel deployment.

- [ ] **Step 1: Write Vercel Configuration**

```json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build" },
    { "src": "server/index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server/index.js" },
    { "src": "/uploads/(.*)", "dest": "/server/index.js" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "chore: add vercel configuration for express backend"
```

---

### Task 2: Supabase Storage Adapter

**Files:**
- Modify: `server/db_supabase.js`

**Interfaces:**
- Consumes: `@supabase/supabase-js` client
- Produces: `uploadFile(bucket, path, buffer, mimetype)` returning the public URL.

- [ ] **Step 1: Write the implementation**

Update `server/db_supabase.js` to add the `uploadFile` method to the `SupabaseDBAdapter` class.

```javascript
  async uploadFile(bucket, filePath, fileBuffer, mimeType) {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });
      
      if (error) {
        console.error('Supabase upload error:', error.message);
        throw new Error(error.message);
      }
      
      const { data: publicUrlData } = this.client.storage
        .from(bucket)
        .getPublicUrl(filePath);
        
      return publicUrlData.publicUrl;
    } catch (e) {
      console.error('Supabase upload Exception:', e.message);
      throw e;
    }
  }
```

- [ ] **Step 2: Commit**

```bash
git add server/db_supabase.js
git commit -m "feat: add uploadFile method to supabase adapter"
```

---

### Task 3: Refactor Upload Routes in Express

**Files:**
- Modify: `server/index.js`

**Interfaces:**
- Consumes: `supabaseAdapter.uploadFile` from Task 2.
- Produces: Updated `/api/jamaah/dokumen`, `/api/jamaah/pembayaran`, and `/api/admin/galeri` endpoints.

- [ ] **Step 1: Update Multer Configuration**

In `server/index.js`, replace `multer.diskStorage` with `multer.memoryStorage()`.

```javascript
// Replace storage definition
const storage = multer.memoryStorage();
```
(Remove the `const uploadsDir` and `mkdirSync` lines as they are no longer used).

- [ ] **Step 2: Update `/api/jamaah/dokumen` endpoint**

In `server/index.js`, modify the `/api/jamaah/dokumen` route to upload the buffer to Supabase.

```javascript
app.post('/api/jamaah/dokumen', authMiddleware, roleMiddleware('jamaah'), upload.single('file'), async (req, res) => {
  try {
    const { pendaftaran_id, jenis } = req.body;
    if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan.' });

    // Verify ownership
    const pendaftaran = await db.getById('pendaftaran', parseInt(pendaftaran_id));
    if (!pendaftaran || pendaftaran.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Akses ditolak.' });
    }
    
    // Upload to Supabase Storage
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `dokumen/${pendaftaran_id}/${uniqueSuffix}${extname(req.file.originalname)}`;
    const publicUrl = await supabaseAdapter.uploadFile('uploads', fileName, req.file.buffer, req.file.mimetype);

    // Check if doc already exists, update it
    const existingRaw = await db.getWhere('dokumen_jamaah', { pendaftaran_id: parseInt(pendaftaran_id), jenis });
    const existing = Array.isArray(existingRaw) ? existingRaw : [];
    if (existing.length > 0) {
      await db.update('dokumen_jamaah', existing[0].id, {
        file_path: publicUrl,
        status: 'Belum Diperiksa'
      });
    } else {
      await db.insert('dokumen_jamaah', {
        pendaftaran_id: parseInt(pendaftaran_id),
        jenis,
        file_path: publicUrl,
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
```

- [ ] **Step 3: Update `/api/jamaah/pembayaran` endpoint**

Modify the `/api/jamaah/pembayaran` route.

```javascript
app.post('/api/jamaah/pembayaran', authMiddleware, roleMiddleware('jamaah'), upload.single('bukti'), async (req, res) => {
  try {
    const { pendaftaran_id, jenis, jumlah, catatan } = req.body;

    const pendaftaran = await db.getById('pendaftaran', parseInt(pendaftaran_id));
    if (!pendaftaran || pendaftaran.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Akses ditolak.' });
    }

    let publicUrl = null;
    if (req.file) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = `pembayaran/${pendaftaran_id}/${uniqueSuffix}${extname(req.file.originalname)}`;
      publicUrl = await supabaseAdapter.uploadFile('uploads', fileName, req.file.buffer, req.file.mimetype);
    }

    const pembayaran = await db.insert('pembayaran', {
      pendaftaran_id: parseInt(pendaftaran_id),
      jenis,
      jumlah: parseInt(jumlah),
      tanggal: new Date().toISOString().split('T')[0],
      bukti: publicUrl,
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
```

- [ ] **Step 4: Update `/api/admin/galeri` endpoints**

Modify the POST and PUT gallery routes to upload to Supabase.

```javascript
app.post('/api/admin/galeri', authMiddleware, roleMiddleware('admin'), upload.single('foto'), async (req, res) => {
  try {
    const { judul, deskripsi, tipe, url } = req.body;
    let fotoUrl = url || '';
    
    if (req.file) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = `galeri/${uniqueSuffix}${extname(req.file.originalname)}`;
      fotoUrl = await supabaseAdapter.uploadFile('uploads', fileName, req.file.buffer, req.file.mimetype);
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
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = `galeri/${uniqueSuffix}${extname(req.file.originalname)}`;
      fotoUrl = await supabaseAdapter.uploadFile('uploads', fileName, req.file.buffer, req.file.mimetype);
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
```

- [ ] **Step 5: Conditional Express Listen**

At the bottom of `server/index.js`, wrap the `app.listen()` to prevent EADDRINUSE on Vercel.

```javascript
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════╗');
    // ... rest of the logs
    console.log('');
  });
}

export default app;
```

- [ ] **Step 6: Commit**

```bash
git add server/index.js
git commit -m "refactor: migrate multer disk uploads to supabase storage and configure vercel listen"
```
