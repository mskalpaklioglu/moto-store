import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { useCategories } from "@/hooks/queries";
import { formatPrice } from "@/lib/format";
import { catalog } from "@/services";
import { useDebounced, useShop } from "@/state/shop";

function SearchBox({ onDone, autoFocus }: { onDone?: () => void; autoFocus?: boolean }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLFormElement>(null);
  const debounced = useDebounced(term.trim(), 250);
  const { data } = useQuery({
    queryKey: ["suggest", debounced],
    queryFn: () => catalog.suggest(debounced),
    enabled: debounced.length >= 2,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    setOpen(false);
    onDone?.();
    void navigate({ to: "/arama", search: { q } });
  };
  const close = () => {
    setOpen(false);
    onDone?.();
  };
  const hasResults =
    !!data && (data.products.length > 0 || data.categories.length > 0 || data.brands.length > 0);

  return (
    <form
      ref={wrap}
      role="search"
      onSubmit={submit}
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      className="relative w-full"
    >
      <label htmlFor="site-search" className="sr-only">
        Ürün ara
      </label>
      <input
        id="site-search"
        type="search"
        autoFocus={autoFocus}
        autoComplete="off"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        placeholder="Ürün, marka veya kategori ara"
        className="h-11 w-full border border-input bg-background pl-4 pr-12 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
      />
      <button
        type="submit"
        aria-label="Ara"
        className="absolute right-0 top-0 flex h-11 w-11 cursor-pointer items-center justify-center text-foreground hover:text-brand"
      >
        <Search className="size-5" />
      </button>
      {open && term.trim().length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 border border-t-0 bg-popover p-4 shadow-lg">
          <p className="eyebrow mb-2">Popüler aramalar</p>
          <ul className="flex flex-wrap gap-2">
            {["Kask", "İnterkom", "Telefon tutucu", "CarPlay", "Kamera", "Sis farı"].map((q) => (
              <li key={q}>
                <Link
                  to="/arama"
                  search={{ q }}
                  onClick={close}
                  className="inline-block border px-3 py-1.5 text-sm font-semibold hover:border-foreground"
                >
                  {q}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {open && debounced.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 max-h-[70vh] overflow-auto border border-t-0 bg-popover shadow-lg">
          {!data ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Aranıyor…</p>
          ) : !hasResults ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              “{debounced}” için sonuç bulunamadı.
            </p>
          ) : (
            <ul className="py-1 text-sm">
              {data.categories.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/kategori/$slug"
                    params={{ slug: c.slug }}
                    onClick={close}
                    className="flex items-center justify-between px-4 py-2 hover:bg-accent"
                  >
                    <span>{c.name}</span>
                    <span className="eyebrow">Kategori</span>
                  </Link>
                </li>
              ))}
              {data.brands.map((b) => (
                <li key={b.id}>
                  <Link
                    to="/urunler"
                    search={{ marka: [b.slug] }}
                    onClick={close}
                    className="flex items-center justify-between px-4 py-2 hover:bg-accent"
                  >
                    <span>{b.name}</span>
                    <span className="eyebrow">Marka</span>
                  </Link>
                </li>
              ))}
              {data.products.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/urun/$slug"
                    params={{ slug: p.slug }}
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-accent"
                  >
                    <img src={p.images[0]?.url} alt="" className="size-10 object-cover" />
                    <span className="flex-1 truncate">{p.title}</span>
                    <span className="font-semibold tabular-nums">{formatPrice(p.price)}</span>
                  </Link>
                </li>
              ))}
              <li className="border-t">
                <Link
                  to="/arama"
                  search={{ q: debounced }}
                  onClick={close}
                  className="block px-4 py-2.5 text-center text-xs font-bold hover:bg-accent"
                >
                  Tüm sonuçları gör
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </form>
  );
}

function IconLink({
  to,
  label,
  count,
  children,
}: {
  to: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Button asChild variant="ghost" size="icon" className="relative">
      <Link to={to} aria-label={count ? `${label} (${count})` : label}>
        {children}
        {!!count && (
          <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-4 text-brand-foreground">
            {count}
          </span>
        )}
      </Link>
    </Button>
  );
}

export function Header() {
  const { data: categories } = useCategories();
  const { totals, favorites, ready, setCartOpen } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const [searchOpen, setSearchOpen] = useState(false);
  const { announcement } = siteConfig;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background transition-shadow",
        scrolled && "shadow-md",
      )}
    >
      {announcement.enabled && (
        <div className="bg-primary text-primary-foreground">
          <div className="container-page flex min-h-9 items-center justify-center gap-3 py-1.5 text-center text-xs">
            <span>{announcement.text}</span>
            <Link
              to={announcement.link.to}
              className="hidden font-bold underline underline-offset-2 sm:inline"
            >
              {announcement.link.label}
            </Link>
          </div>
        </div>
      )}
      <div className="container-page flex h-16 items-center gap-3 md:gap-6">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menüyü aç">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-0">
            <SheetHeader className="border-b p-4 text-left">
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobil menü" className="p-2">
              <Link
                to="/urunler"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-3 text-sm font-bold"
              >
                Tüm ürünler
              </Link>
              {categories?.map((c) => (
                <details key={c.id} className="group border-t">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3 text-sm font-semibold">
                    {c.name}
                    <span
                      aria-hidden
                      className="text-lg leading-none transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="pb-2 pl-6">
                    <Link
                      to="/kategori/$slug"
                      params={{ slug: c.slug }}
                      onClick={() => setMenuOpen(false)}
                      className="block py-2 text-sm font-semibold text-brand"
                    >
                      Tümünü gör
                    </Link>
                    {c.children?.map((s) => (
                      <Link
                        key={s.id}
                        to="/kategori/$slug"
                        params={{ slug: c.slug }}
                        search={{ alt: s.slug }}
                        onClick={() => setMenuOpen(false)}
                        className="block py-2 text-sm text-muted-foreground"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
              <div className="border-t pt-2">
                {[
                  ["/favoriler", "Favorilerim"],
                  ["/hesap", "Hesabım"],
                  ["/sss", "Sık sorulan sorular"],
                  ["/iletisim", "İletişim"],
                ].map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-3 text-sm"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        <Logo />

        <div className="mx-auto hidden max-w-xl flex-1 md:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center md:ml-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={searchOpen ? "Aramayı kapat" : "Ara"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X /> : <Search />}
          </Button>
          <IconLink to="/hesap" label="Hesabım">
            <User />
          </IconLink>
          <IconLink to="/favoriler" label="Favorilerim" count={ready ? favorites.length : 0}>
            <Heart />
          </IconLink>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={ready && totals.itemCount ? `Sepetim (${totals.itemCount})` : "Sepetim"}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag />
            {ready && totals.itemCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-4 text-brand-foreground">
                {totals.itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="container-page pb-3 md:hidden">
          <SearchBox autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}

      <nav aria-label="Kategoriler" className="relative hidden border-t lg:block">
        <ul className="container-page flex items-center gap-8 text-[0.8125rem] font-semibold">
          <li className="group static">
            <button
              type="button"
              aria-haspopup="true"
              className="flex cursor-pointer items-center gap-2 py-3 hover:text-brand"
            >
              <Menu className="size-4" aria-hidden /> Tüm kategoriler
            </button>
            <div className="invisible absolute inset-x-0 top-full z-50 border-y bg-popover opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div className="container-page grid grid-cols-4 gap-x-8 gap-y-6 py-6">
                {categories?.map((c) => (
                  <div key={c.id}>
                    <Link
                      to="/kategori/$slug"
                      params={{ slug: c.slug }}
                      className="text-sm font-extrabold hover:text-brand"
                    >
                      {c.name}
                    </Link>
                    <ul className="mt-2 space-y-1">
                      {c.children?.map((s) => (
                        <li key={s.id}>
                          <Link
                            to="/kategori/$slug"
                            params={{ slug: c.slug }}
                            search={{ alt: s.slug }}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground"
                          >
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </li>
          <li>
            <Link to="/urunler" className="block whitespace-nowrap py-3 hover:text-brand">
              Tüm ürünler
            </Link>
          </li>
          {categories?.slice(0, 4).map((c) => (
            <li key={c.id} className="group">
              <Link
                to="/kategori/$slug"
                params={{ slug: c.slug }}
                activeProps={{ className: "text-brand" }}
                className="block whitespace-nowrap py-3 hover:text-brand"
              >
                {c.name.split(" ve ")[0]}
              </Link>
              <div className="invisible absolute inset-x-0 top-full z-50 border-y bg-popover opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="container-page grid grid-cols-[1fr_16rem] gap-10 py-6">
                  <div>
                    <p className="eyebrow">{c.name}</p>
                    <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1">
                      {c.children?.map((s) => (
                        <li key={s.id}>
                          <Link
                            to="/kategori/$slug"
                            params={{ slug: c.slug }}
                            search={{ alt: s.slug }}
                            className="block py-1.5 text-sm font-semibold hover:text-brand"
                          >
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/kategori/$slug"
                      params={{ slug: c.slug }}
                      className="mt-4 inline-block text-sm font-bold text-brand underline underline-offset-4"
                    >
                      Tüm {(c.name.split(" ve ")[0] ?? c.name).toLocaleLowerCase("tr-TR")}{" "}
                      ürünlerini gör
                    </Link>
                  </div>
                  {c.image && (
                    <Link
                      to="/kategori/$slug"
                      params={{ slug: c.slug }}
                      tabIndex={-1}
                      aria-hidden
                      className="block aspect-[4/3] overflow-hidden bg-surface"
                    >
                      <img src={c.image} alt="" className="size-full object-cover" />
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
          <li className="ml-auto">
            <Link
              to="/urunler"
              search={{ indirim: true }}
              className="block whitespace-nowrap py-3 text-brand"
            >
              İndirimli ürünler
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
