"use server";

interface ContactFormResult {
  success: boolean;
  error?: string;
}

export async function submitContactForm(
  _prevState: ContactFormResult | null,
  formData: FormData
): Promise<ContactFormResult> {
  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const topic = formData.get("topic") as string | null;
  const message = formData.get("message") as string | null;

  if (!name?.trim() || !email?.trim() || !topic?.trim() || !message?.trim()) {
    return { success: false, error: "All fields are required." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // Stub: simulate processing delay
  // Future: send via Resend/SendGrid, store in DB
  await new Promise((r) => setTimeout(r, 800));

  return { success: true };
}
