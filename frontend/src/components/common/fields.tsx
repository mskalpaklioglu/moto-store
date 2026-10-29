// Accessible form field helpers (label + control + hint + error) shared by storefront and admin.
import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "h-10 w-full border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-70 aria-[invalid=true]:border-destructive";
export const textareaClass = cn(inputClass, "h-auto min-h-24 py-2 leading-relaxed");
export const selectClass = cn(inputClass, "cursor-pointer");

interface FieldProps {
  label: string;
  error?: string | undefined;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}

export function Field({ label, error, hint, required, className, children }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
        {required && (
          <span aria-hidden className="text-destructive">
            {" "}
            *
          </span>
        )}
      </label>
      {isValidElement(children) &&
        cloneElement(children, {
          id,
          "aria-invalid": !!error,
          ...(describedBy ? { "aria-describedby": describedBy } : {}),
        })}
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-extrabold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}
