import { requireAdmin } from "@/lib/admin";
import { getSettings, st } from "@/lib/site-settings";
import { EditableWrapper } from "@/components/EditableWrapper";

const R = ["/admin/ayarlar/email"];

const FALLBACK_SUBJECT = "Yeni Randevu: {{serviceName}} — {{dateLabel}}";
const FALLBACK_BODY = `<div style="font-family:sans-serif;max-width:520px;color:#1a1a1a">
  <h2 style="margin:0 0 16px">Yeni Randevu Talebi</h2>
  <p><strong>Müşteri:</strong> {{customerName}}</p>
  <p><strong>Servis:</strong> {{serviceName}} ({{duration}} dk)</p>
  <p><strong>Tarih:</strong> {{dateLabel}}</p>
  <p><strong>Motor:</strong> {{motoLabel}}</p>
  <p><strong>Not:</strong> {{note}}</p>
  <p style="margin-top:24px">
    <a href="{{adminUrl}}" style="display:inline-block;background:#FFD700;color:#000;padding:10px 22px;text-decoration:none;border-radius:6px;font-weight:bold">
      Admin Panelinde Gör →
    </a>
  </p>
</div>`;

const PLACEHOLDERS = [
  ["{{customerName}}", "Müşteri adı/eposta"],
  ["{{serviceName}}", "Servis adı"],
  ["{{duration}}", "Servis süresi (dk)"],
  ["{{dateLabel}}", "Randevu tarihi (TR formatında)"],
  ["{{motoLabel}}", "Motosiklet marka + model"],
  ["{{note}}", "Müşteri notu"],
  ["{{adminUrl}}", "Admin panel linki"],
];

export default async function EmailSettingsPage() {
  await requireAdmin();

  const bag = await getSettings(["email_appt_subject", "email_appt_body"]);
  const subject = st(bag, "email_appt_subject", FALLBACK_SUBJECT);
  const body = st(bag, "email_appt_body", FALLBACK_BODY);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">E-Posta Şablonları</h1>
        <p className="mt-1 text-sm text-white/50">
          Otomatik e-postaların konu ve gövde içeriğini buradan düzenleyebilirsiniz.
          Edit Mode aktifken kalem ikonuna tıklayın.
        </p>
      </header>

      {/* Yer tutucular */}
      <section className="glass rounded-2xl border border-white/10 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          Kullanılabilir Yer Tutucular
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {PLACEHOLDERS.map(([code, desc]) => (
            <div
              key={code}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs"
            >
              <code className="font-mono text-brand-yellow/80">{code}</code>
              <span className="text-white/40">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Randevu Şablonu */}
      <section className="glass rounded-2xl border border-white/10 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          Randevu Bildirimi (admin&apos;e gider)
        </h2>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
              Konu
            </p>
            <EditableWrapper
              table="siteSetting"
              id="email_appt_subject"
              field="value"
              value={subject}
              label="Randevu E-posta Konusu"
              fieldType="text"
              revalidatePaths={R}
              as="div"
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80"
            >
              <div className="font-mono text-sm text-white/80">{subject}</div>
            </EditableWrapper>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
              Gövde (HTML / Rich Text)
            </p>
            <EditableWrapper
              table="siteSetting"
              id="email_appt_body"
              field="value"
              value={body}
              label="Randevu E-posta Gövdesi"
              fieldType="richtext"
              revalidatePaths={R}
              as="div"
              className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
            >
              <div
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            </EditableWrapper>
          </div>
        </div>
      </section>
    </div>
  );
}
