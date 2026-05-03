"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createAppointment } from "@/actions/appointmentActions";
import { AnimatePresence, motion } from "framer-motion";
import { InfoPageHero } from "@/components/InfoPageHero";
import { SITE } from "@/config/site";
import { EditableWrapper } from "@/components/EditableWrapper";

type Service = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  duration: number;
  price: number | null;
};

export type AppointmentSettings = {
  heroEyebrow: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  sec1Title: string;
  sec2Title: string;
  sec3Title: string;
  sec4Title: string;
  fieldBrand: string;
  fieldModel: string;
  fieldNote: string;
  summaryTitle: string;
  rowService: string;
  rowDuration: string;
  rowDate: string;
  rowTime: string;
  rowFee: string;
  freeLabel: string;
  btnConfirm: string;
  btnSubmitting: string;
  smsNote: string;
  emergencyNote: string;
  emergencyLink: string;
  emergencySuffix: string;
};

const R = ["/randevu"];

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const monthNames = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function getNext30Days() {
  const arr: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    arr.push(d);
  }
  return arr;
}

function buildSlots(date: Date) {
  const slots: Date[] = [];
  for (
    let h = SITE.hours.appointmentStart;
    h < SITE.hours.appointmentEnd;
    h++
  ) {
    for (let m = 0; m < 60; m += SITE.hours.appointmentSlotMinutes) {
      const d = new Date(date);
      d.setHours(h, m, 0, 0);
      slots.push(d);
    }
  }
  return slots;
}

