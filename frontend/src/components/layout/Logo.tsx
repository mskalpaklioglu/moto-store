import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Rebrandable wordmark. Edit `siteConfig.logoText` (or swap this component for a real logo). */
export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <Link
      to="/"
      aria-label={`${siteConfig.name} ana sayfa`}
      className={cn("inline-flex items-baseline gap-1 leading-none", className)}
    >
      <span className={cn("text-xl font-black tracking-tight", inverted && "text-on-image")}>
        {siteConfig.logoText.main}
      </span>
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
        {siteConfig.logoText.suffix}
      </span>
    </Link>
  );
}
