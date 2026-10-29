import { Link, useLocation } from "@tanstack/react-router";
import { Headset, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { errorMessage } from "@/services/api/client";
import { newsletter } from "@/services";

const trustIcons = {
  truck: Truck,
  shield: ShieldCheck,
  rotate: RotateCcw,
  headset: Headset,
} as const;

export function TrustBar() {
  return (
    <section aria-label="Mağaza güvenceleri" className="border-y bg-surface">
      <ul className="container-page grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {siteConfig.trust.map((t) => {
          const Icon = trustIcons[t.icon as keyof typeof trustIcons];
          return (
            <li key={t.title} className="flex gap-3">
              <Icon className="mt-0.5 size-6 shrink-0 text-brand" aria-hidden />
              <div>
                <p className="text-sm font-bold">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Geçerli bir e-posta adresi girin.");
      return;
    }
    setError(undefined);
    setBusy(true);
    try {
      await newsletter.subscribe(email);
      toast.success("Demo: e-posta adresiniz kaydedilmedi", {
        description: "Bülten servisi henüz bağlı değil; bu yalnızca arayüz örneğidir.",
      });
      setEmail("");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="w-full max-w-md">
      <label htmlFor="newsletter-email" className="sr-only">
        E-posta adresiniz
      </label>
      <div className="flex">
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "newsletter-error" : undefined}
          placeholder="E-posta adresiniz"
          className="h-11 min-w-0 flex-1 border border-sidebar-border bg-sidebar-accent px-4 text-sm text-sidebar-accent-foreground outline-none placeholder:text-sidebar-foreground/60 focus:border-brand"
        />
        <Button
          type="submit"
          variant="brand"
          size="lg"
          className="h-11 rounded-l-none"
          disabled={busy}
        >
          {busy ? "Gönderiliyor…" : "Abone ol"}
        </Button>
      </div>
      {error && (
        <p id="newsletter-error" role="alert" className="mt-1.5 text-xs text-brand">
          {error}
        </p>
      )}
    </form>
  );
}

const infoHref = (slug: string) => (slug === "iletisim" ? "/iletisim" : `/bilgi/${slug}`);

export function Footer() {
  const { pathname } = useLocation();
  return (
    <footer className="mt-20">
      {pathname !== "/" && <TrustBar />}
      <div className="bg-sidebar text-sidebar-foreground">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="space-y-4">
            <Logo inverted />
            <p className="max-w-sm text-sm text-sidebar-foreground/70">
              Duyurular ve yeni ürünlerden haberdar olmak için bültenimize katılın.
            </p>
            <NewsletterForm />
            <ul className="flex gap-4 pt-2 text-xs">
              {siteConfig.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="text-sidebar-foreground/70 hover:text-brand"
                    aria-label={`${s.label} (bağlantı eklenecek)`}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {siteConfig.footer.columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="eyebrow !text-sidebar-foreground/60">{col.title}</h2>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l.slug}>
                      <Link
                        to={infoHref(l.slug)}
                        className="text-sidebar-foreground/85 hover:text-brand"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                  {col.title === "Yardım" && (
                    <li>
                      <Link to="/sss" className="text-sidebar-foreground/85 hover:text-brand">
                        Sık Sorulan Sorular
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="border-t border-sidebar-border">
          <div className="container-page flex flex-col gap-1 py-5 text-xs text-sidebar-foreground/60 sm:flex-row sm:justify-between">
            <p>
              © {new Date().getFullYear()} {siteConfig.name}. Tüm hakları saklıdır.
            </p>
            <p>
              Demo mağaza: ürünler, fiyatlar ve içerikler örnek verilerdir; gerçek sipariş alınmaz.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
