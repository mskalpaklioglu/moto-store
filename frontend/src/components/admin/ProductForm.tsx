import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmDialog } from "@/components/admin/parts";
import {
  Field,
  FormSection,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/common/fields";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBrands, useCategories } from "@/hooks/queries";
import { slugify } from "@/lib/labels";
import { requiredText } from "@/lib/validation";
import { admin } from "@/services";
import { errorMessage } from "@/services/api/client";
import type { Product, ProductVariant, StockStatus } from "@/types";

const num = (v: string) => Number(v.trim().replace(",", "."));
const money = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} zorunludur.`)
    .refine((v) => !Number.isNaN(num(v)) && num(v) >= 0, `${label} geçerli bir tutar olmalıdır.`);
const intField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} zorunludur.`)
    .refine((v) => /^\d+$/.test(v), `${label} tam sayı olmalıdır.`);

const schema = z
  .object({
    title: requiredText("Ürün adı", 3),
    slug: z
      .string()
      .trim()
      .min(1, "Slug zorunludur.")
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir."),
    sku: requiredText("SKU", 3),
    barcode: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || /^\d{8,14}$/.test(v),
        "Barkod 8–14 haneli rakamlardan oluşmalıdır.",
      ),
    categoryId: z.string().min(1, "Kategori seçin."),
    subcategoryId: z.string(),
    brandId: z.string().min(1, "Marka seçin."),
    price: money("Fiyat"),
    compareAtPrice: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || (!Number.isNaN(num(v)) && num(v) >= 0),
        "İndirimsiz fiyat geçerli bir tutar olmalıdır.",
      ),
    stockQuantity: intField("Stok"),
    status: z.enum(["draft", "published"]),
    shortDescription: requiredText("Kısa açıklama", 10).max(
      200,
      "Kısa açıklama en fazla 200 karakter olabilir.",
    ),
    description: requiredText("Açıklama", 20),
    specifications: z.array(
      z.object({
        label: z.string().trim().min(1, "Özellik adı zorunlu."),
        value: z.string().trim().min(1, "Değer zorunlu."),
      }),
    ),
    attributes: z.array(
      z.object({
        label: z.string().trim().min(1, "Ad zorunlu."),
        value: z.string().trim().min(1, "Değer zorunlu."),
        filterable: z.boolean(),
      }),
    ),
    images: z
      .array(
        z.object({
          url: z.string().trim().min(1, "Görsel adresi zorunlu."),
          alt: z.string().trim(),
        }),
      )
      .min(1, "En az bir görsel ekleyin."),
    variants: z.array(
      z.object({
        optionName: z.string().trim().min(1, "Seçenek adı zorunlu."),
        value: z.string().trim().min(1, "Değer zorunlu."),
        sku: z.string().trim().min(1, "Varyant SKU zorunlu."),
        price: z
          .string()
          .trim()
          .refine(
            (v) => v === "" || (!Number.isNaN(num(v)) && num(v) >= 0),
            "Geçerli tutar girin.",
          ),
        stockQuantity: intField("Stok"),
      }),
    ),
  })
  .refine((v) => v.compareAtPrice === "" || num(v.compareAtPrice) > num(v.price), {
    path: ["compareAtPrice"],
    message: "İndirimsiz fiyat, satış fiyatından yüksek olmalıdır.",
  });

type Values = z.infer<typeof schema>;

const stockStatusOf = (qty: number): StockStatus =>
  qty === 0 ? "out_of_stock" : qty <= 5 ? "low_stock" : "in_stock";

