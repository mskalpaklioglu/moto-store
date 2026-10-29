import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  AdminPageHeader,
  ConfirmDialog,
  DataTable,
  SearchInput,
  type Column,
} from "@/components/admin/parts";
import { Field, inputClass, textareaClass } from "@/components/common/fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBrands } from "@/hooks/queries";
import { trLower } from "@/lib/format";
import { slugify } from "@/lib/labels";
import { requiredText } from "@/lib/validation";
import { admin } from "@/services";
import { errorMessage } from "@/services/api/client";
import type { Brand } from "@/types";

export const Route = createFileRoute("/admin/markalar")({
  component: Page,
});

const schema = z.object({
  name: requiredText("Marka adı"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug zorunludur.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Yalnızca küçük harf, rakam ve tire kullanın."),
  description: z.string().max(200, "Açıklama en fazla 200 karakter olabilir."),
});
type Values = z.infer<typeof schema>;

function BrandDialog({
  editing,
  brands,
  onClose,
}: {
  editing: Brand | null;
  brands: Brand[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editing?.name ?? "",
      slug: editing?.slug ?? "",
      description: editing?.description ?? "",
    },
  });
  const save = useMutation({
    mutationFn: (b: Brand) => admin.saveBrand(b),
    onSuccess: () => {
      void qc.invalidateQueries();
      toast.success(editing ? "Marka güncellendi (demo)" : "Marka eklendi (demo)");
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Markayı düzenle" : "Yeni marka"}</DialogTitle>
          <DialogDescription>
            Değişiklikler demo verisine uygulanır, sunucuya kaydedilmez.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="space-y-4"
          onSubmit={handleSubmit((v) => {
            if (brands.some((b) => b.slug === v.slug && b.id !== editing?.id))
              return setError("slug", { message: "Bu slug başka bir markada kullanılıyor." });
            save.mutate({
              ...(editing ?? {}),
              id: editing?.id ?? `b${Date.now()}`,
              name: v.name,
              slug: v.slug,
              description: v.description,
            });
          })}
        >
          <Field label="Marka adı" required error={errors.name?.message}>
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
          <Field label="Açıklama" error={errors.description?.message}>
            <textarea rows={3} className={textareaClass} {...register("description")} />
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
  const { data, isLoading, isError, refetch } = useBrands();
  const [q, setQ] = useState("");
  const [dialog, setDialog] = useState<{ editing: Brand | null } | null>(null);
  const [toDelete, setToDelete] = useState<Brand | null>(null);
  const del = useMutation({
    mutationFn: (id: string) => admin.deleteBrand(id),
    onSuccess: () => {
      void qc.invalidateQueries();
      toast.success("Marka silindi (demo)");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const rows = data?.filter((b) => !q || trLower(`${b.name} ${b.slug}`).includes(trLower(q)));
  const columns: Column<Brand>[] = [
    { key: "name", header: "Marka", cell: (b) => <span className="font-semibold">{b.name}</span> },
    {
      key: "slug",
      header: "Slug",
      cell: (b) => <span className="text-muted-foreground">{b.slug}</span>,
    },
    { key: "desc", header: "Açıklama", cell: (b) => b.description || "—" },
    {
      key: "actions",
      header: "İşlemler",
      align: "right",
      cell: (b) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="iconSm"
            aria-label={`${b.name} düzenle`}
            onClick={() => setDialog({ editing: b })}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label={`${b.name} sil`}
            onClick={() => setToDelete(b)}
          >
            <Trash2 className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        title="Markalar"
        actions={
          <Button variant="brand" onClick={() => setDialog({ editing: null })}>
            <Plus /> Yeni marka
          </Button>
        }
      />
      <div className="mb-4">
        <SearchInput value={q} onSearch={setQ} placeholder="Marka ara" label="Marka ara" />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(b) => b.id}
        loading={isLoading}
        error={isError}
        onRetry={() => void refetch()}
        empty={{ title: "Marka bulunamadı", text: "Aramanızı değiştirin veya yeni marka ekleyin." }}
      />
      {dialog && (
        <BrandDialog editing={dialog.editing} brands={data ?? []} onClose={() => setDialog(null)} />
      )}
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Marka silinsin mi?"
        description={`“${toDelete?.name ?? ""}” markası silinecek. Markaya bağlı ürünler varsa işlem reddedilir.`}
        onConfirm={() => toDelete && del.mutate(toDelete.id)}
      />
    </div>
  );
}
