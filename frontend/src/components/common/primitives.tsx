// Small shared UI primitives used by both storefront and admin.
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ChevronLeft, ChevronRight, Info, Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { discountPercent, formatPrice } from "@/lib/format";
import { toneClasses, type Tone } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface Crumb {
  label: string;
  to?: string;
  search?: Record<string, unknown>;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Sayfa yolu" className={cn("text-xs text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3" aria-hidden />}
            {c.to && i < items.length - 1 ? (
              <Link
                to={c.to}
                search={c.search as never}
                className="hover:text-foreground hover:underline"
              >
                {c.label}
              </Link>
            ) : (
              <span
                aria-current={i === items.length - 1 ? "page" : undefined}
                className={i === items.length - 1 ? "text-foreground" : ""}
              >
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function EmptyState({
  title,
  text,
  action,
  icon,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border border-dashed px-6 py-14 text-center">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <h2 className="text-base font-bold">{title}</h2>
      {text && <p className="max-w-md text-sm text-muted-foreground">{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
    >
      <AlertTriangle className="size-6 text-destructive" aria-hidden />
      <h2 className="text-base font-bold">Bir sorun oluştu</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {message ?? "İçerik yüklenemedi. Lütfen tekrar deneyin."}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tekrar dene
        </Button>
      )}
    </div>
  );
}

export function DemoNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2 border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function Price({
  price,
  compareAt,
  size = "md",
}: {
  price: number;
  compareAt?: number | undefined;
  size?: "sm" | "md" | "lg";
}) {
  const pct = discountPercent(price, compareAt);
  const big = size === "lg" ? "text-3xl" : size === "md" ? "text-base" : "text-sm";
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={cn("font-extrabold tabular-nums", big, pct && "text-brand")}>
        {formatPrice(price)}
      </span>
      {pct && compareAt && (
        <>
          <span className="text-xs text-muted-foreground tabular-nums line-through">
            {formatPrice(compareAt)}
          </span>
          {size === "lg" && <Badge tone="brand">%{pct} indirim</Badge>}
        </>
      )}
    </div>
  );
}

export function QuantityInput({
  value,
  onChange,
  max = 99,
  label = "Adet",
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  label?: string;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-8" : "h-11";
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center border border-input bg-background", h)}
    >
      <button
        type="button"
        aria-label="Azalt"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className={cn(
          "flex aspect-square h-full cursor-pointer items-center justify-center hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        aria-live="polite"
        className="min-w-8 px-1 text-center text-sm font-semibold tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Artır"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="flex aspect-square h-full cursor-pointer items-center justify-center hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

/** Numbered pager with prev/next. `onChange` receives the 1-based page. */
export function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return (
    <nav aria-label="Sayfalama" className="flex flex-wrap items-center justify-center gap-1">
      <Button
        variant="outline"
        size="iconSm"
        aria-label="Önceki sayfa"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft />
      </Button>
      {list.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && p - (list[i - 1] ?? 0) > 1 && (
            <span aria-hidden className="px-1 text-muted-foreground">
              …
            </span>
          )}
          <Button
            variant={p === page ? "default" : "outline"}
            size="iconSm"
            aria-label={`Sayfa ${p}`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </Button>
        </span>
      ))}
      <Button
        variant="outline"
        size="iconSm"
        aria-label="Sonraki sayfa"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}

export function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs font-medium text-destructive">
      {message}
    </p>
  );
}
