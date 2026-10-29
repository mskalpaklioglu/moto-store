import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field, inputClass, textareaClass } from "@/components/common/fields";
import { Breadcrumbs, DemoNotice } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { emailField, requiredText } from "@/lib/validation";

export const Route = createFileRoute("/_store/iletisim")({
  head: () => ({ meta: [{ title: "İletişim" }] }),
  component: Page,
});

const schema = z.object({
  name: requiredText("Ad soyad"),
  email: emailField,
  subject: requiredText("Konu", 3),
  message: requiredText("Mesaj", 10),
});

function Page() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const c = siteConfig.contact;

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "İletişim" }]} />
      <h1 className="heading-lg mt-3 border-b pb-5">İletişim</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          {sent ? (
            <div role="status" className="border bg-surface p-6">
              <div className="flex items-center gap-2 font-bold">
                <Check className="size-5 text-success" /> Demo: mesajınız gönderilmedi
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                İletişim servisi henüz bağlı değil; form yalnızca arayüz örneğidir. Gerçek iletişim
                bilgileri eklendiğinde bu form çalışacaktır.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setSent(false)}>
                Yeni mesaj yaz
              </Button>
            </div>
          ) : (
            <form
              noValidate
              className="space-y-4"
              onSubmit={handleSubmit(async () => {
                await new Promise((r) => setTimeout(r, 600));
                reset();
                setSent(true);
              })}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ad soyad" required error={errors.name?.message}>
                  <input autoComplete="name" className={inputClass} {...register("name")} />
                </Field>
                <Field label="E-posta" required error={errors.email?.message}>
                  <input
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    {...register("email")}
                  />
                </Field>
              </div>
              <Field label="Konu" required error={errors.subject?.message}>
                <input className={inputClass} {...register("subject")} />
              </Field>
              <Field label="Mesajınız" required error={errors.message?.message}>
                <textarea rows={6} className={textareaClass} {...register("message")} />
              </Field>
              <Button type="submit" variant="brand" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Gönderiliyor…" : "Mesajı gönder"}
              </Button>
            </form>
          )}
        </div>
        <aside className="space-y-4">
          <dl className="space-y-4 border bg-surface p-5 text-sm">
            {[
              ["E-posta", c.email],
              ["Telefon", c.phone],
              ["Çalışma saatleri", c.hours],
              ["Adres", c.address],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-1 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <DemoNotice>
            İletişim bilgileri yer tutucudur; kesinleştiğinde <code>src/config/site.ts</code>{" "}
            dosyasından güncellenir.
          </DemoNotice>
        </aside>
      </div>
    </div>
  );
}
