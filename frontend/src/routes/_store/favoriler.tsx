import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Breadcrumbs, EmptyState, ErrorState } from "@/components/common/primitives";
import { ProductGrid } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useProductsByIds } from "@/hooks/queries";
import { useShop } from "@/state/shop";

export const Route = createFileRoute("/_store/favoriler")({
  head: () => ({ meta: [{ title: "Favorilerim" }] }),
  component: Page,
});

function Page() {
  const { favorites, ready } = useShop();
  const { data, isLoading, isError, refetch } = useProductsByIds(favorites);
  const empty = ready && favorites.length === 0;

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Favorilerim" }]} />
      <h1 className="heading-lg mt-3 border-b pb-5">Favorilerim</h1>
      <div className="mt-8">
        {empty ? (
          <EmptyState
            icon={<Heart className="size-8" />}
            title="Henüz favori ürününüz yok"
            text="Beğendiğiniz ürünlerin kalp simgesine tıklayarak buraya ekleyebilirsiniz. Favoriler bu tarayıcıda saklanır."
            action={
              <Button asChild>
                <Link to="/urunler">Ürünleri keşfet</Link>
              </Button>
            }
          />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : (
          <ProductGrid products={data} loading={!ready || isLoading} count={4} />
        )}
      </div>
    </div>
  );
}
