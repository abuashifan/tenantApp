import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  WalletCards,
  BarChart3,
} from "lucide-react";

const colors = {
  lime50: "#f7fbe9",
  lime100: "#f0f8d3",
  lime200: "#e1f1a7",
  lime300: "#d2ea7b",
  lime500: "#b4db24",
  lime700: "#6c8415",
  lightGreen50: "#eef9ec",
  lightGreen100: "#ddf2d9",
  lightGreen500: "#55bf40",
  emerald50: "#edf8f1",
  emerald100: "#dbf0e2",
  emerald500: "#49b66f",
  emerald700: "#2c6d43",
  ocean50: "#edf7f5",
  ocean100: "#dbf0ea",
  ocean500: "#4bb496",
  teal50: "#ecf8f9",
  teal100: "#d8f2f3",
  teal500: "#3dbdc2",
  cerulean50: "#e9f6fb",
  cerulean500: "#24a1db",
  yale900: "#091c2a",
  yale950: "#06131e",
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

// TODO production: ambil nilai ini dari data Nama Aplikasi / app settings.
// Contoh sumber nanti: company settings, environment config, atau endpoint settings aplikasi.
const appName = "Tenant Accounting ERP";

const featureCards = [
  {
    title: "Akun rapi dari hari pertama",
    desc: "Transaksi, jurnal, dan laporan disusun dalam satu workspace yang mudah dipakai.",
    icon: Building2,
    bg: colors.emerald50,
    iconBg: colors.emerald100,
    iconColor: colors.emerald700,
  },
  {
    title: "Realtime report tanpa repot",
    desc: "Pantau laba rugi, neraca, arus kas, dan ringkasan keuangan tanpa buka banyak file.",
    icon: BarChart3,
    bg: colors.cerulean50,
    iconBg: colors.ocean100,
    iconColor: colors.yale900,
  },
  {
    title: "Kontrol transaksi lebih aman",
    desc: "Approval, posting, audit trail, dan period lock membantu mengurangi salah input.",
    icon: ShieldCheck,
    bg: colors.lime50,
    iconBg: colors.lime100,
    iconColor: colors.lime700,
  },
];

export default function AccountingLoginFormDesign() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden p-4 text-slate-950 sm:p-6 lg:p-8"
      style={{
        background: `radial-gradient(circle at 8% 12%, ${colors.lime100} 0, transparent 30%), radial-gradient(circle at 92% 18%, ${colors.teal100} 0, transparent 32%), linear-gradient(135deg, ${colors.lime50}, #ffffff 42%, ${colors.ocean50})`,
      }}
    >
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: colors.lime200, opacity: 0.45 }} />
      <div className="pointer-events-none absolute -right-24 bottom-16 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: colors.ocean100, opacity: 0.65 }} />

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden lg:block">
          <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl">
              <Sparkles className="h-4 w-4" style={{ color: colors.emerald700 }} />
              {appName}
            </div>

            <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight text-slate-950">
              Kelola akuntansi bisnis tanpa ribet.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Satu aplikasi untuk mencatat transaksi, mengontrol approval, dan membaca laporan keuangan bisnis dengan lebih cepat.
            </p>

            <div className="mt-9 grid max-w-3xl gap-4">
              {featureCards.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.08 }}
                    className="flex items-start gap-4 rounded-3xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: item.iconBg }}>
                      <Icon className="h-6 w-6" style={{ color: item.iconColor }} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <motion.form
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-2xl shadow-slate-950/10 backdrop-blur-xl"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: colors.emerald700 }}>
                    Welcome Back
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Login</h2>
                  <p className="mt-2 text-sm text-slate-500">Masuk untuk membuka dashboard perusahaan aktif.</p>
                </div>
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${colors.lime100}, ${colors.ocean50})` }}
                >
                  <WalletCards className="h-7 w-7" style={{ color: colors.yale900 }} />
                </div>
              </div>

              <div className="mt-7 space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Email</span>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition focus-within:border-transparent focus-within:ring-2" style={{ "--tw-ring-color": colors.teal500 }}>
                    <Mail className="h-5 w-5 text-slate-400" />
                    <input
                      defaultValue="admin@example.com"
                      className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                      type="email"
                      placeholder="email@company.com"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Password</span>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition focus-within:border-transparent focus-within:ring-2" style={{ "--tw-ring-color": colors.teal500 }}>
                    <Lock className="h-5 w-5 text-slate-400" />
                    <input
                      defaultValue="password"
                      className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-slate-700">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </label>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
                  Remember me
                </label>
              </div>

              <div className="mt-4 rounded-2xl border px-4 py-3" style={{ backgroundColor: colors.ocean50, borderColor: colors.ocean100 }}>
                <p className="text-xs leading-5 text-slate-600">
                  Lupa password? Hubungi administrator perusahaan untuk reset akses akun.
                </p>
              </div>

              <button
                type="submit"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: `linear-gradient(135deg, ${colors.lime500}, ${colors.teal500})` }}
              >
                {loading ? "Signing in..." : "Login"}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </div>
          </motion.form>
        </section>
      </div>
    </main>
  );
}
