// Shared zod building blocks with Turkish error messages.
import { z } from "zod";

export const requiredText = (label: string, min = 2) =>
  z
    .string({ required_error: `${label} zorunludur.` })
    .trim()
    .min(min, `${label} zorunludur.`);

export const emailField = z
  .string()
  .trim()
  .min(1, "E-posta adresi zorunludur.")
  .email("Geçerli bir e-posta adresi girin.");

// Accepts 05xx xxx xx xx, +90 5xx ..., 5xx ... (10–11 digits after stripping separators).
export const phoneField = z
  .string()
  .trim()
  .min(1, "Telefon numarası zorunludur.")
  .refine((v) => {
    const d = v.replace(/[\s()-]/g, "").replace(/^\+90/, "0");
    return /^0?5\d{9}$/.test(d);
  }, "Geçerli bir cep telefonu girin (örn. 05xx xxx xx xx).");

export const passwordField = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalıdır.")
  .regex(/[A-Za-zÇĞİÖŞÜçğıöşü]/, "Şifre en az bir harf içermelidir.")
  .regex(/\d/, "Şifre en az bir rakam içermelidir.");

export const postalCodeField = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{5}$/.test(v), "Posta kodu 5 haneli olmalıdır.");
