/* ============================================================
   ALMARWA TOUR TRAVEL - Main App Component
   React SPA with client-side routing & global auth state
   ============================================================ */
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import JamaahDashboard from './pages/JamaahDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

// ===== API Helper =====
const API = '/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('almarwa_token');
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.');
  return data;
}

// ===== Auth Context =====
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// ===== Toast Context =====
export const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

// ===== Format Currency =====
export function formatRupiah(num) {
  if (!num && num !== 0) return 'Rp 0';
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

// ===== Format Date =====
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ===== Main App =====
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Check saved auth on mount
  useEffect(() => {
    const token = localStorage.getItem('almarwa_token');
    const savedUser = localStorage.getItem('almarwa_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Go to appropriate dashboard
        if (parsed.role === 'admin') setPage('admin');
        else if (parsed.role === 'owner') setPage('owner');
        else setPage('jamaah');
      } catch (e) {
        localStorage.removeItem('almarwa_token');
        localStorage.removeItem('almarwa_user');
      }
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('almarwa_token', data.token);
    localStorage.setItem('almarwa_user', JSON.stringify(data.user));
    setUser(data.user);
    if (data.user.role === 'admin') setPage('admin');
    else if (data.user.role === 'owner') setPage('owner');
    else setPage('jamaah');
    showToast(`Assalamu'alaikum, ${data.user.nama}! 🕋`);
    return data;
  }, [showToast]);

  // Register handler
  const register = useCallback(async (formData) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    localStorage.setItem('almarwa_token', data.token);
    localStorage.setItem('almarwa_user', JSON.stringify(data.user));
    setUser(data.user);
    setPage('jamaah');
    showToast('Registrasi berhasil! Selamat datang di Almarwa Tour & Travel 🕋');
    return data;
  }, [showToast]);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('almarwa_token');
    localStorage.removeItem('almarwa_user');
    setUser(null);
    setPage('landing');
    showToast('Anda telah logout. Wa\'alaikumussalam.');
  }, [showToast]);

  // Navigate handler
  const navigate = useCallback((targetPage) => {
    setPage(targetPage);
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-almarwa-600 to-almarwa-800">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Memuat Almarwa Tour & Travel...</p>
        </div>
      </div>
    );
  }

  const authValue = { user, login, register, logout, navigate, page };
  const toastValue = { showToast };

  return (
    <AuthContext.Provider value={authValue}>
      <ToastContext.Provider value={toastValue}>
        {/* Toast Notification */}
        {toast && (
          <div className={`toast ${
            toast.type === 'success' ? 'bg-emerald-500' :
            toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'warning' ? 'bg-amber-500' :
            'bg-almarwa-600'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Page Router with Fallback Protection */}
        {page === 'landing' && <LandingPage />}
        {page === 'auth' && <AuthPage />}
        {page === 'login' && <AuthPage initialTab="login" />}
        {page === 'register' && <AuthPage initialTab="register" />}
        {page === 'jamaah' && (user ? <JamaahDashboard /> : <AuthPage initialTab="login" />)}
        {page === 'admin' && (user?.role === 'admin' || user?.role === 'owner' ? <AdminDashboard /> : <AuthPage initialTab="login" />)}
        {page === 'owner' && (user?.role === 'owner' || user?.role === 'admin' ? <OwnerDashboard /> : <AuthPage initialTab="login" />)}
        {!['landing', 'auth', 'login', 'register', 'jamaah', 'admin', 'owner'].includes(page) && <LandingPage />}
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}
