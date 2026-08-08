/* ============================================================
   ALMARWA TOUR TRAVEL - Auth Page (Login & Register)
   ============================================================ */
import React, { useState } from 'react';
import { useAuth, useToast } from '../App';
import { AlmarwaLogo } from './LandingPage';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Sparkles } from 'lucide-react';

export default function AuthPage({ initialTab = 'login' }) {
  const { login, register, navigate } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    nama: '', email: '', no_hp: '', password: '', confirmPassword: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    if (registerForm.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = registerForm;
      await register(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-almarwa-800 via-almarwa-700 to-almarwa-600"></div>
        <div className="absolute inset-0 bg-pattern-islamic opacity-20"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-almarwa-400/20 rounded-full blur-3xl"></div>

        <div className="relative flex flex-col items-center justify-center p-12 text-center w-full">
          <AlmarwaLogo size="xl" light />

          <div className="mt-10 max-w-md">
            <p className="font-arabic text-2xl text-yellow-300/80 mb-6">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            <h2 className="text-3xl font-extrabold text-white mb-4">Langkah Suci Menuju Baitullah</h2>
            <p className="text-white/60 leading-relaxed">
              Bergabunglah bersama ribuan jamaah yang telah mempercayakan perjalanan ibadah mereka kepada Almarwa Tour & Travel.
            </p>
          </div>

          {/* Floating testimonials */}
          <div className="absolute bottom-16 left-12 right-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/10">
              <p className="text-white/80 text-sm italic">"Alhamdulillah, perjalanan bersama Almarwa sangat berkesan. Pelayanan luar biasa!"</p>
              <p className="text-white/50 text-xs mt-2">— Hj. Nurjanah, Jakarta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-b from-white to-[#FFF8FA]">
        <div className="w-full max-w-md">
          {/* Back button */}
          <button onClick={() => navigate('landing')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-almarwa-600 mb-8 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </button>

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <AlmarwaLogo size="lg" />
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-almarwa-50 rounded-xl p-1 mb-8">
            <button onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'login' ? 'bg-white text-almarwa-600 shadow-sm' : 'text-gray-500'
              }`}>
              Masuk
            </button>
            <button onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'register' ? 'bg-white text-almarwa-600 shadow-sm' : 'text-gray-500'
              }`}>
              Daftar Jamaah
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 animate-fade-in">
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Assalamu'alaikum!</h2>
                <p className="text-gray-400 text-sm mt-1">Masuk ke akun Anda untuk melanjutkan.</p>
              </div>

              <div>
                <label className="form-label">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" required placeholder="email@contoh.com"
                    className="form-input pl-11" value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} required placeholder="Masukkan password"
                    className="form-input pl-11 pr-11" value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Masuk <ArrowLeft size={16} className="rotate-180" /></>}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Daftar Akun Jamaah</h2>
                <p className="text-gray-400 text-sm mt-1">Buat akun jamaah untuk mendaftar umroh bersama Almarwa.</p>
                <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-[11px] text-amber-700">ℹ️ Halaman ini khusus untuk pendaftaran <strong>Jamaah</strong>. Admin dan Owner sudah memiliki akun tersendiri.</p>
                </div>
              </div>

              <div>
                <label className="form-label">Nama Lengkap</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" required placeholder="Nama lengkap Anda"
                    className="form-input pl-11" value={registerForm.nama}
                    onChange={e => setRegisterForm({ ...registerForm, nama: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="form-label">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" required placeholder="email@contoh.com"
                    className="form-input pl-11" value={registerForm.email}
                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="form-label">Nomor HP / WhatsApp</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" required placeholder="08xxxxxxxxxx"
                    className="form-input pl-11" value={registerForm.no_hp}
                    onChange={e => setRegisterForm({ ...registerForm, no_hp: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Password</label>
                  <input type="password" required placeholder="Min. 6 karakter" className="form-input"
                    value={registerForm.password}
                    onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Konfirmasi</label>
                  <input type="password" required placeholder="Ulangi password" className="form-input"
                    value={registerForm.confirmPassword}
                    onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Sparkles size={16} /> Daftar Sekarang</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
