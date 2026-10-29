import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Field, inputClass } from "@/components/common/fields";
import { ErrorState } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/format";
import { emailField, phoneField, requiredText } from "@/lib/validation";
import { account } from "@/services";

export const Route = createFileRoute("/_store/hesap/")({
  component: Page,
});

const schema = z.object({
  firstName: requiredText("Ad"),
  lastName: requiredText("Soyad"),
  email: emailField,
  phone: phoneField.or(z.literal("")),
});
type Values = z.infer<typeof schema>;

function Page() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["account", "profile"],
    queryFn: () => account.getDemoProfile(),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });
  useEffect(() => {
    if (data)
      reset({ firstName: data.firstName, lastName: data.lastName, email: data.email, phone: "" });
  }, [data, reset]);

  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (isLoading || !data) return <div className="h-64 animate-pulse bg-surface" />;

  return (
    <div className="space-y-8">
      <dl className="grid gap-px border bg-border sm:grid-cols-3">
        {[
          ["Üyelik tarihi", formatDate(data.createdAt)],
          ["Sipariş sayısı", String(data.orderCount)],
          ["Toplam harcama", formatPrice(data.totalSpent)],
        ].map(([k, v]) => (
          <div key={k} className="bg-background p-4">
            <dt className="eyebrow">{k}</dt>
            <dd className="mt-1 text-lg font-extrabold">{v}</dd>
          </div>
        ))}
      </dl>
      <form
        noValidate
        className="max-w-xl space-y-4"
        onSubmit={handleSubmit(async () => {
          await new Promise((r) => setTimeout(r, 400));
          toast.info("Demo: değişiklikler kaydedilmedi", {
            description: "Profil servisi henüz bağlı değil.",
          });
        })}
      >
        <h2 className="text-base font-extrabold">Kişisel bilgiler</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ad" required error={errors.firstName?.message}>
            <input className={inputClass} {...register("firstName")} />
          </Field>
          <Field label="Soyad" required error={errors.lastName?.message}>
            <input className={inputClass} {...register("lastName")} />
          </Field>
          <Field label="E-posta" required error={errors.email?.message}>
            <input type="email" className={inputClass} {...register("email")} />
          </Field>
          <Field label="Cep telefonu" error={errors.phone?.message}>
            <input type="tel" className={inputClass} {...register("phone")} />
          </Field>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
        </Button>
      </form>
    </div>
  );
}
