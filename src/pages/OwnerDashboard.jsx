/* ============================================================
   ALMARWA TOUR TRAVEL - Owner Dashboard
   ============================================================ */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth, useToast, apiFetch, formatRupiah, formatDate, formatDateShort } from '../App';
import { AlmarwaLogo } from './LandingPage';
import {
  LayoutDashboard, Users, TrendingUp, CalendarDays, CreditCard, BarChart3,
  ClipboardList, Download, LogOut, Menu, Home, Bell, RefreshCw, Printer,
  Package, DollarSign, PieChart, Activity, FileText, Eye, ArrowUp, ArrowDown
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

// Chart color palette matching Almarwa pink brand
const chartColors = {
  pink: 'rgba(216, 27, 96, 1)',
  pinkLight: 'rgba(216, 27, 96, 0.2)',
  gold: 'rgba(212, 175, 55, 1)',
  goldLight: 'rgba(212, 175, 55, 0.2)',
  rose: 'rgba(233, 30, 99, 0.8)',
  roseLight: 'rgba(233, 30, 99, 0.1)',
  green: 'rgba(16, 185, 129, 1)',
  blue: 'rgba(59, 130, 246, 1)',
  purple: 'rgba(139, 92, 246, 1)',
};

// ===== Sidebar =====
function OwnerSidebar({ activeMenu, setActiveMenu, onClose }) {
  const { user, logout, navigate } = useAuth();
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jamaah', label: 'Data Jamaah', icon: Users },
    { id: 'paket', label: 'Paket Umroh', icon: Package },
    { id: 'keberangkatan', label: 'Keberangkatan', icon: CalendarDays },
    { id: 'pembayaran', label: 'Pembayaran', icon: CreditCard },
    { id: 'laporan', label: 'Laporan', icon: FileText },
    { id: 'activity', label: 'Activity Log', icon: ClipboardList },
  ];

  return (
    <aside className="sidebar scrollbar-pink">
      <div className="p-5 border-b border-white/10">
        <AlmarwaLogo light size="md" />
        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Owner Panel</p>
      </div>
      <div className="px-4 py-3">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-white/90 text-sm font-semibold truncate">{user?.nama}</p>
          <p className="text-white/50 text-xs">Owner</p>
        </div>
      </div>
      <nav className="flex-1 pb-4">
        <div className="px-4 pt-4 pb-1 text-[10px] uppercase tracking-widest text-white/40 font-bold">Monitoring</div>
        {items.map(item => (
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

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [jamaahList, setJamaahList] = useState([]);
  const [paketList, setPaketList] = useState([]);
  const [keberangkatanList, setKeberangkatanList] = useState([]);
  const [pembayaranList, setPembayaranList] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  const loadAll = useCallback(async () => {
    try {
      const [s, j, p, k, pay, a] = await Promise.all([
        apiFetch('/admin/stats'),
        apiFetch('/admin/jamaah'),
        apiFetch('/admin/paket'),
        apiFetch('/admin/keberangkatan'),
        apiFetch('/admin/pembayaran'),
        apiFetch('/owner/activity-log'),
      ]);
      setStats(s); setJamaahList(j); setPaketList(p); setKeberangkatanList(k);
      setPembayaranList(pay); setActivityLog(a);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // CSV export
  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
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
              <div class="company-desc">Izin Kemenag RI PPIU No. 1234/2020 • Laporan Eksekutif Owner</div>
              <div class="company-contact">Jl. KH. Ahmad Dahlan No. 123, Jakarta Selatan | WA: +62 812-3456-7890 | info@almarwatour.com</div>
            </div>
          </div>
          <div class="gold-divider"></div>
          <div class="bismillah">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
        </div>

        <div class="doc-title-box">
          <div class="doc-title">LAPORAN EKSEKUTIF DATA JAMAAH UMROH & HAJI PLUS</div>
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
            <p>Petugas Verifikasi Data,</p>
            <div class="sign-space"></div>
            <p class="sign-name">Staff Admin Almarwa Tour</p>
            <p class="sign-role">PT. Almarwa Tour & Travel</p>
          </div>
          <div class="sign-box">
            <p>Mengetahui & Menyetujui,</p>
            <p>Direktur Utama / Owner,</p>
            <div class="sign-space"></div>
            <p class="sign-name">H. Owner Almarwa, S.Ag</p>
            <p class="sign-role">Owner Almarwa Tour</p>
          </div>
        </div>
      `;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan PDF Owner - Almarwa Tour & Travel</title>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
        <style>
          @page { size: A4 portrait; margin: 12mm 15mm 15mm 15mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e1b1d; background: #ffffff; font-size: 10.5px; line-height: 1.4; padding: 15px; }
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
          .doc-title-box { background: linear-gradient(135deg, #fff1f6, #ffe4ee); border: 1px solid #fecddf; border-radius: 8px; padding: 10px; text-align: center; margin-bottom: 12px; }
          .doc-title { font-size: 13px; font-weight: 800; color: #c2185b; letter-spacing: 0.5px; }
          .doc-meta { font-size: 9px; color: #6b5b63; font-weight: 600; margin-top: 3px; }
          .stats-row { display: flex; gap: 8px; margin-bottom: 12px; }
          .stat-box { flex: 1; background: #fff8fa; border: 1px solid #fecddf; border-radius: 6px; padding: 6px; text-align: center; }
          .stat-val { display: block; font-size: 13px; font-weight: 800; color: #d81b60; }
          .stat-lbl { font-size: 8px; color: #6b5b63; text-transform: uppercase; font-weight: 700; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 8.5px; }
          .data-table th { background: #d81b60; color: #ffffff; text-align: left; padding: 5px 6px; font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; border-right: 1px solid rgba(255,255,255,0.2); }
          .data-table td { padding: 5px 6px; border-bottom: 1px solid #fecddf; border-right: 1px solid #fff1f6; vertical-align: top; }
          .data-table tr:nth-child(even) { background: #fff8fa; }
          .name-text { color: #871644; font-size: 9.5px; }
          .pkg-text { color: #d81b60; }
          .sub-info { font-size: 8px; color: #6b5b63; }
          .text-center { text-align: center; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 10px; font-size: 8px; font-weight: 700; text-align: center; white-space: nowrap; }
          .b-green { background: #d1fae5; color: #065f46; }
          .b-yellow { background: #fef3c7; color: #92400e; }
          .b-pink { background: #ffe4ee; color: #9f1239; }
          .footer-sign-block { display: flex; justify-content: space-between; margin-top: 15px; page-break-inside: avoid; }
          .sign-box { text-align: center; width: 220px; font-size: 9px; color: #4b5563; }
          .sign-space { height: 40px; }
          .sign-name { font-weight: 800; color: #871644; text-decoration: underline; font-size: 9.5px; }
          .sign-role { font-size: 8px; color: #6b5b63; }
          @media print { body { padding: 0; } .no-print { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; padding: 10px 15px; background: #fff1f6; border: 1px solid #fecddf; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span style="font-weight: bold; color: #c2185b; font-size: 13px;">📄 Laporan Eksekutif PDF Almarwa</span>
            <p style="font-size: 11px; color: #6b5b63; margin-top: 2px;">Klik tombol di kanan untuk mengunduh / simpan sebagai PDF.</p>
          </div>
          <button onclick="window.print();" style="background: linear-gradient(135deg, #d81b60, #c2185b); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: inherit; box-shadow: 0 4px 12px rgba(216,27,96,0.3); display: flex; align-items: center; gap: 6px;">
            🖨️ Cetak / Simpan Ke PDF
          </button>
        </div>
        ${contentHtml}
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // Print report
  const printReport = () => { window.print(); };

  // Chart data
  const monthlyChartData = {
    labels: (stats.monthlyStats || []).map(m => {
      const [y, mo] = m.bulan.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return months[parseInt(mo) - 1] + ' ' + y;
    }),
    datasets: [
      {
        label: 'Jamaah Mendaftar',
        data: (stats.monthlyStats || []).map(m => m.jamaah),
        backgroundColor: chartColors.pinkLight,
        borderColor: chartColors.pink,
        borderWidth: 2,
        borderRadius: 8,
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const revenueChartData = {
    labels: (stats.monthlyStats || []).map(m => {
      const [y, mo] = m.bulan.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return months[parseInt(mo) - 1];
    }),
    datasets: [{
      label: 'Pendapatan (Juta)',
      data: (stats.monthlyStats || []).map(m => m.pendapatan / 1000000),
      backgroundColor: chartColors.goldLight,
      borderColor: chartColors.gold,
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const paketChartData = {
    labels: (stats.paketStats || []).map(p => p.nama),
    datasets: [{
      data: (stats.paketStats || []).map(p => p.total),
      backgroundColor: [chartColors.pink, chartColors.gold, chartColors.purple, chartColors.green, chartColors.blue],
      borderWidth: 0,
      hoverOffset: 10,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E1B1D',
        titleFont: { family: 'Plus Jakarta Sans' },
        bodyFont: { family: 'Plus Jakarta Sans' },
        cornerRadius: 8,
        padding: 12,
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(216,27,96,0.05)' }, ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true, font: { family: 'Plus Jakarta Sans', size: 12 } } },
      tooltip: { backgroundColor: '#1E1B1D', cornerRadius: 8, padding: 12 }
    }
  };

  // Payment totals
  const totalPendapatan = stats.totalPendapatan || 0;
  const lunas = jamaahList.filter(j => j.status_bayar === 'Lunas').length;
  const belumLunas = jamaahList.filter(j => j.status_bayar !== 'Lunas').length;

  return (
    <div className="min-h-screen bg-[#FFF8FA]">
      <div className="hidden lg:block"><OwnerSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} /></div>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)}></div>
          <OwnerSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-almarwa-100/50 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-almarwa-50"><Menu size={20} className="text-almarwa-600" /></button>
            <h1 className="text-lg font-bold text-gray-900">{activeMenu === 'dashboard' ? 'Dashboard Owner' : activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={printReport} className="p-2 rounded-lg hover:bg-almarwa-50" title="Print"><Printer size={18} className="text-gray-400" /></button>
            <button onClick={loadAll} className="p-2 rounded-lg hover:bg-almarwa-50"><RefreshCw size={18} className="text-gray-400" /></button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* ===== DASHBOARD ===== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Jamaah', val: stats.totalJamaah || 0, icon: Users, color: 'bg-almarwa-100', iconColor: 'text-almarwa-600', sub: `+${stats.jamaahBaru || 0} bulan ini` },
                  { label: 'Total Pendapatan', val: formatRupiah(totalPendapatan), icon: TrendingUp, color: 'bg-green-100', iconColor: 'text-green-600', sub: `${lunas} lunas, ${belumLunas} belum` },
                  { label: 'Keberangkatan', val: stats.totalKeberangkatan || 0, icon: CalendarDays, color: 'bg-blue-100', iconColor: 'text-blue-600', sub: `Kuota: ${stats.totalTerisi || 0}/${stats.totalKuota || 0}` },
                  { label: 'Paket Aktif', val: stats.totalPaket || 0, icon: Package, color: 'bg-purple-100', iconColor: 'text-purple-600', sub: `${stats.totalPendaftaran || 0} pendaftaran` },
                ].map((s, i) => (
                  <div key={i} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`stat-icon ${s.color}`}><s.icon className={s.iconColor} size={22} /></div>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">{s.val}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    <p className="text-[10px] text-almarwa-500 mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Premium Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Menunggu Verifikasi', val: stats.menungguVerifikasi || 0, color: 'text-amber-600' },
                  { label: 'Belum Lunas', val: stats.belumLunas || 0, color: 'text-red-500' },
                  { label: 'Kuota Tersisa', val: stats.kuotaTersisa || 0, color: 'text-blue-500' },
                  { label: 'Jamaah Baru', val: stats.jamaahBaru || 0, color: 'text-almarwa-600' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 text-center border border-almarwa-50">
                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.val}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2"><Activity size={18} className="text-almarwa-500" /> Jamaah Per Bulan</h3>
                  </div>
                  <div className="h-64"><Line data={monthlyChartData} options={chartOptions} /></div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2"><DollarSign size={18} className="text-amber-500" /> Pendapatan Per Bulan (Juta)</h3>
                  </div>
                  <div className="h-64"><Bar data={revenueChartData} options={chartOptions} /></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Paket Popularity */}
                <div className="card p-6">
                  <h3 className="font-bold flex items-center gap-2 mb-4"><PieChart size={18} className="text-almarwa-500" /> Paket Terpopuler</h3>
                  <div className="h-64"><Doughnut data={paketChartData} options={doughnutOptions} /></div>
                </div>

                {/* Kuota Utilization */}
                <div className="card p-6">
                  <h3 className="font-bold mb-4">Kuota Keberangkatan</h3>
                  <div className="space-y-3">
                    {keberangkatanList.slice(0, 5).map(k => {
                      const pct = Math.round((k.terisi / k.kuota) * 100);
                      return (
                        <div key={k.id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700 truncate">{k.paket_nama}</span>
                            <span className="text-gray-400">{k.terisi}/{k.kuota}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-almarwa-500'}`}
                              style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{formatDateShort(k.tanggal_berangkat)} • {k.status}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="card p-6">
                  <h3 className="font-bold flex items-center gap-2 mb-4"><ClipboardList size={18} className="text-almarwa-500" /> Aktivitas Terbaru</h3>
                  <div className="space-y-3">
                    {activityLog.slice(0, 6).map(log => (
                      <div key={log.id} className="flex items-start gap-2 text-xs">
                        <div className="w-1.5 h-1.5 bg-almarwa-400 rounded-full mt-1.5 shrink-0"></div>
                        <div>
                          <p className="text-gray-700">{log.deskripsi}</p>
                          <p className="text-gray-400">{log.user_nama} • {formatDateShort(log.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== JAMAAH ===== */}
          {activeMenu === 'jamaah' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex justify-end gap-2">
                <button onClick={() => exportJamaahPDF(jamaahList, false)} className="btn-primary btn-sm flex items-center gap-1.5 shadow-sm font-semibold">
                  <Printer size={14} /> Export Laporan PDF
                </button>
                <button onClick={() => exportCSV(jamaahList.map(j => ({
                  ID: j.id, Nama: j.nama_paspor, NIK: j.nik, Paspor: j.no_paspor, Paket: j.paket_nama,
                  Status: j.status, Bayar: j.status_bayar, Dibayar: j.total_bayar, Sisa: j.sisa_bayar, TglDaftar: j.created_at
                })), 'laporan-jamaah.csv')} className="btn-secondary btn-sm flex items-center gap-1"><Download size={14} /> Export Excel</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>ID</th><th>Nama</th><th>NIK</th><th>Paket</th><th>Berangkat</th><th>Status</th><th>Pembayaran</th><th>Dokumen</th></tr></thead>
                  <tbody>
                    {jamaahList.map(j => (
                      <tr key={j.id}>
                        <td className="font-mono text-xs">#{j.id}</td>
                        <td className="font-semibold">{j.nama_paspor}</td>
                        <td className="text-xs font-mono">{j.nik}</td>
                        <td>{j.paket_nama}</td>
                        <td className="text-xs">{formatDateShort(j.tanggal_berangkat)}</td>
                        <td><span className={`badge ${j.status === 'Data Diverifikasi' || j.status === 'Terdaftar' ? 'badge-green' : j.status === 'Menunggu Verifikasi' ? 'badge-yellow' : 'badge-blue'}`}>{j.status}</span></td>
                        <td>
                          <div><span className={`badge ${j.status_bayar === 'Lunas' ? 'badge-green' : j.status_bayar === 'Belum Bayar' ? 'badge-red' : 'badge-yellow'}`}>{j.status_bayar}</span></div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{formatRupiah(j.total_bayar)} / {formatRupiah(j.paket_harga)}</p>
                        </td>
                        <td><span className={`badge ${j.dokumen_lengkap ? 'badge-green' : 'badge-yellow'}`}>{j.dokumen_lengkap ? '✓ Lengkap' : 'Belum'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== PAKET ===== */}
          {activeMenu === 'paket' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paketList.map(p => {
                  const total = jamaahList.filter(j => j.paket_nama === p.nama).length;
                  return (
                    <div key={p.id} className="card p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold">{p.nama}</h3>
                          <p className="text-xl font-extrabold text-almarwa-600">{formatRupiah(p.harga)}</p>
                        </div>
                        <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-red'}`}>{p.status}</span>
                      </div>
                      <div className="mt-3 text-sm text-gray-500">
                        <p>{p.durasi} • {p.maskapai}</p>
                        <p>{p.hotel_mekkah}</p>
                      </div>
                      <div className="mt-3 p-2 bg-almarwa-50 rounded-lg text-center">
                        <span className="text-xs text-almarwa-600 font-semibold">{total} Jamaah Terdaftar</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== KEBERANGKATAN ===== */}
          {activeMenu === 'keberangkatan' && (
            <div className="animate-fade-in table-wrapper">
              <table>
                <thead><tr><th>Paket</th><th>Berangkat</th><th>Pulang</th><th>Kuota</th><th>Terisi</th><th>Sisa</th><th>Status</th></tr></thead>
                <tbody>
                  {keberangkatanList.map(k => (
                    <tr key={k.id}>
                      <td className="font-semibold">{k.paket_nama}</td>
                      <td>{formatDate(k.tanggal_berangkat)}</td>
                      <td>{formatDate(k.tanggal_pulang)}</td>
                      <td>{k.kuota}</td>
                      <td className="font-bold text-almarwa-600">{k.terisi}</td>
                      <td>{k.kuota - k.terisi}</td>
                      <td><span className={`badge ${k.status === 'Pendaftaran Dibuka' ? 'badge-green' : k.status === 'Hampir Penuh' ? 'badge-yellow' : k.status === 'Berangkat' ? 'badge-blue' : 'badge-red'}`}>{k.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== PEMBAYARAN ===== */}
          {activeMenu === 'pembayaran' && (
            <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card-pink p-5">
                  <p className="text-white/60 text-xs">Total Pendapatan</p>
                  <p className="text-2xl font-extrabold text-white mt-1">{formatRupiah(totalPendapatan)}</p>
                </div>
                <div className="card p-5">
                  <p className="text-gray-400 text-xs">Pembayaran Lunas</p>
                  <p className="text-2xl font-extrabold text-green-600 mt-1">{lunas} Jamaah</p>
                </div>
                <div className="card p-5">
                  <p className="text-gray-400 text-xs">Belum Lunas</p>
                  <p className="text-2xl font-extrabold text-red-500 mt-1">{belumLunas} Jamaah</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => exportCSV(pembayaranList.map(p => ({
                  Jamaah: p.nama_jamaah, Jenis: p.jenis, Jumlah: p.jumlah, Tanggal: p.tanggal, Status: p.status
                })), 'laporan-pembayaran.csv')} className="btn-secondary btn-sm flex items-center gap-1"><Download size={14} /> Export</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Jamaah</th><th>Jenis</th><th>Jumlah</th><th>Tanggal</th><th>Status</th></tr></thead>
                  <tbody>
                    {pembayaranList.map(p => (
                      <tr key={p.id}>
                        <td className="font-semibold">{p.nama_jamaah}</td>
                        <td>{p.jenis}</td>
                        <td className="font-bold text-almarwa-600">{formatRupiah(p.jumlah)}</td>
                        <td>{formatDate(p.tanggal)}</td>
                        <td><span className={`badge ${p.status === 'Terverifikasi' ? 'badge-green' : p.status === 'Ditolak' ? 'badge-red' : 'badge-yellow'}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== LAPORAN ===== */}
          {activeMenu === 'laporan' && (
            <div className="animate-fade-in space-y-6">
              <div className="section-heading !text-left !mb-6">
                <h2 className="text-2xl">Laporan & Export</h2>
                <p className="text-gray-500 text-sm">Download laporan lengkap dalam format Excel (CSV) atau cetak sebagai PDF.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Laporan Jamaah',
                    desc: 'Data lengkap seluruh jamaah terdaftar',
                    icon: Users,
                    action: () => exportCSV(jamaahList.map(j => ({
                      ID: j.id, Nama: j.nama_paspor, NIK: j.nik, Paspor: j.no_paspor, Paket: j.paket_nama,
                      Harga: j.paket_harga, Dibayar: j.total_bayar, Sisa: j.sisa_bayar,
                      Status: j.status, StatusBayar: j.status_bayar, DokumenLengkap: j.dokumen_lengkap ? 'Ya' : 'Tidak',
                      TglDaftar: j.created_at
                    })), 'laporan-jamaah.csv')
                  },
                  {
                    title: 'Laporan Pembayaran',
                    desc: 'Riwayat seluruh transaksi pembayaran',
                    icon: CreditCard,
                    action: () => exportCSV(pembayaranList.map(p => ({
                      ID: p.id, Jamaah: p.nama_jamaah, Jenis: p.jenis, Jumlah: p.jumlah,
                      Tanggal: p.tanggal, Status: p.status, Catatan: p.catatan
                    })), 'laporan-pembayaran.csv')
                  },
                  {
                    title: 'Laporan Keberangkatan',
                    desc: 'Data jadwal dan kuota keberangkatan',
                    icon: CalendarDays,
                    action: () => exportCSV(keberangkatanList.map(k => ({
                      Paket: k.paket_nama, Berangkat: k.tanggal_berangkat, Pulang: k.tanggal_pulang,
                      Kuota: k.kuota, Terisi: k.terisi, Sisa: k.kuota - k.terisi, Status: k.status
                    })), 'laporan-keberangkatan.csv')
                  },
                  {
                    title: 'Cetak Laporan (PDF)',
                    desc: 'Cetak halaman dashboard sebagai PDF',
                    icon: Printer,
                    action: printReport
                  },
                ].map((item, i) => (
                  <button key={i} onClick={item.action} className="card p-6 text-left hover:border-almarwa-300 group">
                    <div className="w-12 h-12 rounded-xl bg-almarwa-100 group-hover:bg-almarwa-600 flex items-center justify-center mb-3 transition-colors">
                      <item.icon className="text-almarwa-600 group-hover:text-white transition-colors" size={22} />
                    </div>
                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== ACTIVITY LOG ===== */}
          {activeMenu === 'activity' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex justify-end">
                <button onClick={() => exportCSV(activityLog.map(l => ({
                  Waktu: l.created_at, Admin: l.user_nama, Aksi: l.aksi, Deskripsi: l.deskripsi, Target: l.target
                })), 'activity-log.csv')} className="btn-secondary btn-sm flex items-center gap-1"><Download size={14} /> Export</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Waktu</th><th>Admin</th><th>Aksi</th><th>Deskripsi</th><th>Target</th></tr></thead>
                  <tbody>
                    {activityLog.map(l => (
                      <tr key={l.id}>
                        <td className="text-xs text-gray-400 whitespace-nowrap">{formatDateShort(l.created_at)}</td>
                        <td className="font-medium">{l.user_nama}</td>
                        <td><span className="badge badge-pink">{l.aksi}</span></td>
                        <td className="text-sm text-gray-600">{l.deskripsi}</td>
                        <td className="text-xs text-gray-400">{l.target}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
