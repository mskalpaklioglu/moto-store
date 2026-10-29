import { Link, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Breadcrumbs,
  EmptyState,
  ErrorState,
  Pager,
  type Crumb,
} from "@/components/common/primitives";
import { ProductGrid } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCategories, useProducts } from "@/hooks/queries";
import { formatNumber } from "@/lib/format";
import { sortLabels } from "@/lib/labels";
import { toProductQuery, type ListingSearch } from "@/lib/listing-search";
import { cn } from "@/lib/utils";
import type { Category, ProductFacets, SortKey } from "@/types";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t py-4 first:border-t-0 first:pt-0">
      <legend className="mb-3 text-xs font-extrabold uppercase tracking-wider">{title}</legend>
      {children}
    </fieldset>
  );
}

function CheckRow({
  id,
  label,
  count,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 cursor-pointer accent-[var(--brand)]"
      />
      <span className="flex-1">{label}</span>
      {count != null && <span className="text-xs text-muted-foreground tabular-nums">{count}</span>}
    </label>
  );
}

function toggle(list: string[] | undefined, v: string, on: boolean) {
  const set = new Set(list ?? []);
  if (on) set.add(v);
  else set.delete(v);
  return set.size ? [...set] : undefined;
}

function PriceForm({
  search,
  range,
  apply,
}: {
  search: ListingSearch;
  range: ProductFacets["priceRange"];
  apply: (min?: number, max?: number) => void;
}) {
  const [min, setMin] = useState(search.min?.toString() ?? "");
  const [max, setMax] = useState(search.max?.toString() ?? "");
  useEffect(() => {
    setMin(search.min?.toString() ?? "");
    setMax(search.max?.toString() ?? "");
  }, [search.min, search.max]);
  const bad = min !== "" && max !== "" && Number(min) > Number(max);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (bad) return;
    apply(
      min === "" ? undefined : Math.max(0, Number(min)),
      max === "" ? undefined : Math.max(0, Number(max)),
    );
  };
  const input =
    "h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-foreground";
  return (
    <form onSubmit={submit} noValidate>
      <div className="flex items-center gap-2">
        <label className="flex-1">
          <span className="sr-only">En düşük fiyat (₺)</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder={range.max ? `₺${formatNumber(range.min)}` : "En az"}
            className={input}
          />
        </label>
        <span aria-hidden>–</span>
        <label className="flex-1">
          <span className="sr-only">En yüksek fiyat (₺)</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder={range.max ? `₺${formatNumber(range.max)}` : "En çok"}
            className={input}
          />
        </label>
      </div>
      {bad && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          En düşük fiyat, en yüksek fiyattan büyük olamaz.
        </p>
      )}
      <Button type="submit" variant="outline" size="sm" className="mt-2 w-full" disabled={bad}>
        Fiyatı uygula
      </Button>
    </form>
  );
}

