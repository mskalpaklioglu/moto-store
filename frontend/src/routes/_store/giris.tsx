import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Field, inputClass } from "@/components/common/fields";
import { DemoNotice } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { emailField } from "@/lib/validation";
import { auth } from "@/services";
import { errorMessage } from "@/services/api/client";

export const Route = createFileRoute("/_store/giris")({
  head: () => ({ meta: [{ title: "Giriş Yap" }] }),
  component: Page,
});

const schema = z.object({ email: emailField, password: z.string().min(1, "Şifre zorunludur.") });
const resetSchema = z.object({ email: emailField });

function ResetForm({ onBack }: { onBack: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit(async (v) => {
        try {
          await auth.requestPasswordReset(v.email);
          toast.success("Demo: e-posta gönderilmedi", {
            description: "Şifre sıfırlama servisi henüz bağlı değil.",
          });
          onBack();
        } catch (e) {
          toast.error(errorMessage(e));
        }
      })}
    >
      <p className="text-sm text-muted-foreground">
        E-posta adresinizi girin; gerçek servis bağlandığında sıfırlama bağlantısı gönderilecektir.
      </p>
      <Field label="E-posta" required error={errors.email?.message}>
        <input type="email" autoComplete="email" className={inputClass} {...register("email")} />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Gönderiliyor…" : "Sıfırlama bağlantısı iste"}
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="w-full cursor-pointer text-center text-sm underline"
      >
        Girişe dön
      </button>
    </form>
  );
}

function Page() {
  const [reset, setReset] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <div className="container-page flex justify-center py-12 md:py-16">
      <div className="w-full max-w-md">
        <h1 className="heading-lg">{reset ? "Şifremi unuttum" : "Giriş yap"}</h1>
        <div className="mt-6">
          {reset ? (
            <ResetForm onBack={() => setReset(false)} />
          ) : (
            <form
              noValidate
              className="space-y-4"
              onSubmit={handleSubmit(async (v) => {
                setServerError(undefined);
                try {
                  await auth.signIn(v.email, v.password);
                } catch (e) {
                  setServerError(errorMessage(e));
                }
              })}
            >
              {serverError && (
                <div
                  role="alert"
                  className="flex gap-2 border border-destructive/30 bg-destructive/5 p-3 text-sm"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />{" "}
                  {serverError}
                </div>
              )}
              <Field label="E-posta" required error={errors.email?.message}>
                <input
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  {...register("email")}
                />
              </Field>
              <Field label="Şifre" required error={errors.password?.message}>
                <input
                  type="password"
                  autoComplete="current-password"
                  className={inputClass}
                  {...register("password")}
                />
              </Field>
              <button
                type="button"
                onClick={() => setReset(true)}
                className="cursor-pointer text-sm underline"
              >
                Şifremi unuttum
              </button>
              <Button
                type="submit"
                size="lg"
                variant="brand"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Giriş yapılıyor…" : "Giriş yap"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Hesabınız yok mu?{" "}
                <Link to="/kayit" className="font-bold text-foreground underline">
                  Kayıt olun
                </Link>
              </p>
            </form>
          )}
        </div>
        <DemoNotice className="mt-8">
          Kimlik doğrulama servisi henüz bağlı değil; giriş yapılamaz. Hesap ekranlarının tasarımını{" "}
          <Link to="/hesap" className="font-bold underline">
            demo hesap önizlemesinde
          </Link>{" "}
          görebilirsiniz.
        </DemoNotice>
      </div>
    </div>
  );
}