const isoLocal = (d: Date) => {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString();
};

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function AppointmentClient({
  services,
  settings: s,
}: {
  services: Service[];
  settings: AppointmentSettings;
}) {
  const router = useRouter();
  const days = useMemo(() => getNext30Days(), []);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [day, setDay] = useState<Date>(days[0]);
  const [time, setTime] = useState<Date | null>(null);
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [motoBrand, setMotoBrand] = useState("");
  const [motoModel, setMotoModel] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slots = useMemo(() => buildSlots(day), [day]);
  const selectedService = services.find((svc) => svc.id === serviceId);

  useEffect(() => {
    if (!serviceId) return;
    setTime(null);
    fetch(`/api/appointments?serviceId=${serviceId}&date=${ymd(day)}`)
      .then((r) => r.json())
      .then((d: { taken: string[] }) =>
        setTaken(new Set(d.taken.map((iso) => new Date(iso).toISOString())))
      )
      .catch(() => setTaken(new Set()));
  }, [serviceId, day]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceId || !time) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await createAppointment({
        serviceId,
        scheduledAt: isoLocal(time),
        motoBrand,
        motoModel,
        note,
      });
      if (!result.ok) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      router.push("/hesabim/randevular");
    } catch {
      setError("Beklenmeyen bir hata oluştu.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <InfoPageHero
        eyebrow={s.heroEyebrow}
        title={
          <>
            <EditableWrapper
              table="siteSetting"
              id="appt_hero_title1"
              field="value"
              value={s.heroTitle1}
              label="Randevu Hero Başlık 1"
              revalidatePaths={R}
              as="span"
            >
              {s.heroTitle1}
            </EditableWrapper>
            {" "}
            <EditableWrapper
              table="siteSetting"
              id="appt_hero_title2"
              field="value"
              value={s.heroTitle2}
              label="Randevu Hero Başlık 2 (altın)"
              revalidatePaths={R}
              as="span"
              className="text-gradient-gold"
            >
              <span className="text-gradient-gold">{s.heroTitle2}</span>
            </EditableWrapper>
          </>
        }
        description={s.heroDesc}
      />

      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            {/* Service */}
            <Section index={1} title={s.sec1Title} settingKey="appt_sec1_title">
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((svc) => (
                  <ServiceCard
                    key={svc.id}
                    active={serviceId === svc.id}
                    onClick={() => setServiceId(svc.id)}
                    service={svc}
                    freeLabel={s.freeLabel}
                  />
                ))}
              </div>
            </Section>

            {/* Day picker */}
            <Section index={2} title={s.sec2Title} settingKey="appt_sec2_title">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {days.map((d) => {
                  const active = ymd(d) === ymd(day);
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      onClick={() => setDay(d)}
                      className={`flex shrink-0 flex-col items-center justify-center rounded-xl border px-4 py-3 transition ${
                        active
                          ? "border-brand-yellow bg-brand-yellow/10 text-brand-yellow shadow-[0_0_0_1px_rgba(255,215,0,0.4)]"
                          : "border-white/10 bg-white/[0.025] text-white/70 hover:border-white/30"
                      }`}
                    >
                      <span className="text-[11px] uppercase tracking-wider opacity-70">
                        {dayNames[d.getDay()]}
                      </span>
                      <span className="mt-0.5 text-lg font-bold">
                        {d.getDate()}
                      </span>
                      <span className="text-[10px] opacity-60">
                        {monthNames[d.getMonth()].slice(0, 3)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Time slot */}
            <Section index={3} title={s.sec3Title} settingKey="appt_sec3_title">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {slots.map((slot) => {
                  const isPast = slot.getTime() < Date.now();
                  const isTaken = taken.has(slot.toISOString());
                  const disabled = isPast || isTaken;
                  const active = time?.getTime() === slot.getTime();
                  return (
                    <button
                      key={slot.toISOString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => setTime(slot)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "border-brand-yellow bg-brand-yellow text-brand-black shadow-[0_0_18px_-4px_rgba(255,215,0,0.7)]"
                          : disabled
                          ? "cursor-not-allowed border-white/5 bg-white/[0.015] text-white/25 line-through"
                          : "border-white/10 bg-white/[0.025] text-white/80 hover:border-brand-yellow/50 hover:text-brand-yellow"
                      }`}
                    >
                      {String(slot.getHours()).padStart(2, "0")}:
                      {String(slot.getMinutes()).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-white/45">
                Çalışma saatleri: {SITE.hours.weekdays} · Cmt:{" "}
                {SITE.hours.saturday} · Paz: {SITE.hours.sunday}
              </p>
            </Section>

            {/* Motorcycle info */}
            <Section index={4} title={s.sec4Title} settingKey="appt_sec4_title">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={s.fieldBrand}
                  value={motoBrand}
                  onChange={setMotoBrand}
                  placeholder="Honda"
                />
                <Field
                  label={s.fieldModel}
                  value={motoModel}
                  onChange={setMotoModel}
                  placeholder="PCX 160"
                />
              </div>
              <div className="mt-3">
                <Field
                  label={s.fieldNote}
                  value={note}
                  onChange={setNote}
                  placeholder="Eklemek istediğin bir şey..."
                  textarea
                />
              </div>
            </Section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
              <div className="border-b border-white/10 bg-gradient-to-br from-brand-yellow/10 via-transparent to-brand-yellow/5 p-5">
                <EditableWrapper
                  table="siteSetting"
                  id="appt_summary_title"
                  field="value"
                  value={s.summaryTitle}
                  label="Randevu Özeti Başlığı"
                  revalidatePaths={R}
                  as="h2"
                  className="text-base font-semibold text-white"
                >
                  <h2 className="text-base font-semibold text-white">
                    {s.summaryTitle}
                  </h2>
                </EditableWrapper>
              </div>
              <div className="space-y-3 p-5 text-sm">
                <Row
                  label={s.rowService}
                  settingKey="appt_row_service"
                  value={selectedService?.name ?? "—"}
                />
                <Row
                  label={s.rowDuration}
                  settingKey="appt_row_duration"
                  value={selectedService ? `${selectedService.duration} dk` : "—"}
                />
                <Row
                  label={s.rowDate}
                  settingKey="appt_row_date"
                  value={`${day.getDate()} ${monthNames[day.getMonth()]}`}
                />
                <Row
                  label={s.rowTime}
                  settingKey="appt_row_time"
                  value={
                    time
                      ? `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`
                      : "—"
                  }
                />
                <div className="my-2 h-px bg-white/10" />
                <div className="flex items-end justify-between">
                  <EditableWrapper
                    table="siteSetting"
                    id="appt_row_fee"
                    field="value"
                    value={s.rowFee}
                    label="Randevu Özeti: Ücret Etiketi"
                    revalidatePaths={R}
                    as="span"
                    className="text-sm text-white/60"
                  >
                    <span className="text-sm text-white/60">{s.rowFee}</span>
                  </EditableWrapper>
                  <span className="text-2xl font-bold text-gradient-gold">
                    {selectedService?.price && selectedService.price > 0 ? (
                      fmt(selectedService.price)
                    ) : (
                      <EditableWrapper
                        table="siteSetting"
                        id="appt_free"
                        field="value"
                        value={s.freeLabel}
                        label="Ücretsiz Etiketi"
                        revalidatePaths={R}
                        as="span"
                      >
                        {s.freeLabel}
                      </EditableWrapper>
                    )}
                  </span>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!serviceId || !time || submitting}
                  className="group mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-brand-yellow py-3.5 text-sm font-semibold text-brand-black shadow-[0_18px_40px_-12px_rgba(255,215,0,0.7)] transition hover:shadow-[0_24px_50px_-10px_rgba(255,215,0,0.9)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
                >
                  {submitting ? (
                    <EditableWrapper
                      table="siteSetting"
                      id="appt_btn_submitting"
                      field="value"
                      value={s.btnSubmitting}
                      label="Randevu: Gönderiliyor Metni"
                      revalidatePaths={R}
                      as="span"
                    >
                      {s.btnSubmitting}
                    </EditableWrapper>
                  ) : (
                    <EditableWrapper
                      table="siteSetting"
                      id="appt_btn_confirm"
                      field="value"
                      value={s.btnConfirm}
                      label="Randevu: Onayla Butonu"
                      revalidatePaths={R}
                      as="span"
                    >
                      {s.btnConfirm}
                    </EditableWrapper>
                  )}
                </button>
                <EditableWrapper
                  table="siteSetting"
                  id="appt_sms_note"
                  field="value"
                  value={s.smsNote}
                  label="Randevu: SMS Notu"
                  revalidatePaths={R}
                  as="p"
                  className="text-center text-[11px] text-white/40"
                >
                  <p className="text-center text-[11px] text-white/40">
                    {s.smsNote}
                  </p>
                </EditableWrapper>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-xs text-white/60 backdrop-blur-md">
              <EditableWrapper
                table="siteSetting"
                id="appt_emergency_note"
                field="value"
                value={s.emergencyNote}
                label="Randevu: Acil Durum Notu"
                revalidatePaths={R}
                as="span"
              >
                {s.emergencyNote}
              </EditableWrapper>
              {" "}
              <Link href="/iletisim" className="text-brand-yellow underline">
                <EditableWrapper
                  table="siteSetting"
                  id="appt_emergency_link"
                  field="value"
                  value={s.emergencyLink}
                  label="Randevu: Acil Durum Link Metni"
                  revalidatePaths={R}
                  as="span"
                >
                  {s.emergencyLink}
                </EditableWrapper>
              </Link>
              {" "}
              <EditableWrapper
                table="siteSetting"
                id="appt_emergency_suffix"
                field="value"
                value={s.emergencySuffix}
                label="Randevu: Acil Durum Son"
                revalidatePaths={R}
                as="span"
              >
                {s.emergencySuffix}
              </EditableWrapper>
            </div>
          </aside>
        </div>
      </form>
    </>
  );
}

function Section({
  index,
  title,
  settingKey,
  children,
}: {
  index: number;
  title: string;
  settingKey?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-md">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow/15 text-sm font-bold text-brand-yellow ring-1 ring-brand-yellow/30">
          {index}
        </span>
        {settingKey ? (
          <EditableWrapper
            table="siteSetting"
            id={settingKey}
            field="value"
            value={title}
            label={`Randevu Adım ${index} Başlığı`}
            revalidatePaths={["/randevu"]}
            as="h3"
            className="text-sm font-semibold uppercase tracking-wider text-white"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {title}
            </h3>
          </EditableWrapper>
        ) : (
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {title}
          </h3>
        )}
      </header>
      {children}
    </section>
  );
}

function ServiceCard({
  service,
  active,
  onClick,
  freeLabel,
}: {
  service: Service;
  active: boolean;
  onClick: () => void;
  freeLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition ${
        active
          ? "border-brand-yellow bg-brand-yellow/10 shadow-[0_0_0_1px_rgba(255,215,0,0.4),0_0_28px_-6px_rgba(255,215,0,0.4)]"
          : "border-white/10 bg-white/[0.025] hover:border-white/30"
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-sm font-semibold text-white">{service.name}</span>
        <span className="text-xs font-semibold text-brand-yellow">
          {service.price && service.price > 0 ? fmt(service.price) : freeLabel}
        </span>
      </div>
      {service.description && (
        <span className="text-xs leading-relaxed text-white/55">
          {service.description}
        </span>
      )}
      <span className="mt-1 text-[11px] text-white/40">
        ⏱ {service.duration} dk
      </span>
    </button>
  );
}

function Row({
  label,
  value,
  settingKey,
}: {
  label: string;
  value: React.ReactNode;
  settingKey?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      {settingKey ? (
        <EditableWrapper
          table="siteSetting"
          id={settingKey}
          field="value"
          value={label}
          label={`Randevu Özeti: ${label}`}
          revalidatePaths={["/randevu"]}
          as="span"
          className="text-white/55"
        >
          <span className="text-white/55">{label}</span>
        </EditableWrapper>
      ) : (
        <span className="text-white/55">{label}</span>
      )}
      <span className="font-medium text-white/90">{value}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const cls =
    "input-glass w-full rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-white/55">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </label>
  );
}