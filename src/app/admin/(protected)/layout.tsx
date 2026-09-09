import { redirect } from "next/navigation";
import { auth, STAFF_ROLES } from "@/lib/auth/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function ProtectedAdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  // authorize() only verifies identity now — customers can authenticate too (see
  // src/lib/auth/auth.ts). Staff-only access to the admin panel is enforced here.
  if (!STAFF_ROLES.includes(session.user.role)) redirect("/admin/login");

  return <AdminShell user={session.user}>{children}</AdminShell>;
}
