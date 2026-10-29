import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AdminPageHeader, ConfirmDialog } from "@/components/admin/parts";
import { Field, inputClass, selectClass } from "@/components/common/fields";
import { EmptyState, ErrorState } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { slugify } from "@/lib/labels";
import { requiredText } from "@/lib/validation";
import { admin } from "@/services";
import { errorMessage } from "@/services/api/client";
import type { Category } from "@/types";

export const Route = createFileRoute("/admin/kategoriler")({
  component: Page,
});

const schema = z.object({
  name: requiredText("Kategori adı"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug zorunludur.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Yalnızca küçük harf, rakam ve tire kullanın."),
  parentId: z.string(),
  sortOrder: z.string().refine((v) => /^\d+$/.test(v), "Sıra tam sayı olmalıdır."),
});
type Values = z.infer<typeof schema>;

function CategoryDialog({
  open,
  onClose,
  editing,
  parents,
  all,
}: {
  open: boolean;
  onClose: () => void;
  editing: Category | null;
  parents: Category[];
  all: Category[];
}) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      name: editing?.name ?? "",
      slug: editing?.slug ?? "",
      parentId: editing?.parentId ?? "",
      sortOrder: String(editing?.sortOrder ?? 99),
    },
  });
  const save = useMutation({
    mutationFn: (c: Category) => admin.saveCategory(c),
    onSuccess: () => {
      void qc.invalidateQueries();
      toast.success(editing ? "Kategori güncellendi (demo)" : "Kategori eklendi (demo)");
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const submit = handleSubmit((v) => {
    const siblings = v.parentId ? (all.find((c) => c.id === v.parentId)?.children ?? []) : all;
    if (siblings.some((c) => c.slug === v.slug && c.id !== editing?.id)) {
      setError("slug", { message: "Bu slug aynı düzeyde zaten kullanılıyor." });
      return;
    }
    save.mutate({
      ...(editing ?? {}),
      id: editing?.id ?? `c${Date.now()}`,
      name: v.name,
      slug: v.slug,
      parentId: v.parentId || null,
      sortOrder: Number(v.sortOrder),
    } as Category);
  });
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Kategoriyi düzenle" : "Yeni kategori"}</DialogTitle>
          <DialogDescription>
            Değişiklikler demo verisine uygulanır, sunucuya kaydedilmez.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="Kategori adı" required error={errors.name?.message}>
            <input
              className={inputClass}
              {...register("name", {
                onBlur: (e) => {
                  if (!watch("slug")) setValue("slug", slugify(e.target.value));
                },
              })}
            />
          </Field>
          <Field label="Slug" required error={errors.slug?.message}>
            <input className={inputClass} {...register("slug")} />
          </Field>
          <Field label="Üst kategori" error={errors.parentId?.message}>
            <select
              className={selectClass}
              disabled={!!editing?.children?.length}
              {...register("parentId")}
            >
              <option value="">Yok (ana kategori)</option>
              {parents
                .filter((p) => p.id !== editing?.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Sıra" error={errors.sortOrder?.message}>
            <input inputMode="numeric" className={inputClass} {...register("sortOrder")} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Vazgeç
            </Button>
            <Button type="submit" variant="brand" disabled={save.isPending}>
              {save.isPending ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Page() {
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => admin.listCategories(),
  });
  const [dialog, setDialog] = useState<{ editing: Category | null } | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const del = useMutation({
    mutationFn: (id: string) => admin.deleteCategory(id),
    onSuccess: () => {
      void qc.invalidateQueries();
      toast.success("Kategori silindi (demo)");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const row = (c: Category, child = false) => (
    <li
      key={c.id}
      className={`flex items-center gap-3 px-4 py-2.5 ${child ? "pl-10 text-sm" : "font-semibold"}`}
    >
      <span className="flex-1">
        {child && <span className="mr-2 text-muted-foreground">↳</span>}
        {c.name} <span className="text-xs font-normal text-muted-foreground">/{c.slug}</span>
      </span>
      <Button
        variant="ghost"
        size="iconSm"
        aria-label={`${c.name} düzenle`}
        onClick={() => setDialog({ editing: c })}
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="iconSm"
        aria-label={`${c.name} sil`}
        onClick={() => setToDelete(c)}
      >
        <Trash2 className="text-destructive" />
      </Button>
    </li>
  );

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Kategoriler"
        description="Ana ve alt kategorileri yönetin."
        actions={
          <Button variant="brand" onClick={() => setDialog({ editing: null })}>
            <Plus /> Yeni kategori
          </Button>
        }
      />
      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="h-64 animate-pulse bg-card" />
      ) : !data?.length ? (
        <EmptyState title="Henüz kategori yok" />
      ) : (
        <ul className="divide-y border bg-card">
          {data.map((c) => (
            <li key={c.id}>
              <ul>
                {row(c)}
                {c.children?.map((s) => row(s, true))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {dialog && (
        <CategoryDialog
          open
          onClose={() => setDialog(null)}
          editing={dialog.editing}
          parents={data ?? []}
          all={data ?? []}
        />
      )}
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Kategori silinsin mi?"
        description={`“${toDelete?.name ?? ""}” kategorisi silinecek. Kategoriye bağlı ürünler varsa silme işlemi reddedilir.`}
        onConfirm={() => toDelete && del.mutate(toDelete.id)}
      />
    </div>
  );
}
