import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  OrderItemsTable,
  OrderMeta,
  OrderTimeline,
  OrderTotals,
} from "@/components/common/OrderDetailView";
import { EmptyState, ErrorState } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { account } from "@/services";

export const Route = createFileRoute("/_store/hesap/siparisler/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["account", "order", id],
    queryFn: () => account.getOrder(id),
  });
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (isLoading) return <div className="h-64 animate-pulse bg-surface" />;
  if (!data)
    return (
      <EmptyState
        title="Sipariş bulunamadı"
        action={
          <Button asChild>
            <Link to="/hesap/siparisler">Siparişlerime dön</Link>
          </Button>
        }
      />
    );
  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/hesap/siparisler"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Siparişlerim
        </Link>
        <h2 className="text-xl font-extrabold">Sipariş {data.number}</h2>
        <p className="text-sm text-muted-foreground">
          {formatDateTime(data.createdAt)} tarihinde oluşturuldu (demo kayıt)
        </p>
      </div>
      <OrderMeta order={data} />
      <OrderItemsTable order={data} />
      <OrderTotals order={data} />
      <div>
        <h3 className="mb-3 text-base font-extrabold">Sipariş geçmişi</h3>
        <OrderTimeline order={data} />
      </div>
    </div>
  );
}
