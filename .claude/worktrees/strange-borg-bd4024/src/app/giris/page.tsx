"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FormEvent, useState, Suspense } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

/* ─── Easing constants (satisfies framer-motion Easing type) ─────────────── */
const EASE_IO = [0.4, 0, 0.2, 1] as const;
const EASE_OUT = [0.0, 0, 0.2, 1] as const;

/* ─── Spokes ─────────────────────────────────────────────────────────────── */
function Spokes({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      {[0, 45, 90, 135].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return (
          <line key={angle}
            x1={cx + r * cos} y1={cy + r * sin}
            x2={cx - r * cos} y2={cy - r * sin}
            stroke="#FFD700" strokeWidth="1" opacity="0.3"
          />
        );
      })}
    </>
  );
}

/* ─── Motorcycle SVG (inline animations, no Variants) ──────────────────── */
function MotorcycleSVG() {
  const pathAnim = (delay: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { duration: 1.8, delay, ease: EASE_IO },
      opacity: { duration: 0.25, delay },
    },
  });

  return (
    <motion.svg
      viewBox="0 0 400 220" width="360" height="198"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      style={{ filter: "drop-shadow(0 0 14px rgba(255,215,0,0.35))" }}
    >
      {/* Rear wheel */}
      <motion.circle cx={88} cy={160} r={46} fill="none" stroke="#FFD700" strokeWidth="2.5" {...pathAnim(0.3)} />
      <circle cx={88} cy={160} r={7} fill="rgba(255,215,0,0.7)" />
      <Spokes cx={88} cy={160} r={38} />

      {/* Front wheel */}
      <motion.circle cx={314} cy={160} r={46} fill="none" stroke="#FFD700" strokeWidth="2.5" {...pathAnim(0.5)} />
      <circle cx={314} cy={160} r={7} fill="rgba(255,215,0,0.7)" />
      <Spokes cx={314} cy={160} r={38} />

      {/* Main frame */}
      <motion.path d="M88,160 L115,102 L178,90 L238,90 L270,118 L314,160"
        fill="none" stroke="#FFD700" strokeWidth="2.5" {...pathAnim(0.7)} />

      {/* Engine block */}
      <path d="M138,103 L180,106 L194,130 L148,134 Z"
        fill="rgba(255,215,0,0.07)" stroke="rgba(255,215,0,0.45)" strokeWidth="1.5" />

      {/* Tank */}
      <path d="M178,90 L240,88 L250,103 L210,106 L180,103 Z"
        fill="rgba(255,215,0,0.1)" stroke="#FFD700" strokeWidth="1.5" />

      {/* Seat */}
      <path d="M212,88 L254,85 L266,94 L240,97 Z"
        fill="rgba(255,215,0,0.16)" stroke="#FFD700" strokeWidth="1.5" />

      {/* Front fork */}
      <motion.path d="M266,94 L292,128 L314,160" fill="none" stroke="#FFD700" strokeWidth="2.5" {...pathAnim(0.9)} />
      <motion.path d="M270,118 L296,150" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.5" {...pathAnim(1.0)} />

      {/* Handlebars */}
      <motion.path d="M266,94 L250,74 M266,94 L283,79" fill="none" stroke="#FFD700" strokeWidth="2" {...pathAnim(1.1)} />

      {/* Headlight */}
      <ellipse cx={286} cy={110} rx={14} ry={10} fill="rgba(255,215,0,0.12)" stroke="#FFD700" strokeWidth="1.5" />
      <motion.ellipse cx={286} cy={110} rx={14} ry={10} fill="none" stroke="rgba(255,215,0,0.9)" strokeWidth="0.8"
        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, ease: EASE_IO }}
      />

      {/* Exhaust */}
      <motion.path d="M138,140 L100,147 L62,152" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.55" {...pathAnim(1.2)} />

      {/* Rider silhouette */}
      <path d="M222,89 Q230,60 244,55 Q254,50 257,62 L254,89"
        fill="rgba(255,215,0,0.05)" stroke="rgba(255,215,0,0.35)" strokeWidth="1.5" />

      {/* Ground shadow */}
      <motion.ellipse cx={201} cy={208} rx={120} ry={6} fill="rgba(255,215,0,0.06)"
        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 1.4, ease: EASE_OUT }}
      />

      {/* Speed lines */}
      <motion.g
        animate={{ x: ["-30px", "0px"], opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: EASE_OUT }}
      >
        <line x1="8" y1="128" x2="52" y2="128" stroke="#FFD700" strokeWidth="1.5" />
        <line x1="4" y1="143" x2="44" y2="143" stroke="#FFD700" strokeWidth="1" />
        <line x1="10" y1="157" x2="46" y2="157" stroke="#FFD700" strokeWidth="1" />
      </motion.g>
    </motion.svg>
  );
}

