import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Field, inputClass } from "@/components/common/fields";
import { Badge, EmptyState, ErrorState } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { phoneField, postalCodeField, requiredText } from "@/lib/validation";
import { account } from "@/services";
import type { Address } from "@/types";

export const Route = createFileRoute("/_store/hesap/adresler")({
  component: Page,
});

const schema = z.object({
  title: requiredText("Adres başlığı"),
  firstName: requiredText("Ad"),
  lastName: requiredText("Soyad"),
  phone: phoneField,
  city: requiredText("İl"),
  district: requiredText("İlçe"),
  neighborhood: requiredText("Mahalle"),
  addressLine: requiredText("Açık adres", 8),
  postalCode: postalCodeField,
});
type Values = z.infer<typeof schema>;

function AddressForm({ onSave, onCancel }: { onSave: (a: Address) => void; onCancel: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });
  return (
    <form
      noValidate
      className="grid gap-4 border p-5 sm:grid-cols-2"
      onSubmit={handleSubmit((v) =>
        onSave({ id: `local-${Date.now()}`, ...v, ...(v.postalCode ? {} : { postalCode: "" }) }),
      )}
    >
      <Field label="Adres başlığı" required error={errors.title?.message} className="sm:col-span-2">
        <input placeholder="Ev, iş…" className={inputClass} {...register("title")} />
      </Field>
      <Field label="Ad" required error={errors.firstName?.message}>
        <input className={inputClass} {...register("firstName")} />
      </Field>
      <Field label="Soyad" required error={errors.lastName?.message}>
        <input className={inputClass} {...register("lastName")} />
      </Field>
      <Field label="Cep telefonu" required error={errors.phone?.message}>
        <input type="tel" className={inputClass} {...register("phone")} />
      </Field>
      <Field label="Posta kodu" error={errors.postalCode?.message}>
        <input inputMode="numeric" className={inputClass} {...register("postalCode")} />
      </Field>
      <Field label="İl" required error={errors.city?.message}>
        <input className={inputClass} {...register("city")} />
      </Field>
      <Field label="İlçe" required error={errors.district?.message}>
        <input className={inputClass} {...register("district")} />
      </Field>
      <Field
        label="Mahalle"
        required
        error={errors.neighborhood?.message}
        className="sm:col-span-2"
      >
        <input className={inputClass} {...register("neighborhood")} />
      </Field>
      <Field
        label="Açık adres"
        required
        error={errors.addressLine?.message}
        className="sm:col-span-2"
      >
        <input className={inputClass} {...register("addressLine")} />
      </Field>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit">Adresi ekle</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Vazgeç
        </Button>
      </div>
    </form>
  );
}

function Page() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["account", "addresses"],
    queryFn: () => account.listAddresses(),
  });
  const [list, setList] = useState<Address[]>([]);
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    if (data) setList(data);
  }, [data]);

  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (isLoading) return <div className="h-48 animate-pulse bg-surface" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold">Adreslerim</h2>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            Yeni adres ekle
          </Button>
        )}
      </div>
      {adding && (
        <AddressForm
          onCancel={() => setAdding(false)}
          onSave={(a) => {
            setList((l) => [...l, a]);
            setAdding(false);
            toast.info("Adres eklendi (demo)", {
              description: "Yalnızca bu oturumda görünür; sunucuya kaydedilmez.",
            });
          }}
        />
      )}
      {list.length === 0 ? (
        <EmptyState title="Kayıtlı adresiniz yok" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className="border p-4 text-sm">
              <div className="mb-2 flex items-center gap-2">
                <strong>{a.title}</strong>
                {a.isDefault && <Badge tone="brand">Varsayılan</Badge>}
              </div>
              <address className="not-italic leading-relaxed text-muted-foreground">
                {a.firstName} {a.lastName}
                <br />
                {a.addressLine}
                <br />
                {a.neighborhood}, {a.district} / {a.city}
                <br />
                {a.phone}
              </address>
              <button
                type="button"
                onClick={() => {
                  setList((l) => l.filter((x) => x.id !== a.id));
                  toast.info("Adres silindi (demo)");
                }}
                className="mt-3 cursor-pointer text-xs text-muted-foreground underline hover:text-destructive"
              >
                Sil
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
