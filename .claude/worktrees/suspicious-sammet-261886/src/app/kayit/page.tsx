"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

/* ─── Easing constants ────────────────────────────────────────────────────── */
const EASE_IO = [0.4, 0, 0.2, 1] as const;
const EASE_OUT = [0.0, 0, 0.2, 1] as const;

/* ─── Right panel ambient orbs ───────────────────────────────────────────── */
function RightPanelOrbs() {
  return (
    <>
      <motion.div className="pointer-events-none absolute rounded-full"
        style={{
          width: 280, height: 280,
          background: "radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 70%)",
          top: "-10%", right: "-8%",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: EASE_IO }}
      />
      <motion.div className="pointer-events-none absolute rounded-full"
        style={{
          width: 200, height: 200,
          background: "radial-gradient(circle, rgba(255,215,0,0.03) 0%, transparent 70%)",
          bottom: "5%", left: "-5%",
        }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: EASE_IO, delay: 1.5 }}
      />
    </>
  );
}

/* ─── Left Decorative Panel (wheel / rings motif) ────────────────────────── */
function LeftPanel() {
  const dots = [
    { style: { top: "12%", left: "18%" } as const, delay: 0 },
    { style: { top: "35%", right: "12%" } as const, delay: 0.7 },
    { style: { bottom: "18%", left: "14%" } as const, delay: 1.3 },
    { style: { bottom: "10%", right: "20%" } as const, delay: 1.9 },
  ];

  return (
    <div
      className="relative hidden lg:flex lg:w-[55%] flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: "linear-gradient(145deg, #080808 0%, #111111 60%, #0c0c0c 100%)" }}
    >
      {/* Grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(255,215,0,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,215,0,0.035) 1px, transparent 1px)`,
        backgroundSize: "52px 52px",
      }} />

      {/* Corner glows */}
      <div className="absolute top-0 left-0 w-40 h-40"
        style={{ background: "radial-gradient(circle at 0% 0%, rgba(255,215,0,0.07) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 w-56 h-56"
        style={{ background: "radial-gradient(circle at 100% 100%, rgba(255,215,0,0.05) 0%, transparent 70%)" }} />

      {/* Pulsing glow */}
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{
          width: 450, height: 450,
          background: "radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 68%)",
          top: "50%", left: "50%", x: "-50%", y: "-50%",
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: EASE_IO }}
      />

      {/* Wheel rings artwork */}
      <motion.div className="relative z-10 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: EASE_OUT }}
      >
        <svg viewBox="0 0 300 300" width="290" height="290"
          style={{ filter: "drop-shadow(0 0 18px rgba(255,215,0,0.28))" }}>

          <motion.circle cx={150} cy={150} r={130} fill="none" stroke="rgba(255,215,0,0.1)" strokeWidth="1"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, delay: 0.4, ease: EASE_IO }}
          />
          <motion.circle cx={150} cy={150} r={95} fill="none" stroke="rgba(255,215,0,0.18)" strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.7, ease: EASE_IO }}
          />
          <motion.circle cx={150} cy={150} r={60} fill="none" stroke="rgba(255,215,0,0.32)" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, delay: 1.0, ease: EASE_IO }}
          />

          {/* Hub */}
          <circle cx={150} cy={150} r={12} fill="rgba(255,215,0,0.25)" stroke="#FFD700" strokeWidth="1.5" />
          <motion.circle cx={150} cy={150} r={12} fill="none" stroke="rgba(255,215,0,0.8)" strokeWidth="1"
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: EASE_IO }}
          />

          {/* Spokes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <motion.line key={angle}
                x1={150 + 12 * Math.cos(rad)} y1={150 + 12 * Math.sin(rad)}
                x2={150 + 92 * Math.cos(rad)} y2={150 + 92 * Math.sin(rad)}
                stroke="#FFD700" strokeWidth="1"
                initial={{ opacity: 0 }} animate={{ opacity: 0.28 }}
                transition={{ duration: 0.4, delay: 1.2 }}
              />
            );
          })}

          {/* Outer tick marks */}
          {Array.from({ length: 24 }, (_, i) => i * 15).map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const inner = 118;
            const outer = 128;
            return (
              <line key={angle}
                x1={150 + inner * Math.cos(rad)} y1={150 + inner * Math.sin(rad)}
                x2={150 + outer * Math.cos(rad)} y2={150 + outer * Math.sin(rad)}
                stroke="rgba(255,215,0,0.2)" strokeWidth={angle % 90 === 0 ? 2 : 1}
              />
            );
          })}

          {/* GM label */}
          <text x={150} y={155} textAnchor="middle" dominantBaseline="middle"
            fill="#FFD700" fontSize="14" fontWeight="700"
            fontFamily="system-ui, sans-serif" letterSpacing="3" opacity="0.8"
          >
            GM
          </text>
        </svg>
      </motion.div>

      {/* Brand text */}
      <motion.div className="relative z-10 text-center mt-6"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.4, ease: EASE_OUT }}
      >
        <p className="text-[11px] tracking-[0.55em] text-brand-yellow/55 uppercase mb-3 font-medium">Galaksi Motor</p>
        <div className="h-px w-20 mx-auto bg-gradient-to-r from-transparent via-brand-yellow/35 to-transparent mb-3" />
        <p className="text-[13px] text-white/30 tracking-[0.18em] font-light">Topluluğa katıl. Farkı hisset.</p>
      </motion.div>

      {/* Feature list */}
      <motion.div className="relative z-10 mt-7 flex flex-col gap-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.7 }}
      >
        {["Özel fiyatlar ve kampanyalar", "Randevu & servis takibi", "Kişisel garaj profili"].map((item, i) => (
          <motion.div key={item} className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 + i * 0.12, ease: EASE_OUT }}
          >
            <div className="w-1 h-1 rounded-full bg-brand-yellow/45" />
            <span className="text-[12px] text-white/28 font-light tracking-wide">{item}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating dots */}
      {dots.map(({ style, delay }, i) => (
        <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-brand-yellow"
          style={{ ...style, opacity: 0 }}
          animate={{ opacity: [0.12, 0.55, 0.12], scale: [1, 1.7, 1] }}
          transition={{ duration: 2.8 + i * 0.4, repeat: Infinity, delay, ease: EASE_IO }}
        />
      ))}

      {/* Right edge accent */}
      <div className="absolute right-0 top-[10%] bottom-[10%] w-px"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,215,0,0.12), transparent)" }} />
    </div>
  );
}

