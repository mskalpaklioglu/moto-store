import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orderColumns } from "@/components/admin/orderColumns";
import {
  AdminPageHeader,
  DataTable,
  FilterSelect,
  SearchInput,
  useListState,
} from "@/components/admin/parts";
import { Button } from "@/components/ui/button";
import { orderStatusLabels } from "@/lib/labels";
import { admin } from "@/services";

export const Route = createFileRoute("/admin/siparisler/")({
  component: Page,
});

function Page() {
  const list = useListState({ sort: "-date", filters: { status: "" } });
  const params = {
    q: list.q,
    page: list.page,
    pageSize: list.pageSize,
    sort: list.sort,
    status: list.filters.status,
  };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: () => admin.listOrders(params),
    placeholderData: (p) => p,
  });
  return (
    <div>
      <AdminPageHeader title="Siparişler" description="Demo sipariş kayıtları." />
      <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <SearchInput
          value={list.q}
          onSearch={list.setQ}
          placeholder="Sipariş no, müşteri veya e-posta"
          label="Sipariş ara"
        />
        <FilterSelect
          label="Durum"
          value={list.filters.status}
          onChange={(v) => list.setFilter("status", v)}
          options={Object.entries(orderStatusLabels).map(([value, s]) => ({
            value,
            label: s.label,
          }))}
        />
        {list.hasFilters && (
          <Button variant="ghost" size="sm" onClick={list.reset}>
            Filtreleri temizle
          </Button>
        )}
      </div>
      <DataTable
        columns={orderColumns}
        rows={data?.items}
        rowKey={(o) => o.id}
        loading={isLoading}
        error={isError}
        onRetry={() => void refetch()}
        sort={list.sort}
        onSort={list.setSort}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        onPage={list.setPage}
        empty={{ title: "Sipariş bulunamadı", text: "Arama veya filtre kriterlerini değiştirin." }}
      />
    </div>
  );
}
