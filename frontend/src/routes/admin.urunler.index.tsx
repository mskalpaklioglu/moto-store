import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AdminPageHeader,
  ConfirmDialog,
  DataTable,
  FilterSelect,
  SearchInput,
  useListState,
  type Column,
} from "@/components/admin/parts";
import { Badge } from "@/components/common/primitives";
import { StockBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useBrands, useCategories } from "@/hooks/queries";
import { brandNameOf } from "@/lib/catalog-utils";
import { formatPrice } from "@/lib/format";
import { stockLabels } from "@/lib/labels";
import { admin } from "@/services";
import { errorMessage } from "@/services/api/client";
import type { Product } from "@/types";

export const Route = createFileRoute("/admin/urunler/")({
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const list = useListState({ sort: "title", filters: { status: "", category: "", stock: "" } });
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const params = {
    q: list.q,
    page: list.page,
    pageSize: list.pageSize,
    sort: list.sort,
    ...list.filters,
  };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "products", params],
    queryFn: () => admin.listProducts(params),
    placeholderData: (p) => p,
  });

  const exportCsv = async () => {
    try {
      const all = await admin.listProducts({ ...params, page: 1, pageSize: 1000 });
      const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
      const rows = [
        ["SKU", "Ürün", "Fiyat", "Stok", "Durum"],
        ...all.items.map((x) => [
          x.sku,
          x.title,
          x.price,
          x.stockQuantity,
          x.status === "published" ? "Yayında" : "Taslak",
        ]),
      ];
      const csv = rows.map((r) => r.map(esc).join(";")).join("\r\n");
      // Leading BOM so Excel opens Turkish characters correctly.
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "urunler.csv";
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`${all.items.length} ürün dışa aktarıldı`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const del = useMutation({
    mutationFn: (id: string) => admin.deleteProduct(id),
    onSuccess: () => {
      void qc.invalidateQueries();
      toast.success("Ürün silindi (demo)");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const columns: Column<Product>[] = [
    {
      key: "title",
      header: "Ürün",
      sortKey: "title",
      className: "min-w-56",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <img src={p.images[0]?.url} alt="" className="size-10 shrink-0 bg-surface object-cover" />
          <div className="min-w-0">
            <Link
              to="/admin/urunler/$id"
              params={{ id: p.id }}
              className="line-clamp-1 font-semibold hover:text-brand"
            >
              {p.title}
            </Link>
            <p className="text-xs text-muted-foreground">{p.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "cat",
      header: "Kategori",
      cell: (p) => categories?.find((c) => c.id === p.categoryId)?.name ?? "—",
    },
    { key: "brand", header: "Marka", cell: (p) => brandNameOf(brands, p.brandId) || "—" },
    {
      key: "price",
      header: "Fiyat",
      sortKey: "price",
      align: "right",
      cell: (p) => formatPrice(p.price),
    },
    {
      key: "stock",
      header: "Stok",
      sortKey: "stock",
      align: "right",
      cell: (p) => (
        <span className="inline-flex items-center justify-end gap-2">
          {p.stockQuantity} <StockBadge status={p.stockStatus} />
        </span>
      ),
    },
    {
      key: "status",
      header: "Durum",
      cell: (p) => (
        <Badge tone={p.status === "published" ? "success" : "neutral"}>
          {p.status === "published" ? "Yayında" : "Taslak"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      align: "right",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="iconSm" aria-label={`${p.title} düzenle`}>
            <Link to="/admin/urunler/$id" params={{ id: p.id }}>
              <Pencil />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label={`${p.title} sil`}
            onClick={() => setToDelete(p)}
          >
            <Trash2 className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Ürünler"
        description="Katalogdaki ürünleri yönetin."
        actions={
          <>
            <Button variant="outline" onClick={() => void exportCsv()}>
              <Download /> CSV indir
            </Button>
            <Button asChild variant="brand">
              <Link to="/admin/urunler/yeni">
                <Plus /> Yeni ürün
              </Link>
            </Button>
          </>
        }
      />
      <div className="mb-4 grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap">
        <SearchInput
          value={list.q}
          onSearch={list.setQ}
          placeholder="Ürün adı veya SKU ara"
          label="Ürün ara"
        />
        <FilterSelect
          label="Durum"
          value={list.filters.status}
          onChange={(v) => list.setFilter("status", v)}
          options={[
            { value: "published", label: "Yayında" },
            { value: "draft", label: "Taslak" },
          ]}
        />
        <FilterSelect
          label="Kategori"
          value={list.filters.category}
          onChange={(v) => list.setFilter("category", v)}
          options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
        />
        <FilterSelect
          label="Stok"
          value={list.filters.stock}
          onChange={(v) => list.setFilter("stock", v)}
          options={Object.entries(stockLabels).map(([value, s]) => ({ value, label: s.label }))}
        />
        {list.hasFilters && (
          <Button variant="ghost" size="sm" onClick={list.reset}>
            Filtreleri temizle
          </Button>
        )}
      </div>
      <DataTable
        columns={columns}
        rows={data?.items}
        rowKey={(p) => p.id}
        loading={isLoading}
        error={isError}
        onRetry={() => void refetch()}
        sort={list.sort}
        onSort={list.setSort}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        onPage={list.setPage}
        empty={{
          title: "Ürün bulunamadı",
          text: "Arama ve filtre kriterlerinizi değiştirin ya da yeni ürün ekleyin.",
          action: (
            <Button asChild variant="outline">
              <Link to="/admin/urunler/yeni">Yeni ürün ekle</Link>
            </Button>
          ),
        }}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Ürün silinsin mi?"
        description={`“${toDelete?.title ?? ""}” ürünü demo katalogdan kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        onConfirm={() => toDelete && del.mutate(toDelete.id)}
      />
    </div>
  );
}
