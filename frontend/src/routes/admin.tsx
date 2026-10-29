import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  Boxes,
  LayoutDashboard,
  Megaphone,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Users,
  Warehouse,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Yönetim Paneli" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Genel bakış", icon: LayoutDashboard, exact: true },
  { to: "/admin/urunler", label: "Ürünler", icon: Package },
  { to: "/admin/kategoriler", label: "Kategoriler", icon: Layers },
  { to: "/admin/markalar", label: "Markalar", icon: Tags },
  { to: "/admin/stok", label: "Stok", icon: Warehouse },
  { to: "/admin/siparisler", label: "Siparişler", icon: ShoppingCart },
  { to: "/admin/musteriler", label: "Müşteriler", icon: Users },
  { to: "/admin/kampanyalar", label: "Kampanyalar", icon: Megaphone },
  { to: "/admin/ayarlar", label: "Site ayarları", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Yönetim menüsü" className="space-y-0.5 p-3">
      {nav.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          {...("exact" in n ? { activeOptions: { exact: true } } : {})}
          onClick={onNavigate}
          activeProps={{
            className: "bg-sidebar-accent text-sidebar-accent-foreground [&_svg]:text-brand",
          }}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <n.icon className="size-4" aria-hidden /> {n.label}
        </Link>
      ))}
      <Link
        to="/"
        onClick={onNavigate}
        className="mt-4 flex items-center gap-3 border-t border-sidebar-border px-3 py-3 text-sm text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
      >
        <Store className="size-4" aria-hidden /> Mağazayı görüntüle
      </Link>
    </nav>
  );
}

function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="hidden bg-sidebar text-sidebar-foreground lg:block">
        <div className="sticky top-0 max-h-screen overflow-y-auto">
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
            <Logo inverted />
          </div>
          <NavList />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4 lg:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menüyü aç">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
              <SheetHeader className="border-b border-sidebar-border p-4 text-left">
                <SheetTitle>
                  <Logo inverted />
                </SheetTitle>
              </SheetHeader>
              <NavList onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Boxes className="size-4 text-muted-foreground max-lg:hidden" aria-hidden />
          <p className="text-sm font-bold">Yönetim paneli</p>
          <span className="ml-auto bg-warning-soft px-2 py-1 text-xs font-bold text-warning">
            DEMO
          </span>
        </header>
        <div
          role="note"
          className="border-b border-warning/30 bg-warning-soft px-4 py-2 text-xs lg:px-8"
        >
          <strong>Demo panel:</strong> yetkilendirme yoktur; değişiklikler yalnızca bu oturumda
          tutulur.
          <span className="max-sm:hidden">
            {" "}
            Sayfa yenilenince sıfırlanır. Gerçek erişim kontrolü backend tarafında uygulanacaktır.
          </span>
        </div>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
