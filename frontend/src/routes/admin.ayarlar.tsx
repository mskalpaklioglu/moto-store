import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AdminPageHeader } from "@/components/admin/parts";
import { Field, FormSection, inputClass, textareaClass } from "@/components/common/fields";
import { DemoNotice, ErrorState } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { emailField, requiredText } from "@/lib/validation";
import { admin } from "@/services";
import { errorMessage } from "@/services/api/client";
import type { SiteSettings } from "@/types";

export const Route = createFileRoute("/admin/ayarlar")({
  component: Page,
});

const num = (v: string) => Number(v.trim().replace(",", "."));
const schema = z.object({
  storeName: requiredText("Mağaza adı"),
  tagline: z.string().trim().max(80, "Slogan en fazla 80 karakter olabilir."),
  contactEmail: emailField,
  contactPhone: z.string().trim(),
  address: z.string().trim(),
  freeShippingThreshold: z
    .string()
    .trim()
    .refine((v) => v === "" || (!Number.isNaN(num(v)) && num(v) >= 0), "Geçerli bir tutar girin."),
  flatShippingFee: z
    .string()
    .trim()
    .min(1, "Kargo ücreti zorunludur.")
    .refine((v) => !Number.isNaN(num(v)) && num(v) >= 0, "Geçerli bir tutar girin."),
  announcementEnabled: z.boolean(),
  announcementText: z.string().trim().max(160, "Duyuru en fazla 160 karakter olabilir."),
});
type Values = z.infer<typeof schema>;

const toValues = (s: SiteSettings): Values => ({
  storeName: s.storeName,
  tagline: s.tagline,
  contactEmail: s.contactEmail,
  contactPhone: s.contactPhone,
  address: s.address,
  freeShippingThreshold: s.freeShippingThreshold == null ? "" : String(s.freeShippingThreshold),
  flatShippingFee: String(s.flatShippingFee),
  announcementEnabled: s.announcementEnabled,
  announcementText: s.announcementText,
});

function Page() {
  const qc = useQueryClient();
  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => admin.getSettings(),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema) });
  useEffect(() => {
    if (data) reset(toValues(data));
  }, [data, reset]);

  const save = useMutation({
    mutationFn: (v: Values) =>
      admin.saveSettings({
        storeName: v.storeName,
        tagline: v.tagline,
        contactEmail: v.contactEmail,
        contactPhone: v.contactPhone,
        address: v.address,
        freeShippingThreshold: v.freeShippingThreshold === "" ? null : num(v.freeShippingThreshold),
        flatShippingFee: num(v.flatShippingFee),
        announcementEnabled: v.announcementEnabled,
        announcementText: v.announcementText,
      }),
    onSuccess: (s) => {
      void qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      reset(toValues(s));
      toast.success("Ayarlar kaydedildi (demo)");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (isLoading || !data) return <div className="h-96 animate-pulse bg-card" />;

  return (
    <div className="max-w-3xl">
      <AdminPageHeader title="Site ayarları" />
      <DemoNotice className="mb-6">
        Ayarlar yalnızca bu oturumda saklanır. Vitrin başlığı, logo ve renkler şimdilik{" "}
        <code>src/config/site.ts</code> ve <code>src/styles.css</code> dosyalarından okunur; backend
        bağlandığında bu form o kaynağı güncelleyecektir.
      </DemoNotice>
      <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="space-y-10">
        <FormSection title="Mağaza">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mağaza adı" required error={errors.storeName?.message}>
              <input className={inputClass} {...register("storeName")} />
            </Field>
            <Field label="Slogan" error={errors.tagline?.message}>
              <input className={inputClass} {...register("tagline")} />
            </Field>
          </div>
        </FormSection>
        <FormSection title="İletişim">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="E-posta" required error={errors.contactEmail?.message}>
              <input type="email" className={inputClass} {...register("contactEmail")} />
            </Field>
            <Field label="Telefon" error={errors.contactPhone?.message}>
              <input type="tel" className={inputClass} {...register("contactPhone")} />
            </Field>
            <Field label="Adres" error={errors.address?.message} className="sm:col-span-2">
              <textarea rows={2} className={textareaClass} {...register("address")} />
            </Field>
          </div>
        </FormSection>
        <FormSection title="Kargo">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sabit kargo ücreti (₺)" required error={errors.flatShippingFee?.message}>
              <input inputMode="decimal" className={inputClass} {...register("flatShippingFee")} />
            </Field>
            <Field
              label="Ücretsiz kargo limiti (₺)"
              error={errors.freeShippingThreshold?.message}
              hint="Boş bırakılırsa ücretsiz kargo uygulanmaz."
            >
              <input
                inputMode="decimal"
                className={inputClass}
                {...register("freeShippingThreshold")}
              />
            </Field>
          </div>
        </FormSection>
        <FormSection title="Duyuru çubuğu">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[var(--brand)]"
              {...register("announcementEnabled")}
            />{" "}
            Sayfa üstünde duyuru göster
          </label>
          <Field label="Duyuru metni" error={errors.announcementText?.message}>
            <input className={inputClass} {...register("announcementText")} />
          </Field>
        </FormSection>
        <div className="flex gap-3 border-t pt-5">
          <Button type="submit" variant="brand" size="lg" disabled={save.isPending || !isDirty}>
            {save.isPending ? "Kaydediliyor…" : "Ayarları kaydet"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={!isDirty}
            onClick={() => reset(toValues(data))}
          >
            Değişiklikleri geri al
          </Button>
        </div>
      </form>
    </div>
  );
}
