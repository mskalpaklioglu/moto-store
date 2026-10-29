// Small "app feel" pieces: route progress bar, mobile bottom navigation, scroll-to-top button.
import { Link, useLocation, useRouterState } from "@tanstack/react-router";
import { ArrowUp, Grid2x2, Home, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useShop } from "@/state/shop";
import { cn } from "@/lib/utils";

/** Thin brand-colored bar at the top while a navigation is pending. */
export function RouteProgress() {
  const pending = useRouterState({ select: (s) => s.isLoading || s.status === "pending" });
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!pending) {
      const t = setTimeout(() => setShow(false), 250);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShow(true), 120);
    return () => clearTimeout(t);
  }, [pending]);
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-brand transition-all duration-500",
        show && pending ? "w-4/5 opacity-100" : show ? "w-full opacity-0" : "w-0 opacity-0",
      )}
    />
  );
}

const items = [
  { to: "/", label: "Ana sayfa", icon: Home },
  { to: "/kategoriler", label: "Kategoriler", icon: Grid2x2 },
  { to: "/arama", label: "Ara", icon: Search },
  { to: "/hesap", label: "Hesabım", icon: User },
] as const;

/** App-style bottom bar on phones. Hidden on product pages, which have their own buy bar. */
export function MobileNav() {
  const { pathname } = useLocation();
  const { totals, ready, setCartOpen } = useShop();
  if (pathname.startsWith("/urun/") || pathname.startsWith("/odeme")) return null;
  const cls = "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold";
  return (
    <nav
      aria-label="Hızlı gezinme"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {items.slice(0, 3).map((n) => (
        <Link
          key={n.to}
          to={n.to}
          activeOptions={{ exact: n.to === "/" }}
          activeProps={{ className: "text-brand" }}
          className={cn(cls, "text-muted-foreground")}
        >
          <n.icon className="size-5" aria-hidden />
          {n.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className={cn(cls, "relative cursor-pointer text-muted-foreground")}
      >
        <ShoppingBag className="size-5" aria-hidden />
        Sepet
        {ready && totals.itemCount > 0 && (
          <span className="absolute right-[28%] top-1 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-4 text-brand-foreground">
            {totals.itemCount}
          </span>
        )}
      </button>
      <Link
        to={items[3].to}
        activeProps={{ className: "text-brand" }}
        className={cn(cls, "text-muted-foreground")}
      >
        <User className="size-5" aria-hidden />
        {items[3].label}
      </Link>
    </nav>
  );
}

export function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <button
      type="button"
      aria-label="Sayfa başına dön"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-20 right-4 z-30 flex size-10 cursor-pointer items-center justify-center bg-primary text-primary-foreground shadow-lg transition-all md:bottom-6",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}
