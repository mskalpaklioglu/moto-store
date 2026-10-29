import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field, inputClass } from "@/components/common/fields";
import { DemoNotice } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { emailField, passwordField, requiredText } from "@/lib/validation";
import { auth } from "@/services";
import { errorMessage } from "@/services/api/client";

export const Route = createFileRoute("/_store/kayit")({
  head: () => ({ meta: [{ title: "Kayıt Ol" }] }),
  component: Page,
});

const schema = z
  .object({
    firstName: requiredText("Ad"),
    lastName: requiredText("Soyad"),
    email: emailField,
    password: passwordField,
    passwordAgain: z.string().min(1, "Şifre tekrarı zorunludur."),
    accept: z.literal(true, {
      errorMap: () => ({ message: "Devam etmek için aydınlatma metnini onaylamalısınız." }),
    }),
  })
  .refine((v) => v.password === v.passwordAgain, {
    path: ["passwordAgain"],
    message: "Şifreler eşleşmiyor.",
  });

function Page() {
  const [serverError, setServerError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { accept: false as unknown as true },
  });

  return (
    <div className="container-page flex justify-center py-12 md:py-16">
      <div className="w-full max-w-md">
        <h1 className="heading-lg">Kayıt ol</h1>
        <form
          noValidate
          className="mt-6 space-y-4"
          onSubmit={handleSubmit(async (v) => {
            setServerError(undefined);
            try {
              await auth.signUp({
                firstName: v.firstName,
                lastName: v.lastName,
                email: v.email,
                password: v.password,
              });
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
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" /> {serverError}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ad" required error={errors.firstName?.message}>
              <input autoComplete="given-name" className={inputClass} {...register("firstName")} />
            </Field>
            <Field label="Soyad" required error={errors.lastName?.message}>
              <input autoComplete="family-name" className={inputClass} {...register("lastName")} />
            </Field>
          </div>
          <Field label="E-posta" required error={errors.email?.message}>
            <input
              type="email"
              autoComplete="email"
              className={inputClass}
              {...register("email")}
            />
          </Field>
          <Field
            label="Şifre"
            required
            error={errors.password?.message}
            hint="En az 8 karakter, bir harf ve bir rakam."
          >
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              {...register("password")}
            />
          </Field>
          <Field label="Şifre tekrar" required error={errors.passwordAgain?.message}>
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              {...register("passwordAgain")}
            />
          </Field>
          <div>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-[var(--brand)]"
                {...register("accept")}
              />
              <span>
                <Link
                  to="/bilgi/$slug"
                  params={{ slug: "kvkk" }}
                  target="_blank"
                  className="underline"
                >
                  KVKK aydınlatma metnini
                </Link>{" "}
                okudum.
              </span>
            </label>
            {errors.accept && (
              <p role="alert" className="mt-1 text-xs font-medium text-destructive">
                {errors.accept.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            variant="brand"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Kaydediliyor…" : "Kayıt ol"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Zaten hesabınız var mı?{" "}
            <Link to="/giris" className="font-bold text-foreground underline">
              Giriş yapın
            </Link>
          </p>
        </form>
        <DemoNotice className="mt-8">
          Kayıt servisi henüz bağlı değil; hesap oluşturulmaz. Bu ekran yalnızca arayüz örneğidir.
        </DemoNotice>
      </div>
    </div>
  );
}
