import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AdminPageHeader, ConfirmDialog, DataTable, type Column } from "@/components/admin/parts";
import { Field, inputClass, selectClass } from "@/components/common/fields";
import { Badge } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCategories } from "@/hooks/queries";
import { formatDate, formatPrice } from "@/lib/format";
import { requiredText } from "@/lib/validation";
import { admin } from "@/services";
import { errorMessage } from "@/services/api/client";
import type { Campaign } from "@/types";

export const Route = createFileRoute("/admin/kampanyalar")({
  component: Page,
});

const num = (v: string) => Number(v.trim().replace(",", "."));
const optionalMoney = z
  .string()
  .trim()
  .refine((v) => v === "" || (!Number.isNaN(num(v)) && num(v) >= 0), "Geçerli bir tutar girin.");

const schema = z
  .object({
    name: requiredText("Kampanya adı"),
    code: z
      .string()
      .trim()
      .min(3, "Kod en az 3 karakter olmalıdır.")
      .regex(/^[A-Za-z0-9_-]+$/, "Kod yalnızca harf, rakam, tire ve alt çizgi içerebilir."),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z
      .string()
      .trim()
      .min(1, "İndirim değeri zorunludur.")
      .refine((v) => !Number.isNaN(num(v)) && num(v) > 0, "İndirim değeri 0'dan büyük olmalıdır."),
    minCartAmount: optionalMoney,
    startsAt: z.string().min(1, "Başlangıç tarihi zorunludur."),
    endsAt: z.string().min(1, "Bitiş tarihi zorunludur."),
    categoryId: z.string(),
    isActive: z.boolean(),
  })
  .refine((v) => v.discountType !== "percentage" || num(v.discountValue) <= 100, {
    path: ["discountValue"],
    message: "Yüzde indirim 100'ü geçemez.",
  })
  .refine((v) => !v.startsAt || !v.endsAt || v.endsAt >= v.startsAt, {
    path: ["endsAt"],
    message: "Bitiş tarihi başlangıçtan önce olamaz.",
  });
type Values = z.infer<typeof schema>;

const day = (iso: string) => iso.slice(0, 10);

