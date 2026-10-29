import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SummaryItems, TotalsTable } from "@/components/checkout/OrderSummary";
import { Field, FormSection, inputClass, textareaClass } from "@/components/common/fields";
import { Breadcrumbs, DemoNotice, EmptyState } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { emailField, phoneField, postalCodeField, requiredText } from "@/lib/validation";
import { checkout } from "@/services";
import { errorMessage } from "@/services/api/client";
import { useShop } from "@/state/shop";
import type { CheckoutResult } from "@/types";

export const Route = createFileRoute("/_store/odeme")({
  head: () => ({ meta: [{ title: "Ödeme" }] }),
  component: Page,
});

const schema = z.object({
  email: emailField,
  phone: phoneField,
  firstName: requiredText("Ad"),
  lastName: requiredText("Soyad"),
  city: requiredText("İl"),
  district: requiredText("İlçe"),
  neighborhood: requiredText("Mahalle"),
  addressLine: requiredText("Açık adres", 8),
  postalCode: postalCodeField,
  note: z.string().max(300, "Not en fazla 300 karakter olabilir.").optional(),
  deliveryMethodId: z.string().min(1, "Bir teslimat yöntemi seçin."),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Devam etmek için sözleşmeleri onaylamalısınız." }),
  }),
});
type Values = z.infer<typeof schema>;

const steps = [
  {
    title: "Bilgiler",
    fields: [
      "email",
      "phone",
      "firstName",
      "lastName",
      "city",
      "district",
      "neighborhood",
      "addressLine",
      "postalCode",
    ],
  },
  { title: "Teslimat", fields: ["deliveryMethodId"] },
  { title: "Ödeme", fields: ["acceptTerms"] },
] as const;