function FilterPanel({
  search,
  facets,
  categories,
  categorySlug,
  onChange,
}: {
  search: ListingSearch;
  facets: ProductFacets | undefined;
  categories: Category[] | undefined;
  categorySlug: string | undefined;
  onChange: (p: Partial<ListingSearch>) => void;
}) {
  const current = categories?.find((c) => c.slug === categorySlug);
  return (
    <div>
      {!current && categories && (
        <Group title="Kategoriler">
          <ul className="space-y-1.5 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to="/kategori/$slug" params={{ slug: c.slug }} className="hover:text-brand">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </Group>
      )}
      {current && (
        <Group title={current.name}>
          <ul className="space-y-1.5 text-sm">
            <li>
              <button
                type="button"
                onClick={() => onChange({ alt: undefined })}
                className={cn(
                  "cursor-pointer hover:text-brand",
                  !search.alt && "font-bold text-brand",
                )}
              >
                Tümü
              </button>
            </li>
            {current.children?.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={search.alt === s.slug}
                  onClick={() => onChange({ alt: s.slug })}
                  className={cn(
                    "cursor-pointer text-left hover:text-brand",
                    search.alt === s.slug && "font-bold text-brand",
                  )}
                >
                  {s.name}
                </button>
              </li>
            ))}
            <li className="pt-1">
              <Link to="/urunler" className="text-xs text-muted-foreground underline">
                Tüm kategoriler
              </Link>
            </li>
          </ul>
        </Group>
      )}
      {facets && (
        <>
          <Group title="Fiyat aralığı">
            <PriceForm
              search={search}
              range={facets.priceRange}
              apply={(min, max) => onChange({ min, max })}
            />
          </Group>
          {facets.brands.length > 0 && (
            <Group title="Marka">
              {facets.brands.map((b) => (
                <CheckRow
                  key={b.value}
                  id={`brand-${b.value}`}
                  label={b.label}
                  count={b.count}
                  checked={!!search.marka?.includes(b.value)}
                  onChange={(on) => onChange({ marka: toggle(search.marka, b.value, on) })}
                />
              ))}
            </Group>
          )}
          <Group title="Stok ve fırsatlar">
            <CheckRow
              id="f-stock"
              label="Yalnızca stokta olanlar"
              checked={!!search.stok}
              onChange={(on) => onChange({ stok: on || undefined })}
            />
            <CheckRow
              id="f-sale"
              label="İndirimli ürünler"
              checked={!!search.indirim}
              onChange={(on) => onChange({ indirim: on || undefined })}
            />
          </Group>
          {facets.attributes.map((a) => (
            <Group key={a.key} title={a.label}>
              {a.values.map((v) => {
                const token = `${a.key}:${v.value}`;
                return (
                  <CheckRow
                    key={token}
                    id={`attr-${token}`}
                    label={v.label}
                    count={v.count}
                    checked={!!search.ozellik?.includes(token)}
                    onChange={(on) => onChange({ ozellik: toggle(search.ozellik, token, on) })}
                  />
                );
              })}
            </Group>
          ))}
        </>
      )}
    </div>
  );
}

interface Chip {
  key: string;
  label: string;
  remove: Partial<ListingSearch>;
}

