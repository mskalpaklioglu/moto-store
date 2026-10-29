import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/parts";
import { Field, inputClass, selectClass } from "@/components/common/fields";
import {
  OrderItemsTable,
  OrderMeta,
  OrderTimeline,
  OrderTotals,
} from "@/components/common/OrderDetailView";
import { Breadcrumbs, EmptyState, ErrorState } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { orderStatusLabels } from "@/lib/labels";
import { admin } from "@/services";
import { errorMessage } from "@/services/api/client";
import type { OrderStatus } from "@/types";

export const Route = createFileRoute("/admin/siparisler/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => admin.getOrder(id),
  });
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [tracking, setTracking] = useState("");
  const [note, setNote] = useState("");
  const [trackingError, setTrackingError] = useState<string>();
  useEffect(() => {
    if (data) {
      setStatus(data.status);
      setTracking(data.trackingNumber ?? "");
    }
  }, [data]);

  const update = useMutation({
    mutationFn: () =>
      admin.updateOrder(id, {
        status,
        trackingNumber: tracking.trim(),
        ...(note.trim() ? { note: note.trim() } : {}),
      }),
    onSuccess: () => {
      void qc.invalidateQueries();
      setNote("");
      toast.success("Sipariş güncellendi (demo)");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const crumbs = [
    { label: "Siparişler", to: "/admin/siparisler" },
    { label: data?.number ?? "Sipariş" },
  ];
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (isLoading) return <div className="h-96 animate-pulse bg-card" />;
  if (!data)
    return (
      <EmptyState
        title="Sipariş bulunamadı"
        action={
          <Button asChild variant="outline">
            <Link to="/admin/siparisler">Siparişlere dön</Link>
          </Button>
        }
      />
    );

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <Breadcrumbs className="mb-3" items={crumbs} />
        <AdminPageHeader
          title={`Sipariş ${data.number}`}
          description={`${formatDateTime(data.createdAt)} · ${data.customerName} · ${data.customerEmail}`}
        />
      </div>
      <section className="space-y-6 border bg-card p-5">
        <OrderMeta order={data} />
      </section>
      <OrderItemsTable order={data} />
      <OrderTotals order={data} />
      <div className="grid gap-6 md:grid-cols-2">
        <form
          noValidate
          className="space-y-4 border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (status === "shipped" && !tracking.trim())
              return setTrackingError("Kargoya verilen sipariş için takip numarası girin.");
            setTrackingError(undefined);
            update.mutate();
          }}
        >
          <h2 className="text-base font-extrabold">Durumu güncelle</h2>
          <Field label="Sipariş durumu">
            <select
              className={selectClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
            >
              {Object.entries(orderStatusLabels).map(([v, s]) => (
                <option key={v} value={v}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Kargo takip numarası" error={trackingError}>
            <input
              className={inputClass}
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
          </Field>
          <Field label="Not (isteğe bağlı)">
            <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <Button type="submit" variant="brand" disabled={update.isPending}>
            {update.isPending ? "Kaydediliyor…" : "Güncelle"}
          </Button>
        </form>
        <section className="border bg-card p-5">
          <h2 className="mb-4 text-base font-extrabold">Sipariş geçmişi</h2>
          <OrderTimeline order={data} />
        </section>
      </div>
    </div>
  );
}