/* ─── Glass Input ─────────────────────────────────────────────────────────── */
function GlassInput({
  type, placeholder, value, onChange, required, autoComplete, minLength,
}: {
  type: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean; autoComplete?: string; minLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} required={required} autoComplete={autoComplete}
      placeholder={placeholder} value={value} minLength={minLength}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: focused ? "1px solid rgba(255,215,0,0.5)" : "1px solid rgba(255,255,255,0.07)",
        boxShadow: focused
          ? "0 0 0 3px rgba(255,215,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    />
  );
}

/* ─── Register Form ───────────────────────────────────────────────────────── */
function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Kayıt başarısız.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) { setError("Kayıt tamam, ancak otomatik giriş yapılamadı."); return; }
    router.push("/hesabim");
    router.refresh();
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } as never },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12 lg:px-12"
      style={{ background: "linear-gradient(160deg, #0d0d0d 0%, #111111 100%)" }}
    >
      <RightPanelOrbs />
      <motion.div className="relative z-10 w-full max-w-[400px]"
        variants={container} initial="hidden" animate="visible"
      >
        {/* Header */}
        <motion.div variants={item} className="mb-8" transition={{ duration: 0.5, ease: EASE_OUT }}>
          <p className="text-[11px] tracking-[0.4em] text-brand-yellow/60 uppercase mb-2 font-medium">Galaksi Motor</p>
          <h1 className="text-3xl font-bold text-white leading-tight">
            Hesap{" "}
            <span className="text-brand-yellow" style={{ textShadow: "0 0 20px rgba(255,215,0,0.35)" }}>
              oluştur.
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/40">Topluluğa katıl, ayrıcalıklı deneyimi yaşa.</p>
        </motion.div>

        {/* Glass card */}
        <motion.div variants={item} transition={{ duration: 0.5, ease: EASE_OUT }}
          className="rounded-2xl p-7"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Google */}
          <motion.button
            onClick={() => signIn("google", { callbackUrl: "/hesabim" })}
            whileHover={{ scale: 1.015, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3 text-sm font-semibold text-[#1a1a1a]"
            style={{ background: "#f5f5f5" }}
          >
            <GoogleIcon />
            Google ile Kayıt Ol
          </motion.button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs text-white/25 tracking-wider">veya</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <GlassInput type="text" placeholder="Ad Soyad" value={name} onChange={setName} required autoComplete="name" />
            <GlassInput type="email" placeholder="E-posta" value={email} onChange={setEmail} required autoComplete="email" />
            <GlassInput type="password" placeholder="Şifre (en az 6 karakter)" value={password} onChange={setPassword} required minLength={6} autoComplete="new-password" />

            <AnimatePresence>
              {error && (
                <motion.p className="text-xs text-red-400 px-1"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.015, boxShadow: "0 4px 24px rgba(255,215,0,0.22)" } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              className="mt-1 w-full rounded-xl py-3 text-sm font-bold text-brand-black disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFC200 100%)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner /> Kayıt olunuyor...
                </span>
              ) : "Kayıt Ol"}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p variants={item} transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mt-6 text-center text-xs text-white/30"
        >
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="text-brand-yellow/80 hover:text-brand-yellow transition-colors duration-150 font-medium">
            Giriş yapın
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

/* ─── Icons ───────────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
      <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <motion.svg width="14" height="14" viewBox="0 0 14 14"
      animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
      <path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />
    </motion.svg>
  );
}

/* ─── Page export ─────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 65px)" }}>
      <LeftPanel />
      <RegisterForm />
    </div>
  );
}
