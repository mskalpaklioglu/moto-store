// Reusable admin building blocks: page header, data table, toolbar, confirm dialog.
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { EmptyState, ErrorState, Pager } from "@/components/common/primitives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { inputClass, selectClass } from "@/components/common/fields";
import { useDebounced } from "@/state/shop";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Sil",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Debounced search input; calls onSearch after the user pauses typing. */
export function SearchInput({
  value,
  onSearch,
  placeholder = "Ara…",
  label = "Ara",
}: {
  value: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounced(local, 300);
  useEffect(() => {
    if (debounced !== value) onSearch(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  return (
    <label className="relative col-span-2 block min-w-0 flex-1 sm:col-span-1 sm:min-w-56 sm:max-w-xs">
      <span className="sr-only">{label}</span>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, "pl-9")}
      />
    </label>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(selectClass, "w-full sm:w-auto sm:min-w-40")}
      >
        <option value="">{label}: Tümü</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  sortKey?: string;
  align?: "right";
  className?: string;
  cell: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  onRetry,
  sort,
  onSort,
  empty,
  page,
  totalPages,
  total,
  onPage,
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (r: T) => string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  sort?: string;
  onSort?: (s: string) => void;
  empty?: { title: string; text?: string; action?: ReactNode };
  page?: number;
  totalPages?: number;
  total?: number;
  onPage?: (p: number) => void;
}) {
  if (error) return <ErrorState onRetry={onRetry} />;
  if (!loading && rows && rows.length === 0)
    return (
      <EmptyState
        title={empty?.title ?? "Kayıt bulunamadı"}
        {...(empty?.text ? { text: empty.text } : {})}
        action={empty?.action}
      />
    );
  const toggleSort = (k: string) => onSort?.(sort === k ? `-${k}` : k);
  return (
    <div>
      <div className="overflow-x-auto border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {columns.map((c) => {
                const active = c.sortKey && (sort === c.sortKey || sort === `-${c.sortKey}`);
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={
                      active ? (sort?.startsWith("-") ? "descending" : "ascending") : undefined
                    }
                    className={cn(
                      "whitespace-nowrap px-3 py-2.5 font-bold",
                      c.align === "right" && "text-right",
                      c.className,
                    )}
                  >
                    {c.sortKey ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.sortKey!)}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1 uppercase tracking-wider hover:text-foreground",
                          active && "text-foreground",
                        )}
                      >
                        {c.header}
                        {active ? (
                          sort?.startsWith("-") ? (
                            <ArrowDown className="size-3" />
                          ) : (
                            <ArrowUp className="size-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3 opacity-50" />
                        )}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading || !rows
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c.key} className="px-3 py-3">
                        <div className="h-4 animate-pulse bg-surface" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((r) => (
                  <tr key={rowKey(r)} className="hover:bg-surface/60">
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={cn(
                          "px-3 py-2.5 align-middle",
                          c.align === "right" && "text-right tabular-nums",
                          c.className,
                        )}
                      >
                        {c.cell(r)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {page != null && totalPages != null && onPage && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span aria-live="polite">{total != null && `${total} kayıt`}</span>
          <Pager page={page} totalPages={totalPages} onChange={onPage} />
        </div>
      )}
    </div>
  );
}

/** Local list state (search, filters, sort, page) for admin tables. */
export function useListState<F extends Record<string, string>>(initial: {
  sort: string;
  filters: F;
  pageSize?: number;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initial.sort);
  const [filters, setFilters] = useState<F>(initial.filters);
  return {
    q,
    page,
    sort,
    filters,
    pageSize: initial.pageSize ?? 10,
    setQ: (v: string) => {
      setQ(v);
      setPage(1);
    },
    setPage,
    setSort: (s: string) => {
      setSort(s);
      setPage(1);
    },
    setFilter: (k: keyof F, v: string) => {
      setFilters((f) => ({ ...f, [k]: v }));
      setPage(1);
    },
    reset: () => {
      setQ("");
      setFilters(initial.filters);
      setPage(1);
    },
    hasFilters: q !== "" || Object.values(filters).some(Boolean),
  };
}
