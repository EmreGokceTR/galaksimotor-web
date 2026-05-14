"use client";

import { useState, useMemo } from "react";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { TrackingInput } from "./TrackingInput";
import { RefundButton } from "./RefundButton";

const PAYMENT_BADGE: Record<string, string> = {
  PENDING: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  PAID: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  FAILED: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  REFUNDED: "border-violet-400/30 bg-violet-500/10 text-violet-200",
};

const fmt = (n: string | number) =>
  Number(n).toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export type OrderRow = {
  id: string;
  orderNumber: string;
  invoiceNumber: string | null;
  status: string;
  paymentStatus: string;
  total: string;
  discountAmount: string | null;
  couponCode: string | null;
  deliveryType: string;
  trackingNumber: string | null;
  invoicePdfUrl: string | null;
  iyzicoPaymentId: string | null;
  createdAt: string;
  shippingPhone: string | null;
  user: { name: string | null; email: string; phone: string | null };
  items: { id: string }[];
};

const ORDER_STATUSES = ["PENDING", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
};

export function OrdersClient({ orders }: { orders: OrderRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      // Metin araması — müşteri adı, e-posta, sipariş no
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matches =
          (o.user.name ?? "").toLowerCase().includes(q) ||
          o.user.email.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Sipariş durumu filtresi
      if (statusFilter && o.status !== statusFilter) return false;
      // Ödeme durumu filtresi
      if (paymentFilter && o.paymentStatus !== paymentFilter) return false;
      // Tarih aralığı
      if (dateFrom) {
        const d = new Date(o.createdAt);
        if (d < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const d = new Date(o.createdAt);
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter, paymentFilter, dateFrom, dateTo]);

  const hasFilter = search || statusFilter || paymentFilter || dateFrom || dateTo;

  return (
    <div>
      {/* ── Filtreler ── */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        {/* Arama */}
        <div className="flex-1 min-w-[180px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Müşteri adı, e-posta veya sipariş no…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-brand-yellow/40"
          />
        </div>

        {/* Sipariş durumu */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40"
        >
          <option value="">Tüm durumlar</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-brand-black">
              {STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>

        {/* Ödeme durumu */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40"
        >
          <option value="">Tüm ödemeler</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-brand-black">
              {s}
            </option>
          ))}
        </select>

        {/* Tarih başlangıç */}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 [color-scheme:dark]"
        />

        {/* Tarih bitiş */}
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 [color-scheme:dark]"
        />

        {hasFilter && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setPaymentFilter("");
              setDateFrom("");
              setDateTo("");
            }}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/50 hover:text-white"
          >
            Temizle
          </button>
        )}
      </div>

      {/* ── Sonuç sayısı ── */}
      <p className="mb-3 text-xs text-white/40">
        {filtered.length} / {orders.length} sipariş gösteriliyor
      </p>

      {/* ── Tablo ── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          Filtrelerle eşleşen sipariş bulunamadı.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-left text-[11px] uppercase tracking-wider text-white/45">
                <tr>
                  <th className="px-4 py-3">Sipariş</th>
                  <th className="px-4 py-3">Müşteri</th>
                  <th className="px-4 py-3">Tutar</th>
                  <th className="px-4 py-3">Ödeme</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Kargo No</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">İade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-brand-yellow">
                        #{o.orderNumber}
                      </div>
                      {o.invoiceNumber && (
                        <div className="text-[11px] text-white/60 font-mono">
                          Fatura: {o.invoiceNumber}
                        </div>
                      )}
                      <div className="text-[11px] text-white/45">
                        {o.items.length} kalem ·{" "}
                        {o.deliveryType === "CARGO" ? "Kargo" : "Mağaza"}
                      </div>
                      {o.invoicePdfUrl && (
                        <a
                          href={o.invoicePdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200"
                        >
                          📄 Fatura
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-white">{o.user.name ?? o.user.email}</div>
                      <div className="text-[11px] text-white/45">
                        {o.shippingPhone ?? o.user.phone ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top font-semibold text-white">
                      {fmt(o.total)}
                      {o.discountAmount && (
                        <div className="text-[11px] text-emerald-300">
                          {o.couponCode} · -{fmt(o.discountAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                          PAYMENT_BADGE[o.paymentStatus] ?? ""
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-white/60">
                      {new Date(o.createdAt).toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {o.deliveryType === "CARGO" ? (
                        <TrackingInput orderId={o.id} initial={o.trackingNumber} />
                      ) : (
                        <span className="text-[11px] text-white/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <OrderStatusSelect
                        orderId={o.id}
                        status={o.status as Parameters<typeof OrderStatusSelect>[0]["status"]}
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      {o.paymentStatus === "PAID" && o.iyzicoPaymentId ? (
                        <RefundButton orderId={o.id} />
                      ) : (
                        <span className="text-[11px] text-white/20">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
