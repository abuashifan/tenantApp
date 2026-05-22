'use client';

import {
  ArrowRight,
  BarChart3,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ApiRequestError, apiRequest } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { LoginResponse } from '@/types/auth';
import type { Company } from '@/types/company';

type FeatureCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  bgClassName: string;
  iconBgClassName: string;
  iconClassName: string;
};

// TODO production: ambil nilai ini dari data Nama Aplikasi / app settings.
// Contoh sumber nanti: company settings, environment config, atau endpoint settings aplikasi.
const appName = 'Tenant Accounting ERP';

const featureCards: FeatureCard[] = [
  {
    title: 'Akun rapi dari hari pertama',
    description:
      'Transaksi, jurnal, dan laporan disusun dalam satu workspace yang mudah dipakai.',
    icon: Building2,
    bgClassName: 'bg-[var(--color-emerald-50)]',
    iconBgClassName: 'bg-[var(--color-emerald-100)]',
    iconClassName: 'text-[var(--color-emerald-700)]',
  },
  {
    title: 'Realtime report tanpa repot',
    description:
      'Pantau laba rugi, neraca, arus kas, dan ringkasan keuangan tanpa buka banyak file.',
    icon: BarChart3,
    bgClassName: 'bg-[var(--color-cerulean-50)]',
    iconBgClassName: 'bg-[var(--color-ocean-mist-100)]',
    iconClassName: 'text-[var(--color-yale-blue-900)]',
  },
  {
    title: 'Kontrol transaksi lebih aman',
    description:
      'Approval, posting, audit trail, dan period lock membantu mengurangi salah input.',
    icon: ShieldCheck,
    bgClassName: 'bg-[var(--color-lime-cream-50)]',
    iconBgClassName: 'bg-[var(--color-lime-cream-100)]',
    iconClassName: 'text-[var(--color-lime-cream-700)]',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    try {
      setLoading(true);

      const loginRes = await apiRequest<ApiResponse<LoginResponse>>(
        '/auth/login',
        {
          method: 'POST',
          body: { email, password, remember: rememberMe },
        },
      );

      localStorage.setItem('auth_token', loginRes.data.token);
      localStorage.setItem('auth_user', JSON.stringify(loginRes.data.user));

      const companiesRes = await apiRequest<ApiResponse<Company[]>>('/companies', {
        token: loginRes.data.token,
      });

      const companies = companiesRes.data ?? [];

      if (companies.length === 0) {
        setError('User ini belum punya company.');
        return;
      }

      if (companies.length === 1) {
        localStorage.setItem('active_company_id', String(companies[0].id));
        router.push('/dashboard');
        return;
      }

      router.push('/select-company');
    } catch (err) {
      setError(toLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden p-4 text-slate-950 sm:p-6 lg:p-8"
      style={{
        background:
          'radial-gradient(circle at 8% 12%, var(--color-lime-cream-100) 0, transparent 30%), radial-gradient(circle at 92% 18%, var(--color-tropical-teal-100) 0, transparent 32%), linear-gradient(135deg, var(--color-lime-cream-50), #ffffff 42%, var(--color-ocean-mist-50))',
      }}
    >
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[var(--color-lime-cream-200)] opacity-[0.45] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-[var(--color-ocean-mist-100)] opacity-[0.65] blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden lg:block">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-[var(--color-emerald-700)]" />
              {appName}
            </div>

            <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight text-slate-950">
              Kelola akuntansi bisnis tanpa ribet.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Satu aplikasi untuk mencatat transaksi, mengontrol approval, dan membaca
              laporan keuangan bisnis dengan lebih cepat.
            </p>

            <div className="mt-9 grid max-w-3xl gap-4">
              {featureCards.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`flex items-start gap-4 rounded-3xl border border-white/80 p-5 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 ${item.bgClassName}`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.iconBgClassName}`}
                    >
                      <Icon className={`h-6 w-6 ${item.iconClassName}`} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <form
            onSubmit={onSubmit}
            className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-2xl shadow-slate-950/10 backdrop-blur-xl"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--color-emerald-700)]">
                    Welcome Back
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                    Login
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Masuk untuk membuka dashboard perusahaan aktif.
                  </p>
                </div>
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-lime-cream-100), var(--color-ocean-mist-50))',
                  }}
                >
                  <WalletCards className="h-7 w-7 text-[var(--color-yale-blue-900)]" />
                </div>
              </div>

              <div className="mt-7 space-y-4">
                {error ? (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  >
                    {error}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                    Email
                  </label>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition focus-within:border-transparent focus-within:ring-2 focus-within:ring-[var(--color-tropical-teal-500)]">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="email@company.com"
                      autoComplete="email"
                      className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Password
                  </label>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition focus-within:border-transparent focus-within:ring-2 focus-within:ring-[var(--color-tropical-teal-500)]">
                    <Lock className="h-5 w-5 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      onClick={() => setShowPassword((current) => !current)}
                      className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-tropical-teal-500)]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[var(--color-yale-blue-900)] focus:ring-2 focus:ring-[var(--color-tropical-teal-500)]"
                  />
                  Remember me
                </label>
              </div>

              <div className="mt-4 rounded-2xl border border-[var(--color-ocean-mist-100)] bg-[var(--color-ocean-mist-50)] px-4 py-3">
                <p className="text-xs leading-5 text-slate-600">
                  Lupa password? Hubungi administrator perusahaan untuk reset akses akun.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-tropical-teal-500)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-lime-cream-500), var(--color-tropical-teal-500))',
                }}
              >
                {loading ? 'Signing in...' : 'Login'}
                {!loading ? <ArrowRight className="h-5 w-5" /> : null}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function toLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.message === 'NEXT_PUBLIC_API_URL is not configured') {
      return 'Konfigurasi koneksi API belum tersedia. Hubungi administrator sistem.';
    }

    if (error.status === 401 || error.status === 422) {
      return 'Email atau password tidak sesuai.';
    }

    if (error.status === 403) {
      return 'Akun Anda belum memiliki izin untuk masuk.';
    }
  }

  if (error instanceof Error && error.message === 'NEXT_PUBLIC_API_URL is not configured') {
    return 'Konfigurasi koneksi API belum tersedia. Hubungi administrator sistem.';
  }

  return 'Login gagal. Periksa email dan password lalu coba lagi.';
}
