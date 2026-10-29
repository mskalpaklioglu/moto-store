import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/common/primitives";
import { OrderStatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/format";
import { account } from "@/services";

export const Route = createFileRoute("/_store/hesap/siparisler/")({
  component: Page,
});

function Page() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["account", "orders"],
    queryFn: () => account.listOrders(),
  });
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (isLoading) return <div className="h-48 animate-pulse bg-surface" />;
  if (!data?.length)
    return (
      <EmptyState
        icon={<Package className="size-8" />}
        title="Henüz siparişiniz yok"
        action={
          <Button asChild>
            <Link to="/urunler">Alışverişe başla</Link>
          </Button>
        }
      />
    );
  return (
    <div>
      <h2 className="mb-4 text-base font-extrabold">Siparişlerim</h2>
      <ul className="divide-y border">
        {data.map((o) => (
          <li key={o.id}>
            <Link
              to="/hesap/siparisler/$id"
              params={{ id: o.id }}
              className="flex flex-wrap items-center gap-x-6 gap-y-1 p-4 hover:bg-surface"
            >
              <span className="min-w-32 font-bold">{o.number}</span>
              <span className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</span>
              <span className="text-sm text-muted-foreground">
                {o.items.reduce((s, i) => s + i.quantity, 0)} ürün
              </span>
              <span className="ml-auto flex items-center gap-4">
                <OrderStatusBadge status={o.status} />
                <span className="font-extrabold tabular-nums">{formatPrice(o.total)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
