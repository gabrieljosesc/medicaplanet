import { z } from "zod";

export const registrationSchema = z
  .object({
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
    confirm_email: z.string().trim().min(1, "Confirm your email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[0-9]/, "Password must include at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must include at least one special character")
      .max(128, "Password is too long"),
    confirm_password: z.string().min(1, "Confirm your password"),
    first_name: z.string().trim().min(1, "First name is required").max(100),
    last_name: z.string().trim().min(1, "Last name is required").max(100),
    delivery_address: z.string().trim().min(1, "Delivery address is required").max(500),
    country: z.string().trim().min(1, "Please select your country"),
    city: z.string().trim().min(1, "City is required").max(120),
    state: z.string().trim().min(1, "State or province is required").max(120),
    postal_code: z.string().trim().min(1, "Zip / postal code is required").max(32),
    phone: z
      .string()
      .trim()
      .min(7, "Phone is required")
      .regex(/^[\d\s\-+().]{7,}$/, "Enter a valid phone number"),
    profession: z.string().trim().min(1, "Profession is required").max(200),
    license_number: z.string().trim().min(1, "License number is required").max(120),
    license_expiry: z.string().min(1, "License expiry is required"),
  })
  .refine((d) => d.email === d.confirm_email, {
    message: "Emails do not match",
    path: ["confirm_email"],
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine(
    (d) => {
      const t = Date.parse(d.license_expiry);
      return !Number.isNaN(t);
    },
    { message: "Enter a valid date", path: ["license_expiry"] }
  )
  .refine(
    (d) => {
      const t = new Date(d.license_expiry);
      return t > new Date(new Date().toDateString());
    },
    { message: "License expiry must be in the future", path: ["license_expiry"] }
  );

export type RegistrationInput = z.infer<typeof registrationSchema>;

export function flattenZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}
