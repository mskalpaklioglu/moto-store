import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/parts";
import { ProductForm } from "@/components/admin/ProductForm";
import { Breadcrumbs, EmptyState, ErrorState } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { useBrands, useCategories } from "@/hooks/queries";
import { admin } from "@/services";

export const Route = createFileRoute("/admin/urunler/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => admin.getProduct(id),
  });
  // Selects need their options before the form mounts, or saved category/brand show as empty.
  const categories = useCategories();
  const brands = useBrands();
  const lookups = !!categories.data && !!brands.data;
  return (
    <div>
      <Breadcrumbs
        className="mb-3"
        items={[
          { label: "Ürünler", to: "/admin/urunler" },
          { label: data?.title ?? "Ürün düzenle" },
        ]}
      />
      <AdminPageHeader title="Ürünü düzenle" description={data?.sku} />
      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading || !lookups ? (
        <div className="h-96 animate-pulse bg-card" />
      ) : !data ? (
        <EmptyState
          title="Ürün bulunamadı"
          action={
            <Button asChild variant="outline">
              <Link to="/admin/urunler">Ürünlere dön</Link>
            </Button>
          }
        />
      ) : (
        <ProductForm key={data.id} product={data} />
      )}
    </div>
  );
}
