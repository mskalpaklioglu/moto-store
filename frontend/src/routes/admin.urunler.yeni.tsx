import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/parts";
import { ProductForm } from "@/components/admin/ProductForm";
import { Breadcrumbs } from "@/components/common/primitives";

export const Route = createFileRoute("/admin/urunler/yeni")({
  component: () => (
    <div>
      <Breadcrumbs
        className="mb-3"
        items={[{ label: "Ürünler", to: "/admin/urunler" }, { label: "Yeni ürün" }]}
      />
      <AdminPageHeader title="Yeni ürün" description="Demo katalog için yeni bir ürün oluşturun." />
      <ProductForm />
    </div>
  ),
});