function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-8 flex items-center gap-2 text-sm" aria-label="Ödeme adımları">
      {steps.map((s, i) => (
        <li
          key={s.title}
          aria-current={i === step ? "step" : undefined}
          className="flex flex-1 items-center gap-2 last:flex-none"
        >
          <span
            className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i < step ? "bg-success text-white" : i === step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            {i < step ? <Check className="size-4" /> : i + 1}
          </span>
          <span className={i === step ? "font-bold" : "text-muted-foreground max-sm:hidden"}>
            {s.title}
          </span>
          {i < steps.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

function Page() {
  const { items, totals, coupon, ready, clear } = useShop();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<
    { ok: true; result: CheckoutResult } | { ok: false; message: string } | null
  >(null);
  const methods = useQuery({
    queryKey: ["delivery-methods"],
    queryFn: () => checkout.listDeliveryMethods(),
  });

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      city: "",
      district: "",
      neighborhood: "",
      addressLine: "",
      postalCode: "",
      note: "",
      deliveryMethodId: "standard",
      acceptTerms: false as unknown as true,
    },
  });
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = form;
  const method = methods.data?.find((m) => m.id === watch("deliveryMethodId"));

  const next = async () => {
    const ok = await trigger([...steps[step]!.fields]);
    if (ok) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submit = handleSubmit(async (v) => {
    setBusy(true);
    try {
      const result = await checkout.submit({
        contact: { email: v.email, phone: v.phone, firstName: v.firstName, lastName: v.lastName },
        address: {
          firstName: v.firstName,
          lastName: v.lastName,
          phone: v.phone,
          city: v.city,
          district: v.district,
          neighborhood: v.neighborhood,
          addressLine: v.addressLine,
          ...(v.postalCode ? { postalCode: v.postalCode } : {}),
        },
        deliveryMethodId: v.deliveryMethodId,
        items: items.map((i) => ({
          productId: i.productId,
          ...(i.variantId ? { variantId: i.variantId } : {}),
          quantity: i.quantity,
        })),
        ...(v.note ? { note: v.note } : {}),
      });
      setOutcome({ ok: true, result });
    } catch (e) {
      setOutcome({ ok: false, message: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  });

  const crumbs = [
    { label: "Ana sayfa", to: "/" },
    { label: "Sepet", to: "/sepet" },
    { label: "Ödeme" },
  ];

  if (outcome?.ok) {
    return (
      <div className="container-page max-w-2xl py-12 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <Check className="size-7" />
        </div>
        <h1 className="heading-lg mt-5">Demo gönderimi tamamlandı</h1>
        <p className="mt-3 text-sm text-muted-foreground">{outcome.result.message}</p>
        <p className="mt-4 text-sm">
          Demo referansı: <strong>{outcome.result.reference}</strong>
        </p>
        <DemoNotice className="mx-auto mt-6 max-w-lg text-left">
          Bu bir arayüz denemesidir: gerçek bir sipariş oluşturulmadı, ödeme alınmadı ve e-posta
          gönderilmedi.
        </DemoNotice>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="brand" onClick={() => clear()} asChild>
            <Link to="/urunler">Sepeti temizle ve alışverişe dön</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/sepet">Sepete dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (ready && items.length === 0) {
    return (
      <div className="container-page py-12">
        <Breadcrumbs items={crumbs} className="mb-4" />
        <EmptyState
          icon={<ShoppingBag className="size-8" />}
          title="Sepetiniz boş"
          text="Ödeme adımına geçmek için sepetinize ürün ekleyin."
          action={
            <Button asChild>
              <Link to="/urunler">Ürünlere göz at</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={crumbs} />
      <h1 className="heading-lg mt-3 border-b pb-5">Ödeme</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_24rem]">
        <form onSubmit={submit} noValidate>
          <Stepper step={step} />

          {outcome && !outcome.ok && (
            <div
              role="alert"
              className="mb-6 flex gap-3 border border-destructive/30 bg-destructive/5 p-4 text-sm"
            >
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div>
                <p className="font-bold">Demo gönderimi başarısız oldu</p>
                <p className="text-muted-foreground">
                  {outcome.message} Bilgilerinizi kontrol edip yeniden deneyebilirsiniz.
                </p>
              </div>
            </div>
          )}

          <div hidden={step !== 0} className="space-y-8">
            <FormSection title="İletişim bilgileri">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="E-posta" required error={errors.email?.message}>
                  <input
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    {...register("email")}
                  />
                </Field>
                <Field
                  label="Cep telefonu"
                  required
                  error={errors.phone?.message}
                  hint="Örn. 05xx xxx xx xx"
                >
                  <input
                    type="tel"
                    autoComplete="tel"
                    className={inputClass}
                    {...register("phone")}
                  />
                </Field>
              </div>
            </FormSection>
            <FormSection title="Teslimat adresi">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ad" required error={errors.firstName?.message}>
                  <input
                    autoComplete="given-name"
                    className={inputClass}
                    {...register("firstName")}
                  />
                </Field>
                <Field label="Soyad" required error={errors.lastName?.message}>
                  <input
                    autoComplete="family-name"
                    className={inputClass}
                    {...register("lastName")}
                  />
                </Field>
                <Field label="İl" required error={errors.city?.message}>
                  <input
                    autoComplete="address-level1"
                    className={inputClass}
                    {...register("city")}
                  />
                </Field>
                <Field label="İlçe" required error={errors.district?.message}>
                  <input
                    autoComplete="address-level2"
                    className={inputClass}
                    {...register("district")}
                  />
                </Field>
                <Field label="Mahalle" required error={errors.neighborhood?.message}>
                  <input className={inputClass} {...register("neighborhood")} />
                </Field>
                <Field label="Posta kodu" error={errors.postalCode?.message}>
                  <input
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className={inputClass}
                    {...register("postalCode")}
                  />
                </Field>
                <Field
                  label="Açık adres"
                  required
                  error={errors.addressLine?.message}
                  className="sm:col-span-2"
                >
                  <textarea
                    rows={3}
                    autoComplete="street-address"
                    className={textareaClass}
                    {...register("addressLine")}
                  />
                </Field>
                <Field
                  label="Sipariş notu (isteğe bağlı)"
                  error={errors.note?.message}
                  className="sm:col-span-2"
                >
                  <textarea rows={2} className={textareaClass} {...register("note")} />
                </Field>
              </div>
            </FormSection>
          </div>

          <div hidden={step !== 1}>
            <FormSection
              title="Teslimat yöntemi"
              description="Kargo firması, ücret ve süreler entegrasyon sonrasında netleşecektir."
            >
              <fieldset className="space-y-2">
                <legend className="sr-only">Teslimat yöntemi</legend>
                {methods.isLoading && <div className="h-20 animate-pulse bg-surface" />}
                {methods.data?.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-start gap-3 border p-4 has-[:checked]:border-foreground has-[:checked]:bg-surface"
                  >
                    <input
                      type="radio"
                      value={m.id}
                      className="mt-1 accent-[var(--brand)]"
                      {...register("deliveryMethodId")}
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-bold">{m.name}</span>
                      <span className="block text-xs text-muted-foreground">{m.description}</span>
                    </span>
                    <span className="text-sm font-bold tabular-nums">
                      {m.fee == null ? "—" : m.fee === 0 ? "Ücretsiz" : formatPrice(m.fee)}
                    </span>
                  </label>
                ))}
                {errors.deliveryMethodId && (
                  <p role="alert" className="text-xs font-medium text-destructive">
                    {errors.deliveryMethodId.message}
                  </p>
                )}
              </fieldset>
            </FormSection>
          </div>

          <div hidden={step !== 2} className="space-y-6">
            <FormSection title="Ödeme">
              <DemoNotice>
                Ödeme altyapısı henüz bağlı değil. Bu adımda kart bilgisi alınmaz ve ödeme yapılmaz.
                Gerçek ödeme, ileride entegre edilecek ödeme sağlayıcısının güvenli sayfasında
                alınacaktır.
              </DemoNotice>
              <p className="text-sm text-muted-foreground">
                “Demo siparişini gönder” düğmesi yalnızca arayüz akışını gösterir. Test için e-posta
                adresine “hata” kelimesi eklerseniz başarısız durum ekranını görebilirsiniz.
              </p>
            </FormSection>
            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[var(--brand)]"
                  {...register("acceptTerms")}
                />
                <span>
                  <Link
                    to="/bilgi/$slug"
                    params={{ slug: "on-bilgilendirme-formu" }}
                    target="_blank"
                    className="underline"
                  >
                    Ön bilgilendirme formunu
                  </Link>{" "}
                  ve{" "}
                  <Link
                    to="/bilgi/$slug"
                    params={{ slug: "mesafeli-satis-sozlesmesi" }}
                    target="_blank"
                    className="underline"
                  >
                    mesafeli satış sözleşmesini
                  </Link>{" "}
                  okudum, onaylıyorum.
                </span>
              </label>
              {errors.acceptTerms && (
                <p role="alert" className="mt-1 text-xs font-medium text-destructive">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
                Geri
              </Button>
            ) : (
              <Button asChild variant="ghost">
                <Link to="/sepet">Sepete dön</Link>
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button
                key="next"
                type="button"
                variant="brand"
                size="lg"
                onClick={() => void next()}
              >
                Devam et
              </Button>
            ) : (
              <Button key="submit" type="submit" variant="brand" size="lg" disabled={busy}>
                {busy ? "Gönderiliyor…" : "Demo siparişini gönder"}
              </Button>
            )}
          </div>
        </form>

        <aside
          aria-label="Sipariş özeti"
          className="h-fit space-y-4 border bg-surface p-5 lg:sticky lg:top-40"
        >
          <h2 className="text-base font-extrabold">Sipariş özeti</h2>
          <SummaryItems items={items} />
          <TotalsTable
            totals={totals}
            couponCode={coupon?.code}
            shippingOverride={method ? method.fee : undefined}
          />
        </aside>
      </div>
    </div>
  );
}
