import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  AdminPageHeader,
  DataTable,
  FilterSelect,
  SearchInput,
  useListState,
  type Column,
} from "@/components/admin/parts";
import { Field, inputClass } from "@/components/common/fields";
import { StockBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/format";
import { stockLabels } from "@/lib/labels";
import { requiredText } from "@/lib/validation";
import { admin } from "@/services";
import { errorMessage } from "@/services/api/client";
import type { Product, StockMovement } from "@/types";

export const Route = createFileRoute("/admin/stok")({
  component: Page,
});

const schema = z.object({
  delta: z
    .string()
    .refine(
      (v) => /^-?\d+$/.test(v.trim()) && Number(v) !== 0,
      "0 dışında bir tam sayı girin (ör. 10 veya -3).",
    ),
  reason: requiredText("Gerekçe", 3),
});

function AdjustDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { delta: "", reason: "" },
  });
  const m = useMutation({
    mutationFn: (v: z.infer<typeof schema>) =>
      admin.adjustStock(product.id, Number(v.delta), v.reason),
    onSuccess: (p) => {
      void qc.invalidateQueries();
      toast.success("Stok güncellendi (demo)", {
        description: `${p.title}: ${p.stockQuantity} adet`,
      });
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stok düzelt</DialogTitle>
          <DialogDescription>
            {product.title} — mevcut stok: {product.stockQuantity} adet
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="space-y-4"
          onSubmit={handleSubmit((v) => {
            if (product.stockQuantity + Number(v.delta) < 0)
              return setError("delta", { message: "Stok sıfırın altına düşemez." });
            m.mutate(v);
          })}
        >
          <Field
            label="Değişim miktarı"
            required
            error={errors.delta?.message}
            hint="Artırmak için pozitif, azaltmak için negatif sayı girin."
          >
            <input inputMode="numeric" className={inputClass} {...register("delta")} />
          </Field>
          <Field label="Gerekçe" required error={errors.reason?.message}>
            <input
              placeholder="Mal kabul, sayım farkı…"
              className={inputClass}
              {...register("reason")}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Vazgeç
            </Button>
            <Button type="submit" variant="brand" disabled={m.isPending}>
              {m.isPending ? "Kaydediliyor…" : "Uygula"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Page() {
  const list = useListState({ sort: "stock", filters: { stock: "" }, pageSize: 10 });
  const [adjust, setAdjust] = useState<Product | null>(null);
  const params = {
    q: list.q,
    page: list.page,
    pageSize: list.pageSize,
    sort: list.sort,
    stock: list.filters.stock,
  };
  const products = useQuery({
    queryKey: ["admin", "stock", params],
    queryFn: () => admin.listProducts(params),
    placeholderData: (p) => p,
  });
  const movements = useQuery({
    queryKey: ["admin", "movements"],
    queryFn: () => admin.listStockMovements(),
  });

  const columns: Column<Product>[] = [
    {
      key: "title",
      header: "Ürün",
      sortKey: "title",
      cell: (p) => (
        <div>
          <p className="font-semibold">{p.title}</p>
          <p className="text-xs text-muted-foreground">{p.sku}</p>
        </div>
      ),
    },
    {
      key: "qty",
      header: "Stok",
      sortKey: "stock",
      align: "right",
      cell: (p) => <strong>{p.stockQuantity}</strong>,
    },
    { key: "status", header: "Durum", cell: (p) => <StockBadge status={p.stockStatus} /> },
    { key: "variants", header: "Varyant", align: "right", cell: (p) => p.variants.length || "—" },
    {
      key: "a",
      header: "İşlem",
      align: "right",
      cell: (p) => (
        <Button variant="outline" size="sm" onClick={() => setAdjust(p)}>
          Stok düzelt
        </Button>
      ),
    },
  ];
  const moveCols: Column<StockMovement>[] = [
    { key: "at", header: "Tarih", cell: (m) => formatDateTime(m.at) },
    { key: "sku", header: "SKU", cell: (m) => m.sku },
    {
      key: "delta",
      header: "Değişim",
      align: "right",
      cell: (m) => (
        <span className={m.delta < 0 ? "text-destructive" : "text-success"}>
          {m.delta > 0 ? `+${m.delta}` : m.delta}
        </span>
      ),
    },
    { key: "reason", header: "Gerekçe", cell: (m) => m.reason },
    { key: "by", header: "Kullanıcı", cell: (m) => m.by },
  ];

  return (
    <div>
      <AdminPageHeader title="Stok yönetimi" description="Stok seviyelerini izleyin ve düzeltin." />
      <Tabs defaultValue="levels">
        <TabsList>
          <TabsTrigger value="levels">Stok seviyeleri</TabsTrigger>
          <TabsTrigger value="movements">Hareket geçmişi</TabsTrigger>
        </TabsList>
        <TabsContent value="levels" className="mt-4">
          <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <SearchInput
              value={list.q}
              onSearch={list.setQ}
              placeholder="Ürün adı veya SKU ara"
              label="Ürün ara"
            />
            <FilterSelect
              label="Durum"
              value={list.filters.stock}
              onChange={(v) => list.setFilter("stock", v)}
              options={Object.entries(stockLabels).map(([value, s]) => ({ value, label: s.label }))}
            />
            {list.hasFilters && (
              <Button variant="ghost" size="sm" onClick={list.reset}>
                Temizle
              </Button>
            )}
          </div>
          <DataTable
            columns={columns}
            rows={products.data?.items}
            rowKey={(p) => p.id}
            loading={products.isLoading}
            error={products.isError}
            onRetry={() => void products.refetch()}
            sort={list.sort}
            onSort={list.setSort}
            page={products.data?.page ?? 1}
            totalPages={products.data?.totalPages ?? 1}
            total={products.data?.total ?? 0}
            onPage={list.setPage}
            empty={{ title: "Ürün bulunamadı" }}
          />
        </TabsContent>
        <TabsContent value="movements" className="mt-4">
          <DataTable
            columns={moveCols}
            rows={movements.data}
            rowKey={(m) => m.id}
            loading={movements.isLoading}
            error={movements.isError}
            onRetry={() => void movements.refetch()}
            empty={{ title: "Henüz stok hareketi yok" }}
          />
        </TabsContent>
      </Tabs>
      {adjust && <AdjustDialog product={adjust} onClose={() => setAdjust(null)} />}
    </div>
  );
}
