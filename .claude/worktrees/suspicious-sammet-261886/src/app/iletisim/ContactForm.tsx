"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitContactForm } from "@/app/_actions/contact";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await submitContactForm({
        name,
        email,
        phone: phone || undefined,
        subject: subject || undefined,
        message,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(res.message);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-strong rounded-2xl border border-white/10 p-6 backdrop-blur-md"
    >
      <header className="mb-5">
        <span className="text-[11px] uppercase tracking-[0.2em] text-brand-yellow/70">
          · İletişim Formu
        </span>
        <h3 className="mt-1.5 text-xl font-bold text-white">
          Bize bir mesaj <span className="text-gradient-gold">bırakın</span>
        </h3>
        <p className="mt-1 text-xs text-white/45">
          Mesajınızı 1 iş günü içinde info@galaksimotor.com üzerinden
          yanıtlıyoruz.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Ad Soyad *"
          value={name}
          onChange={setName}
          autoComplete="name"
          required
          disabled={isPending}
        />
        <Field
          label="E-posta *"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
          disabled={isPending}
        />
        <Field
          label="Telefon"
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
          placeholder="05XX XXX XX XX"
          disabled={isPending}
        />
        <Field
          label="Konu"
          value={subject}
          onChange={setSubject}
          placeholder="Özel sipariş, randevu, vb."
          disabled={isPending}
        />
      </div>

      <div className="mt-3">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/55">
            Mesaj *
          </span>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending}
            placeholder="Sorunuzu veya talebinizi buraya yazın..."
            className="input-glass w-full resize-none rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none disabled:opacity-50"
          />
          <span className="mt-1 block text-right text-[10px] text-white/30">
            {message.length}/5000
          </span>
        </label>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-200"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-200"
          >
            ✓ {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-[10px] text-white/35">
          Form gönderildiğinde teyit e-postası alacaksınız.
        </p>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-brand-black shadow-[0_8px_24px_-8px_rgba(255,215,0,0.65)] transition hover:shadow-[0_10px_32px_-6px_rgba(255,215,0,0.85)] disabled:opacity-60"
        >
          {isPending ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeOpacity={0.25}
                  strokeWidth={3}
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              </svg>
              Gönderiliyor...
            </>
          ) : (
            <>
              Mesajı Gönder
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/55">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        className="input-glass w-full rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none disabled:opacity-50"
      />
    </label>
  );
}