export function ProductListing({
  title,
  intro,
  crumbs,
  search,
  categorySlug,
  basePath,
}: {
  title: string;
  intro?: string;
  crumbs: Crumb[];
  search: ListingSearch;
  categorySlug?: string;
  basePath?: string;
}) {
  void basePath;
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const query = toProductQuery(search, categorySlug);
  const { data, isLoading, isError, refetch, isFetching } = useProducts(query);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const onChange = (patch: Partial<ListingSearch>) => {
    void navigate({
      to: ".",
      search: ((prev: ListingSearch) => ({
        ...prev,
        ...patch,
        ...("sayfa" in patch ? {} : { sayfa: undefined }),
      })) as never,
      resetScroll: false,
    });
  };

  const facets = data?.facets;
  const sub = categories
    ?.find((c) => c.slug === categorySlug)
    ?.children?.find((s) => s.slug === search.alt);
  const chips: Chip[] = [];
  if (search.q) chips.push({ key: "q", label: `Arama: ${search.q}`, remove: { q: undefined } });
  if (sub) chips.push({ key: "alt", label: sub.name, remove: { alt: undefined } });
  for (const b of search.marka ?? [])
    chips.push({
      key: `b-${b}`,
      label: facets?.brands.find((x) => x.value === b)?.label ?? b,
      remove: { marka: toggle(search.marka, b, false) },
    });
  if (search.min != null || search.max != null) {
    chips.push({
      key: "price",
      label: `Fiyat: ${search.min != null ? `₺${formatNumber(search.min)}` : "…"} – ${search.max != null ? `₺${formatNumber(search.max)}` : "…"}`,
      remove: { min: undefined, max: undefined },
    });
  }
  if (search.stok)
    chips.push({ key: "stok", label: "Stokta olanlar", remove: { stok: undefined } });
  if (search.indirim)
    chips.push({ key: "indirim", label: "İndirimli ürünler", remove: { indirim: undefined } });
  for (const t of search.ozellik ?? []) {
    const [k, ...rest] = t.split(":");
    const label = facets?.attributes.find((a) => a.key === k)?.label ?? k;
    chips.push({
      key: `a-${t}`,
      label: `${label}: ${rest.join(":")}`,
      remove: { ozellik: toggle(search.ozellik, t, false) },
    });
  }
  const clearAll = {
    q: search.q && !categorySlug ? search.q : undefined,
    alt: undefined,
    marka: undefined,
    min: undefined,
    max: undefined,
    stok: undefined,
    indirim: undefined,
    ozellik: undefined,
  };
  const filterChips = chips.filter((c) => c.key !== "q");
  const panel = (
    <FilterPanel
      search={search}
      facets={facets}
      categories={categories}
      categorySlug={categorySlug}
      onChange={onChange}
    />
  );

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={crumbs} />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-b pb-5">
        <div>
          <h1 className="heading-lg">{title}</h1>
          {intro && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{intro}</p>}
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {data ? (
            <>
              <strong className="text-foreground">{formatNumber(data.total)}</strong> ürün
            </>
          ) : (
            "Yükleniyor…"
          )}
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_1fr] xl:grid-cols-[17rem_1fr]">
        <aside
          aria-label="Filtreler"
          className="hidden lg:sticky lg:top-44 lg:block lg:max-h-[calc(100vh-12rem)] lg:self-start lg:overflow-y-auto lg:pr-2"
        >
          {panel}
        </aside>

        <section
          aria-label="Ürün listesi"
          className={cn("min-w-0 transition-opacity", isFetching && !isLoading && "opacity-70")}
        >
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal /> Filtrele
                  {filterChips.length > 0 && ` (${filterChips.length})`}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-[90vw] max-w-sm flex-col p-0">
                <SheetHeader className="border-b p-4 text-left">
                  <SheetTitle>Filtreler</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">{panel}</div>
                <div className="flex gap-2 border-t p-4">
                  <Button variant="outline" className="flex-1" onClick={() => onChange(clearAll)}>
                    Temizle
                  </Button>
                  <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                    {data ? `${formatNumber(data.total)} ürünü göster` : "Sonuçları göster"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="text-muted-foreground max-sm:sr-only">Sırala</span>
              <select
                value={search.sirala ?? "recommended"}
                onChange={(e) =>
                  onChange({
                    sirala:
                      e.target.value === "recommended" ? undefined : (e.target.value as SortKey),
                  })
                }
                className="h-9 cursor-pointer border border-input bg-background px-2 text-sm outline-none focus:border-foreground"
              >
                {Object.entries(sortLabels).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <ul aria-label="Etkin filtreler" className="mb-5 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={() => onChange(c.remove)}
                    aria-label={`${c.label} filtresini kaldır`}
                    className="flex cursor-pointer items-center gap-1.5 border bg-surface px-2.5 py-1 text-xs font-semibold hover:border-foreground"
                  >
                    {c.label} <X className="size-3" />
                  </button>
                </li>
              ))}
              {filterChips.length > 0 && (
                <li>
                  <button
                    type="button"
                    onClick={() => onChange(clearAll)}
                    className="cursor-pointer text-xs font-bold text-brand underline"
                  >
                    Tümünü temizle
                  </button>
                </li>
              )}
            </ul>
          )}

          {isError ? (
            <ErrorState onRetry={() => void refetch()} />
          ) : data && data.items.length === 0 ? (
            <EmptyState
              title="Aradığınız kriterlere uygun ürün bulunamadı"
              text="Filtreleri azaltmayı, farklı bir arama terimi denemeyi ya da popüler kategorilere göz atmayı deneyin."
              action={
                <div className="flex flex-col items-center gap-4">
                  <Button variant="outline" onClick={() => onChange(clearAll)}>
                    Filtreleri temizle
                  </Button>
                  <ul className="flex flex-wrap justify-center gap-2">
                    {categories?.slice(0, 5).map((c) => (
                      <li key={c.id}>
                        <Link
                          to="/kategori/$slug"
                          params={{ slug: c.slug }}
                          className="border px-3 py-1.5 text-xs font-semibold hover:border-foreground"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              }
            />
          ) : (
            <ProductGrid
              products={data?.items}
              loading={isLoading}
              count={PAGE}
              className="lg:grid-cols-3 xl:grid-cols-4"
            />
          )}

          {data && (
            <div className="mt-10">
              <Pager
                page={data.page}
                totalPages={data.totalPages}
                onChange={(p) => {
                  onChange({ sayfa: p === 1 ? undefined : p });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const PAGE = 12;
