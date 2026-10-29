import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs, ErrorState } from "@/components/common/primitives";
import { useCategories } from "@/hooks/queries";

export const Route = createFileRoute("/_store/kategoriler")({
  head: () => ({ meta: [{ title: "Kategoriler" }] }),
  component: Page,
});

function Page() {
  const { data, isError, refetch } = useCategories();
  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Kategoriler" }]} />
      <h1 className="heading-lg mt-3 border-b pb-5">Tüm kategoriler</h1>
      {isError ? (
        <div className="mt-6">
          <ErrorState onRetry={() => void refetch()} />
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(data ?? Array.from({ length: 8 }, () => null)).map((c, i) =>
            c ? (
              <li key={c.id}>
                <Link to="/kategori/$slug" params={{ slug: c.slug }} className="group block">
                  <div className="aspect-[4/3] overflow-hidden bg-surface">
                    <img
                      src={c.image}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h2 className="mt-3 text-base font-bold group-hover:text-brand">{c.name}</h2>
                </Link>
                <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                  {c.children?.map((s) => (
                    <li key={s.id}>
                      <Link
                        to="/kategori/$slug"
                        params={{ slug: c.slug }}
                        search={{ alt: s.slug }}
                        className="hover:text-foreground hover:underline"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={i} className="aspect-[4/3] animate-pulse bg-surface" />
            ),
          )}
        </ul>
      )}
    </div>
  );
}
