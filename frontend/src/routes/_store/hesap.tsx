import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Breadcrumbs, DemoNotice } from "@/components/common/primitives";

export const Route = createFileRoute("/_store/hesap")({
  head: () => ({ meta: [{ title: "Hesabım" }] }),
  component: AccountLayout,
});

const nav = [
  { to: "/hesap", label: "Profilim", exact: true },
  { to: "/hesap/siparisler", label: "Siparişlerim", exact: false },
  { to: "/hesap/adresler", label: "Adreslerim", exact: false },
  { to: "/favoriler", label: "Favorilerim", exact: false },
] as const;

function AccountLayout() {
  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Hesabım" }]} />
      <h1 className="heading-lg mt-3 border-b pb-5">Hesabım</h1>
      <DemoNotice className="mt-5">
        Demo hesap önizlemesi: kimlik doğrulama bağlı olmadığından aşağıdaki bilgiler örnek
        verilerdir ve değişiklikler kaydedilmez.
      </DemoNotice>
      <div className="mt-6 grid gap-8 md:grid-cols-[14rem_1fr]">
        <nav aria-label="Hesap menüsü" className="min-w-0">
          <ul className="flex gap-1 overflow-x-auto md:flex-col">
            {nav.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  activeOptions={{ exact: n.exact }}
                  activeProps={{ className: "bg-primary text-primary-foreground" }}
                  className="block whitespace-nowrap px-4 py-2.5 text-sm font-semibold hover:bg-accent"
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/giris"
                className="block whitespace-nowrap px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent"
              >
                Giriş ekranı
              </Link>
            </li>
          </ul>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
