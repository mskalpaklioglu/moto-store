import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MobileNav, RouteProgress, ScrollTop } from "@/components/layout/Chrome";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const Route = createFileRoute("/_store")({
  component: StoreLayout,
});

function StoreLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col max-md:pb-14">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        İçeriğe geç
      </a>
      <RouteProgress />
      <Header />
      <CartDrawer />
      <main id="main" className="flex-1">
        <div key={pathname} className="animate-in fade-in duration-300">
          <Outlet />
        </div>
      </main>
      <Footer />
      <ScrollTop />
      <MobileNav />
    </div>
  );
}
