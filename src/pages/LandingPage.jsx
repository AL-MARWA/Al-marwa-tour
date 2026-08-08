/* ============================================================
   ALMARWA TOUR TRAVEL - Landing Page
   ============================================================ */
import React, { useState, useEffect } from 'react';
import { useAuth, useToast, apiFetch, formatRupiah, formatDate } from '../App';
import {
  Menu, X, ChevronDown, ChevronRight, Star, MapPin, Clock, Users, Plane, Building2,
  Phone, Mail, Instagram, Facebook, MessageCircle, Award, Shield, Heart, BookOpen,
  UserCheck, CalendarDays, Bus, FileCheck, UtensilsCrossed, GraduationCap, Droplets,
  Luggage, Play, Quote, ArrowRight, Sparkles, Check, Image, Eye, Camera
} from 'lucide-react';

// ===== Official Logo =====
function AlmarwaLogo({ size = 'md', light = false }) {
  const heights = { sm: 'h-9', md: 'h-11', lg: 'h-14', xl: 'h-20' };
  const sizeClass = heights[size] || heights.md;
  return (
    <div className="flex items-center gap-2.5">
      <img src="/logo.png" alt="Al-Marwa Tour & Travel" className={`${sizeClass} w-auto object-contain rounded-full drop-shadow-sm border-2 ${light ? 'border-white/30' : 'border-pink-200'}`} />
      <div className="flex flex-col leading-tight">
        <span className={`font-extrabold tracking-tight ${light ? 'text-white' : 'text-almarwa-700'} ${size === 'xl' ? 'text-2xl' : size === 'lg' ? 'text-xl' : 'text-base'}`}>
          AL-MARWA
        </span>
        <span className={`font-semibold tracking-widest ${light ? 'text-white/80' : 'text-almarwa-500'} ${size === 'xl' ? 'text-xs' : 'text-[9px]'} uppercase`}>
          Tour & Travel
        </span>
      </div>
    </div>
  );
}

export { AlmarwaLogo };

