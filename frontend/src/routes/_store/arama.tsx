import { createFileRoute } from "@tanstack/react-router";
import { ProductListing } from "@/components/listing/ProductListing";
import { validateListingSearch } from "@/lib/listing-search";

export const Route = createFileRoute("/_store/arama")({
  validateSearch: validateListingSearch,
  head: () => ({ meta: [{ title: "Arama Sonuçları" }] }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return (
    <ProductListing
      title={search.q ? `“${search.q}” için arama sonuçları` : "Arama"}
      crumbs={[{ label: "Ana sayfa", to: "/" }, { label: "Arama" }]}
      search={search}
    />
  );
}
