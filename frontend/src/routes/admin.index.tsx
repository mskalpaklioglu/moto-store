import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminPageHeader } from "@/components/admin/parts";
import { ErrorState } from "@/components/common/primitives";
import { OrderStatusBadge } from "@/components/common/StatusBadge";
import { formatDate, formatNumber, formatPrice } from "@/lib/format";
import { admin } from "@/services";

export const Route = createFileRoute("/admin/")({
  component: Page,
});

const shortDay = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border bg-card p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-2xl font-extrabold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Page() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => admin.dashboard(),
  });
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (isLoading || !data) return <div className="h-96 animate-pulse bg-card" />;

  return (
    <div>
      <AdminPageHeader title="Genel bakış" description={data.periodLabel} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Sipariş sayısı" value={formatNumber(data.orderCount)} />
        <Stat label="Ciro" value={formatPrice(data.revenue)} hint="İptal edilenler hariç" />
        <Stat label="Ortalama sepet" value={formatPrice(data.avgOrder)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="border bg-card p-5">
          <h2 className="mb-4 text-base font-extrabold">Günlük ciro</h2>
          <div className="h-64" role="img" aria-label="Günlük ciro grafiği">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.salesByDay.map((d) => ({
                  ...d,
                  label: shortDay.format(new Date(d.day)),
                }))}
              >
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={56}
                  tickFormatter={(v: number) => `₺${formatNumber(v)}`}
                />
                <Tooltip
                  formatter={(v: number) => [formatPrice(v), "Ciro"]}
                  cursor={{ fill: "var(--surface)" }}
                />
                <Bar dataKey="revenue" fill="var(--brand)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="border bg-card p-5">
          <h2 className="mb-3 text-base font-extrabold">Çok satan ürünler</h2>
          <ol className="divide-y text-sm">
            {data.bestsellers.map((b) => (
              <li key={b.product.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link
                  to="/admin/urunler/$id"
                  params={{ id: b.product.id }}
                  className="truncate hover:text-brand"
                >
                  {b.product.title}
                </Link>
                <span className="shrink-0 font-semibold tabular-nums">{b.units} adet</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-extrabold">Son siparişler</h2>
            <Link to="/admin/siparisler" className="text-xs font-bold underline">
              Tümü
            </Link>
          </div>
          <ul className="divide-y text-sm">
            {data.recentOrders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                <Link
                  to="/admin/siparisler/$id"
                  params={{ id: o.id }}
                  className="font-bold hover:text-brand"
                >
                  {o.number}
                </Link>
                <span className="text-muted-foreground">{o.customerName}</span>
                <span className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</span>
                <span className="ml-auto flex items-center gap-3">
                  <OrderStatusBadge status={o.status} />
                  <span className="font-semibold tabular-nums">{formatPrice(o.total)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-extrabold">Düşük stok uyarıları</h2>
            <Link to="/admin/stok" className="text-xs font-bold underline">
              Stok yönetimi
            </Link>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Düşük stoklu ürün yok.</p>
          ) : (
            <ul className="divide-y text-sm">
              {data.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link
                    to="/admin/urunler/$id"
                    params={{ id: p.id }}
                    className="truncate hover:text-brand"
                  >
                    {p.title}
                  </Link>
                  <span
                    className={`shrink-0 font-bold tabular-nums ${p.stockQuantity === 0 ? "text-destructive" : "text-warning"}`}
                  >
                    {p.stockQuantity === 0 ? "Tükendi" : `${p.stockQuantity} adet`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
