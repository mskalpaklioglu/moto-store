import { createFileRoute } from "@tanstack/react-router";
import { ProductListing } from "@/components/listing/ProductListing";
import { validateListingSearch } from "@/lib/listing-search";

export const Route = createFileRoute("/_store/urunler")({
  validateSearch: validateListingSearch,
  head: () => ({ meta: [{ title: "Tüm Ürünler" }] }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return (
    <ProductListing
      title={search.indirim ? "İndirimli Ürünler" : "Tüm Ürünler"}
      intro="Demo katalog: ürünler ve fiyatlar örnek verilerdir."
      crumbs={[{ label: "Ana sayfa", to: "/" }, { label: "Ürünler" }]}
      search={search}
    />
  );
}
