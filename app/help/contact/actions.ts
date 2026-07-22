"use server";

import { ContactFormSchema } from "@/lib/validation/schemas";

interface ContactFormResult {
  success: boolean;
  error?: string;
}

export async function submitContactForm(
  _prevState: ContactFormResult | null,
  formData: FormData,
): Promise<ContactFormResult> {
  const parsed = ContactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    topic: formData.get("topic"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      fieldErrors.email?.[0] ??
      fieldErrors.name?.[0] ??
      fieldErrors.topic?.[0] ??
      fieldErrors.message?.[0] ??
      "All fields are required.";
    return { success: false, error: firstError };
  }

  // Stub: simulate processing delay
  // Future: send via Resend/SendGrid, store in DB
  await new Promise((r) => setTimeout(r, 800));

  return { success: true };
}
