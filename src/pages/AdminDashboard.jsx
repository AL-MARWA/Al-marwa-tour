/* ============================================================
   ALMARWA TOUR TRAVEL - Admin Dashboard
   ============================================================ */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, useToast, apiFetch, formatRupiah, formatDate, formatDateShort } from '../App';
import { AlmarwaLogo } from './LandingPage';
import {
  LayoutDashboard, Users, Package, CalendarDays, FileText, CreditCard, Image, MessageSquare,
  HelpCircle, Bell, Settings, LogOut, Menu, X, Plus, Edit, Trash2, Eye, Check, XCircle,
  Search, Filter, Download, ChevronDown, ChevronRight, AlertCircle, CheckCircle, Clock, TrendingUp,
  Home, Megaphone, ClipboardList, RefreshCw, Star, FileCheck, UserCheck, BarChart3, Printer, FileSpreadsheet
} from 'lucide-react';

// ===== Sidebar =====
function AdminSidebar({ activeMenu, setActiveMenu, onClose }) {
  const { user, logout, navigate } = useAuth();
  const items = [
    { section: 'Utama' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jamaah', label: 'Data Jamaah', icon: Users },
    { id: 'paket', label: 'Paket Umroh', icon: Package },
    { id: 'keberangkatan', label: 'Jadwal Keberangkatan', icon: CalendarDays },
    { section: 'Operasional' },
    { id: 'dokumen', label: 'Dokumen Jamaah', icon: FileCheck },
    { id: 'pembayaran', label: 'Pembayaran', icon: CreditCard },
    { section: 'Konten' },
    { id: 'galeri', label: 'Galeri Foto Jamaah', icon: Image },
    { id: 'testimoni', label: 'Testimoni', icon: MessageSquare },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'promo', label: 'Promo', icon: Megaphone },
    { section: 'Sistem' },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
    { id: 'activity', label: 'Activity Log', icon: ClipboardList },
  ];

  return (
    <aside className="sidebar scrollbar-pink">
      <div className="p-5 border-b border-white/10">
        <AlmarwaLogo light size="md" />
        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Admin Panel</p>
      </div>
      <div className="px-4 py-3">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-white/90 text-sm font-semibold truncate">{user?.nama}</p>
          <p className="text-white/50 text-xs">Administrator</p>
        </div>
      </div>
      <nav className="flex-1 pb-4 overflow-y-auto">
        {items.map((item, i) => item.section ? (
          <div key={i} className="sidebar-section">{item.section}</div>
        ) : (
          <button key={item.id} onClick={() => { setActiveMenu(item.id); onClose?.(); }}
            className={`sidebar-link w-full text-left ${activeMenu === item.id ? 'active' : ''}`}>
            <item.icon size={18} /> {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-1">
        <button onClick={() => navigate('landing')} className="sidebar-link w-full text-left"><Home size={18} /> Beranda</button>
        <button onClick={logout} className="sidebar-link w-full text-left hover:!bg-red-500/20"><LogOut size={18} /> Logout</button>
      </div>
    </aside>
  );
}

// ===== Modal =====
function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${maxWidth}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-almarwa-50">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [jamaahList, setJamaahList] = useState([]);
  const [paketList, setPaketList] = useState([]);
  const [keberangkatanList, setKeberangkatanList] = useState([]);
  const [pembayaranList, setPembayaranList] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [testimoniList, setTestimoniList] = useState([]);
  const [faqList, setFaqList] = useState([]);
  const [promoList, setPromoList] = useState([]);
  const [galeriList, setGaleriList] = useState([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaket, setFilterPaket] = useState('');

  // Modal states
  const [modal, setModal] = useState({ type: null, data: null });

  const loadAll = useCallback(async () => {
    try {
      const [s, j, p, k, pay, n, a, t, f, pr, g] = await Promise.all([
        apiFetch('/admin/stats'),
        apiFetch('/admin/jamaah'),
        apiFetch('/admin/paket'),
        apiFetch('/admin/keberangkatan'),
        apiFetch('/admin/pembayaran'),
        apiFetch('/notifikasi'),
        apiFetch('/owner/activity-log'),
        apiFetch('/admin/testimoni').catch(() => []),
        apiFetch('/admin/faq').catch(() => []),
        apiFetch('/admin/promo').catch(() => []),
        apiFetch('/admin/galeri').catch(() => []),
      ]);
      setStats(s || {});
      setJamaahList(j || []);
      setPaketList(p || []);
      setKeberangkatanList(k || []);
      setPembayaranList(pay || []);
      setNotifikasi(n || []);
      setActivityLog(a || []);
      setTestimoniList(t || []);
      setFaqList(f || []);
      setPromoList(pr || []);
      setGaleriList(g || []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Filtered jamaah
  const filteredJamaah = (jamaahList || []).filter(j => {
    if (searchQuery && !j.nama_paspor.toLowerCase().includes(searchQuery.toLowerCase()) && !j.nik?.includes(searchQuery)) return false;
    if (filterStatus && j.status !== filterStatus) return false;
    if (filterPaket && j.paket_nama !== filterPaket) return false;
    return true;
  });

  // CRUD Handlers
  const handleSavePaket = async (formData, editId) => {
    try {
      if (editId) {
        await apiFetch(`/admin/paket/${editId}`, { method: 'PUT', body: JSON.stringify(formData) });
        showToast('Paket berhasil diperbarui.');
      } else {
        await apiFetch('/admin/paket', { method: 'POST', body: JSON.stringify(formData) });
        showToast('Paket berhasil ditambahkan.');
      }
      setModal({ type: null }); loadAll();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeletePaket = async (id) => {
    if (!confirm('Hapus paket ini?')) return;
    try {
      await apiFetch(`/admin/paket/${id}`, { method: 'DELETE' });
      showToast('Paket berhasil dihapus.');
      loadAll();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleSaveKeberangkatan = async (formData, editId) => {
    try {
      if (editId) {
        await apiFetch(`/admin/keberangkatan/${editId}`, { method: 'PUT', body: JSON.stringify(formData) });
        showToast('Jadwal berhasil diperbarui.');
      } else {
        await apiFetch('/admin/keberangkatan', { method: 'POST', body: JSON.stringify(formData) });
        showToast('Jadwal berhasil ditambahkan.');
      }
      setModal({ type: null }); loadAll();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeleteKeberangkatan = async (id) => {
    if (!confirm('Hapus jadwal keberangkatan ini?')) return;
    try {
      await apiFetch(`/admin/keberangkatan/${id}`, { method: 'DELETE' });
      showToast('Jadwal keberangkatan berhasil dihapus.');
      loadAll();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleUpdateJamaahStatus = async (id, status, catatan) => {
    try {
      await apiFetch(`/admin/jamaah/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, catatan_admin: catatan }) });
      showToast('Status jamaah berhasil diperbarui.');
      loadAll();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleVerifyDoc = async (docId, status, catatan) => {
    try {
      await apiFetch(`/admin/dokumen/${docId}/verify`, { method: 'PUT', body: JSON.stringify({ status, catatan }) });
      showToast('Dokumen berhasil diverifikasi.');
      loadAll();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleVerifyPayment = async (payId, status) => {
    try {
      await apiFetch(`/admin/pembayaran/${payId}/verify`, { method: 'PUT', body: JSON.stringify({ status }) });
      showToast('Status pembayaran berhasil diperbarui.');
      loadAll();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const unreadNotif = notifikasi.filter(n => !n.dibaca).length;

  // ===== Smart Notification Click & Navigation Handler =====
  const handleNotificationClick = async (n) => {
    try {
      if (!n.dibaca) {
        await apiFetch(`/notifikasi/${n.id}/read`, { method: 'PUT' });
        loadAll();
      }
    } catch(e) {}

    const lowerJudul = (n.judul || '').toLowerCase();
    const lowerPesan = (n.pesan || '').toLowerCase();

    // Find matching jamaah if mentioned in notification message
    const matchedJamaah = jamaahList.find(j => 
      j.nama_paspor && lowerPesan.includes(j.nama_paspor.toLowerCase())
    );

    if (lowerJudul.includes('dokumen') || lowerPesan.includes('dokumen') || lowerPesan.includes('upload') || lowerPesan.includes('ktp') || lowerPesan.includes('paspor')) {
      setActiveMenu('dokumen');
      if (matchedJamaah) {
        setSearchQuery(matchedJamaah.nama_paspor);
        showToast(`Membuka Dokumen untuk ${matchedJamaah.nama_paspor}`);
      } else {
        showToast('Membuka menu Dokumen Jamaah');
      }
    } else if (lowerJudul.includes('pembayaran') || lowerPesan.includes('pembayaran') || lowerPesan.includes('dp') || lowerPesan.includes('lunas') || lowerPesan.includes('bayar')) {
      setActiveMenu('pembayaran');
      if (matchedJamaah) {
        setSearchQuery(matchedJamaah.nama_paspor);
        showToast(`Membuka Pembayaran untuk ${matchedJamaah.nama_paspor}`);
      } else {
        showToast('Membuka menu Pembayaran');
      }
    } else if (lowerJudul.includes('pendaftaran') || lowerJudul.includes('jamaah') || lowerPesan.includes('mendaftar') || lowerPesan.includes('jamaah baru')) {
      setActiveMenu('jamaah');
      if (matchedJamaah) {
        setModal({ type: 'jamaah-detail', data: matchedJamaah });
        showToast(`Membuka Detail Pendaftaran ${matchedJamaah.nama_paspor}`);
      } else {
        showToast('Membuka menu Data Jamaah');
      }
    } else if (lowerJudul.includes('jadwal') || lowerJudul.includes('keberangkatan') || lowerPesan.includes('keberangkatan')) {
      setActiveMenu('keberangkatan');
      showToast('Membuka menu Jadwal Keberangkatan');
    } else if (lowerJudul.includes('paket') || lowerPesan.includes('paket')) {
      setActiveMenu('paket');
      showToast('Membuka menu Paket Umroh');
    } else if (lowerJudul.includes('promo') || lowerPesan.includes('promo')) {
      setActiveMenu('promo');
      showToast('Membuka menu Promo');
    } else if (lowerJudul.includes('faq') || lowerPesan.includes('faq')) {
      setActiveMenu('faq');
      showToast('Membuka menu FAQ');
    } else {
      setActiveMenu('notifikasi');
    }
  };

  // CSV export
  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  };

  // ===== High Aesthetic PDF Export Generator =====
  const exportJamaahPDF = (jamaahInput, isSingle = false) => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      showToast('Mohon izinkan pop-up window browser Anda untuk membuka PDF.', 'warning');
      return;
    }

    const todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const isBatch = Array.isArray(jamaahInput);
    const jamaahList = isBatch ? jamaahInput : [jamaahInput];

    let contentHtml = '';

    if (!isSingle) {
      // ===== BATCH REKAP PDF =====
      contentHtml = `
        <div class="header-container">
          <div class="brand-row">
            <div class="logo-box">
              <img src="/logo.png" alt="Almarwa Logo" class="logo-img" onerror="this.style.display='none';" />
              <div class="logo-text">
                <div class="brand-title">AL-MARWA</div>
                <div class="brand-sub">TOUR & TRAVEL</div>
              </div>
            </div>
            <div class="header-info">
              <div class="company-name">PT. ALMARWA TOUR & TRAVEL</div>
              <div class="company-desc">Izin Kemenag RI PPIU No. 1234/2020 • Biro Perjalanan Umroh & Haji Plus</div>
              <div class="company-contact">Jl. KH. Ahmad Dahlan No. 123, Jakarta Selatan | WA: +62 812-3456-7890 | info@almarwatour.com</div>
            </div>
          </div>
          <div class="gold-divider"></div>
          <div class="bismillah">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
        </div>

        <div class="doc-title-box">
          <div class="doc-title">LAPORAN DOKUMEN & BIODATA LENGKAP JAMAAH UMROH</div>
          <div class="doc-meta">Tanggal Cetak: ${todayStr} | Total Data: ${jamaahList.length} Jamaah</div>
        </div>

        <div class="stats-row">
          <div class="stat-box"><span class="stat-val">${jamaahList.length}</span><span class="stat-lbl">Total Jamaah</span></div>
          <div class="stat-box"><span class="stat-val">${jamaahList.filter(j => j.status === 'Data Diverifikasi' || j.status === 'Terdaftar' || j.status === 'Selesai').length}</span><span class="stat-lbl">Diverifikasi</span></div>
          <div class="stat-box"><span class="stat-val">${jamaahList.filter(j => j.status_bayar === 'Lunas').length}</span><span class="stat-lbl">Lunas</span></div>
          <div class="stat-box"><span class="stat-val">${jamaahList.filter(j => j.dokumen_lengkap).length}</span><span class="stat-lbl">Dokumen Lengkap</span></div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 25px;">NO</th>
              <th>NAMA PASPOR & NIK</th>
              <th>NO. PASPOR</th>
              <th>PAKET & TGL</th>
              <th>TTL & GENDER</th>
              <th>ALAMAT & KOTA</th>
              <th>KONTAK / HP</th>
              <th>STATUS DATA</th>
              <th>STATUS BAYAR</th>
              <th>DOKUMEN</th>
            </tr>
          </thead>
          <tbody>
            ${jamaahList.map((j, idx) => `
              <tr>
                <td class="text-center font-mono">${idx + 1}</td>
                <td>
                  <strong class="name-text">${j.nama_paspor || '-'}</strong><br/>
                  <span class="sub-info font-mono">NIK: ${j.nik || '-'}</span>
                </td>
                <td class="font-mono text-center"><strong>${j.no_paspor || '-'}</strong></td>
                <td>
                  <strong class="pkg-text">${j.paket_nama || '-'}</strong><br/>
                  <span class="sub-info">Ref: #${j.id}</span>
                </td>
                <td>
                  ${j.tempat_lahir || '-'}, ${j.tanggal_lahir ? formatDateShort(j.tanggal_lahir) : '-'}<br/>
                  <span class="sub-info">${j.jenis_kelamin || '-'}</span>
                </td>
                <td>
                  <span class="sub-info">${j.alamat || '-'}</span><br/>
                  <span class="sub-info">${j.kota || ''} ${j.provinsi || ''}</span>
                </td>
                <td>
                  <span class="font-mono sub-info">${j.hp_darurat || j.no_hp || '-'}</span>
                </td>
                <td class="text-center">
                  <span class="badge ${j.status === 'Data Diverifikasi' || j.status === 'Selesai' ? 'b-green' : j.status === 'Menunggu Verifikasi' ? 'b-yellow' : 'b-pink'}">${j.status || '-'}</span>
                </td>
                <td class="text-center">
                  <span class="badge ${j.status_bayar === 'Lunas' ? 'b-green' : 'b-pink'}">${j.status_bayar || 'Belum Bayar'}</span><br/>
                  <span class="sub-info" style="font-size:8px;">Terbayar: ${formatRupiah(j.total_bayar)}</span>
                </td>
                <td class="text-center">
                  <span class="badge ${j.dokumen_lengkap ? 'b-green' : 'b-yellow'}">${j.dokumen_lengkap ? 'Lengkap' : 'Belum'}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer-sign-block">
          <div class="sign-box">
            <p>Dicetak Pada: ${todayStr}</p>
            <p>Petugas Verifikasi Data Jamaah,</p>
            <div class="sign-space"></div>
            <p class="sign-name">Staff Admin Almarwa Tour</p>
            <p class="sign-role">PT. Almarwa Tour & Travel</p>
          </div>
          <div class="sign-box">
            <p>Mengetahui & Menyetujui,</p>
            <p>Pimpinan Operasional,</p>
            <div class="sign-space"></div>
            <p class="sign-name">H. Owner Almarwa, S.Ag</p>
            <p class="sign-role">Direktur Utama</p>
          </div>
        </div>
      `;
    } else {
      // ===== SINGLE JAMAAH BIODATA FORM PDF =====
      const j = jamaahList[0];
      contentHtml = `
        <div class="header-container">
          <div class="brand-row">
            <div class="logo-box">
              <img src="/logo.png" alt="Almarwa Logo" class="logo-img" onerror="this.style.display='none';" />
              <div class="logo-text">
                <div class="brand-title">AL-MARWA</div>
                <div class="brand-sub">TOUR & TRAVEL</div>
              </div>
            </div>
            <div class="header-info">
              <div class="company-name">PT. ALMARWA TOUR & TRAVEL</div>
              <div class="company-desc">Izin Kemenag RI PPIU No. 1234/2020 • Penyelenggara Umroh & Haji Plus</div>
              <div class="company-contact">Jl. KH. Ahmad Dahlan No. 123, Jakarta Selatan | WA: +62 812-3456-7890 | info@almarwatour.com</div>
            </div>
          </div>
          <div class="gold-divider"></div>
          <div class="bismillah">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
        </div>

        <div class="doc-title-box">
          <div class="doc-title">FORMULIR BIODATA DOKUMEN RESMI JAMAAH UMROH</div>
          <div class="doc-meta">No. Registrasi: #ALM-${String(j.id).padStart(5, '0')} | Tanggal Cetak: ${todayStr}</div>
        </div>

        <div class="sec-card">
          <div class="sec-title">1. DATA PRIBADI & IDENTITAS JAMAAH</div>
          <table class="grid-table">
            <tr>
              <td class="lbl">Nama Lengkap (Sesuai Paspor)</td>
              <td class="val highlight">${j.nama_paspor || '-'}</td>
              <td class="lbl">NIK / No. KTP</td>
              <td class="val font-mono">${j.nik || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">No. Kartu Keluarga (KK)</td>
              <td class="val font-mono">${j.no_kk || '-'}</td>
              <td class="lbl">No. Paspor</td>
              <td class="val font-mono highlight">${j.no_paspor || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Tempat & Tanggal Lahir</td>
              <td class="val">${j.tempat_lahir || '-'}, ${j.tanggal_lahir ? formatDate(j.tanggal_lahir) : '-'}</td>
              <td class="lbl">Jenis Kelamin</td>
              <td class="val">${j.jenis_kelamin || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Status Perkawinan</td>
              <td class="val">${j.status_nikah || '-'}</td>
              <td class="lbl">Pekerjaan</td>
              <td class="val">${j.pekerjaan || '-'}</td>
            </tr>
          </table>
        </div>

        <div class="sec-card">
          <div class="sec-title">2. ALAMAT LENGKAP & DOMISILI</div>
          <table class="grid-table">
            <tr>
              <td class="lbl">Alamat Jalan / RT RW</td>
              <td class="val" colspan="3">${j.alamat || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Kelurahan</td>
              <td class="val">${j.kelurahan || '-'}</td>
              <td class="lbl">Kecamatan</td>
              <td class="val">${j.kecamatan || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Kota / Kabupaten</td>
              <td class="val">${j.kota || '-'}</td>
              <td class="lbl">Provinsi</td>
              <td class="val">${j.provinsi || '-'}</td>
            </tr>
          </table>
        </div>

        <div class="sec-card">
          <div class="sec-title">3. KONTAK EMERGENSI / KELUARGA DARURAT</div>
          <table class="grid-table">
            <tr>
              <td class="lbl">Nama Kontak Darurat</td>
              <td class="val">${j.nama_darurat || '-'}</td>
              <td class="lbl">Hubungan Keluarga</td>
              <td class="val">${j.hub_darurat || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">No. HP / WA Darurat</td>
              <td class="val font-mono" colspan="3">${j.hp_darurat || '-'}</td>
            </tr>
          </table>
        </div>

        <div class="sec-card">
          <div class="sec-title">4. PROGRAM PAKET UMROH & STATUS DOKUMEN</div>
          <table class="grid-table">
            <tr>
              <td class="lbl">Paket Umroh Dipilih</td>
              <td class="val highlight">${j.paket_nama || '-'}</td>
              <td class="lbl">Status Pendaftaran</td>
              <td class="val"><span class="badge b-green">${j.status || '-'}</span></td>
            </tr>
            <tr>
              <td class="lbl">Total Biaya Paket</td>
              <td class="val font-mono">${formatRupiah(j.total_bayar + (j.sisa_bayar || 0))}</td>
              <td class="lbl">Status Pembayaran</td>
              <td class="val"><span class="badge ${j.status_bayar === 'Lunas' ? 'b-green' : 'b-pink'}">${j.status_bayar || '-'}</span></td>
            </tr>
            <tr>
              <td class="lbl">Total Terbayar Masuk</td>
              <td class="val font-mono text-green">${formatRupiah(j.total_bayar)}</td>
              <td class="lbl">Sisa Pembayaran</td>
              <td class="val font-mono text-red">${formatRupiah(j.sisa_bayar)}</td>
            </tr>
            <tr>
              <td class="lbl">Kelengkapan Dokumen</td>
              <td class="val" colspan="3">
                <span class="badge ${j.dokumen_lengkap ? 'b-green' : 'b-yellow'}">${j.dokumen_lengkap ? 'DOKUMEN LENGKAP & VALID' : 'DOKUMEN BELUM LENGKAP'}</span>
              </td>
            </tr>
          </table>
        </div>

        <div class="sec-card">
          <div class="sec-title">5. STATUS VERIFIKASI FILE DOKUMEN PERSYARATAN</div>
          <table class="grid-table">
            <thead>
              <tr style="background:#fdf2f8;">
                <th style="padding:6px; font-size:10px; text-align:left;">JENIS DOKUMEN</th>
                <th style="padding:6px; font-size:10px; text-align:center;">STATUS VERIFIKASI</th>
                <th style="padding:6px; font-size:10px; text-align:left;">KETERANGAN ADMIN</th>
              </tr>
            </thead>
            <tbody>
              ${(j.dokumen || [
                { jenis: 'KTP', status: j.nik ? 'Valid' : 'Belum Ada' },
                { jenis: 'Paspor', status: j.no_paspor ? 'Valid' : 'Belum Ada' },
                { jenis: 'Kartu Keluarga / Akta', status: j.no_kk ? 'Valid' : 'Belum Ada' },
                { jenis: 'Pas Foto 4x6 Background Putih', status: 'Valid' },
                { jenis: 'Buku Meningitis (Buku Kuning)', status: 'Valid' }
              ]).map(d => `
                <tr>
                  <td class="val"><strong>${d.jenis}</strong></td>
                  <td class="text-center"><span class="badge ${d.status === 'Valid' ? 'b-green' : 'b-yellow'}">${d.status}</span></td>
                  <td class="val text-muted">${d.catatan || 'Diperiksa oleh sistem Almarwa'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer-sign-block">
          <div class="sign-box">
            <p>Dicetak Pada: ${todayStr}</p>
            <p>Petugas Verifikasi Data,</p>
            <div class="sign-space"></div>
            <p class="sign-name">Staff Admin Almarwa Tour</p>
            <p class="sign-role">PT. Almarwa Tour & Travel</p>
          </div>
          <div class="sign-box">
            <p>Tanda Tangan Jamaah,</p>
            <p>Menyatakan Data di atas Benar,</p>
            <div class="sign-space"></div>
            <p class="sign-name">${j.nama_paspor || 'Jamaah'}</p>
            <p class="sign-role">NIK: ${j.nik || '-'}</p>
          </div>
        </div>
      `;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan PDF Jamaah - Almarwa Tour & Travel</title>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1e1b1d;
            background: #ffffff;
            font-size: 10.5px;
            line-height: 1.4;
            padding: 15px;
          }

          /* Header Kop Surat */
          .header-container { margin-bottom: 12px; }
          .brand-row { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-bottom: 8px; }
          .logo-box { display: flex; align-items: center; gap: 10px; }
          .logo-img { height: 50px; width: auto; object-fit: contain; }
          .brand-title { font-size: 20px; font-weight: 800; color: #d81b60; letter-spacing: -0.5px; line-height: 1; }
          .brand-sub { font-size: 9px; font-weight: 700; color: #d4af37; letter-spacing: 2px; }
          .header-info { text-align: right; }
          .company-name { font-size: 13px; font-weight: 800; color: #871644; }
          .company-desc { font-size: 10px; font-weight: 600; color: #6b5b63; }
          .company-contact { font-size: 9px; color: #871644; margin-top: 2px; }
          .gold-divider { height: 3px; background: linear-gradient(90deg, #d81b60, #d4af37, #d81b60); border-radius: 2px; margin: 6px 0; }
          .bismillah { text-align: center; font-family: 'Amiri', serif; font-size: 16px; color: #d4af37; margin: 4px 0 8px 0; font-weight: bold; }

          /* Document Header Title */
          .doc-title-box { background: linear-gradient(135deg, #fff1f6, #ffe4ee); border: 1px solid #fecddf; border-radius: 8px; padding: 10px; text-align: center; margin-bottom: 12px; }
          .doc-title { font-size: 13px; font-weight: 800; color: #c2185b; letter-spacing: 0.5px; }
          .doc-meta { font-size: 9px; color: #6b5b63; font-weight: 600; margin-top: 3px; }

          /* Stats bar */
          .stats-row { display: flex; gap: 8px; margin-bottom: 12px; }
          .stat-box { flex: 1; background: #fff8fa; border: 1px solid #fecddf; border-radius: 6px; padding: 6px; text-align: center; }
          .stat-val { display: block; font-size: 13px; font-weight: 800; color: #d81b60; }
          .stat-lbl { font-size: 8px; color: #6b5b63; text-transform: uppercase; font-weight: 700; }

          /* Sections for Single Jamaah */
          .sec-card { border: 1px solid #fecddf; border-radius: 8px; margin-bottom: 10px; overflow: hidden; page-break-inside: avoid; }
          .sec-title { background: linear-gradient(90deg, #d81b60, #c2185b); color: #ffffff; font-size: 10px; font-weight: 800; padding: 5px 10px; letter-spacing: 0.5px; }

          /* Tables */
          .grid-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
          .grid-table td { padding: 5px 8px; border-bottom: 1px solid #fecddf; border-right: 1px solid #fff1f6; vertical-align: top; }
          .grid-table td:last-child { border-right: none; }
          .grid-table tr:last-child td { border-bottom: none; }
          .lbl { font-weight: 600; color: #6b5b63; width: 22%; background: #fff8fa; }
          .val { color: #1e1b1d; width: 28%; font-weight: 500; }
          .val.highlight { font-weight: 800; color: #c2185b; }
          .font-mono { font-family: monospace; }
          .text-green { color: #059669; font-weight: 700; }
          .text-red { color: #dc2626; font-weight: 700; }

          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 8.5px; }
          .data-table th { background: #d81b60; color: #ffffff; text-align: left; padding: 5px 6px; font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; border-right: 1px solid rgba(255,255,255,0.2); }
          .data-table td { padding: 5px 6px; border-bottom: 1px solid #fecddf; border-right: 1px solid #fff1f6; vertical-align: top; }
          .data-table tr:nth-child(even) { background: #fff8fa; }
          .name-text { color: #871644; font-size: 9.5px; }
          .pkg-text { color: #d81b60; }
          .sub-info { font-size: 8px; color: #6b5b63; }
          .text-center { text-align: center; }

          /* Badges */
          .badge { display: inline-block; padding: 2px 6px; border-radius: 10px; font-size: 8px; font-weight: 700; text-align: center; white-space: nowrap; }
          .b-green { background: #d1fae5; color: #065f46; }
          .b-yellow { background: #fef3c7; color: #92400e; }
          .b-pink { background: #ffe4ee; color: #9f1239; }

          /* Footer Signatures */
          .footer-sign-block { display: flex; justify-content: space-between; margin-top: 15px; page-break-inside: avoid; }
          .sign-box { text-align: center; width: 220px; font-size: 9px; color: #4b5563; }
          .sign-space { height: 40px; }
          .sign-name { font-weight: 800; color: #871644; text-decoration: underline; font-size: 9.5px; }
          .sign-role { font-size: 8px; color: #6b5b63; }

          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; padding: 10px 15px; background: #fff1f6; border: 1px solid #fecddf; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span style="font-weight: bold; color: #c2185b; font-size: 13px;">📄 Preview Dokumen PDF Resmi Almarwa</span>
            <p style="font-size: 11px; color: #6b5b63; margin-top: 2px;">Klik tombol di kanan untuk mengunduh / simpan sebagai PDF.</p>
          </div>
          <button onclick="window.print();" style="background: linear-gradient(135deg, #d81b60, #c2185b); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: inherit; box-shadow: 0 4px 12px rgba(216,27,96,0.3); display: flex; align-items: center; gap: 6px;">
            🖨️ Cetak / Simpan Ke PDF
          </button>
        </div>

        ${contentHtml}

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="min-h-screen bg-[#FFF8FA]">
      <div className="hidden lg:block"><AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} /></div>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)}></div>
          <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-almarwa-100/50 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-almarwa-50"><Menu size={20} className="text-almarwa-600" /></button>
            <h1 className="text-lg font-bold text-gray-900 capitalize">{activeMenu === 'dashboard' ? 'Dashboard Admin' : activeMenu.replace('_', ' ')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveMenu('notifikasi')} className="relative p-2 rounded-lg hover:bg-almarwa-50">
              <Bell size={20} className="text-gray-500" />
              {unreadNotif > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-almarwa-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadNotif}</span>}
            </button>
            <button onClick={loadAll} className="p-2 rounded-lg hover:bg-almarwa-50"><RefreshCw size={18} className="text-gray-400" /></button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* ===== DASHBOARD ===== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Jamaah', val: stats.totalJamaah, icon: Users, color: 'bg-almarwa-100', iconColor: 'text-almarwa-600' },
                  { label: 'Menunggu Verifikasi', val: stats.menungguVerifikasi, icon: Clock, color: 'bg-amber-100', iconColor: 'text-amber-600' },
                  { label: 'Total Pendapatan', val: formatRupiah(stats.totalPendapatan), icon: TrendingUp, color: 'bg-green-100', iconColor: 'text-green-600' },
                  { label: 'Kuota Tersisa', val: stats.kuotaTersisa, icon: CalendarDays, color: 'bg-blue-100', iconColor: 'text-blue-600' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className={`stat-icon ${s.color}`}><s.icon className={s.iconColor} size={22} /></div>
                    <div><p className="text-xs text-gray-400">{s.label}</p><p className="text-xl font-extrabold text-gray-900">{s.val || 0}</p></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Stats */}
                <div className="card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-almarwa-500" /> Ringkasan</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      ['Total Pendaftaran', stats.totalPendaftaran],
                      ['Paket Aktif', stats.totalPaket],
                      ['Jadwal Keberangkatan', stats.totalKeberangkatan],
                      ['Jamaah Baru Bulan Ini', stats.jamaahBaru],
                      ['Belum Lunas', stats.belumLunas],
                    ].map(([l, v], i) => (
                      <div key={i} className="flex justify-between border-b border-almarwa-50 pb-2">
                        <span className="text-gray-500">{l}</span>
                        <span className="font-bold text-gray-900">{v || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><ClipboardList size={18} className="text-almarwa-500" /> Aktivitas Terbaru</h3>
                  <div className="space-y-3">
                    {activityLog.slice(0, 5).map(log => (
                      <div key={log.id} className="flex items-start gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-almarwa-50 flex items-center justify-center shrink-0">
                          <UserCheck size={14} className="text-almarwa-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-700 truncate">{log.deskripsi}</p>
                          <p className="text-[10px] text-gray-400">{log.user_nama} • {formatDateShort(log.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pending Pembayaran Quick Action Widget */}
              {pembayaranList.filter(p => p.status === 'Menunggu Verifikasi').length > 0 && (
                <div className="card p-6 border border-amber-200 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">💳</div>
                      <div>
                        <h3 className="font-extrabold text-base text-gray-900">Pembayaran Menunggu Verifikasi ({pembayaranList.filter(p => p.status === 'Menunggu Verifikasi').length})</h3>
                        <p className="text-xs text-gray-500">Bukti pendaftaran / cicilan jamaah yang perlu Anda periksa dan setujui</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveMenu('pembayaran')} className="text-xs font-bold text-almarwa-600 hover:text-almarwa-700 flex items-center gap-1">
                      Lihat Semua Pembayaran <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {pembayaranList.filter(p => p.status === 'Menunggu Verifikasi').slice(0, 5).map(p => (
                      <div key={p.id} className="p-3.5 bg-white rounded-xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{p.nama_jamaah} <span className="text-xs font-normal text-gray-500">({p.jenis})</span></p>
                          <p className="text-xs text-gray-500 mt-0.5">{p.paket_nama} • Tanggal: {formatDate(p.tanggal)}</p>
                          <p className="text-sm font-extrabold text-almarwa-600 mt-1">Jumlah: {formatRupiah(p.jumlah)}</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {p.bukti && (
                            <button onClick={() => setModal({ type: 'preview-image', data: { title: `Bukti Pembayaran ${p.jenis} - ${p.nama_jamaah}`, image: p.bukti, payId: p.id, status: p.status, amount: p.jumlah } })}
                              className="btn-secondary btn-sm text-xs py-1.5 flex items-center gap-1">
                              <Eye size={14} /> Bukti Transfer
                            </button>
                          )}
                          <button onClick={() => handleVerifyPayment(p.id, 'Terverifikasi')} className="btn-primary btn-sm text-xs py-1.5 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 border-emerald-600">
                            <Check size={14} /> Setujui Pembayaran
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Pendaftaran Quick Action Widget */}
              <div className="card p-6 border border-almarwa-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                      <Users size={20} className="text-almarwa-600" /> Pendaftaran Jamaah Terbaru
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Daftar pendaftaran terbaru yang masuk ke dalam sistem</p>
                  </div>
                  <button onClick={() => setActiveMenu('jamaah')} className="text-xs font-bold text-almarwa-600 hover:text-almarwa-700 flex items-center gap-1">
                    Lihat Semua Jamaah <ChevronRight size={14} />
                  </button>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>ID</th><th>Nama Jamaah</th><th>Paket</th><th>Sisa Bayar</th><th>Status</th><th>Tgl Daftar</th><th>Aksi</th></tr>
                    </thead>
                    <tbody>
                      {jamaahList.slice(0, 5).map(j => (
                        <tr key={j.id}>
                          <td className="font-mono text-xs">#{j.id}</td>
                          <td className="font-bold text-gray-900">{j.nama_paspor}</td>
                          <td>{j.paket_nama}</td>
                          <td className="font-bold text-almarwa-600">{formatRupiah(j.sisa_bayar)}</td>
                          <td>
                            <span className={`badge ${
                              j.status === 'Data Diverifikasi' || j.status === 'Terdaftar' ? 'badge-green' :
                              j.status === 'Menunggu Verifikasi' ? 'badge-yellow' : 'badge-blue'
                            }`}>{j.status}</span>
                          </td>
                          <td className="text-xs text-gray-500">{formatDate(j.created_at)}</td>
                          <td>
                            <button onClick={() => setModal({ type: 'jamaah-detail', data: j })} className="btn-secondary btn-sm text-xs py-1 flex items-center gap-1">
                              <Eye size={13} /> Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== JAMAAH ===== */}
          {activeMenu === 'jamaah' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="form-input pl-9" placeholder="Cari nama atau NIK..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="form-select w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">Semua Status</option>
                  {['Menunggu Verifikasi', 'Data Diverifikasi', 'Data Perlu Diperbaiki', 'Terdaftar', 'Siap Berangkat', 'Selesai'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button onClick={() => setModal({ type: 'export-jamaah' })} className="btn-primary btn-sm flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                  <Printer size={14} /> Export / Cetak PDF
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead><tr><th>ID</th><th>Nama</th><th>NIK</th><th>Paket</th><th>Status</th><th>Bayar</th><th>Dokumen</th><th>Aksi</th></tr></thead>
                  <tbody>
                    {filteredJamaah.map(j => (
                      <tr key={j.id}>
                        <td className="font-mono text-xs">#{j.id}</td>
                        <td className="font-semibold">{j.nama_paspor}</td>
                        <td className="text-xs font-mono">{j.nik}</td>
                        <td>{j.paket_nama}</td>
                        <td><span className={`badge ${
                          j.status === 'Data Diverifikasi' || j.status === 'Terdaftar' ? 'badge-green' :
                          j.status === 'Menunggu Verifikasi' ? 'badge-yellow' :
                          j.status === 'Data Perlu Diperbaiki' ? 'badge-red' : 'badge-blue'
                        }`}>{j.status}</span></td>
                        <td><span className={`badge ${j.status_bayar === 'Lunas' ? 'badge-green' : j.status_bayar === 'Belum Bayar' ? 'badge-red' : 'badge-yellow'}`}>{j.status_bayar}</span></td>
                        <td><span className={`badge ${j.dokumen_lengkap ? 'badge-green' : 'badge-yellow'}`}>{j.dokumen_lengkap ? 'Lengkap' : 'Belum'}</span></td>
                        <td>
                          <div className="flex gap-1">
                            <button onClick={() => setModal({ type: 'jamaah-detail', data: j })} className="p-1.5 rounded-lg hover:bg-almarwa-50 text-almarwa-500"><Eye size={16} /></button>
                            <button onClick={() => setModal({ type: 'jamaah-status', data: j })} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500"><CheckCircle size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== PAKET ===== */}
          {activeMenu === 'paket' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setModal({ type: 'paket-form', data: null })} className="btn-primary flex items-center gap-2"><Plus size={16} /> Tambah Paket</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paketList.map(p => (
                  <div key={p.id} className="card p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold">{p.nama}</h3>
                        <p className="text-xl font-extrabold text-almarwa-600">{formatRupiah(p.harga)}</p>
                      </div>
                      <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-red'}`}>{p.status}</span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1 mb-3">
                      <p>{p.durasi} • {p.maskapai}</p>
                      <p>{p.hotel_mekkah}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setModal({ type: 'paket-form', data: p })} className="btn-ghost btn-sm flex items-center gap-1"><Edit size={14} /> Edit</button>
                      <button onClick={() => handleDeletePaket(p.id)} className="btn-ghost btn-sm flex items-center gap-1 text-red-500 hover:!bg-red-50"><Trash2 size={14} /> Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== KEBERANGKATAN ===== */}
          {activeMenu === 'keberangkatan' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setModal({ type: 'jadwal-form', data: null })} className="btn-primary flex items-center gap-2"><Plus size={16} /> Tambah Jadwal</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Paket</th><th>Berangkat</th><th>Pulang</th><th>Kuota</th><th>Status</th><th>Aksi</th></tr></thead>
                  <tbody>
                    {keberangkatanList.map(k => (
                      <tr key={k.id}>
                        <td className="font-semibold">{k.paket_nama}</td>
                        <td>{formatDate(k.tanggal_berangkat)}</td>
                        <td>{formatDate(k.tanggal_pulang)}</td>
                        <td><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-almarwa-500 rounded-full" style={{ width: `${(k.terisi / k.kuota) * 100}%` }}></div></div><span className="text-xs">{k.terisi}/{k.kuota}</span></div></td>
                        <td><span className={`badge ${k.status === 'Pendaftaran Dibuka' ? 'badge-green' : k.status === 'Hampir Penuh' ? 'badge-yellow' : k.status === 'Berangkat' ? 'badge-blue' : 'badge-red'}`}>{k.status}</span></td>
                        <td>
                          <div className="flex gap-1">
                            <button onClick={() => setModal({ type: 'jadwal-form', data: k })} className="p-1.5 rounded-lg hover:bg-almarwa-50 text-almarwa-500" title="Edit"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteKeberangkatan(k.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Hapus"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== DOKUMEN ===== */}
          {activeMenu === 'dokumen' && (
            <div className="animate-fade-in space-y-4">
              {jamaahList.map(j => {
                const docs = j.dokumen || [];
                if (docs.length === 0 && !searchQuery) return null;
                return (
                  <div key={j.id} className="card p-5">
                    <div className="flex items-center justify-between mb-3 border-b border-almarwa-50 pb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{j.nama_paspor}</h4>
                        <p className="text-xs text-gray-400">{j.paket_nama} • NIK: {j.nik}</p>
                      </div>
                      <span className={`badge ${j.dokumen_lengkap ? 'badge-green' : 'badge-yellow'}`}>
                        {j.dokumen_lengkap ? 'Dokumen Lengkap' : 'Belum Lengkap'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {docs.map(doc => (
                        <div key={doc.id} className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between ${
                          doc.status === 'Valid' ? 'border-green-200 bg-green-50/50' :
                          doc.status === 'Belum Diperiksa' ? 'border-amber-200 bg-amber-50/50' : 'border-red-200 bg-red-50/50'
                        }`}>
                          <div className="w-full">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs text-gray-800">{doc.jenis}</span>
                              <span className={`badge text-[9px] ${doc.status === 'Valid' ? 'badge-green' : doc.status === 'Belum Diperiksa' ? 'badge-yellow' : 'badge-red'}`}>{doc.status}</span>
                            </div>
                            {/* Thumbnail */}
                            {doc.file_path ? (
                              <div className="w-full h-24 my-2 rounded-lg bg-gray-100 border overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setModal({ type: 'preview-image', data: { title: `Dokumen ${doc.jenis} - ${j.nama_paspor}`, image: doc.file_path, docId: doc.id, status: doc.status, jamaahName: j.nama_paspor } })}>
                                <img src={doc.file_path} alt={doc.jenis} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-full h-24 my-2 rounded-lg bg-gray-100 border border-dashed flex items-center justify-center text-gray-400 text-xs">
                                Belum ada file
                              </div>
                            )}
                          </div>

                          <div className="w-full space-y-1.5 mt-2">
                            {doc.file_path && (
                              <button onClick={() => setModal({ type: 'preview-image', data: { title: `Dokumen ${doc.jenis} - ${j.nama_paspor}`, image: doc.file_path, docId: doc.id, status: doc.status, jamaahName: j.nama_paspor } })}
                                className="btn-secondary btn-sm w-full text-[11px] py-1 flex items-center justify-center gap-1">
                                <Eye size={12} /> Lihat Gambar
                              </button>
                            )}
                            <div className="flex gap-1 justify-center">
                              <button onClick={() => handleVerifyDoc(doc.id, 'Valid', 'Dokumen valid')} className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold flex items-center justify-center gap-1">
                                <Check size={11} /> Valid
                              </button>
                              <button onClick={() => handleVerifyDoc(doc.id, 'Tidak Valid', 'Dokumen kurang jelas / tidak sesuai')} className="flex-1 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold flex items-center justify-center gap-1">
                                <XCircle size={11} /> Tolak
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          )}

          {/* ===== PEMBAYARAN ===== */}
          {activeMenu === 'pembayaran' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex justify-end">
                <button onClick={() => exportCSV(pembayaranList.map(p => ({
                  Jamaah: p.nama_jamaah, Jenis: p.jenis, Transaksi: p.jumlah, TotalPaket: p.paket_harga, SisaTagihan: p.sisa_bayar, Tanggal: p.tanggal, Status: p.status
                })), 'data-pembayaran.csv')} className="btn-secondary btn-sm flex items-center gap-1"><Download size={14} /> Export CSV</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Jamaah</th><th>Jenis</th><th>Jumlah Bayar</th><th>Total Biaya Paket</th><th>Sisa Tagihan</th><th>Tanggal</th><th>Bukti Transfer</th><th>Status</th><th>Aksi</th></tr></thead>
                  <tbody>
                    {pembayaranList.map(p => (
                      <tr key={p.id}>
                        <td className="font-semibold">{p.nama_jamaah}</td>
                        <td><span className="badge badge-pink">{p.jenis}</span></td>
                        <td className="font-bold text-almarwa-600">{formatRupiah(p.jumlah)}</td>
                        <td className="text-gray-600 font-medium">{formatRupiah(p.paket_harga)}</td>
                        <td>
                          {p.sisa_bayar > 0 ? (
                            <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 font-extrabold text-xs border border-red-200">
                              Sisa {formatRupiah(p.sisa_bayar)}
                            </span>
                          ) : (
                            <span className="badge badge-green">✓ Lunas</span>
                          )}
                        </td>
                        <td className="text-xs text-gray-500">{formatDate(p.tanggal)}</td>
                        <td>
                          {p.bukti ? (
                            <button onClick={() => setModal({ type: 'preview-image', data: { title: `Bukti Pembayaran ${p.jenis} - ${p.nama_jamaah}`, image: p.bukti, payId: p.id, status: p.status, amount: p.jumlah } })}
                              className="px-2.5 py-1 rounded-lg bg-almarwa-50 hover:bg-almarwa-100 text-almarwa-600 font-semibold text-xs flex items-center gap-1 border border-almarwa-200">
                              <Eye size={13} /> Lihat Bukti
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">Tidak Ada Bukti</span>
                          )}
                        </td>
                        <td><span className={`badge ${p.status === 'Terverifikasi' ? 'badge-green' : p.status === 'Ditolak' ? 'badge-red' : 'badge-yellow'}`}>{p.status}</span></td>
                        <td>
                          <div className="flex gap-1">
                            <button onClick={() => handleVerifyPayment(p.id, 'Terverifikasi')} className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center gap-1 text-xs font-semibold" title="Setujui">
                              <Check size={14} /> Setujui
                            </button>
                            <button onClick={() => handleVerifyPayment(p.id, 'Ditolak')} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center gap-1 text-xs font-semibold" title="Tolak">
                              <XCircle size={14} /> Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== TESTIMONI ===== */}
          {activeMenu === 'testimoni' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Kelola Testimoni Jamaah</h3>
                <button onClick={() => setModal({ type: 'testimoni-form', data: null })} className="btn-primary flex items-center gap-2"><Plus size={16} /> Tambah Testimoni</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimoniList.map(t => (
                  <div key={t.id} className="card p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{t.nama}</h4>
                        <p className="text-xs text-gray-400">{t.asal} • {t.paket} • {t.tahun}</p>
                      </div>
                      <span className={`badge ${t.status === 'active' ? 'badge-green' : 'badge-red'}`}>{t.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 italic mb-3">"{t.isi}"</p>
                    <div className="flex items-center justify-between pt-2 border-t border-almarwa-50">
                      <span className="text-xs text-amber-500 font-bold">{'★'.repeat(t.rating)}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setModal({ type: 'testimoni-form', data: t })} className="btn-ghost btn-sm"><Edit size={14} /> Edit</button>
                        <button onClick={async () => {
                          if (confirm('Hapus testimoni ini?')) {
                            await apiFetch(`/admin/testimoni/${t.id}`, { method: 'DELETE' });
                            showToast('Testimoni dihapus.');
                            const updated = await apiFetch('/admin/testimoni'); setTestimoniList(updated);
                          }
                        }} className="btn-ghost btn-sm text-red-500 hover:!bg-red-50"><Trash2 size={14} /> Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== FAQ ===== */}
          {activeMenu === 'faq' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Kelola Pertanyaan Umum (FAQ)</h3>
                <button onClick={() => setModal({ type: 'faq-form', data: null })} className="btn-primary flex items-center gap-2"><Plus size={16} /> Tambah FAQ</button>
              </div>
              <div className="space-y-3">
                {faqList.map(f => (
                  <div key={f.id} className="card p-5 flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="badge badge-pink text-[10px] mb-1">Urutan #{f.urutan}</span>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{f.pertanyaan}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{f.jawaban}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setModal({ type: 'faq-form', data: f })} className="p-1.5 rounded-lg hover:bg-almarwa-50 text-almarwa-500"><Edit size={16} /></button>
                      <button onClick={async () => {
                        if (confirm('Hapus FAQ ini?')) {
                          await apiFetch(`/admin/faq/${f.id}`, { method: 'DELETE' });
                          showToast('FAQ dihapus.');
                          const updated = await apiFetch('/admin/faq'); setFaqList(updated);
                        }
                      }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== PROMO ===== */}
          {activeMenu === 'promo' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Kelola Promo</h3>
                <button onClick={() => setModal({ type: 'promo-form', data: null })} className="btn-primary flex items-center gap-2"><Plus size={16} /> Tambah Promo</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promoList.map(p => (
                  <div key={p.id} className="card p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">{p.judul}</h4>
                      <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-red'}`}>{p.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{p.deskripsi}</p>
                    <div className="flex justify-between items-center p-2 bg-almarwa-50 rounded-lg text-xs font-mono text-almarwa-700 mb-3">
                      <span>Kode: <strong>{p.kode}</strong></span>
                      <span>Diskon: <strong>{formatRupiah(p.potongan)}</strong></span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400 border-t border-almarwa-50 pt-2">
                      <span>Berlaku s/d: {formatDate(p.berlaku_sampai)}</span>
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ type: 'promo-form', data: p })} className="btn-ghost btn-sm"><Edit size={14} /></button>
                        <button onClick={async () => {
                          if (confirm('Hapus promo ini?')) {
                            await apiFetch(`/admin/promo/${p.id}`, { method: 'DELETE' });
                            showToast('Promo dihapus.');
                            const updated = await apiFetch('/admin/promo'); setPromoList(updated);
                          }
                        }} className="btn-ghost btn-sm text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== GALERI FOTO JAMAAH ===== */}
          {activeMenu === 'galeri' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-almarwa-900 via-almarwa-800 to-almarwa-900 p-6 rounded-2xl text-white shadow-lg border border-almarwa-700">
                <div>
                  <h3 className="font-extrabold text-xl flex items-center gap-2">
                    <Image size={24} className="text-almarwa-300" /> Kelola Galeri Foto & Dokumentasi Jamaah
                  </h3>
                  <p className="text-xs text-white/70 mt-1">
                    Unggah foto kegiatan, momen ibadah di Makkah & Madinah, serta sertakan caption menarik untuk dilihat jamaah.
                  </p>
                </div>
                <button onClick={() => setModal({ type: 'galeri-form', data: null })} className="btn-primary bg-white !text-almarwa-900 hover:bg-almarwa-50 flex items-center gap-2 font-bold shrink-0 shadow-md">
                  <Plus size={16} /> Tambah Foto Jamaah
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {galeriList.map(g => (
                  <div key={g.id} className="card overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col border border-almarwa-100">
                    <div className="relative h-48 bg-gray-100 overflow-hidden cursor-pointer" onClick={() => setModal({ type: 'preview-image', data: { title: g.judul, image: g.url } })}>
                      <img
                        src={g.url || 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=80'}
                        alt={g.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=80'; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                          <Eye size={14} /> Lihat Foto
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-medium">
                        {formatDateShort(g.created_at)}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{g.judul}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">{g.deskripsi || 'Tidak ada deskripsi'}</p>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-almarwa-50 justify-end">
                        <button onClick={() => setModal({ type: 'galeri-form', data: g })} className="btn-ghost btn-sm text-almarwa-600 flex items-center gap-1">
                          <Edit size={14} /> Edit Caption
                        </button>
                        <button onClick={async () => {
                          if (confirm('Hapus foto ini dari galeri?')) {
                            try {
                              await apiFetch(`/admin/galeri/${g.id}`, { method: 'DELETE' });
                              showToast('Foto galeri berhasil dihapus.');
                              const updated = await apiFetch('/admin/galeri'); setGaleriList(updated);
                            } catch(e) { showToast(e.message, 'error'); }
                          }
                        }} className="btn-ghost btn-sm text-red-500 hover:!bg-red-50 flex items-center gap-1">
                          <Trash2 size={14} /> Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {galeriList.length === 0 && (
                  <div className="col-span-full card p-12 text-center text-gray-400">
                    <Image size={48} className="mx-auto mb-3 text-gray-300 opacity-50" />
                    <p className="font-medium text-gray-600">Belum ada foto galeri jamaah.</p>
                    <p className="text-xs text-gray-400 mt-1">Klik tombol 'Tambah Foto Jamaah' di atas untuk mengunggah foto baru.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== NOTIFIKASI ===== */}
          {activeMenu === 'notifikasi' && (
            <div className="animate-fade-in space-y-3">
              {notifikasi.length === 0 ? (
                <div className="card p-10 text-center text-gray-400">Tidak ada notifikasi.</div>
              ) : notifikasi.map(n => (
                <div key={n.id} className={`card p-4 flex items-start gap-3 cursor-pointer ${!n.dibaca ? 'border-l-4 border-l-almarwa-500' : ''}`}
                  onClick={async () => { if (!n.dibaca) { await apiFetch(`/notifikasi/${n.id}/read`, { method: 'PUT' }); loadAll(); } }}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    n.tipe === 'success' ? 'bg-green-100' : n.tipe === 'warning' ? 'bg-amber-100' : 'bg-almarwa-100'
                  }`}>
                    {n.tipe === 'success' ? <CheckCircle size={18} className="text-green-600" /> : n.tipe === 'warning' ? <AlertCircle size={18} className="text-amber-600" /> : <Bell size={18} className="text-almarwa-600" />}
                  </div>
                  <div className="flex-1"><p className="font-semibold text-sm">{n.judul}</p><p className="text-xs text-gray-500">{n.pesan}</p><p className="text-[10px] text-gray-300 mt-1">{formatDateShort(n.created_at)}</p></div>
                </div>
              ))}
            </div>
          )}

          {/* ===== ACTIVITY LOG ===== */}
          {activeMenu === 'activity' && (
            <div className="animate-fade-in table-wrapper">
              <table>
                <thead><tr><th>Waktu</th><th>Admin</th><th>Aksi</th><th>Deskripsi</th></tr></thead>
                <tbody>
                  {activityLog.map(l => (
                    <tr key={l.id}>
                      <td className="text-xs text-gray-400 whitespace-nowrap">{formatDateShort(l.created_at)}</td>
                      <td className="font-medium">{l.user_nama}</td>
                      <td><span className="badge badge-pink">{l.aksi}</span></td>
                      <td className="text-sm text-gray-600">{l.deskripsi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* ===== MODALS ===== */}

      {/* Jamaah Detail Modal */}
      <Modal open={modal.type === 'jamaah-detail'} onClose={() => setModal({ type: null })} title="Detail Jamaah & Dokumen" maxWidth="max-w-3xl">
        {modal.data && (
          <div className="space-y-6 text-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-almarwa-600 to-almarwa-700 text-white p-4 rounded-xl shadow-md">
              <div>
                <p className="font-extrabold text-base">{modal.data.nama_paspor}</p>
                <p className="text-xs text-white/80">NIK: {modal.data.nik} • Paspor: {modal.data.no_paspor || '-'}</p>
              </div>
              <button onClick={() => exportJamaahPDF(modal.data, true)} className="btn-gold btn-sm flex items-center gap-1.5 font-bold shadow-md whitespace-nowrap">
                <Printer size={15} /> Cetak / Download PDF Biodata
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-almarwa-50/50 p-4 rounded-xl border border-almarwa-100">
              {[
                ['Nama Paspor', modal.data.nama_paspor], ['NIK', modal.data.nik], ['No. Paspor', modal.data.no_paspor],
                ['TTL', `${modal.data.tempat_lahir}, ${formatDate(modal.data.tanggal_lahir)}`],
                ['Jenis Kelamin', modal.data.jenis_kelamin], ['Status Nikah', modal.data.status_nikah],
                ['Pekerjaan', modal.data.pekerjaan], ['Alamat', modal.data.alamat],
                ['Paket', modal.data.paket_nama], ['Status Jamaah', modal.data.status],
                ['Total Bayar', formatRupiah(modal.data.total_bayar)], ['Sisa Pembayaran', formatRupiah(modal.data.sisa_bayar)],
                ['Kontak Darurat', `${modal.data.nama_darurat} (${modal.data.hub_darurat})`],
                ['HP Darurat', modal.data.hp_darurat],
              ].map(([l, v], i) => (
                <div key={i}><p className="text-gray-400 text-xs">{l}</p><p className="font-semibold text-gray-800">{v || '-'}</p></div>
              ))}
            </div>

            {/* Uploaded Documents List in Detail */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
                <span>Dokumen Ter-Upload</span>
                <span className={`badge ${modal.data.dokumen_lengkap ? 'badge-green' : 'badge-yellow'}`}>
                  {modal.data.dokumen_lengkap ? 'Lengkap' : 'Belum Lengkap'}
                </span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(modal.data.dokumen || []).map(doc => (
                  <div key={doc.id} className="p-3 bg-white border border-almarwa-100 rounded-xl text-center flex flex-col items-center">
                    <p className="text-xs font-bold text-gray-800 mb-1">{doc.jenis}</p>
                    <span className={`badge text-[9px] mb-2 ${doc.status === 'Valid' ? 'badge-green' : doc.status === 'Belum Diperiksa' ? 'badge-yellow' : 'badge-red'}`}>{doc.status}</span>
                    {doc.file_path ? (
                      <button onClick={() => setModal({ type: 'preview-image', data: { title: `Dokumen ${doc.jenis} - ${modal.data.nama_paspor}`, image: doc.file_path, docId: doc.id, status: doc.status, jamaahName: modal.data.nama_paspor } })}
                        className="btn-secondary btn-sm text-[11px] py-1 px-2.5 w-full flex items-center justify-center gap-1">
                        <Eye size={12} /> Lihat Gambar
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400">Belum Ada File</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {modal.data.catatan_admin && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl"><p className="text-xs font-semibold text-amber-700">Catatan Admin:</p><p className="text-sm text-gray-700 mt-1">{modal.data.catatan_admin}</p></div>
            )}
          </div>
        )}
      </Modal>

      {/* Export Options Modal */}
      <Modal open={modal.type === 'export-jamaah'} onClose={() => setModal({ type: null })} title="Export Data Jamaah & Laporan PDF" maxWidth="max-w-md">
        <div className="space-y-4 text-sm">
          <p className="text-gray-600 text-xs leading-relaxed">
            Pilih jenis dokumen & format laporan resmi yang ingin Anda hasilkan untuk data jamaah Almarwa Tour:
          </p>

          <div className="space-y-3">
            <button onClick={() => { exportJamaahPDF(filteredJamaah, false); setModal({ type: null }); }}
              className="w-full p-4 rounded-xl border border-almarwa-200 bg-gradient-to-r from-almarwa-50 to-pink-50 hover:border-almarwa-500 hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-almarwa-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <Printer size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-almarwa-600">Export PDF Laporan Rekap Lengkap</p>
                  <p className="text-xs text-gray-500">Cetak rekap PDF seluruh data jamaah ({filteredJamaah.length} jamaah)</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-almarwa-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="p-4 rounded-xl border border-almarwa-200 bg-white space-y-2">
              <label className="block text-xs font-bold text-gray-800">Export PDF Biodata Jamaah Perorangan:</label>
              <select id="exportSingleJamaahSelect" className="form-select text-xs">
                {filteredJamaah.map(j => (
                  <option key={j.id} value={j.id}>#{j.id} - {j.nama_paspor} (NIK: {j.nik})</option>
                ))}
              </select>
              <button onClick={() => {
                const selId = document.getElementById('exportSingleJamaahSelect')?.value;
                const targetJ = jamaahList.find(j => j.id === parseInt(selId)) || filteredJamaah[0];
                if (targetJ) exportJamaahPDF(targetJ, true);
                setModal({ type: null });
              }} className="btn-secondary btn-sm w-full mt-2 flex items-center justify-center gap-1.5 font-semibold">
                <Printer size={14} /> Cetak Form Biodata PDF Per-Jamaah
              </button>
            </div>

            <button onClick={() => {
              exportCSV(filteredJamaah.map(j => ({
                Nama: j.nama_paspor, NIK: j.nik, Paspor: j.no_paspor, KK: j.no_kk, TTL: `${j.tempat_lahir}, ${j.tanggal_lahir}`,
                Gender: j.jenis_kelamin, Alamat: j.alamat, Kota: j.kota, Provinsi: j.provinsi, HP: j.hp_darurat || j.no_hp,
                Paket: j.paket_nama, Status: j.status, 'Status Bayar': j.status_bayar, 'Total Terbayar': j.total_bayar, 'Sisa Bayar': j.sisa_bayar
              })), 'data-jamaah-lengkap.csv');
              setModal({ type: null });
            }} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={20} className="text-emerald-600" />
                <div>
                  <p className="font-bold text-gray-800">Export File Spreadsheet (CSV / Excel)</p>
                  <p className="text-xs text-gray-500">Unduh data mentah ke spreadsheet</p>
                </div>
              </div>
              <Download size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      </Modal>

      {/* Lightbox Image Preview Modal */}
      <Modal open={modal.type === 'preview-image'} onClose={() => setModal({ type: null })} title={modal.data?.title || 'Preview Gambar'} maxWidth="max-w-3xl">
        {modal.data && (
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-center overflow-hidden min-h-[300px] max-h-[500px]">
              {modal.data.image ? (
                <img src={modal.data.image} alt={modal.data.title} className="max-h-[460px] w-auto object-contain rounded-lg shadow-2xl" />
              ) : (
                <p className="text-white/50 text-sm">Gambar tidak dapat ditampilkan.</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-almarwa-100">
              <div className="text-xs text-gray-500">
                Status: <span className="font-semibold text-gray-800">{modal.data.status || 'Aktif'}</span>
              </div>
              <div className="flex items-center gap-2">
                {modal.data.docId && (
                  <>
                    <button onClick={() => { handleVerifyDoc(modal.data.docId, 'Valid', 'Dokumen valid'); setModal({ type: null }); }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Check size={14} /> Verifikasi Valid
                    </button>
                    <button onClick={() => { handleVerifyDoc(modal.data.docId, 'Tidak Valid', 'Kurang jelas'); setModal({ type: null }); }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <XCircle size={14} /> Tolak Dokumen
                    </button>
                  </>
                )}
                {modal.data.payId && (
                  <>
                    <button onClick={() => { handleVerifyPayment(modal.data.payId, 'Terverifikasi'); setModal({ type: null }); }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Check size={14} /> Verifikasi Pembayaran
                    </button>
                    <button onClick={() => { handleVerifyPayment(modal.data.payId, 'Ditolak'); setModal({ type: null }); }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <XCircle size={14} /> Tolak Pembayaran
                    </button>
                  </>
                )}
                {modal.data.image && (
                  <a href={modal.data.image} download="document.png" target="_blank" rel="noopener noreferrer"
                    className="btn-secondary btn-sm flex items-center gap-1 text-xs">
                    <Download size={13} /> Download
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Jamaah Status Modal */}
      <Modal open={modal.type === 'jamaah-status'} onClose={() => setModal({ type: null })} title="Ubah Status Jamaah">
        {modal.data && <StatusForm jamaah={modal.data} onSubmit={(status, catatan) => { handleUpdateJamaahStatus(modal.data.id, status, catatan); setModal({ type: null }); }} />}
      </Modal>

      {/* Paket Form Modal */}
      <Modal open={modal.type === 'paket-form'} onClose={() => setModal({ type: null })} title={modal.data ? 'Edit Paket' : 'Tambah Paket'} maxWidth="max-w-3xl">
        <PaketForm initialData={modal.data} paketList={paketList} onSubmit={(data) => handleSavePaket(data, modal.data?.id)} />
      </Modal>

      {/* Testimoni Form Modal */}
      <Modal open={modal.type === 'testimoni-form'} onClose={() => setModal({ type: null })} title={modal.data ? 'Edit Testimoni' : 'Tambah Testimoni'}>
        <TestimoniForm initialData={modal.data} onSubmit={async (formData) => {
          try {
            if (modal.data?.id) {
              await apiFetch(`/admin/testimoni/${modal.data.id}`, { method: 'PUT', body: JSON.stringify(formData) });
              showToast('Testimoni berhasil diperbarui.');
            } else {
              await apiFetch('/admin/testimoni', { method: 'POST', body: JSON.stringify(formData) });
              showToast('Testimoni berhasil ditambahkan.');
            }
            setModal({ type: null });
            const updated = await apiFetch('/admin/testimoni'); setTestimoniList(updated);
          } catch(e) { showToast(e.message, 'error'); }
        }} />
      </Modal>

      {/* FAQ Form Modal */}
      <Modal open={modal.type === 'faq-form'} onClose={() => setModal({ type: null })} title={modal.data ? 'Edit FAQ' : 'Tambah FAQ'}>
        <FaqForm initialData={modal.data} onSubmit={async (formData) => {
          try {
            if (modal.data?.id) {
              await apiFetch(`/admin/faq/${modal.data.id}`, { method: 'PUT', body: JSON.stringify(formData) });
              showToast('FAQ berhasil diperbarui.');
            } else {
              await apiFetch('/admin/faq', { method: 'POST', body: JSON.stringify(formData) });
              showToast('FAQ berhasil ditambahkan.');
            }
            setModal({ type: null });
            const updated = await apiFetch('/admin/faq'); setFaqList(updated);
          } catch(e) { showToast(e.message, 'error'); }
        }} />
      </Modal>

      {/* Promo Form Modal */}
      <Modal open={modal.type === 'promo-form'} onClose={() => setModal({ type: null })} title={modal.data ? 'Edit Promo' : 'Tambah Promo'}>
        <PromoForm initialData={modal.data} onSubmit={async (formData) => {
          try {
            if (modal.data?.id) {
              await apiFetch(`/admin/promo/${modal.data.id}`, { method: 'PUT', body: JSON.stringify(formData) });
              showToast('Promo berhasil diperbarui.');
            } else {
              await apiFetch('/admin/promo', { method: 'POST', body: JSON.stringify(formData) });
              showToast('Promo berhasil ditambahkan.');
            }
            setModal({ type: null });
            const updated = await apiFetch('/admin/promo'); setPromoList(updated);
          } catch(e) { showToast(e.message, 'error'); }
        }} />
      </Modal>

      {/* Galeri Form Modal */}
      <Modal open={modal.type === 'galeri-form'} onClose={() => setModal({ type: null })} title={modal.data ? 'Edit Caption / Foto Galeri' : 'Tambah Foto Ke Galeri Jamaah'}>
        <GaleriForm initialData={modal.data} onSubmit={async (formData) => {
          try {
            if (modal.data?.id) {
              await apiFetch(`/admin/galeri/${modal.data.id}`, { method: 'PUT', body: formData });
              showToast('Foto galeri berhasil diperbarui.');
            } else {
              await apiFetch('/admin/galeri', { method: 'POST', body: formData });
              showToast('Foto galeri berhasil ditambahkan.');
            }
            setModal({ type: null });
            const updated = await apiFetch('/admin/galeri'); setGaleriList(updated);
          } catch(e) { showToast(e.message, 'error'); }
        }} />
      </Modal>
    </div>
  );
}

// ===== Sub-Components =====

function GaleriForm({ initialData, onSubmit }) {
  const [form, setForm] = useState(initialData || { judul: '', deskripsi: '', tipe: 'foto', url: '' });
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState(initialData?.url?.startsWith('/uploads') || !initialData?.url ? 'file' : 'url');
  const set = (k, v) => setForm({ ...form, [k]: v });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.judul) return alert('Judul / caption foto wajib diisi');
    const formData = new FormData();
    formData.append('judul', form.judul);
    formData.append('deskripsi', form.deskripsi || '');
    formData.append('tipe', form.tipe || 'foto');
    if (uploadType === 'file' && file) {
      formData.append('foto', file);
    } else {
      formData.append('url', form.url || '');
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Judul / Caption Foto Jamaah *</label>
        <input className="form-input" placeholder="Contoh: Keberangkatan Jamaah Kloter 1 2026" value={form.judul} onChange={e => set('judul', e.target.value)} required />
      </div>

      <div>
        <label className="form-label">Deskripsi / Catatan Tambahan</label>
        <textarea className="form-input" rows="3" placeholder="Keterangan lokasi, momen ibadah, atau catatan foto..." value={form.deskripsi} onChange={e => set('deskripsi', e.target.value)} />
      </div>

      <div>
        <label className="form-label mb-2 block font-semibold text-gray-700">Sumber Foto</label>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <input type="radio" name="uploadType" value="file" checked={uploadType === 'file'} onChange={() => setUploadType('file')} className="text-almarwa-600" />
            Upload File Foto dari Perangkat
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <input type="radio" name="uploadType" value="url" checked={uploadType === 'url'} onChange={() => setUploadType('url')} className="text-almarwa-600" />
            URL / Link Gambar Online
          </label>
        </div>

        {uploadType === 'file' ? (
          <div>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="form-input" />
            {initialData?.url && initialData.url.startsWith('/uploads') && (
              <p className="text-xs text-gray-500 mt-1">Foto saat ini: <a href={initialData.url} target="_blank" rel="noreferrer" className="text-almarwa-600 underline">Lihat Foto</a></p>
            )}
          </div>
        ) : (
          <div>
            <input className="form-input" placeholder="https://images.unsplash.com/photo-..." value={form.url} onChange={e => set('url', e.target.value)} />
          </div>
        )}
      </div>

      <button type="submit" className="btn-primary w-full py-2.5 font-bold">
        {initialData ? 'Simpan Perubahan Foto' : 'Tambah Foto Ke Galeri'}
      </button>
    </form>
  );
}

function StatusForm({ jamaah, onSubmit }) {
  const [status, setStatus] = useState(jamaah.status);
  const [catatan, setCatatan] = useState(jamaah.catatan_admin || '');
  return (
    <div className="space-y-4">
      <p className="font-semibold">{jamaah.nama_paspor}</p>
      <div><label className="form-label">Status</label>
        <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
          {['Menunggu Verifikasi', 'Data Diverifikasi', 'Data Perlu Diperbaiki', 'Terdaftar', 'Siap Berangkat', 'Selesai'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div><label className="form-label">Catatan Admin</label>
        <textarea className="form-input" rows="3" value={catatan} onChange={e => setCatatan(e.target.value)} /></div>
      <button onClick={() => onSubmit(status, catatan)} className="btn-primary w-full">Simpan</button>
    </div>
  );
}

function PaketForm({ initialData, onSubmit }) {
  const [form, setForm] = useState(initialData || {
    nama: '', harga: '', durasi: '9 Hari', hotel_mekkah: '', hotel_madinah: '',
    maskapai: 'Garuda Indonesia', kota_keberangkatan: 'Jakarta', deskripsi: '', fasilitas: '', status: 'active', is_populer: false
  });
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Nama Paket *</label><input className="form-input" value={form.nama} onChange={e => set('nama', e.target.value)} /></div>
        <div><label className="form-label">Harga *</label><input type="number" className="form-input" value={form.harga} onChange={e => set('harga', e.target.value)} /></div>
        <div><label className="form-label">Durasi</label><input className="form-input" value={form.durasi} onChange={e => set('durasi', e.target.value)} /></div>
        <div><label className="form-label">Maskapai</label><input className="form-input" value={form.maskapai} onChange={e => set('maskapai', e.target.value)} /></div>
        <div><label className="form-label">Hotel Mekkah</label><input className="form-input" value={form.hotel_mekkah} onChange={e => set('hotel_mekkah', e.target.value)} /></div>
        <div><label className="form-label">Hotel Madinah</label><input className="form-input" value={form.hotel_madinah} onChange={e => set('hotel_madinah', e.target.value)} /></div>
        <div><label className="form-label">Kota Keberangkatan</label><input className="form-input" value={form.kota_keberangkatan} onChange={e => set('kota_keberangkatan', e.target.value)} /></div>
        <div><label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Aktif</option><option value="inactive">Nonaktif</option>
          </select></div>
      </div>
      <div><label className="form-label">Deskripsi</label><textarea className="form-input" rows="3" value={form.deskripsi} onChange={e => set('deskripsi', e.target.value)} /></div>
      <div><label className="form-label">Fasilitas (pisahkan dengan koma)</label><textarea className="form-input" rows="3" value={form.fasilitas} onChange={e => set('fasilitas', e.target.value)} placeholder="Tiket Pesawat PP,Hotel,Makan 3x,Visa,dll" /></div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_populer} onChange={e => set('is_populer', e.target.checked)} className="rounded border-almarwa-300 text-almarwa-600" /> <span className="text-sm">Tandai sebagai paket populer</span></label>
      <button onClick={() => onSubmit({ ...form, harga: parseInt(form.harga) })} className="btn-primary w-full">Simpan Paket</button>
    </div>
  );
}

function JadwalForm({ initialData, paketList, onSubmit }) {
  const [form, setForm] = useState(initialData || {
    paket_id: paketList[0]?.id || '', tanggal_berangkat: '', tanggal_pulang: '',
    kuota: 45, terisi: 0, status: 'Pendaftaran Dibuka'
  });
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-4">
      <div><label className="form-label">Paket *</label>
        <select className="form-select" value={form.paket_id} onChange={e => set('paket_id', parseInt(e.target.value))}>
          {paketList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
        </select></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Tanggal Berangkat</label><input type="date" className="form-input" value={form.tanggal_berangkat} onChange={e => set('tanggal_berangkat', e.target.value)} /></div>
        <div><label className="form-label">Tanggal Pulang</label><input type="date" className="form-input" value={form.tanggal_pulang} onChange={e => set('tanggal_pulang', e.target.value)} /></div>
        <div><label className="form-label">Kuota</label><input type="number" className="form-input" value={form.kuota} onChange={e => set('kuota', e.target.value)} /></div>
        <div><label className="form-label">Terisi</label><input type="number" className="form-input" value={form.terisi} onChange={e => set('terisi', e.target.value)} /></div>
      </div>
      <div><label className="form-label">Status</label>
        <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
          {['Pendaftaran Dibuka', 'Hampir Penuh', 'Penuh', 'Persiapan Keberangkatan', 'Berangkat', 'Selesai'].map(s => <option key={s}>{s}</option>)}
        </select></div>
      <button onClick={() => onSubmit(form)} className="btn-primary w-full">Simpan Jadwal</button>
    </div>
  );
}

function TestimoniForm({ initialData, onSubmit }) {
  const [form, setForm] = useState(initialData || {
    nama: '', asal: '', isi: '', rating: 5, paket: 'Paket Regular', tahun: '2026', status: 'active'
  });
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Nama Jamaah *</label><input className="form-input" value={form.nama} onChange={e => set('nama', e.target.value)} /></div>
        <div><label className="form-label">Asal Kota</label><input className="form-input" value={form.asal} onChange={e => set('asal', e.target.value)} /></div>
        <div><label className="form-label">Paket</label><input className="form-input" value={form.paket} onChange={e => set('paket', e.target.value)} /></div>
        <div><label className="form-label">Tahun</label><input className="form-input" value={form.tahun} onChange={e => set('tahun', e.target.value)} /></div>
        <div><label className="form-label">Rating (1-5)</label><input type="number" min="1" max="5" className="form-input" value={form.rating} onChange={e => set('rating', parseInt(e.target.value))} /></div>
        <div><label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Aktif</option><option value="inactive">Nonaktif</option>
          </select></div>
      </div>
      <div><label className="form-label">Isi Testimoni *</label><textarea className="form-input" rows="4" value={form.isi} onChange={e => set('isi', e.target.value)} /></div>
      <button onClick={() => onSubmit(form)} className="btn-primary w-full">Simpan Testimoni</button>
    </div>
  );
}

function FaqForm({ initialData, onSubmit }) {
  const [form, setForm] = useState(initialData || { pertanyaan: '', jawaban: '', urutan: 1, status: 'active' });
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-4">
      <div><label className="form-label">Pertanyaan *</label><input className="form-input" value={form.pertanyaan} onChange={e => set('pertanyaan', e.target.value)} /></div>
      <div><label className="form-label">Jawaban *</label><textarea className="form-input" rows="4" value={form.jawaban} onChange={e => set('jawaban', e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Urutan Tampil</label><input type="number" className="form-input" value={form.urutan} onChange={e => set('urutan', parseInt(e.target.value))} /></div>
        <div><label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Aktif</option><option value="inactive">Nonaktif</option>
          </select></div>
      </div>
      <button onClick={() => onSubmit(form)} className="btn-primary w-full">Simpan FAQ</button>
    </div>
  );
}

function PromoForm({ initialData, onSubmit }) {
  const [form, setForm] = useState(initialData || { judul: '', deskripsi: '', potongan: 1000000, kode: '', berlaku_sampai: '', status: 'active' });
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-4">
      <div><label className="form-label">Judul Promo *</label><input className="form-input" value={form.judul} onChange={e => set('judul', e.target.value)} /></div>
      <div><label className="form-label">Deskripsi</label><textarea className="form-input" rows="3" value={form.deskripsi} onChange={e => set('deskripsi', e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Kode Promo *</label><input className="form-input" value={form.kode} onChange={e => set('kode', e.target.value)} /></div>
        <div><label className="form-label">Potongan Diskon (Rp) *</label><input type="number" className="form-input" value={form.potongan} onChange={e => set('potongan', e.target.value)} /></div>
        <div><label className="form-label">Berlaku Sampai</label><input type="date" className="form-input" value={form.berlaku_sampai} onChange={e => set('berlaku_sampai', e.target.value)} /></div>
        <div><label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Aktif</option><option value="inactive">Nonaktif</option>
          </select></div>
      </div>
      <button onClick={() => onSubmit({ ...form, potongan: parseInt(form.potongan) })} className="btn-primary w-full">Simpan Promo</button>
    </div>
  );
}
