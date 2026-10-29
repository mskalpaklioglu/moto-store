import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductListing } from "@/components/listing/ProductListing";
import { EmptyState } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/queries";
import { validateListingSearch } from "@/lib/listing-search";

export const Route = createFileRoute("/_store/kategori/$slug")({
  validateSearch: validateListingSearch,
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const { data: categories, isLoading } = useCategories();
  const category = categories?.find((c) => c.slug === slug);
  if (!isLoading && categories && !category) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Kategori bulunamadı"
          text="Aradığınız kategori mevcut değil veya kaldırılmış olabilir."
          action={
            <Button asChild>
              <Link to="/kategoriler">Tüm kategoriler</Link>
            </Button>
          }
        />
      </div>
    );
  }
  const sub = category?.children?.find((s) => s.slug === search.alt);
  return (
    <ProductListing
      title={sub?.name ?? category?.name ?? "Kategori"}
      crumbs={[
        { label: "Ana sayfa", to: "/" },
        { label: "Kategoriler", to: "/kategoriler" },
        ...(category
          ? [{ label: category.name, ...(sub ? { to: `/kategori/${category.slug}` } : {}) }]
          : []),
        ...(sub ? [{ label: sub.name }] : []),
      ]}
      search={search}
      categorySlug={slug}
    />
  );
}
