import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShopRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/studios/${id}`);
}