// ===== Navbar =====
function Navbar() {
  const { user, navigate, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Beranda', href: '#beranda' },
    { label: 'Tentang', href: '#tentang' },
    { label: 'Paket', href: '#paket' },
    { label: 'Jadwal', href: '#jadwal' },
    { label: 'Fasilitas', href: '#fasilitas' },
    { label: 'Galeri', href: '#galeri' },
    { label: 'Testimoni', href: '#testimoni' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Kontak', href: '#kontak' },
  ];

  const scrollTo = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-almarwa-100/30' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <AlmarwaLogo light={!scrolled} />

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map(item => (
              <a key={item.href} href={item.href} onClick={(e) => scrollTo(e, item.href)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  scrolled ? 'text-gray-600 hover:text-almarwa-600 hover:bg-almarwa-50' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}>
                {item.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <button onClick={() => {
                  if (user.role === 'admin') navigate('admin');
                  else if (user.role === 'owner') navigate('owner');
                  else navigate('jamaah');
                }} className="btn-primary btn-sm">Dashboard</button>
                <button onClick={logout} className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  scrolled ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-white/30 text-white hover:bg-white/10'
                }`}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('login')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled ? 'text-almarwa-600 hover:bg-almarwa-50' : 'text-white hover:bg-white/10'
                }`}>Login</button>
                <button onClick={() => navigate('register')} className="btn-primary btn-sm">Daftar</button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg">
            {mobileOpen
              ? <X className={scrolled ? 'text-gray-700' : 'text-white'} size={24} />
              : <Menu className={scrolled ? 'text-gray-700' : 'text-white'} size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-almarwa-100 shadow-xl animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {menuItems.map(item => (
              <a key={item.href} href={item.href} onClick={(e) => scrollTo(e, item.href)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-almarwa-600 hover:bg-almarwa-50">
                {item.label}
              </a>
            ))}
            <div className="pt-3 border-t border-almarwa-100 flex gap-2">
              {user ? (
                <>
                  <button onClick={() => { setMobileOpen(false); navigate(user.role === 'admin' ? 'admin' : user.role === 'owner' ? 'owner' : 'jamaah'); }}
                    className="btn-primary btn-sm flex-1">Dashboard</button>
                  <button onClick={() => { setMobileOpen(false); logout(); }}
                    className="btn-secondary btn-sm flex-1">Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMobileOpen(false); navigate('login'); }}
                    className="btn-secondary btn-sm flex-1">Login</button>
                  <button onClick={() => { setMobileOpen(false); navigate('register'); }}
                    className="btn-primary btn-sm flex-1">Daftar</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ===== Hero Section =====
function HeroSection() {
  const { navigate, user } = useAuth();
  return (
    <section id="beranda" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-almarwa-900 via-almarwa-800 to-almarwa-700"></div>
        <div className="absolute inset-0 bg-pattern-islamic opacity-30"></div>
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-almarwa-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        {/* Islamic geometric overlay */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
          <svg viewBox="0 0 400 600" className="w-full h-full">
            <pattern id="islamicPattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0 L60 15 L60 45 L30 60 L0 45 L0 15 Z" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
            <rect width="400" height="600" fill="url(#islamicPattern)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="max-w-3xl">
          {/* Arabic text */}
          <p className="font-arabic text-lg md:text-xl text-yellow-300/80 mb-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Langkah Suci{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #D4AF37, #F5E6B8)' }}>
              Menuju Baitullah
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/70 mb-8 max-w-xl leading-relaxed animate-fade-up" style={{ animationDelay: '0.3s' }}>
            Temukan perjalanan ibadah umroh yang nyaman, aman, dan terpercaya bersama
            <span className="text-white font-semibold"> Almarwa Tour & Travel</span>.
            Melayani sepenuh hati sejak tahun 2015.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-12 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <a href="#paket" onClick={(e) => { e.preventDefault(); document.querySelector('#paket')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="btn-gold flex items-center gap-2 text-base">
              <Sparkles size={18} /> Jelajahi Paket
            </a>
            <button onClick={() => navigate(user ? 'jamaah' : 'register')}
              className="btn-secondary !border-white/30 !text-white hover:!bg-white hover:!text-almarwa-700 flex items-center gap-2 text-base">
              Daftar Sekarang <ArrowRight size={18} />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-6 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            {[
              { num: '2,500+', label: 'Jamaah Berangkat' },
              { num: '150+', label: 'Keberangkatan' },
              { num: '10+', label: 'Tahun Pengalaman' },
              { num: '4.9★', label: 'Rating Jamaah' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-white">{stat.num}</div>
                <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full h-auto">
          <path fill="#FFF8FA" d="M0,32L48,37.3C96,43,192,53,288,48C384,43,480,21,576,16C672,11,768,21,864,32C960,43,1056,53,1152,53.3C1248,53,1344,43,1392,37.3L1440,32L1440,80L1392,80C1344,80,1248,80,1152,80C1056,80,960,80,864,80C768,80,672,80,576,80C480,80,384,80,288,80C192,80,96,80,48,80L0,80Z"/>
        </svg>
      </div>
    </section>
  );
}

// ===== Trust Section =====
function TrustSection() {
  const features = [
    { icon: Shield, title: 'Travel Terpercaya', desc: 'Izin resmi Kemenag & PPIU terdaftar' },
    { icon: BookOpen, title: 'Pembimbing Berpengalaman', desc: 'Ustadz & muthawif profesional' },
    { icon: Building2, title: 'Hotel Nyaman', desc: 'Hotel bintang 3-5 dekat Masjidil Haram' },
    { icon: Heart, title: 'Pelayanan Profesional', desc: 'Melayani sepenuh hati sejak 2015' },
    { icon: UserCheck, title: 'Pendampingan Jamaah', desc: 'Dampingan dari keberangkatan hingga pulang' },
    { icon: CalendarDays, title: 'Jadwal Terencana', desc: 'Itinerary tertata & waktu ibadah optimal' },
  ];

  return (
    <section id="tentang" className="py-20 bg-gradient-to-b from-[#FFF8FA] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-heading">
          <p className="text-almarwa-500 font-semibold text-sm uppercase tracking-widest mb-2">Mengapa Memilih Kami</p>
          <h2>Almarwa Tour & Travel</h2>
          <p>Kami hadir sebagai mitra perjalanan ibadah Anda dengan layanan terbaik, aman, nyaman, dan amanah.</p>
          <div className="accent-line"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card p-6 text-center group" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-almarwa-100 to-almarwa-50 group-hover:from-almarwa-600 group-hover:to-almarwa-500 transition-all duration-300">
                <f.icon className="text-almarwa-600 group-hover:text-white transition-colors duration-300" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== Paket Section =====
function PaketSection() {
  const { navigate, user } = useAuth();
  const [paket, setPaket] = useState([]);
  const [selectedPaket, setSelectedPaket] = useState(null);

  useEffect(() => {
    apiFetch('/public/paket').then(setPaket).catch(() => {});
  }, []);

  return (
    <section id="paket" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-heading">
          <p className="text-almarwa-500 font-semibold text-sm uppercase tracking-widest mb-2">Pilihan Paket</p>
          <h2>Paket Umroh Kami</h2>
          <p>Pilih paket yang sesuai dengan kebutuhan dan budget Anda. Semua paket sudah termasuk bimbingan ibadah.</p>
          <div className="accent-line"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paket.map((p, i) => (
            <div key={p.id} className={`card flex flex-col relative ${p.is_populer ? 'ring-2 ring-almarwa-500' : ''}`}>
              {p.is_populer && (
                <div className="absolute top-4 right-4 z-10 badge-gold flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold">
                  <Star size={12} fill="currentColor" /> TERPOPULER
                </div>
              )}
              {/* Card Header */}
              <div className="p-1">
                <div className="h-40 rounded-xl bg-gradient-to-br from-almarwa-500 to-almarwa-700 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-pattern-islamic opacity-20"></div>
                  <div className="text-center relative">
                    <div className="text-4xl mb-1">🕋</div>
                    <span className="text-white font-bold text-sm">{p.durasi}</span>
                  </div>
                </div>
              </div>
              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{p.nama}</h3>
                <div className="text-2xl font-extrabold text-almarwa-600 mb-3">{formatRupiah(p.harga)}</div>

                <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
                  <div className="flex items-center gap-2"><Building2 size={14} className="text-almarwa-400" /> <span className="truncate">{p.hotel_mekkah}</span></div>
                  <div className="flex items-center gap-2"><Building2 size={14} className="text-almarwa-400" /> <span className="truncate">{p.hotel_madinah}</span></div>
                  <div className="flex items-center gap-2"><Plane size={14} className="text-almarwa-400" /> {p.maskapai}</div>
                  <div className="flex items-center gap-2"><MapPin size={14} className="text-almarwa-400" /> {p.kota_keberangkatan}</div>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button onClick={() => setSelectedPaket(p)} className="btn-secondary btn-sm flex-1 text-xs">Lihat Detail</button>
                  <button onClick={() => navigate(user ? 'jamaah' : 'register')} className="btn-primary btn-sm flex-1 text-xs">Daftar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPaket && (
        <div className="modal-overlay" onClick={() => setSelectedPaket(null)}>
          <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 bg-gradient-to-r from-almarwa-600 to-almarwa-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{selectedPaket.nama}</h3>
                  <p className="text-white/70 mt-1">{selectedPaket.durasi} • {selectedPaket.maskapai}</p>
                </div>
                <button onClick={() => setSelectedPaket(null)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-extrabold text-almarwa-600 mb-4">{formatRupiah(selectedPaket.harga)}<span className="text-sm font-normal text-gray-400">/jamaah</span></div>
              <p className="text-gray-600 mb-6">{selectedPaket.deskripsi}</p>

              <h4 className="font-bold text-gray-900 mb-3">Hotel</h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-almarwa-50 rounded-xl">
                  <p className="text-xs text-almarwa-500 font-semibold">Mekkah</p>
                  <p className="font-medium text-sm">{selectedPaket.hotel_mekkah}</p>
                </div>
                <div className="p-3 bg-almarwa-50 rounded-xl">
                  <p className="text-xs text-almarwa-500 font-semibold">Madinah</p>
                  <p className="font-medium text-sm">{selectedPaket.hotel_madinah}</p>
                </div>
              </div>

              <h4 className="font-bold text-gray-900 mb-3">Fasilitas</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {(selectedPaket.fasilitas || '').split(',').map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-almarwa-500 shrink-0" /> {f.trim()}
                  </div>
                ))}
              </div>

              <button onClick={() => { setSelectedPaket(null); navigate(user ? 'jamaah' : 'register'); }}
                className="btn-primary w-full text-base">
                Daftar Paket Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ===== Jadwal Section =====
function JadwalSection() {
  const [jadwal, setJadwal] = useState([]);

  useEffect(() => {
    apiFetch('/public/keberangkatan').then(setJadwal).catch(() => {});
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pendaftaran Dibuka': return 'badge-green';
      case 'Hampir Penuh': return 'badge-yellow';
      case 'Penuh': return 'badge-red';
      case 'Berangkat': return 'badge-blue';
      case 'Selesai': return 'badge-pink';
      default: return 'badge-pink';
    }
  };

  return (
    <section id="jadwal" className="py-20 bg-gradient-to-b from-white to-[#FFF8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-heading">
          <p className="text-almarwa-500 font-semibold text-sm uppercase tracking-widest mb-2">Jadwal</p>
          <h2>Jadwal Keberangkatan</h2>
          <p>Pilih jadwal keberangkatan yang sesuai dengan rencana Anda.</p>
          <div className="accent-line"></div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Paket</th>
                <th>Berangkat</th>
                <th>Pulang</th>
                <th>Kuota</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {jadwal.map(j => (
                <tr key={j.id}>
                  <td className="font-semibold text-gray-900">{j.paket_nama}</td>
                  <td>{formatDate(j.tanggal_berangkat)}</td>
                  <td>{formatDate(j.tanggal_pulang)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-almarwa-500 to-almarwa-400 rounded-full"
                             style={{ width: `${Math.min((j.terisi / j.kuota) * 100, 100)}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{j.terisi}/{j.kuota}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${getStatusBadge(j.status)}`}>{j.status}</span></td>
                </tr>
              ))}
              {jadwal.length === 0 && (
                <tr><td colSpan="5" className="text-center text-gray-400 py-8">Belum ada jadwal tersedia.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ===== Fasilitas Section =====
function FasilitasSection() {
  const iconMap = {
    Plane, Building: Building2, Bus, FileCheck, UtensilsCrossed,
    UserCheck, BookOpen, GraduationCap, Droplets, Luggage
  };

  const [fasilitas, setFasilitas] = useState([]);
  useEffect(() => {
    apiFetch('/public/fasilitas').then(setFasilitas).catch(() => {});
  }, []);

  return (
    <section id="fasilitas" className="py-20 bg-[#FFF8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-heading">
          <p className="text-almarwa-500 font-semibold text-sm uppercase tracking-widest mb-2">Fasilitas</p>
          <h2>Fasilitas Lengkap</h2>
          <p>Kami menyediakan fasilitas terbaik untuk kenyamanan ibadah Anda.</p>
          <div className="accent-line"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {fasilitas.map((f, i) => {
            const Icon = iconMap[f.icon] || Award;
            return (
              <div key={f.id} className="card p-5 text-center group">
                <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 bg-gradient-to-br from-almarwa-100 to-almarwa-50 group-hover:from-almarwa-600 group-hover:to-almarwa-500 transition-all duration-300">
                  <Icon className="text-almarwa-600 group-hover:text-white transition-colors duration-300" size={24} />
                </div>
                <h4 className="font-semibold text-sm text-gray-800">{f.nama}</h4>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ===== Galeri Section =====
function GaleriSection() {
  const [activeTab, setActiveTab] = useState('foto'); // 'foto' | 'manasik'
  const [galeriList, setGaleriList] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    apiFetch('/public/galeri')
      .then(data => {
        if (Array.isArray(data)) setGaleriList(data);
      })
      .catch(() => {});
  }, []);

  const galeriImages = [
    { title: 'Masjidil Haram', emoji: '🕋' },
    { title: 'Masjid Nabawi', emoji: '🕌' },
    { title: 'Hotel Bintang 5', emoji: '🏨' },
    { title: 'City Tour', emoji: '🚌' },
    { title: 'Jamaah Almarwa', emoji: '👥' },
    { title: 'Manasik Umroh', emoji: '📖' },
  ];

  const galeriDetails = {
    'Manasik Umroh': {
      title: 'Panduan & Manasik Umroh Almarwa',
      subtitle: 'Kegiatan manasik umroh meliputi dua hal utama, yaitu pembekalan teori dan simulasi praktik lapangan agar jemaah tidak bingung saat berada di Tanah Suci.',
      emoji: '📖',
      sections: [
        {
          heading: 'Kegiatan yang Dilakukan Saat Manasik',
          items: [
            { title: 'Penyampaian Teori', desc: 'Penjelasan tentang fikih umroh, syarat, rukun, wajib umroh, hingga hal-hal yang membatalkan pahala ibadah.' },
            { title: 'Simulasi Praktik', desc: 'Jemaah memakai pakaian ihram lalu mempraktikkan cara berjalan, membaca doa, mengelilingi replika Ka\'bah, dan simulasi sa\'i.' },
            { title: 'Panduan Teknis', desc: 'Informasi seputar jadwal penerbangan, hotel, aturan bagasi pesawat, tips menjaga kesehatan, dan barang bawaan wajib.' },
            { title: 'Tanya Jawab', desc: 'Sesi diskusi antara jemaah dengan ustaz pembimbing untuk berkonsultasi mengenai kondisi khusus (seperti kesehatan atau haid).' }
          ]
        },
        {
          heading: 'Rangkaian Urutan Ibadah Umroh',
          subheading: 'Saat hari pelaksanaan di Tanah Suci, berikut adalah urutan rangkaian ibadah yang wajib dijalankan secara berurutan (tertib):',
          numberedItems: [
            { title: 'Mandi Besar & Memakai Ihram', desc: 'Dilakukan di hotel atau tempat persiapan sebelum menuju batas miqat.' },
            { title: 'Niat di Miqat', desc: 'Membaca niat umroh di batas wilayah yang ditentukan (misalnya di Dzulkulaifah/Bir Ali atau Yalamlam) dan mulai melafalkan kalimat Talbiyah.' },
            { title: 'Thawaf', desc: 'Mengelilingi Ka\'bah sebanyak 7 kali putaran, dimulai dan diakhiri di garis lurus Hajar Aswad.' },
            { title: 'Shalat Sunnah Thawaf', desc: 'Melakukan shalat sunnah 2 rakaat di belakang Makam Ibrahim (jika situasi memungkinkan) setelah selesai thawaf.' },
            { title: 'Sa\'i', desc: 'Berjalan atau berlari-lari kecil sebanyak 7 kali putaran antara Bukit Safa dan Bukit Marwah, dimulai dari Safa dan berakhir di Marwah.' },
            { title: 'Tahallul', desc: 'Memotong atau mencukur rambut (minimal 3 helai untuk wanita, dan disunnahkan pangkas botak/pendek bagi laki-laki) sebagai tanda selesainya ibadah umroh.' }
          ]
        }
      ],
      bacaanTalbiyah: 'Labbaykallahumma Labbayk, Labbayka Laa Syariika Laka Labbayk, Innal Hamda Wan Ni\'mata Laka Wal Mulk, Laa Syariika Lak.'
    },
    'Masjidil Haram': {
      title: 'Keutamaan & Panduan Masjidil Haram',
      subtitle: 'Masjid paling suci dalam Islam tempat berdirinya Ka\'bah dan kiblat utama seluruh umat Islam.',
      emoji: '🕋',
      sections: [
        {
          heading: 'Keutamaan & Amalan di Masjidil Haram',
          items: [
            { title: 'Pahala 100.000 Kali Lipat', desc: 'Shalat 1 kali di Masjidil Haram bernilai 100.000 kali lipat dibanding shalat di masjid lainnya.' },
            { title: 'Pelaksanaan Thawaf 7 Putaran', desc: 'Ibadah Thawaf mengelilingi Ka\'bah berlawanan arah jarum jam dimulai dari sudut Hajar Aswad.' },
            { title: 'Air Zamzam Berkah', desc: 'Penyediaan air Zamzam murni segar yang dapat diminum sepuasnya oleh seluruh jemaah.' },
            { title: 'Multazam & Maqam Ibrahim', desc: 'Tempat-tempat paling mustajab untuk bermunajat dan memanjatkan doa kepada Allah SWT.' }
          ]
        }
      ]
    },
    'Masjid Nabawi': {
      title: 'Keutamaan & Ziarah Masjid Nabawi',
      subtitle: 'Masjid suci di Kota Madinah Munawwarah tempat peristirahatan terakhir Rasulullah SAW.',
      emoji: '🕌',
      sections: [
        {
          heading: 'Destinasi Ziarah & Keutamaan Nabawi',
          items: [
            { title: 'Pahala 1.000 Kali Lipat', desc: 'Shalat 1 kali di Masjid Nabawi bernilai 1.000 kali lipat dibanding masjid lainnya.' },
            { title: 'Taman Raudhah (Taman Surga)', desc: 'Area antara mimbar dan makam Nabi Muhammad SAW yang sangat dikabulkan doanya.' },
            { title: 'Salam Kepada Rasulullah SAW', desc: 'Ziarah dan menguntumkan salam kepada Nabi Muhammad SAW, Abu Bakar, dan Umar bin Khattab.' },
            { title: 'Pemakaman Baqi', desc: 'Ziarah ke makam para istri, keluarga, dan ribuan sahabat Rasulullah SAW.' }
          ]
        }
      ]
    },
    'Hotel Bintang 5': {
      title: 'Akomodasi Hotel Bintang 5 Premium',
      subtitle: 'Kenyamanan tempat menginap terbaik berjarak sangat dekat dari halaman masjid.',
      emoji: '🏨',
      sections: [
        {
          heading: 'Fasilitas & Layanan Hotel',
          items: [
            { title: 'Jarak Dekat Masjid', desc: 'Hanya melangkah 50-150 meter dari pelataran Masjidil Haram & Masjid Nabawi.' },
            { title: 'Makanan Menu Nusantara', desc: 'Sajian prasmanan 3x sehari dengan masakan Indonesia yang cocok dengan selera jemaah.' },
            { title: 'Kamar Luas & Mewah', desc: 'Kamar nyaman ber-AC, tempat tidur empuk, Wi-Fi gratis, dan perlengkapan mandi lengkap.' },
            { title: 'Layanan Kamar & Laundry', desc: 'Pembersihan kamar harian serta fasilitas pencucian pakaian jemaah.' }
          ]
        }
      ]
    },
    'City Tour': {
      title: 'City Tour & Ziarah Makkah - Madinah',
      subtitle: 'Mengunjungi situs-situs bersejarah perkembangan peradaban Islam di Tanah Suci.',
      emoji: '🚌',
      sections: [
        {
          heading: 'Destinasi Ziarah Bersejarah',
          items: [
            { title: 'Jabal Rahmah & Padang Arafah', desc: 'Bukit tempat bertemunya Nabi Adam & Hawa serta tempat pelaksanaan wukuf haji.' },
            { title: 'Masjid Quba', desc: 'Masjid pertama dalam sejarah Islam dengan pahala shalat 2 rakaat setara pahala umroh.' },
            { title: 'Jabal Uhud', desc: 'Bukit cinta Rasulullah SAW dan lokasi pertempuran bersejarah Perang Uhud.' },
            { title: 'Kebun Kurma & Museum', desc: 'Melihat perkebunan kurma khas Madinah dan mengunjungi museum sejarah Al-Qur\'an.' }
          ]
        }
      ]
    },
    'Jamaah Almarwa': {
      title: 'Pelayanan & Bimbingan Jamaah Almarwa',
      subtitle: 'Pendampingan penuh kehangatan & kekeluargaan dari tim profesional kami.',
      emoji: '👥',
      sections: [
        {
          heading: 'Keunggulan Pendampingan Kami',
          items: [
            { title: 'Muthawif Berpengalaman', desc: 'Pembimbing ibadah lulusan Universitas Islam Madinah / Al-Azhar yang sangat memahami fikih umroh.' },
            { title: 'Tour Leader 24 Jam', desc: 'Petugas pendamping lapangan yang siaga membantu segala kebutuhan teknis jemaah.' },
            { title: 'Bimbingan Lansia & Ramah Anak', desc: 'Pelayanan khusus, penyiapan kursi roda gratis, dan bantuan jemaah lanjut usia.' },
            { title: 'Suasana Kekeluargaan', desc: 'Menjalin silaturahmi dan kebersamaan antar jemaah selama perjalanan ibadah.' }
          ]
        }
      ]
    }
  };

  return (
    <section id="galeri" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-heading">
          <p className="text-almarwa-500 font-semibold text-sm uppercase tracking-widest mb-2">Galeri & Dokumentasi</p>
          <h2>Momen Indah Jamaah Almarwa</h2>
          <p>Dokumentasi perjalanan ibadah jamaah kami di Tanah Suci Makkah & Madinah serta panduan manasik.</p>
          <div className="accent-line"></div>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-almarwa-50 border border-almarwa-100 shadow-inner gap-2">
            <button
              onClick={() => setActiveTab('foto')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === 'foto'
                  ? 'bg-almarwa-600 text-white shadow-md shadow-almarwa-600/30'
                  : 'text-gray-600 hover:text-almarwa-600 hover:bg-white/60'
              }`}
            >
              <Camera size={18} /> Galeri Foto Jamaah ({galeriList.length})
            </button>
            <button
              onClick={() => setActiveTab('manasik')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === 'manasik'
                  ? 'bg-almarwa-600 text-white shadow-md shadow-almarwa-600/30'
                  : 'text-gray-600 hover:text-almarwa-600 hover:bg-white/60'
              }`}
            >
              <BookOpen size={18} /> Panduan & Manasik
            </button>
          </div>
        </div>

        {/* Tab Content 1: Real Photo Gallery */}
        {activeTab === 'foto' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galeriList.map(g => (
                <div
                  key={g.id}
                  className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-almarwa-100 bg-white cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
                  onClick={() => setPreviewPhoto(g)}
                >
                  <div className="h-64 overflow-hidden relative bg-gray-900">
                    <img
                      src={g.url || 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80'}
                      alt={g.judul}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 text-white">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-almarwa-600/90 text-white border border-almarwa-400/50 backdrop-blur-sm">
                          {g.tipe || 'Foto Jamaah'}
                        </span>
                        <span className="text-[11px] text-white/75 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                          {formatDate(g.created_at)}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base line-clamp-1 group-hover:text-almarwa-300 transition-colors">
                        {g.judul}
                      </h3>
                      {g.deskripsi && (
                        <p className="text-xs text-gray-200 line-clamp-2 mt-1 leading-relaxed">
                          {g.deskripsi}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-almarwa-300 group-hover:translate-x-1 transition-transform">
                        <Eye size={14} /> Lihat Foto Penuh & Detail <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {galeriList.length === 0 && (
              <div className="text-center py-16 card border-dashed border-2 border-gray-200">
                <Image size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium">Belum ada foto galeri yang diunggah.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Manasik & Guide Cards */}
        {activeTab === 'manasik' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galeriImages.map((g, i) => (
              <div key={i} onClick={() => setSelectedDetail(galeriDetails[g.title] || { title: g.title, emoji: g.emoji, subtitle: 'Informasi detail perjalanan umroh Almarwa.' })}
                className={`relative rounded-2xl overflow-hidden group cursor-pointer border-2 border-transparent hover:border-almarwa-400 transition-all duration-300 shadow-md hover:shadow-xl ${i === 0 ? 'md:col-span-2 md:row-span-2 h-64 md:h-full' : 'h-48 md:h-52'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-almarwa-600 to-almarwa-800"></div>
                <div className="absolute inset-0 bg-pattern-islamic opacity-20"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                    <div className={`${i === 0 ? 'text-6xl' : 'text-4xl'} mb-2`}>{g.emoji}</div>
                    <p className="text-white font-bold text-base md:text-lg">{g.title}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-white/80 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mt-2 group-hover:bg-white group-hover:text-almarwa-700 transition-all">
                      🔍 Klik untuk Lihat Detail
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Lightbox Preview Modal */}
      {previewPhoto && (
        <div className="modal-overlay z-50" onClick={() => setPreviewPhoto(null)}>
          <div className="modal-content max-w-4xl overflow-hidden p-0 rounded-3xl bg-gray-950 text-white shadow-2xl border border-gray-800" onClick={e => e.stopPropagation()}>
            <div className="relative bg-black flex justify-center items-center min-h-[300px]">
              <img
                src={previewPhoto.url || 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=80'}
                alt={previewPhoto.judul}
                className="w-full max-h-[75vh] object-contain mx-auto"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=80'; }}
              />
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 right-4 p-2.5 bg-black/70 hover:bg-black rounded-full text-white transition-all backdrop-blur-md shadow-lg border border-white/20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-950 border-t border-gray-800">
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-almarwa-600 text-white inline-block mb-2">
                    {previewPhoto.tipe || 'Foto Jamaah'}
                  </span>
                  <h3 className="font-extrabold text-xl text-white">{previewPhoto.judul}</h3>
                </div>
                <span className="text-xs text-almarwa-300 font-medium whitespace-nowrap bg-almarwa-950 px-3 py-1.5 rounded-full border border-almarwa-800 shrink-0">
                  📅 {formatDate(previewPhoto.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mt-2">
                {previewPhoto.deskripsi || 'Dokumentasi perjalanan ibadah jamaah Almarwa Tour & Travel.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal Popup for Manasik */}
      {selectedDetail && (
        <div className="modal-overlay z-50" onClick={() => setSelectedDetail(null)}>
          <div className="modal-content max-w-3xl max-h-[85vh] overflow-y-auto scrollbar-pink" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-almarwa-100 flex items-start justify-between bg-gradient-to-r from-almarwa-50 to-pink-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-almarwa-600 text-white text-2xl flex items-center justify-center shadow-md">
                  {selectedDetail.emoji}
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-gray-900">{selectedDetail.title}</h3>
                  <p className="text-xs text-gray-600 mt-0.5">{selectedDetail.subtitle}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 text-gray-700">
              {(selectedDetail.sections || []).map((sec, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="border-b border-almarwa-100 pb-2">
                    <h4 className="font-extrabold text-lg text-almarwa-700">{sec.heading}</h4>
                    {sec.subheading && <p className="text-xs text-gray-500 mt-1">{sec.subheading}</p>}
                  </div>

                  {/* Bullet items */}
                  {sec.items && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sec.items.map((item, i) => (
                        <div key={i} className="p-3.5 bg-almarwa-50/60 rounded-xl border border-almarwa-100/60 hover:border-almarwa-300 transition-colors">
                          <p className="font-bold text-sm text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-almarwa-500"></span>
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed pl-4">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Numbered items (Rangkaian Ibadah) */}
                  {sec.numberedItems && (
                    <div className="space-y-3">
                      {sec.numberedItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3.5 bg-white border border-almarwa-100 rounded-xl shadow-sm hover:border-almarwa-300 transition-colors">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-almarwa-500 to-almarwa-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Bacaan Talbiyah Banner */}
              {selectedDetail.bacaanTalbiyah && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-200 rounded-xl text-center">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">📖 Bacaan Doa Talbiyah</p>
                  <p className="text-sm font-serif italic text-amber-900">"{selectedDetail.bacaanTalbiyah}"</p>
                  <p className="text-[11px] text-amber-700 mt-1">Dikumandangkan sejak niat di miqat hingga sebelum memulai thawaf.</p>
                </div>
              )}

              <div className="pt-3 border-t border-almarwa-100 flex justify-end">
                <button onClick={() => setSelectedDetail(null)} className="btn-primary btn-sm">
                  Tutup Penjelasan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ===== Testimoni Section =====
function TestimoniSection() {
  const [testimoni, setTestimoni] = useState([]);
  useEffect(() => {
    apiFetch('/public/testimoni').then(setTestimoni).catch(() => {});
  }, []);

  return (
    <section id="testimoni" className="py-20 bg-gradient-to-b from-white to-[#FFF8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-heading">
          <p className="text-almarwa-500 font-semibold text-sm uppercase tracking-widest mb-2">Testimoni</p>
          <h2>Apa Kata Jamaah Kami</h2>
          <p>Pengalaman dan kesan jamaah yang telah berangkat bersama Almarwa Tour & Travel.</p>
          <div className="accent-line"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimoni.map((t, i) => (
            <div key={t.id} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-almarwa-500 to-almarwa-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-lg">{t.nama.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} className="text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                  <Quote size={20} className="text-almarwa-200 mb-2" />
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{t.isi}</p>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.nama}</p>
                    <p className="text-xs text-gray-400">{t.asal} • {t.paket} • {t.tahun}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== FAQ Section =====
function FAQSection() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    apiFetch('/public/faq').then(setFaqs).catch(() => {});
  }, []);

  return (
    <section id="faq" className="py-20 bg-[#FFF8FA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-heading">
          <p className="text-almarwa-500 font-semibold text-sm uppercase tracking-widest mb-2">FAQ</p>
          <h2>Pertanyaan Umum</h2>
          <p>Temukan jawaban atas pertanyaan yang sering diajukan.</p>
          <div className="accent-line"></div>
        </div>

        <div className="space-y-3">
          {faqs.map(faq => (
            <div key={faq.id} className="card">
              <button onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left">
                <span className="font-semibold text-gray-900 text-sm pr-4">{faq.pertanyaan}</span>
                <ChevronDown size={18} className={`text-almarwa-500 shrink-0 transition-transform duration-300 ${openId === faq.id ? 'rotate-180' : ''}`} />
              </button>
              {openId === faq.id && (
                <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed animate-fade-in border-t border-almarwa-50 pt-3">
                  {faq.jawaban}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== Kontak Section =====
function KontakSection({ kontak = {} }) {

  return (
    <section id="kontak" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-heading">
          <p className="text-almarwa-500 font-semibold text-sm uppercase tracking-widest mb-2">Kontak</p>
          <h2>Hubungi Kami</h2>
          <p>Jangan ragu untuk menghubungi kami untuk informasi lebih lanjut.</p>
          <div className="accent-line"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="card p-5 flex items-center gap-4">
              <div className="stat-icon bg-green-100"><MessageCircle className="text-green-600" size={22} /></div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">WhatsApp</p>
                <a href={`https://wa.me/${kontak.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="font-bold text-gray-900 hover:text-almarwa-600">+{kontak.whatsapp}</a>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <div className="stat-icon bg-almarwa-100"><Mail className="text-almarwa-600" size={22} /></div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Email</p>
                <a href={`mailto:${kontak.email}`} className="font-bold text-gray-900 hover:text-almarwa-600">{kontak.email}</a>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <div className="stat-icon bg-red-100"><MapPin className="text-red-500" size={22} /></div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Alamat</p>
                <a href="https://maps.app.goo.gl/6f5MBUBYvJBr5wB57?g_st=ic" target="_blank" rel="noopener noreferrer" className="font-medium text-sm text-gray-700 hover:text-almarwa-600 block transition-colors">
                  {kontak.alamat}
                </a>
              </div>
            </div>
            <div className="flex gap-3">
              {kontak.instagram && (
                <a href={`https://instagram.com/${kontak.instagram}`} target="_blank" rel="noopener noreferrer"
                  className="card p-4 flex-1 flex items-center justify-center gap-2 text-sm font-medium text-pink-600 hover:bg-pink-50">
                  <Instagram size={20} /> Instagram
                </a>
              )}
              {kontak.facebook && (
                <a href={`https://facebook.com/${kontak.facebook}`} target="_blank" rel="noopener noreferrer"
                  className="card p-4 flex-1 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                  <Facebook size={20} /> Facebook
                </a>
              )}
            </div>
          </div>

          <div className="card overflow-hidden h-80 lg:h-auto">
            <div className="w-full h-full bg-gradient-to-br from-almarwa-100 to-almarwa-200 flex items-center justify-center">
              <div className="text-center p-6">
                <MapPin size={48} className="text-almarwa-400 mx-auto mb-3" />
                <p className="text-almarwa-600 font-semibold">Lokasi Kantor</p>
                <p className="text-sm text-almarwa-400 mt-1">Almarwa Tour & Travel</p>
                <p className="text-xs text-almarwa-300 mt-2">{kontak.alamat}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== Footer =====
function Footer({ kontak = {} }) {
  return (
    <footer className="bg-gradient-to-br from-almarwa-900 via-almarwa-800 to-almarwa-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <AlmarwaLogo size="lg" light />
            <p className="text-white/50 text-sm mt-4 leading-relaxed">
              Biro perjalanan umroh & haji plus terpercaya. Melayani sepenuh hati sejak 2015 dengan pengalaman lebih dari 2.500 jamaah.
            </p>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-white/80">Menu</h4>
            <div className="space-y-2">
              {['Beranda', 'Tentang Kami', 'Paket Umroh', 'Jadwal', 'Fasilitas', 'Galeri', 'FAQ'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '')}`}
                  className="block text-sm text-white/50 hover:text-white transition-colors">{item}</a>
              ))}
            </div>
          </div>

          {/* Paket */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-white/80">Paket</h4>
            <div className="space-y-2">
              {['Paket Ekonomi', 'Paket Regular', 'Paket VIP', 'Paket Ramadhan'].map(item => (
                <p key={item} className="text-sm text-white/50">{item}</p>
              ))}
            </div>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-white/80">Kontak</h4>
            <div className="space-y-3 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <Phone size={14} /> 
                <a href={`https://wa.me/${kontak.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  +{kontak.whatsapp}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} /> 
                <a href={`mailto:${kontak.email}`} className="hover:text-white transition-colors">{kontak.email}</a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" /> 
                <a href="https://maps.app.goo.gl/6f5MBUBYvJBr5wB57?g_st=ic" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-left block">
                  {kontak.alamat}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© 2026 Almarwa Tour & Travel. All rights reserved.</p>
          <p className="text-xs text-white/30">Umroh & Haji Plus — Melayani Sepenuh Hati</p>
        </div>
      </div>
    </footer>
  );
}

// ===== CTA Section =====
function CTASection({ kontak = {} }) {
  const { navigate, user } = useAuth();
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-almarwa-700 to-almarwa-600"></div>
      <div className="absolute inset-0 bg-pattern-islamic opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <p className="font-arabic text-lg text-yellow-300/80 mb-4">وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Siap Memulai Perjalanan Suci Anda?</h2>
        <p className="text-white/70 mb-8 max-w-xl mx-auto">Daftarkan diri Anda sekarang dan wujudkan perjalanan ibadah umroh yang berkesan bersama Almarwa Tour & Travel.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate(user ? 'jamaah' : 'register')} className="btn-gold flex items-center gap-2 text-base">
            Daftar Sekarang <ArrowRight size={18} />
          </button>
          <a href={`https://wa.me/${kontak.whatsapp}`} target="_blank" rel="noopener noreferrer"
            className="btn-secondary !border-white/30 !text-white hover:!bg-white hover:!text-almarwa-700 flex items-center gap-2 text-base">
            <MessageCircle size={18} /> Hubungi via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

// ===== Landing Page =====
export default function LandingPage() {
  const [kontak, setKontak] = useState({});
  useEffect(() => {
    apiFetch('/public/kontak').then(setKontak).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TrustSection />
      <PaketSection />
      <JadwalSection />
      <FasilitasSection />
      <GaleriSection />
      <TestimoniSection />
      <FAQSection />
      <CTASection kontak={kontak} />
      <KontakSection kontak={kontak} />
      <Footer kontak={kontak} />
    </div>
  );
}
