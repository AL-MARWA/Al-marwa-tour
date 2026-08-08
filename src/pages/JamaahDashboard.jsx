/* ============================================================
   ALMARWA TOUR TRAVEL - Jamaah Dashboard
   ============================================================ */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, useToast, apiFetch, formatRupiah, formatDate } from '../App';
import { AlmarwaLogo } from './LandingPage';
import {
  LayoutDashboard, Package, CalendarDays, FileText, CreditCard, Bell, User,
  LogOut, Menu, X, Upload, ChevronRight, Check, Clock, AlertCircle, CheckCircle,
  ArrowRight, Plane, Building2, Download, Eye, RefreshCw, Home, Image
} from 'lucide-react';

// ===== Sidebar =====
function Sidebar({ activeMenu, setActiveMenu, onClose }) {
  const { user, logout, navigate } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pendaftaran', label: 'Pendaftaran', icon: FileText },
    { id: 'paket', label: 'Paket Umroh', icon: Package },
    { id: 'jadwal', label: 'Jadwal', icon: CalendarDays },
    { id: 'dokumen', label: 'Dokumen', icon: Upload },
    { id: 'pembayaran', label: 'Pembayaran', icon: CreditCard },
    { id: 'galeri', label: 'Galeri Foto Jamaah', icon: Image },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
    { id: 'profil', label: 'Profil Saya', icon: User },
  ];

  return (
    <aside className="sidebar scrollbar-pink">
      <div className="p-5 border-b border-white/10">
        <AlmarwaLogo light size="md" />
      </div>

      <div className="px-4 py-4">
        <div className="bg-white/10 rounded-xl p-3 mb-4">
          <p className="text-white/90 text-sm font-semibold truncate">{user?.nama}</p>
          <p className="text-white/50 text-xs truncate">{user?.email}</p>
        </div>
      </div>

      <nav className="flex-1 pb-4">
        <div className="sidebar-section">Menu Utama</div>
        {menuItems.map(item => (
          <button key={item.id} onClick={() => { setActiveMenu(item.id); onClose?.(); }}
            className={`sidebar-link w-full text-left ${activeMenu === item.id ? 'active' : ''}`}>
            <item.icon size={18} /> {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <button onClick={() => navigate('landing')} className="sidebar-link w-full text-left">
          <Home size={18} /> Beranda
        </button>
        <button onClick={logout} className="sidebar-link w-full text-left hover:!bg-red-500/20">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}

// ===== Progress Steps =====
function ProgressSteps({ currentStatus }) {
  const steps = [
    { label: 'Pendaftaran', status: 'Menunggu Verifikasi' },
    { label: 'Verifikasi Data', status: 'Data Diverifikasi' },
    { label: 'Dokumen Lengkap', status: 'Terdaftar' },
    { label: 'Pelunasan', status: 'Siap Berangkat' },
    { label: 'Persiapan', status: 'Siap Berangkat' },
    { label: 'Berangkat', status: 'Selesai' },
  ];

  const statusOrder = ['Menunggu Verifikasi', 'Data Diverifikasi', 'Data Perlu Diperbaiki', 'Terdaftar', 'Siap Berangkat', 'Selesai'];
  const currentIdx = statusOrder.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-between w-full overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isCompleted = i <= currentIdx - 1;
        const isCurrent = i === currentIdx || (i === currentIdx && currentIdx >= 0);
        return (
          <div key={i} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center text-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isCompleted ? 'bg-almarwa-600 text-white' :
                isCurrent ? 'bg-almarwa-100 text-almarwa-600 ring-4 ring-almarwa-100' :
                'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                isCompleted || isCurrent ? 'text-almarwa-600' : 'text-gray-400'
              }`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded ${isCompleted ? 'bg-almarwa-500' : 'bg-gray-200'}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== Registration Form =====
function RegistrationForm({ onSuccess }) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [paketList, setPaketList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    paket_id: '', keberangkatan_id: '',
    nama_paspor: '', nik: '', no_kk: '', no_paspor: '',
    tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki',
    alamat: '', provinsi: '', kota: '', kecamatan: '', kelurahan: '',
    status_nikah: 'Belum Menikah', pekerjaan: '',
    nama_darurat: '', hub_darurat: '', hp_darurat: '',
    jumlah_jamaah: 1
  });

  useEffect(() => {
    apiFetch('/public/paket').then(setPaketList).catch(() => {});
    apiFetch('/public/keberangkatan').then(setJadwalList).catch(() => {});
  }, []);

  const set = (field, val) => setForm({ ...form, [field]: val });

  const filteredJadwal = jadwalList.filter(j =>
    form.paket_id ? j.paket_id === parseInt(form.paket_id) : true
  ).filter(j => j.status === 'Pendaftaran Dibuka' || j.status === 'Hampir Penuh');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiFetch('/jamaah/pendaftaran', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          paket_id: parseInt(form.paket_id),
          keberangkatan_id: parseInt(form.keberangkatan_id)
        })
      });
      showToast('Pendaftaran berhasil! Silakan lengkapi dokumen Anda.', 'success');
      onSuccess?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="card">
      {/* Steps indicator */}
      <div className="p-5 bg-gradient-to-r from-almarwa-50 to-pink-50 border-b border-almarwa-100 flex items-center gap-2 overflow-x-auto">
        {['Paket & Jadwal', 'Data Pribadi', 'Alamat', 'Kontak Darurat'].map((s, i) => (
          <button key={i} onClick={() => setStep(i + 1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              step === i + 1 ? 'bg-almarwa-600 text-white' : i + 1 < step ? 'bg-almarwa-100 text-almarwa-600' : 'text-gray-400'
            }`}>
            {i + 1 < step ? <Check size={12} /> : null} {s}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Step 1: Package & Schedule */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-lg">Pilih Paket & Jadwal</h3>
            <div>
              <label className="form-label">Paket Umroh *</label>
              <select className="form-select" value={form.paket_id} onChange={e => set('paket_id', e.target.value)} required>
                <option value="">Pilih paket...</option>
                {paketList.map(p => (
                  <option key={p.id} value={p.id}>{p.nama} - {formatRupiah(p.harga)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Jadwal Keberangkatan *</label>
              <select className="form-select" value={form.keberangkatan_id} onChange={e => set('keberangkatan_id', e.target.value)} required>
                <option value="">Pilih jadwal...</option>
                {filteredJadwal.map(j => (
                  <option key={j.id} value={j.id}>{formatDate(j.tanggal_berangkat)} - {formatDate(j.tanggal_pulang)} (Sisa {j.kuota - j.terisi} kursi)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Jumlah Jamaah</label>
              <input type="number" min="1" max="10" className="form-input" value={form.jumlah_jamaah} onChange={e => set('jumlah_jamaah', e.target.value)} />
            </div>
            <div className="flex justify-end">
              <button onClick={() => { if (form.paket_id && form.keberangkatan_id) setStep(2); else alert('Pilih paket dan jadwal terlebih dahulu.'); }} className="btn-primary flex items-center gap-2">
                Selanjutnya <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Personal Data */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-lg">Data Pribadi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="form-label">Nama Lengkap (Sesuai Paspor) *</label>
                <input className="form-input" required value={form.nama_paspor} onChange={e => set('nama_paspor', e.target.value)} placeholder="NAMA LENGKAP" /></div>
              <div><label className="form-label">NIK *</label>
                <input className="form-input" required maxLength="16" value={form.nik} onChange={e => set('nik', e.target.value)} placeholder="16 digit NIK" /></div>
              <div><label className="form-label">No. Kartu Keluarga</label>
                <input className="form-input" maxLength="16" value={form.no_kk} onChange={e => set('no_kk', e.target.value)} placeholder="16 digit No. KK" /></div>
              <div><label className="form-label">No. Paspor *</label>
                <input className="form-input" required value={form.no_paspor} onChange={e => set('no_paspor', e.target.value)} placeholder="Nomor paspor" /></div>
              <div><label className="form-label">Tempat Lahir</label>
                <input className="form-input" value={form.tempat_lahir} onChange={e => set('tempat_lahir', e.target.value)} /></div>
              <div><label className="form-label">Tanggal Lahir</label>
                <input type="date" className="form-input" value={form.tanggal_lahir} onChange={e => set('tanggal_lahir', e.target.value)} /></div>
              <div><label className="form-label">Jenis Kelamin</label>
                <select className="form-select" value={form.jenis_kelamin} onChange={e => set('jenis_kelamin', e.target.value)}>
                  <option>Laki-laki</option><option>Perempuan</option>
                </select></div>
              <div><label className="form-label">Status Pernikahan</label>
                <select className="form-select" value={form.status_nikah} onChange={e => set('status_nikah', e.target.value)}>
                  <option>Belum Menikah</option><option>Menikah</option><option>Cerai</option>
                </select></div>
              <div className="md:col-span-2"><label className="form-label">Pekerjaan</label>
                <input className="form-input" value={form.pekerjaan} onChange={e => set('pekerjaan', e.target.value)} /></div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-ghost">← Kembali</button>
              <button onClick={() => { if (form.nama_paspor && form.nik && form.no_paspor) setStep(3); else alert('Lengkapi data wajib.'); }} className="btn-primary flex items-center gap-2">Selanjutnya <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 3: Address */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-lg">Alamat</h3>
            <div><label className="form-label">Alamat Lengkap</label>
              <textarea className="form-input" rows="3" value={form.alamat} onChange={e => set('alamat', e.target.value)} placeholder="Jalan, RT/RW, No. Rumah"></textarea></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="form-label">Provinsi</label>
                <input className="form-input" value={form.provinsi} onChange={e => set('provinsi', e.target.value)} /></div>
              <div><label className="form-label">Kota/Kabupaten</label>
                <input className="form-input" value={form.kota} onChange={e => set('kota', e.target.value)} /></div>
              <div><label className="form-label">Kecamatan</label>
                <input className="form-input" value={form.kecamatan} onChange={e => set('kecamatan', e.target.value)} /></div>
              <div><label className="form-label">Kelurahan</label>
                <input className="form-input" value={form.kelurahan} onChange={e => set('kelurahan', e.target.value)} /></div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn-ghost">← Kembali</button>
              <button onClick={() => setStep(4)} className="btn-primary flex items-center gap-2">Selanjutnya <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 4: Emergency Contact */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-lg">Kontak Darurat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="form-label">Nama Kontak Darurat</label>
                <input className="form-input" value={form.nama_darurat} onChange={e => set('nama_darurat', e.target.value)} /></div>
              <div><label className="form-label">Hubungan</label>
                <input className="form-input" value={form.hub_darurat} onChange={e => set('hub_darurat', e.target.value)} placeholder="Istri / Suami / Anak / dll" /></div>
              <div className="md:col-span-2"><label className="form-label">No. HP Kontak Darurat</label>
                <input className="form-input" value={form.hp_darurat} onChange={e => set('hp_darurat', e.target.value)} placeholder="08xxxxxxxxxx" /></div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(3)} className="btn-ghost">← Kembali</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Kirim Pendaftaran <Check size={16} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Main Dashboard =====
export default function JamaahDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendaftaran, setPendaftaran] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);
  const [paketList, setPaketList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [galeriList, setGaleriList] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [pend, notif, paket, jadwal, galeri] = await Promise.all([
        apiFetch('/jamaah/pendaftaran'),
        apiFetch('/notifikasi'),
        apiFetch('/public/paket'),
        apiFetch('/public/keberangkatan'),
        apiFetch('/public/galeri').catch(() => [])
      ]);
      setPendaftaran(pend);
      setNotifikasi(notif);
      setPaketList(paket);
      setJadwalList(jadwal);
      setGaleriList(galeri || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const myPendaftaran = pendaftaran[0] || null;
  const unreadNotif = notifikasi.filter(n => !n.dibaca).length;

  // Document upload handler
  const handleDocUpload = async (pendaftaranId, jenis, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pendaftaran_id', pendaftaranId);
    formData.append('jenis', jenis);
    try {
      await apiFetch('/jamaah/dokumen', { method: 'POST', body: formData, headers: {} });
      showToast(`Dokumen ${jenis} berhasil diupload.`);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Payment upload handler
  const handlePaymentSubmit = async (pendaftaranId, jenis, jumlah, file) => {
    const formData = new FormData();
    if (file) formData.append('bukti', file);
    formData.append('pendaftaran_id', pendaftaranId);
    formData.append('jenis', jenis);
    formData.append('jumlah', jumlah);
    try {
      await apiFetch('/jamaah/pembayaran', { method: 'POST', body: formData, headers: {} });
      showToast('Pembayaran berhasil dikirim. Menunggu verifikasi admin.');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="min-h-screen bg-[#FFF8FA]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)}></div>
          <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-almarwa-100/50 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-almarwa-50">
              <Menu size={20} className="text-almarwa-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 capitalize">{activeMenu === 'dashboard' ? `Assalamu'alaikum, ${user?.nama?.split(' ')[0]}` : activeMenu.replace('_', ' ')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveMenu('notifikasi')} className="relative p-2 rounded-lg hover:bg-almarwa-50">
              <Bell size={20} className="text-gray-500" />
              {unreadNotif > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-almarwa-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadNotif}</span>}
            </button>
            <button onClick={loadData} className="p-2 rounded-lg hover:bg-almarwa-50"><RefreshCw size={18} className="text-gray-400" /></button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* ===== DASHBOARD ===== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-gray-500">Selamat datang kembali! Berikut adalah ringkasan perjalanan umroh Anda. 🕋</p>

              {myPendaftaran ? (
                <>
                  {/* Progress */}
                  <div className="card p-6">
                    <h3 className="font-bold text-sm text-gray-700 mb-4">Progress Pendaftaran</h3>
                    <ProgressSteps currentStatus={myPendaftaran.status} />
                  </div>

                  {/* Status Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stat-card">
                      <div className="stat-icon bg-almarwa-100"><Package className="text-almarwa-600" size={22} /></div>
                      <div><p className="text-xs text-gray-400">Paket</p><p className="font-bold text-gray-900">{myPendaftaran.paket_nama}</p></div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon bg-blue-100"><CalendarDays className="text-blue-600" size={22} /></div>
                      <div><p className="text-xs text-gray-400">Keberangkatan</p><p className="font-bold text-gray-900">{formatDate(myPendaftaran.tanggal_berangkat)}</p></div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon bg-green-100"><CheckCircle className="text-green-600" size={22} /></div>
                      <div><p className="text-xs text-gray-400">Status</p><p className="font-bold text-gray-900 text-sm">{myPendaftaran.status}</p></div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon bg-amber-100"><CreditCard className="text-amber-600" size={22} /></div>
                      <div>
                        <p className="text-xs text-gray-400">Sisa Bayar (Terverifikasi)</p>
                        <p className="font-bold text-almarwa-600">{formatRupiah(myPendaftaran.sisa_bayar)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Notice if payment is pending verification */}
                  {myPendaftaran.total_pending_bayar > 0 && (
                    <div className="card p-4 bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm">
                      <Clock size={22} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm text-amber-950">Bukti Pembayaran Sedang Diverifikasi Admin</h4>
                          <span className="badge bg-amber-200 text-amber-900 border border-amber-300 font-bold text-[10px]">Menunggu Verifikasi</span>
                        </div>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                          Bukti pembayaran Anda sebesar <strong className="font-extrabold text-amber-950">{formatRupiah(myPendaftaran.total_pending_bayar)}</strong> telah terkirim. Admin kami akan segera memverifikasi transaksi ini.
                        </p>
                        <div className="mt-2 text-xs font-semibold text-amber-900 bg-amber-100/80 px-3 py-1.5 rounded-lg inline-block border border-amber-200">
                          Estimasi Sisa Bayar Setelah Diverifikasi Admin: <strong>{formatRupiah(myPendaftaran.sisa_bayar_est)}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dokumen Status */}
                  <div className="card p-6">
                    <h3 className="font-bold mb-4">Kelengkapan Dokumen</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['KTP', 'KK', 'Paspor', 'Foto'].map(jenis => {
                        const doc = myPendaftaran.dokumen?.find(d => d.jenis === jenis);
                        return (
                          <div key={jenis} className={`p-3 rounded-xl border text-center ${
                            doc?.status === 'Valid' ? 'border-green-200 bg-green-50' :
                            doc?.status === 'Belum Diperiksa' ? 'border-amber-200 bg-amber-50' :
                            doc ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="text-lg mb-1">{doc?.status === 'Valid' ? '✅' : doc ? '📄' : '❌'}</div>
                            <p className="text-xs font-semibold">{jenis}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{doc ? doc.status : 'Belum Upload'}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Galeri & Dokumentasi Jamaah preview card */}
                  <div className="card p-6 border border-almarwa-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Image size={18} className="text-almarwa-600" /> Galeri Foto & Dokumentasi Jamaah
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">Momen-momen indah perjalanan ibadah jamaah Almarwa Tour</p>
                      </div>
                      <button onClick={() => setActiveMenu('galeri')} className="text-xs font-bold text-almarwa-600 hover:text-almarwa-700 flex items-center gap-1">
                        Lihat Semua <ChevronRight size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {galeriList.slice(0, 3).map(g => (
                        <div key={g.id} className="group relative rounded-xl overflow-hidden shadow-sm border border-almarwa-100 bg-white cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                          onClick={() => setPreviewPhoto(g)}>
                          <div className="h-40 overflow-hidden relative">
                            <img src={g.url || 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=80'}
                              alt={g.judul}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=80'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3 text-white">
                              <h4 className="font-bold text-sm line-clamp-1">{g.judul}</h4>
                              <p className="text-[11px] text-white/80 line-clamp-1">{g.deskripsi}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="card p-10 text-center">
                  <div className="text-5xl mb-4">🕋</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Pendaftaran</h3>
                  <p className="text-gray-500 mb-6">Anda belum mendaftar paket umroh. Mulai perjalanan ibadah Anda sekarang!</p>
                  <button onClick={() => setActiveMenu('pendaftaran')} className="btn-primary">
                    Daftar Umroh Sekarang <ArrowRight size={16} className="inline ml-2" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== PENDAFTARAN ===== */}
          {activeMenu === 'pendaftaran' && (
            <div className="animate-fade-in">
              {myPendaftaran ? (
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-4">Data Pendaftaran Anda</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {[
                        ['Nama Paspor', myPendaftaran.nama_paspor],
                        ['NIK', myPendaftaran.nik],
                        ['No. Paspor', myPendaftaran.no_paspor],
                        ['Tempat/Tgl Lahir', `${myPendaftaran.tempat_lahir}, ${formatDate(myPendaftaran.tanggal_lahir)}`],
                        ['Jenis Kelamin', myPendaftaran.jenis_kelamin],
                        ['Status Nikah', myPendaftaran.status_nikah],
                        ['Pekerjaan', myPendaftaran.pekerjaan],
                        ['Paket', myPendaftaran.paket_nama],
                        ['Harga Paket', formatRupiah(myPendaftaran.paket_harga)],
                        ['Keberangkatan', formatDate(myPendaftaran.tanggal_berangkat)],
                        ['Status', myPendaftaran.status],
                        ['Tanggal Daftar', formatDate(myPendaftaran.created_at)],
                      ].map(([label, value], i) => (
                        <div key={i} className="flex justify-between border-b border-almarwa-50 pb-2">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-medium text-gray-900 text-right">{value || '-'}</span>
                        </div>
                      ))}
                    </div>
                    {myPendaftaran.catatan_admin && (
                      <div className="mt-4 p-3 bg-almarwa-50 rounded-xl">
                        <p className="text-xs font-semibold text-almarwa-600">Catatan Admin:</p>
                        <p className="text-sm text-gray-700 mt-1">{myPendaftaran.catatan_admin}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <RegistrationForm onSuccess={loadData} />
              )}
            </div>
          )}

          {/* ===== PAKET ===== */}
          {activeMenu === 'paket' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paketList.map(p => (
                  <div key={p.id} className="card p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{p.nama}</h3>
                        <p className="text-2xl font-extrabold text-almarwa-600 mt-1">{formatRupiah(p.harga)}</p>
                      </div>
                      {p.is_populer && <span className="badge-gold text-xs">⭐ Populer</span>}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><Building2 size={14} className="inline text-almarwa-400 mr-1" /> {p.hotel_mekkah}</p>
                      <p><Building2 size={14} className="inline text-almarwa-400 mr-1" /> {p.hotel_madinah}</p>
                      <p><Plane size={14} className="inline text-almarwa-400 mr-1" /> {p.maskapai}</p>
                      <p><Clock size={14} className="inline text-almarwa-400 mr-1" /> {p.durasi}</p>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{p.deskripsi}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== JADWAL ===== */}
          {activeMenu === 'jadwal' && (
            <div className="animate-fade-in table-wrapper">
              <table>
                <thead><tr><th>Paket</th><th>Berangkat</th><th>Pulang</th><th>Kuota</th><th>Status</th></tr></thead>
                <tbody>
                  {jadwalList.map(j => (
                    <tr key={j.id}>
                      <td className="font-semibold">{j.paket_nama}</td>
                      <td>{formatDate(j.tanggal_berangkat)}</td>
                      <td>{formatDate(j.tanggal_pulang)}</td>
                      <td>{j.terisi}/{j.kuota}</td>
                      <td><span className={`badge ${j.status === 'Pendaftaran Dibuka' ? 'badge-green' : j.status === 'Hampir Penuh' ? 'badge-yellow' : 'badge-red'}`}>{j.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== DOKUMEN ===== */}
          {activeMenu === 'dokumen' && myPendaftaran && (
            <div className="animate-fade-in space-y-4">
              <div className="card p-6">
                <h3 className="font-bold mb-4">Upload Dokumen</h3>
                <p className="text-sm text-gray-500 mb-4">Upload dokumen dalam format JPG, PNG, atau PDF. Maksimal 5MB per file.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['KTP', 'KK', 'Paspor', 'Foto'].map(jenis => {
                    const doc = myPendaftaran.dokumen?.find(d => d.jenis === jenis);
                    return (
                      <div key={jenis} className="border border-almarwa-100 rounded-xl p-4 bg-white flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm text-gray-800">{jenis}</span>
                            {doc && <span className={`badge ${doc.status === 'Valid' ? 'badge-green' : doc.status === 'Belum Diperiksa' ? 'badge-yellow' : 'badge-red'}`}>{doc.status}</span>}
                          </div>

                          {doc?.file_path ? (
                            <div className="w-full h-32 my-2 rounded-lg bg-gray-50 border overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setSelectedImage({ title: `Dokumen ${jenis}`, url: doc.file_path, catatan: doc.catatan })}>
                              <img src={doc.file_path} alt={jenis} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-full h-24 my-2 rounded-lg bg-gray-50 border border-dashed flex items-center justify-center text-gray-400 text-xs">
                              Belum ada file diupload
                            </div>
                          )}

                          {doc?.catatan && <p className="text-xs text-red-500 mb-2">⚠️ Catatan: {doc.catatan}</p>}
                        </div>

                        <div className="flex gap-2 mt-2">
                          {doc?.file_path && (
                            <button type="button" onClick={() => setSelectedImage({ title: `Dokumen ${jenis}`, url: doc.file_path, catatan: doc.catatan })}
                              className="btn-secondary btn-sm flex-1 text-xs py-2 flex items-center justify-center gap-1">
                              <Eye size={14} /> Lihat
                            </button>
                          )}
                          <label className="btn-primary btn-sm flex-1 py-2 flex items-center justify-center gap-1 cursor-pointer text-xs">
                            <Upload size={14} /> {doc ? 'Ganti File' : 'Upload'}
                            <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf"
                              onChange={e => { if (e.target.files[0]) handleDocUpload(myPendaftaran.id, jenis, e.target.files[0]); }} />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'dokumen' && !myPendaftaran && (
            <div className="card p-10 text-center">
              <p className="text-gray-500">Silakan daftar umroh terlebih dahulu untuk mengupload dokumen.</p>
              <button onClick={() => setActiveMenu('pendaftaran')} className="btn-primary mt-4">Daftar Umroh</button>
            </div>
          )}

          {/* ===== PEMBAYARAN ===== */}
          {activeMenu === 'pembayaran' && myPendaftaran && (
            <div className="animate-fade-in space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="stat-card">
                  <div className="stat-icon bg-almarwa-100"><CreditCard className="text-almarwa-600" size={22} /></div>
                  <div>
                    <p className="text-xs text-gray-400">Total Biaya Paket</p>
                    <p className="font-bold text-lg text-gray-900">{formatRupiah(myPendaftaran.paket_harga)}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{myPendaftaran.paket_nama}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon bg-green-100"><CheckCircle className="text-green-600" size={22} /></div>
                  <div>
                    <p className="text-xs text-gray-400">Sudah Dibayar</p>
                    <p className="font-bold text-lg text-green-600">{formatRupiah(myPendaftaran.total_bayar)}</p>
                    <p className="text-[11px] text-green-500 mt-0.5">
                      {myPendaftaran.paket_harga > 0 ? Math.round((myPendaftaran.total_bayar / myPendaftaran.paket_harga) * 100) : 0}% dari total
                    </p>
                  </div>
                </div>
                <div className={`stat-card ${myPendaftaran.sisa_bayar > 0 ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
                  <div className={`stat-icon ${myPendaftaran.sisa_bayar > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                    <AlertCircle className={myPendaftaran.sisa_bayar > 0 ? 'text-red-500' : 'text-green-600'} size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Sisa Tagihan</p>
                    <p className={`font-extrabold text-xl ${myPendaftaran.sisa_bayar > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {myPendaftaran.sisa_bayar > 0 ? formatRupiah(myPendaftaran.sisa_bayar) : '✓ LUNAS'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {myPendaftaran.sisa_bayar > 0 ? 'Harap segera dilunasi' : 'Semua biaya terbayar'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Progress Bar */}
              {myPendaftaran.paket_harga > 0 && (
                <div className="card p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Progress Pembayaran</span>
                    <span className="text-sm font-bold text-almarwa-600">
                      {Math.round((myPendaftaran.total_bayar / myPendaftaran.paket_harga) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-almarwa-500 to-almarwa-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.round((myPendaftaran.total_bayar / myPendaftaran.paket_harga) * 100))}%` }}>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                    <span>Dibayar: {formatRupiah(myPendaftaran.total_bayar)}</span>
                    <span>Sisa: {formatRupiah(myPendaftaran.sisa_bayar)}</span>
                  </div>
                </div>
              )}

              {/* Payment History */}
              <div className="card">
                <div className="p-5 border-b border-almarwa-50"><h3 className="font-bold">Riwayat Pembayaran</h3></div>
                <div className="table-wrapper !border-0 !shadow-none !rounded-none">
                  <table>
                    <thead><tr><th>Tanggal</th><th>Jenis</th><th>Jumlah</th><th>Status</th></tr></thead>
                    <tbody>
                      {(myPendaftaran.pembayaran || []).map(p => (
                        <tr key={p.id}>
                          <td>{formatDate(p.tanggal)}</td>
                          <td className="font-medium">{p.jenis}</td>
                          <td className="font-bold text-almarwa-600">{formatRupiah(p.jumlah)}</td>
                          <td><span className={`badge ${p.status === 'Terverifikasi' ? 'badge-green' : p.status === 'Ditolak' ? 'badge-red' : 'badge-yellow'}`}>{p.status}</span></td>
                        </tr>
                      ))}
                      {(!myPendaftaran.pembayaran || myPendaftaran.pembayaran.length === 0) && (
                        <tr><td colSpan="4" className="text-center text-gray-400 py-6">Belum ada riwayat pembayaran.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bank Accounts Info */}
              <div className="card p-6 bg-gradient-to-r from-almarwa-50 to-pink-50 border border-almarwa-100">
                <h3 className="font-bold text-gray-900 mb-2">Rekening Resmi Pembayaran Almarwa</h3>
                <p className="text-xs text-gray-600 mb-4">Silakan lakukan transfer ke salah satu rekening resmi atas nama <strong>PT Almarwa Tour & Travel</strong>:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-almarwa-100 shadow-sm">
                    <p className="text-xs font-bold text-blue-600">BANK BCA</p>
                    <p className="text-sm font-mono font-bold text-gray-800 mt-1">123-456-7890</p>
                    <p className="text-[10px] text-gray-400">a.n PT Almarwa Tour Travel</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-almarwa-100 shadow-sm">
                    <p className="text-xs font-bold text-yellow-600">BANK MANDIRI</p>
                    <p className="text-sm font-mono font-bold text-gray-800 mt-1">137-00-1234567-8</p>
                    <p className="text-[10px] text-gray-400">a.n PT Almarwa Tour Travel</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-almarwa-100 shadow-sm">
                    <p className="text-xs font-bold text-emerald-600">BANK BSI</p>
                    <p className="text-sm font-mono font-bold text-gray-800 mt-1">712-345-6789</p>
                    <p className="text-[10px] text-gray-400">a.n PT Almarwa Tour Travel</p>
                  </div>
                </div>
              </div>

              {/* New Payment Form */}
              {myPendaftaran.sisa_bayar > 0 && (
                <PaymentForm pendaftaranId={myPendaftaran.id} sisaBayar={myPendaftaran.sisa_bayar} onSubmit={handlePaymentSubmit} />
              )}
              {myPendaftaran.sisa_bayar === 0 && (
                <div className="card p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-center">
                  <p className="text-green-700 font-bold">✅ Pembayaran Lunas!</p>
                  <p className="text-xs text-green-600 mt-1">Semua biaya umroh Anda telah terbayar. Terima kasih!</p>
                </div>
              )}
            </div>
          )}

          {/* ===== GALERI FOTO JAMAAH ===== */}
          {activeMenu === 'galeri' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-r from-almarwa-900 via-almarwa-800 to-almarwa-900 p-6 rounded-2xl text-white shadow-lg border border-almarwa-700">
                <h3 className="font-extrabold text-xl flex items-center gap-2">
                  <Image size={24} className="text-almarwa-300" /> Galeri Foto & Dokumentasi Jamaah
                </h3>
                <p className="text-xs text-white/70 mt-1">
                  Kumpulan momen berkesan, kegiatan ibadah di Makkah & Madinah, serta kenangan indah jamaah Almarwa Tour & Travel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {galeriList.map(g => (
                  <div key={g.id} className="card overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col border border-almarwa-100 cursor-pointer"
                    onClick={() => setPreviewPhoto(g)}>
                    <div className="relative h-52 bg-gray-100 overflow-hidden">
                      <img
                        src={g.url || 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=80'}
                        alt={g.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=80'; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                          <Eye size={14} /> Lihat Foto & Caption
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-medium">
                        {formatDate(g.created_at)}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{g.judul}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{g.deskripsi || 'Dokumentasi ibadah jamaah.'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {galeriList.length === 0 && (
                  <div className="col-span-full card p-12 text-center text-gray-400">
                    <Image size={48} className="mx-auto mb-3 text-gray-300 opacity-50" />
                    <p className="font-medium text-gray-600">Belum ada foto galeri.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== NOTIFIKASI ===== */}
          {activeMenu === 'notifikasi' && (
            <div className="animate-fade-in space-y-3">
              {notifikasi.length === 0 ? (
                <div className="card p-10 text-center text-gray-400">Belum ada notifikasi.</div>
              ) : notifikasi.map(n => (
                <div key={n.id} className={`card p-4 flex items-start gap-3 ${!n.dibaca ? 'border-l-4 border-l-almarwa-500' : ''}`}
                  onClick={async () => { if (!n.dibaca) { await apiFetch(`/notifikasi/${n.id}/read`, { method: 'PUT' }); loadData(); } }}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    n.tipe === 'success' ? 'bg-green-100' : n.tipe === 'warning' ? 'bg-amber-100' : n.tipe === 'error' ? 'bg-red-100' : 'bg-almarwa-100'
                  }`}>
                    {n.tipe === 'success' ? <CheckCircle size={18} className="text-green-600" /> :
                     n.tipe === 'warning' ? <AlertCircle size={18} className="text-amber-600" /> :
                     <Bell size={18} className="text-almarwa-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{n.judul}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.pesan}</p>
                    <p className="text-[10px] text-gray-300 mt-1">{formatDate(n.created_at)}</p>
                  </div>
                  {!n.dibaca && <div className="w-2 h-2 bg-almarwa-500 rounded-full shrink-0 mt-2"></div>}
                </div>
              ))}
            </div>
          )}

          {/* ===== PROFIL ===== */}
          {activeMenu === 'profil' && (
            <div className="animate-fade-in card p-6 max-w-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-almarwa-500 to-almarwa-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{user?.nama?.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user?.nama}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className="badge badge-pink mt-1">Jamaah</span>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[['Nama', user?.nama], ['Email', user?.email], ['No. HP', user?.no_hp], ['Role', 'Jamaah']].map(([l, v], i) => (
                  <div key={i} className="flex justify-between border-b border-almarwa-50 pb-2">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-almarwa-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">{selectedImage.title}</h3>
              <button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-4 bg-slate-900 flex justify-center items-center min-h-[300px] max-h-[500px]">
              <img src={selectedImage.url} alt={selectedImage.title} className="max-h-[460px] w-auto object-contain rounded-lg shadow-2xl" />
            </div>
            {selectedImage.catatan && (
              <div className="p-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-800">
                <strong>Catatan Admin:</strong> {selectedImage.catatan}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {previewPhoto && (
        <div className="modal-overlay z-50" onClick={() => setPreviewPhoto(null)}>
          <div className="modal-content max-w-3xl overflow-hidden p-0 rounded-2xl bg-black/95 text-white" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img
                src={previewPhoto.url || 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80'}
                alt={previewPhoto.judul}
                className="w-full max-h-[70vh] object-contain mx-auto"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80'; }}
              />
              <button onClick={() => setPreviewPhoto(null)} className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 rounded-full text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 bg-gray-900 border-t border-gray-800">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="font-extrabold text-lg text-white">{previewPhoto.judul}</h3>
                <span className="text-xs text-almarwa-300 font-medium whitespace-nowrap bg-almarwa-900/80 px-2.5 py-1 rounded-full border border-almarwa-700">
                  {formatDate(previewPhoto.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{previewPhoto.deskripsi || 'Dokumentasi kegiatan ibadah jamaah Almarwa Tour & Travel.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Payment Form Component =====
function PaymentForm({ pendaftaranId, sisaBayar, onSubmit }) {
  const [jenis, setJenis] = useState('DP');
  const [jumlah, setJumlah] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleJenisChange = (newJenis) => {
    setJenis(newJenis);
    if (newJenis === 'Pelunasan' && sisaBayar) {
      setJumlah(sisaBayar.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jumlah) return;
    setLoading(true);
    await onSubmit(pendaftaranId, jenis, jumlah, file);
    setLoading(false);
    setJumlah('');
    setFile(null);
  };

  return (
    <div className="card p-6 border-l-4 border-l-almarwa-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-almarwa-50">
        <div>
          <h3 className="font-bold text-gray-900">Kirim Bukti Pembayaran</h3>
          <p className="text-xs text-gray-500 mt-0.5">Upload struk / bukti transfer bank untuk verifikasi admin.</p>
        </div>
        {sisaBayar > 0 && (
          <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
            Sisa Tagihan: {formatRupiah(sisaBayar)}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Jenis Pembayaran</label>
            <select className="form-select" value={jenis} onChange={e => handleJenisChange(e.target.value)}>
              <option value="DP">DP (Uang Muka)</option>
              <option value="Cicilan">Cicilan Ke-N</option>
              <option value="Pelunasan">Pelunasan (Sisa Pembayaran)</option>
            </select>
          </div>
          <div>
            <label className="form-label">Jumlah (Rp) *</label>
            <input type="number" className="form-input font-semibold" required value={jumlah} onChange={e => setJumlah(e.target.value)} placeholder="Contoh: 10000000" />
            {jenis === 'Pelunasan' && sisaBayar > 0 && (
              <p className="text-[11px] text-almarwa-600 mt-1">💡 Otomatis terisi sisa tagihan: {formatRupiah(sisaBayar)}</p>
            )}
          </div>
        </div>
        <div>
          <label className="form-label">Bukti Pembayaran (JPG, PNG, atau PDF)</label>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setFile(e.target.files[0])}
            className="form-input text-sm file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-almarwa-100 file:text-almarwa-700 file:font-semibold" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Kirim Bukti Pembayaran'}
        </button>
      </form>
    </div>
  );
}
