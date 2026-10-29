import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AdminPageHeader,
  DataTable,
  SearchInput,
  useListState,
  type Column,
} from "@/components/admin/parts";
import { formatDate, formatPrice } from "@/lib/format";
import { admin } from "@/services";
import type { Customer } from "@/types";

export const Route = createFileRoute("/admin/musteriler/")({
  component: Page,
});

function Page() {
  const list = useListState({ sort: "name", filters: {} });
  const params = { q: list.q, page: list.page, pageSize: list.pageSize, sort: list.sort };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "customers", params],
    queryFn: () => admin.listCustomers(params),
    placeholderData: (p) => p,
  });
  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Müşteri",
      sortKey: "name",
      cell: (c) => (
        <Link
          to="/admin/musteriler/$id"
          params={{ id: c.id }}
          className="font-semibold hover:text-brand"
        >
          {c.firstName} {c.lastName}
        </Link>
      ),
    },
    { key: "email", header: "E-posta", cell: (c) => c.email },
    { key: "date", header: "Kayıt tarihi", sortKey: "date", cell: (c) => formatDate(c.createdAt) },
    {
      key: "orders",
      header: "Sipariş",
      sortKey: "orders",
      align: "right",
      cell: (c) => c.orderCount,
    },
    {
      key: "spent",
      header: "Toplam harcama",
      sortKey: "spent",
      align: "right",
      cell: (c) => formatPrice(c.totalSpent),
    },
  ];
  return (
    <div>
      <AdminPageHeader title="Müşteriler" description="Demo müşteri kayıtları." />
      <div className="mb-4">
        <SearchInput
          value={list.q}
          onSearch={list.setQ}
          placeholder="Ad veya e-posta ara"
          label="Müşteri ara"
        />
      </div>
      <DataTable
        columns={columns}
        rows={data?.items}
        rowKey={(c) => c.id}
        loading={isLoading}
        error={isError}
        onRetry={() => void refetch()}
        sort={list.sort}
        onSort={list.setSort}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        onPage={list.setPage}
        empty={{ title: "Müşteri bulunamadı" }}
      />
    </div>
  );
}
