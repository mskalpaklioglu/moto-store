import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useCategories } from "@/hooks/queries";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
  cta: { label: string; slug?: string };
}

const slides: Slide[] = [
  {
    id: "hero",
    eyebrow: siteConfig.hero.eyebrow,
    title: siteConfig.hero.title,
    text: siteConfig.hero.text,
    image: siteConfig.hero.image,
    imageAlt: siteConfig.hero.imageAlt,
    cta: { label: siteConfig.hero.primary.label },
  },
  ...siteConfig.banners.map((b) => ({
    id: b.id,
    eyebrow: b.eyebrow,
    title: b.title,
    text: b.text,
    image: b.image,
    imageAlt: b.imageAlt,
    cta: { label: b.cta.label, slug: b.cta.category },
  })),
];

/** Full-bleed rotating hero. Autoplay pauses on hover/focus and is off for reduced-motion users. */
export function HeroSlider() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const { data: categories } = useCategories();

  useEffect(() => {
    if (!playing || hover) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [playing, hover]);

  const go = (n: number) => setI((n + slides.length) % slides.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Öne çıkanlar"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="relative isolate min-h-[34rem] overflow-hidden bg-primary md:min-h-[calc(100svh-9.5rem)] md:max-h-[46rem]"
    >
      {slides.map((s, idx) => {
        const active = idx === i;
        return (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} / ${slides.length}`}
            aria-hidden={!active}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              active ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <img
              src={s.image}
              alt={s.imageAlt}
              fetchPriority={idx === 0 ? "high" : "auto"}
              className={cn(
                "absolute inset-0 -z-10 size-full object-cover transition-transform duration-[8000ms] ease-out",
                active ? "scale-110" : "scale-100",
              )}
            />
            <div className="image-scrim absolute inset-0 -z-10" aria-hidden />
            <div className="container-page flex h-full min-h-[inherit] flex-col justify-center pb-36 pt-16">
              {active && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <p className="eyebrow !text-on-image/80">{s.eyebrow}</p>
                  {idx === 0 ? (
                    <h1 className="heading-xl mt-3 max-w-3xl whitespace-pre-line text-on-image">
                      {s.title}
                    </h1>
                  ) : (
                    <h2 className="heading-xl mt-3 max-w-3xl text-on-image">{s.title}</h2>
                  )}
                  <p className="mt-5 max-w-lg text-base text-on-image/85 md:text-lg">{s.text}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild variant="brand" size="lg">
                      {s.cta.slug ? (
                        <Link to="/kategori/$slug" params={{ slug: s.cta.slug }}>
                          {s.cta.label} <ArrowRight />
                        </Link>
                      ) : (
                        <Link to="/urunler">
                          {s.cta.label} <ArrowRight />
                        </Link>
                      )}
                    </Button>
                    <Button asChild variant="onImageOutline" size="lg">
                      <Link to="/kategoriler">Kategorileri İncele</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!!categories?.length && (
        <nav
          aria-label="Hızlı kategori seçimi"
          className="container-page absolute inset-x-0 bottom-5 z-10 hidden items-center gap-2 md:flex"
        >
          <span className="eyebrow !text-on-image/70 mr-1">Hızlı seçim</span>
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.id}
              to="/kategori/$slug"
              params={{ slug: c.slug }}
              className="border border-on-image/40 bg-black/20 px-3 py-1.5 text-xs font-semibold text-on-image backdrop-blur transition-colors hover:border-on-image hover:bg-on-image hover:text-foreground"
            >
              {c.name.split(" ve ")[0]}
            </Link>
          ))}
        </nav>
      )}

      <div className="container-page absolute inset-x-0 bottom-24 z-10 flex items-center gap-3 md:bottom-28">
        <div className="flex items-center gap-2" role="tablist" aria-label="Slayt seçimi">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={idx === i}
              aria-label={`${idx + 1}. slayt`}
              onClick={() => go(idx)}
              className="group flex h-6 w-10 cursor-pointer items-center"
            >
              <span
                className={cn(
                  "h-0.5 w-full transition-colors",
                  idx === i ? "bg-brand" : "bg-on-image/40 group-hover:bg-on-image/70",
                )}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Otomatik geçişi durdur" : "Otomatik geçişi başlat"}
          className="ml-1 flex size-8 cursor-pointer items-center justify-center text-on-image/80 hover:text-on-image"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <div className="ml-auto hidden gap-2 md:flex">
          <Button
            variant="onImageOutline"
            size="icon"
            aria-label="Önceki slayt"
            onClick={() => go(i - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="onImageOutline"
            size="icon"
            aria-label="Sonraki slayt"
            onClick={() => go(i + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