function toValues(p?: Product): Values {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    sku: p?.sku ?? "",
    barcode: p?.barcode ?? "",
    categoryId: p?.categoryId ?? "",
    subcategoryId: p?.subcategoryId ?? "",
    brandId: p?.brandId ?? "",
    price: p ? String(p.price) : "",
    compareAtPrice: p?.compareAtPrice ? String(p.compareAtPrice) : "",
    stockQuantity: p ? String(p.stockQuantity) : "0",
    status: p?.status ?? "draft",
    shortDescription: p?.shortDescription ?? "",
    description: p?.description ?? "",
    specifications: p?.specifications.map((s) => ({ label: s.label, value: s.value })) ?? [],
    attributes:
      p?.attributes.map((a) => ({ label: a.label, value: a.value, filterable: !!a.filterable })) ??
      [],
    images: p?.images.map((i) => ({ url: i.url, alt: i.alt })) ?? [],
    variants:
      p?.variants.map((v) => ({
        optionName: v.options[0]?.name ?? "",
        value: v.options[0]?.value ?? "",
        sku: v.sku,
        price: v.price ? String(v.price) : "",
        stockQuantity: String(v.stockQuantity),
      })) ?? [],
  };
}

function toProduct(v: Values, existing?: Product): Product {
  const qty = Number(v.stockQuantity);
  const variants: ProductVariant[] = v.variants.map((x, i) => {
    const q = Number(x.stockQuantity);
    return {
      id: existing?.variants[i]?.id ?? `v${Date.now()}-${i}`,
      sku: x.sku,
      options: [{ name: x.optionName, value: x.value }],
      ...(x.price ? { price: num(x.price) } : {}),
      stockStatus: stockStatusOf(q),
      stockQuantity: q,
    };
  });
  return {
    id: existing?.id ?? `p${Date.now()}`,
    slug: v.slug,
    sku: v.sku,
    ...(v.barcode ? { barcode: v.barcode } : {}),
    title: v.title,
    brandId: v.brandId,
    categoryId: v.categoryId,
    ...(v.subcategoryId ? { subcategoryId: v.subcategoryId } : {}),
    images: v.images.map((i, idx) => {
      const old = existing?.images[idx];
      const keep =
        old && old.url === i.url
          ? { ...(old.focus ? { focus: old.focus } : {}), ...(old.zoom ? { zoom: old.zoom } : {}) }
          : {};
      return { url: i.url, alt: i.alt || v.title, ...keep };
    }),
    price: num(v.price),
    ...(v.compareAtPrice ? { compareAtPrice: num(v.compareAtPrice) } : {}),
    currency: "TRY",
    stockStatus:
      existing?.stockStatus === "preorder" && qty === 0 ? "preorder" : stockStatusOf(qty),
    stockQuantity: qty,
    shortDescription: v.shortDescription,
    description: v.description,
    attributes: v.attributes.map((a) => ({
      key: slugify(a.label),
      label: a.label,
      value: a.value,
      filterable: a.filterable,
    })),
    specifications: v.specifications,
    ...(existing?.compatibility ? { compatibility: existing.compatibility } : {}),
    variants,
    tags: existing?.tags ?? [],
    ...(existing?.isFeatured ? { isFeatured: true } : {}),
    ...(existing?.isNew ? { isNew: true } : {}),
    popularity: existing?.popularity ?? 0,
    ...(existing?.rating ? { rating: existing.rating } : {}),
    status: v.status,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

const tabDefs = [
  {
    id: "general",
    label: "Genel",
    fields: [
      "title",
      "slug",
      "sku",
      "barcode",
      "categoryId",
      "subcategoryId",
      "brandId",
      "status",
      "shortDescription",
      "description",
    ],
  },
  { id: "price", label: "Fiyat ve stok", fields: ["price", "compareAtPrice", "stockQuantity"] },
  { id: "images", label: "Görseller", fields: ["images"] },
  { id: "specs", label: "Özellikler", fields: ["specifications", "attributes"] },
  { id: "variants", label: "Varyantlar", fields: ["variants"] },
] as const;

const RemoveBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <Button type="button" variant="ghost" size="iconSm" aria-label={label} onClick={onClick}>
    <Trash2 className="text-destructive" />
  </Button>
);

export function ProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState<string>("general");
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toValues(product),
  });
  const specs = useFieldArray({ control, name: "specifications" });
  const attrs = useFieldArray({ control, name: "attributes" });
  const images = useFieldArray({ control, name: "images" });
  const variants = useFieldArray({ control, name: "variants" });
  const categoryId = watch("categoryId");
  const subcategories = categories?.find((c) => c.id === categoryId)?.children ?? [];

  const save = useMutation({
    mutationFn: (v: Values) => admin.saveProduct(toProduct(v, product)),
    onSuccess: (p) => {
      void qc.invalidateQueries();
      toast.success(product ? "Ürün güncellendi (demo)" : "Ürün oluşturuldu (demo)", {
        description: p.title,
      });
      void navigate({ to: "/admin/urunler" });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const del = useMutation({
    mutationFn: () => admin.deleteProduct(product!.id),
    onSuccess: () => {
      void qc.invalidateQueries();
      toast.success("Ürün silindi (demo)");
      void navigate({ to: "/admin/urunler" });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const demoImages = [
    ...new Set((categories ?? []).map((c) => c.image).filter(Boolean) as string[]),
  ];
  const errorCount = Object.keys(errors).length;

  return (
    <form
      onSubmit={(e) => {
        if (!watch("slug") && watch("title")) setValue("slug", slugify(watch("title")));
        return handleSubmit(
          (v) => save.mutate(v),
          (errs) => {
            const bad = tabDefs.find((t) => t.fields.some((f) => f in errs));
            if (bad) setTab(bad.id);
            toast.error("Formda hatalar var", {
              description: "Kırmızı işaretli alanları düzeltin.",
            });
          },
        )(e);
      }}
      noValidate
      className="space-y-10"
    >
      <Tabs value={tab} onValueChange={setTab} className="max-w-4xl">
        <TabsList className="mb-8 h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b bg-transparent p-0">
          {tabDefs.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="-mb-px cursor-pointer rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-bold data-[state=active]:border-brand data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {t.label}
              {t.fields.some((f) => f in errors) && (
                <span
                  className="ml-1.5 size-2 rounded-full bg-destructive"
                  aria-label="Bu sekmede hata var"
                />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="general" forceMount className="space-y-10 data-[state=inactive]:hidden">
          <FormSection title="Temel bilgiler">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Ürün adı"
                required
                error={errors.title?.message}
                className="md:col-span-2"
              >
                <input
                  className={inputClass}
                  {...register("title", {
                    onBlur: (e) => {
                      if (!watch("slug"))
                        setValue("slug", slugify(e.target.value), { shouldValidate: true });
                    },
                  })}
                />
              </Field>
              <Field
                label="Slug (URL)"
                required
                error={errors.slug?.message}
                hint="Ürün adresinde kullanılır: /urun/slug"
              >
                <input className={inputClass} {...register("slug")} />
              </Field>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setValue("slug", slugify(watch("title")), { shouldValidate: true })
                  }
                >
                  Ürün adından oluştur
                </Button>
              </div>
              <Field label="SKU" required error={errors.sku?.message}>
                <input className={inputClass} {...register("sku")} />
              </Field>
              <Field label="Barkod" error={errors.barcode?.message}>
                <input inputMode="numeric" className={inputClass} {...register("barcode")} />
              </Field>
              <Field label="Kategori" required error={errors.categoryId?.message}>
                <select
                  className={selectClass}
                  {...register("categoryId", { onChange: () => setValue("subcategoryId", "") })}
                >
                  <option value="">Seçin</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Alt kategori" error={errors.subcategoryId?.message}>
                <select
                  className={selectClass}
                  disabled={!subcategories.length}
                  {...register("subcategoryId")}
                >
                  <option value="">Seçilmedi</option>
                  {subcategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Marka" required error={errors.brandId?.message}>
                <select className={selectClass} {...register("brandId")}>
                  <option value="">Seçin</option>
                  {brands?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Yayın durumu" error={errors.status?.message}>
                <select className={selectClass} {...register("status")}>
                  <option value="draft">Taslak (mağazada görünmez)</option>
                  <option value="published">Yayında</option>
                </select>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Açıklama">
            <Field label="Kısa açıklama" required error={errors.shortDescription?.message}>
              <textarea rows={2} className={textareaClass} {...register("shortDescription")} />
            </Field>
            <Field label="Ayrıntılı açıklama" required error={errors.description?.message}>
              <textarea rows={6} className={textareaClass} {...register("description")} />
            </Field>
          </FormSection>
        </TabsContent>
        <TabsContent value="price" forceMount className="space-y-10 data-[state=inactive]:hidden">
          <FormSection
            title="Fiyat ve stok"
            description="Stok durumu, adet bilgisinden otomatik belirlenir (0 = tükendi, 5 ve altı = az stok)."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Satış fiyatı (₺)" required error={errors.price?.message}>
                <input inputMode="decimal" className={inputClass} {...register("price")} />
              </Field>
              <Field
                label="İndirimsiz fiyat (₺)"
                error={errors.compareAtPrice?.message}
                hint="Doluysa ürün indirimli gösterilir."
              >
                <input inputMode="decimal" className={inputClass} {...register("compareAtPrice")} />
              </Field>
              <Field label="Stok adedi" required error={errors.stockQuantity?.message}>
                <input inputMode="numeric" className={inputClass} {...register("stockQuantity")} />
              </Field>
            </div>
          </FormSection>
        </TabsContent>
        <TabsContent value="images" forceMount className="space-y-10 data-[state=inactive]:hidden">
          <FormSection
            title="Görseller"
            description="Görsel adresi girin, bilgisayarınızdan seçin veya demo görsellerden ekleyin. Dosyalar yüklenmez; yalnızca bu oturumda önizlenir."
          >
            {errors.images?.root?.message && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {errors.images.root.message}
              </p>
            )}
            {errors.images?.message && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {errors.images.message}
              </p>
            )}
            <ul className="space-y-3">
              {images.fields.map((f, i) => (
                <li key={f.id} className="flex items-start gap-3">
                  <img
                    src={watch(`images.${i}.url`)}
                    alt=""
                    className="size-12 shrink-0 bg-surface object-cover"
                    onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                  />
                  <div className="grid flex-1 gap-2 sm:grid-cols-2">
                    <Field label="Görsel adresi" error={errors.images?.[i]?.url?.message}>
                      <input className={inputClass} {...register(`images.${i}.url`)} />
                    </Field>
                    <Field label="Alternatif metin">
                      <input className={inputClass} {...register(`images.${i}.alt`)} />
                    </Field>
                  </div>
                  <RemoveBtn label={`${i + 1}. görseli kaldır`} onClick={() => images.remove(i)} />
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => images.append({ url: "", alt: "" })}
              >
                <Plus /> Adres ekle
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlus /> Dosya seç
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) images.append({ url: URL.createObjectURL(f), alt: f.name });
                  e.target.value = "";
                }}
              />
              <label className="flex items-center gap-2 text-sm">
                <span className="sr-only">Demo görsel ekle</span>
                <select
                  className={selectClass + " w-auto"}
                  value=""
                  onChange={(e) =>
                    e.target.value && images.append({ url: e.target.value, alt: "" })
                  }
                >
                  <option value="">Demo görsel ekle…</option>
                  {demoImages.map((u, i) => (
                    <option key={u} value={u}>
                      Demo görsel {i + 1}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </FormSection>
        </TabsContent>
        <TabsContent value="specs" forceMount className="space-y-10 data-[state=inactive]:hidden">
          <FormSection
            title="Teknik özellikler"
            description="Ürün sayfasındaki “Teknik özellikler” sekmesinde listelenir."
          >
            <ul className="space-y-2">
              {specs.fields.map((f, i) => (
                <li key={f.id} className="flex items-start gap-2">
                  <div className="grid flex-1 gap-2 sm:grid-cols-2">
                    <Field label="Özellik" error={errors.specifications?.[i]?.label?.message}>
                      <input className={inputClass} {...register(`specifications.${i}.label`)} />
                    </Field>
                    <Field label="Değer" error={errors.specifications?.[i]?.value?.message}>
                      <input className={inputClass} {...register(`specifications.${i}.value`)} />
                    </Field>
                  </div>
                  <div className="pt-7">
                    <RemoveBtn label="Özelliği kaldır" onClick={() => specs.remove(i)} />
                  </div>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => specs.append({ label: "", value: "" })}
            >
              <Plus /> Özellik ekle
            </Button>
          </FormSection>
          <FormSection
            title="Filtrelenebilir özellikler"
            description="Mağazadaki ürün filtrelerinde kullanılır (ör. Bağlantı: Bluetooth)."
          >
            <ul className="space-y-2">
              {attrs.fields.map((f, i) => (
                <li key={f.id} className="flex items-start gap-2">
                  <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <Field label="Ad" error={errors.attributes?.[i]?.label?.message}>
                      <input className={inputClass} {...register(`attributes.${i}.label`)} />
                    </Field>
                    <Field label="Değer" error={errors.attributes?.[i]?.value?.message}>
                      <input className={inputClass} {...register(`attributes.${i}.value`)} />
                    </Field>
                    <label className="flex items-center gap-2 pt-7 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 accent-[var(--brand)]"
                        {...register(`attributes.${i}.filterable`)}
                      />{" "}
                      Filtrede göster
                    </label>
                  </div>
                  <div className="pt-7">
                    <RemoveBtn label="Özelliği kaldır" onClick={() => attrs.remove(i)} />
                  </div>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => attrs.append({ label: "", value: "", filterable: true })}
            >
              <Plus /> Özellik ekle
            </Button>
          </FormSection>
        </TabsContent>
        <TabsContent
          value="variants"
          forceMount
          className="space-y-10 data-[state=inactive]:hidden"
        >
          <FormSection
            title="Varyantlar"
            description="Renk, beden gibi seçenekler. Varyant fiyatı boşsa ürün fiyatı geçerlidir."
          >
            <ul className="space-y-3">
              {variants.fields.map((f, i) => (
                <li key={f.id} className="flex items-start gap-2">
                  <div className="grid flex-1 gap-2 sm:grid-cols-5">
                    <Field label="Seçenek" error={errors.variants?.[i]?.optionName?.message}>
                      <input
                        placeholder="Renk"
                        className={inputClass}
                        {...register(`variants.${i}.optionName`)}
                      />
                    </Field>
                    <Field label="Değer" error={errors.variants?.[i]?.value?.message}>
                      <input
                        placeholder="Siyah"
                        className={inputClass}
                        {...register(`variants.${i}.value`)}
                      />
                    </Field>
                    <Field label="SKU" error={errors.variants?.[i]?.sku?.message}>
                      <input className={inputClass} {...register(`variants.${i}.sku`)} />
                    </Field>
                    <Field label="Fiyat (₺)" error={errors.variants?.[i]?.price?.message}>
                      <input
                        inputMode="decimal"
                        className={inputClass}
                        {...register(`variants.${i}.price`)}
                      />
                    </Field>
                    <Field label="Stok" error={errors.variants?.[i]?.stockQuantity?.message}>
                      <input
                        inputMode="numeric"
                        className={inputClass}
                        {...register(`variants.${i}.stockQuantity`)}
                      />
                    </Field>
                  </div>
                  <div className="pt-7">
                    <RemoveBtn label="Varyantı kaldır" onClick={() => variants.remove(i)} />
                  </div>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                variants.append({
                  optionName: variants.fields[0] ? watch("variants.0.optionName") : "",
                  value: "",
                  sku: "",
                  price: "",
                  stockQuantity: "0",
                })
              }
            >
              <Plus /> Varyant ekle
            </Button>
          </FormSection>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 -mx-4 flex items-center sm:flex-wrap gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={save.isPending}
          className="flex-1 sm:flex-none"
        >
          {save.isPending ? "Kaydediliyor…" : product ? "Değişiklikleri kaydet" : "Ürünü oluştur"}
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/admin/urunler">Vazgeç</Link>
        </Button>
        {errorCount > 0 && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {errorCount} alanda hata var.
          </p>
        )}
        {product && (
          <Button
            type="button"
            variant="ghost"
            className="ml-auto text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 /> <span className="max-sm:sr-only">Ürünü sil</span>
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Ürün silinsin mi?"
        description={`“${product?.title ?? ""}” ürünü demo katalogdan kalıcı olarak silinecek.`}
        onConfirm={() => del.mutate()}
      />
    </form>
  );
}
