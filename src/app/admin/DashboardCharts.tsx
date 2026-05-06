"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const fmtCompact = (n: number) =>
  n >= 1000 ? `₺${(n / 1000).toFixed(1)}k` : `₺${n}`;

const tooltipStyle = {
  backgroundColor: "rgba(10,10,10,0.95)",
  border: "1px solid rgba(255,215,0,0.3)",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "12px",
  color: "#fff",
};

// ─── 30 Günlük Ciro Grafiği ──────────────────────────────────────────────────

export function RevenueChart({
  data,
}: {
  data: { date: string; revenue: number; orders: number }[];
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD700" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#FFD700" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.4)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.4)"
            fontSize={10}
            tickFormatter={fmtCompact}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#FFD700", marginBottom: 4 }}
            formatter={(value, name) => {
              const v = Number(value ?? 0);
              return name === "revenue"
                ? [fmt(v), "Ciro"]
                : [String(v), "Sipariş"];
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#FFD700"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#FFD700", stroke: "#0a0a0a", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── En Çok Satan Ürünler (BarChart) ─────────────────────────────────────────

export function TopProductsChart({
  data,
}: {
  data: { name: string; sold: number; revenue: number }[];
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 12, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke="rgba(255,255,255,0.4)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="rgba(255,255,255,0.6)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={140}
            tickFormatter={(v: string) => (v.length > 18 ? v.slice(0, 18) + "…" : v)}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(255,215,0,0.05)" }}
            labelStyle={{ color: "#FFD700", marginBottom: 4 }}
            formatter={(value, name) => {
              const v = Number(value ?? 0);
              return name === "sold"
                ? [`${v} adet`, "Satış"]
                : [fmt(v), "Ciro"];
            }}
          />
          <Bar dataKey="sold" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={i === 0 ? "#FFD700" : `rgba(255,215,0,${0.85 - i * 0.1})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Randevu Yoğunluk Grafiği ────────────────────────────────────────────────

export function AppointmentsHeatmap({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.4)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.4)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={30}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(255,215,0,0.05)" }}
            labelStyle={{ color: "#FFD700", marginBottom: 4 }}
            formatter={(value) => [`${Number(value ?? 0)} randevu`, "Toplam"]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => {
              const intensity = d.count / max;
              return (
                <Cell
                  key={i}
                  fill={
                    intensity > 0.66
                      ? "#FFD700"
                      : intensity > 0.33
                      ? "rgba(255,215,0,0.65)"
                      : "rgba(255,215,0,0.35)"
                  }
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