/* ─── Left Decorative Panel ─────────────────────────────────────────────── */
function LeftPanel() {
  const dots = [
    { style: { top: "14%", left: "22%" } as const, delay: 0 },
    { style: { top: "28%", right: "14%" } as const, delay: 0.6 },
    { style: { bottom: "22%", left: "16%" } as const, delay: 1.1 },
    { style: { bottom: "14%", right: "22%" } as const, delay: 1.7 },
    { style: { top: "62%", left: "8%" } as const, delay: 0.3 },
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

      {/* Pulsing orb */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 420, height: 420,
          background: "radial-gradient(circle, rgba(255,215,0,0.045) 0%, transparent 68%)",
          top: "50%", left: "50%", x: "-50%", y: "-50%",
        }}
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: EASE_IO }}
      />

      {/* Motorcycle */}
      <motion.div className="relative z-10"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: EASE_OUT }}
      >
        <MotorcycleSVG />
      </motion.div>

      {/* Brand text */}
      <motion.div className="relative z-10 text-center mt-4"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.3, ease: EASE_OUT }}
      >
        <p className="text-[11px] tracking-[0.55em] text-brand-yellow/55 uppercase mb-3 font-medium">Galaksi Motor</p>
        <div className="h-px w-20 mx-auto bg-gradient-to-r from-transparent via-brand-yellow/35 to-transparent mb-3" />
        <p className="text-[13px] text-white/30 tracking-[0.18em] font-light">Motosiklet Tutkusu · Premium Kalite</p>
      </motion.div>

      {/* Floating dots */}
      {dots.map(({ style, delay }, i) => (
        <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-brand-yellow"
          style={{ ...style, opacity: 0 }}
          animate={{ opacity: [0.15, 0.6, 0.15], scale: [1, 1.6, 1] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay, ease: EASE_IO }}
        />
      ))}

      {/* Right edge accent */}
      <div className="absolute right-0 top-[10%] bottom-[10%] w-px"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,215,0,0.15), transparent)" }} />
    </div>
  );
}

/* ─── Glass Input ────────────────────────────────────────────────────────── */
function GlassInput({
  type, placeholder, value, onChange, required, autoComplete,
}: {
  type: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} required={required} autoComplete={autoComplete}
      placeholder={placeholder} value={value}
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

/* ─── Login Form (inside Suspense for useSearchParams) ───────────────────── */
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/hesabim";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("E-posta veya şifre hatalı."); return; }
    router.push(callbackUrl);
    router.refresh();
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } as never },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12"
      style={{ background: "linear-gradient(160deg, #0d0d0d 0%, #111111 100%)" }}
    >
      <motion.div className="w-full max-w-[400px]" variants={container} initial="hidden" animate="visible">

        {/* Header */}
        <motion.div variants={item} className="mb-8" transition={{ duration: 0.5, ease: EASE_OUT }}>
          <p className="text-[11px] tracking-[0.4em] text-brand-yellow/60 uppercase mb-2 font-medium">Galaksi Motor</p>
          <h1 className="text-3xl font-bold text-white leading-tight">
            Tekrar{" "}
            <span className="text-brand-yellow" style={{ textShadow: "0 0 20px rgba(255,215,0,0.35)" }}>
              hoş geldin.
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/40">Hesabına giriş yap, yolculuğuna devam et.</p>
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
          {/* Google button */}
          <motion.button
            onClick={() => signIn("google", { callbackUrl })}
            whileHover={{ scale: 1.015, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3 text-sm font-semibold text-[#1a1a1a]"
            style={{ background: "#f5f5f5" }}
          >
            <GoogleIcon />
            Google ile Giriş Yap
          </motion.button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs text-white/25 tracking-wider">veya</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Form fields */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <GlassInput type="email" placeholder="E-posta" value={email} onChange={setEmail} required autoComplete="email" />
            <GlassInput type="password" placeholder="Şifre" value={password} onChange={setPassword} required autoComplete="current-password" />

            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-white/55 transition hover:text-brand-yellow"
              >
                Şifremi unuttum
              </Link>
            </div>

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
                  <LoadingSpinner /> Giriş yapılıyor...
                </span>
              ) : "Giriş Yap"}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p variants={item} transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mt-6 text-center text-xs text-white/30"
        >
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="text-brand-yellow/80 hover:text-brand-yellow transition-colors duration-150 font-medium">
            Kayıt olun
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

/* ─── Micro-icons ─────────────────────────────────────────────────────────── */
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
export default function LoginPage() {
  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 65px)" }}>
      <LeftPanel />
      <Suspense fallback={
        <div className="flex flex-1 items-center justify-center" style={{ background: "#111111" }}>
          <motion.div className="w-6 h-6 rounded-full border-2 border-brand-yellow border-t-transparent"
            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
