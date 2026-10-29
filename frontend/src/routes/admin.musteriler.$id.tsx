import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { orderColumns } from "@/components/admin/orderColumns";
import { AdminPageHeader, DataTable } from "@/components/admin/parts";
import { Breadcrumbs, EmptyState, ErrorState } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/format";
import { admin } from "@/services";

export const Route = createFileRoute("/admin/musteriler/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const customer = useQuery({
    queryKey: ["admin", "customer", id],
    queryFn: () => admin.getCustomer(id),
  });
  const orders = useQuery({
    queryKey: ["admin", "customer-orders", id],
    queryFn: () => admin.listOrders({ customerId: id, pageSize: 50 }),
  });
  if (customer.isError) return <ErrorState onRetry={() => void customer.refetch()} />;
  if (customer.isLoading) return <div className="h-64 animate-pulse bg-card" />;
  const c = customer.data;
  if (!c)
    return (
      <EmptyState
        title="Müşteri bulunamadı"
        action={
          <Button asChild variant="outline">
            <Link to="/admin/musteriler">Müşterilere dön</Link>
          </Button>
        }
      />
    );
  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <Breadcrumbs
          className="mb-3"
          items={[
            { label: "Müşteriler", to: "/admin/musteriler" },
            { label: `${c.firstName} ${c.lastName}` },
          ]}
        />
        <AdminPageHeader title={`${c.firstName} ${c.lastName}`} description={c.email} />
      </div>
      <dl className="grid gap-px border bg-border sm:grid-cols-4">
        {[
          ["Telefon", c.phone ?? "—"],
          ["Kayıt tarihi", formatDate(c.createdAt)],
          ["Sipariş sayısı", String(c.orderCount)],
          ["Toplam harcama", formatPrice(c.totalSpent)],
        ].map(([k, v]) => (
          <div key={k} className="bg-card p-4">
            <dt className="eyebrow">{k}</dt>
            <dd className="mt-1 font-extrabold">{v}</dd>
          </div>
        ))}
      </dl>
      <section>
        <h2 className="mb-3 text-base font-extrabold">Siparişler</h2>
        <DataTable
          columns={orderColumns.filter((col) => col.key !== "customer")}
          rows={orders.data?.items}
          rowKey={(o) => o.id}
          loading={orders.isLoading}
          error={orders.isError}
          onRetry={() => void orders.refetch()}
          empty={{ title: "Bu müşterinin demo siparişi yok" }}
        />
      </section>
    </div>
  );
}