function CampaignDialog({
  editing,
  all,
  onClose,
}: {
  editing: Campaign | null;
  all: Campaign[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editing?.name ?? "",
      code: editing?.code ?? "",
      discountType: editing?.discountType ?? "percentage",
      discountValue: editing ? String(editing.discountValue) : "",
      minCartAmount: editing?.minCartAmount ? String(editing.minCartAmount) : "",
      startsAt: editing ? day(editing.startsAt) : "",
      endsAt: editing ? day(editing.endsAt) : "",
      categoryId: editing?.eligibleCategoryIds[0] ?? "",
      isActive: editing?.isActive ?? true,
    },
  });
  const save = useMutation({
    mutationFn: (c: Campaign) => admin.saveCampaign(c),
    onSuccess: () => {
      void qc.invalidateQueries();
      toast.success(editing ? "Kampanya güncellendi (demo)" : "Kampanya oluşturuldu (demo)");
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Kampanyayı düzenle" : "Yeni kampanya"}</DialogTitle>
          <DialogDescription>
            İndirim kodları demo mağazada sepet sayfasında denenebilir.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit((v) => {
            if (
              all.some((c) => c.code.toLowerCase() === v.code.toLowerCase() && c.id !== editing?.id)
            )
              return setError("code", { message: "Bu kod başka bir kampanyada kullanılıyor." });
            save.mutate({
              id: editing?.id ?? `cp${Date.now()}`,
              name: v.name,
              code: v.code.toUpperCase(),
              discountType: v.discountType,
              discountValue: num(v.discountValue),
              ...(v.minCartAmount ? { minCartAmount: num(v.minCartAmount) } : {}),
              startsAt: `${v.startsAt}T00:00:00Z`,
              endsAt: `${v.endsAt}T23:59:00Z`,
              eligibleCategoryIds: v.categoryId ? [v.categoryId] : [],
              eligibleProductIds: editing?.eligibleProductIds ?? [],
              isActive: v.isActive,
            });
          })}
        >
          <Field
            label="Kampanya adı"
            required
            error={errors.name?.message}
            className="sm:col-span-2"
          >
            <input className={inputClass} {...register("name")} />
          </Field>
          <Field label="İndirim kodu" required error={errors.code?.message}>
            <input className={inputClass + " uppercase"} {...register("code")} />
          </Field>
          <Field label="İndirim türü">
            <select className={selectClass} {...register("discountType")}>
              <option value="percentage">Yüzde (%)</option>
              <option value="fixed">Sabit tutar (₺)</option>
            </select>
          </Field>
          <Field
            label={
              watch("discountType") === "percentage" ? "İndirim oranı (%)" : "İndirim tutarı (₺)"
            }
            required
            error={errors.discountValue?.message}
          >
            <input inputMode="decimal" className={inputClass} {...register("discountValue")} />
          </Field>
          <Field label="Asgari sepet tutarı (₺)" error={errors.minCartAmount?.message}>
            <input inputMode="decimal" className={inputClass} {...register("minCartAmount")} />
          </Field>
          <Field label="Başlangıç" required error={errors.startsAt?.message}>
            <input type="date" className={inputClass} {...register("startsAt")} />
          </Field>
          <Field label="Bitiş" required error={errors.endsAt?.message}>
            <input type="date" className={inputClass} {...register("endsAt")} />
          </Field>
          <Field
            label="Geçerli kategori"
            className="sm:col-span-2"
            hint="Boş bırakılırsa tüm ürünlerde geçerlidir."
          >
            <select className={selectClass} {...register("categoryId")}>
              <option value="">Tüm kategoriler</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              className="size-4 accent-[var(--brand)]"
              {...register("isActive")}
            />{" "}
            Kampanya aktif
          </label>
          <DialogFooter className="sm:col-span-2">
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
    queryKey: ["admin", "campaigns"],
    queryFn: () => admin.listCampaigns(),
  });
  const [dialog, setDialog] = useState<{ editing: Campaign | null } | null>(null);
  const [toDelete, setToDelete] = useState<Campaign | null>(null);
  const del = useMutation({
    mutationFn: (id: string) => admin.deleteCampaign(id),
    onSuccess: () => {
      void qc.invalidateQueries();
      toast.success("Kampanya silindi (demo)");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const toggle = useMutation({
    mutationFn: (c: Campaign) => admin.saveCampaign({ ...c, isActive: !c.isActive }),
    onSuccess: (c) => {
      void qc.invalidateQueries();
      toast.success(c.isActive ? "Kampanya etkinleştirildi" : "Kampanya devre dışı bırakıldı");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const columns: Column<Campaign>[] = [
    {
      key: "name",
      header: "Kampanya",
      cell: (c) => (
        <div>
          <p className="font-semibold">{c.name}</p>
          <p className="text-xs text-muted-foreground">
            Kod: <code>{c.code}</code>
          </p>
        </div>
      ),
    },
    {
      key: "disc",
      header: "İndirim",
      cell: (c) =>
        c.discountType === "percentage" ? `%${c.discountValue}` : formatPrice(c.discountValue),
    },
    {
      key: "min",
      header: "Asgari sepet",
      align: "right",
      cell: (c) => (c.minCartAmount ? formatPrice(c.minCartAmount) : "—"),
    },
    {
      key: "dates",
      header: "Geçerlilik",
      cell: (c) => `${formatDate(c.startsAt)} – ${formatDate(c.endsAt)}`,
    },
    {
      key: "status",
      header: "Durum",
      cell: (c) => (
        <button
          type="button"
          onClick={() => toggle.mutate(c)}
          aria-label={`${c.name} durumunu değiştir`}
          className="cursor-pointer"
        >
          <Badge tone={c.isActive ? "success" : "neutral"}>{c.isActive ? "Aktif" : "Pasif"}</Badge>
        </button>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      align: "right",
      cell: (c) => (
        <div className="flex justify-end gap-1">
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
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="Kampanyalar ve kuponlar"
        actions={
          <Button variant="brand" onClick={() => setDialog({ editing: null })}>
            <Plus /> Yeni kampanya
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data}
        rowKey={(c) => c.id}
        loading={isLoading}
        error={isError}
        onRetry={() => void refetch()}
        empty={{
          title: "Henüz kampanya yok",
          text: "İndirim kodu oluşturmak için “Yeni kampanya”yı kullanın.",
        }}
      />
      {dialog && (
        <CampaignDialog editing={dialog.editing} all={data ?? []} onClose={() => setDialog(null)} />
      )}
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Kampanya silinsin mi?"
        description={`“${toDelete?.name ?? ""}” kampanyası ve ${toDelete?.code ?? ""} kodu silinecek.`}
        onConfirm={() => toDelete && del.mutate(toDelete.id)}
      />
    </div>
  );
}
