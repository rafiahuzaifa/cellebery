import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { CartPageContent } from "@/components/cart/cart-page-content";

export default async function CartPage() {
  const session = await auth();
  const user = session?.user.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, phone: true } })
    : null;

  return <CartPageContent initialName={user?.name ?? ""} initialEmail={user?.email ?? ""} initialPhone={user?.phone ?? ""} />;
}
