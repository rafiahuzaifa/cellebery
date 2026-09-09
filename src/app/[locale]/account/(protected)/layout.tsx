import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { AccountShell } from "@/components/account/account-shell";

export default async function ProtectedAccountLayout({ children, params }: LayoutProps<"/[locale]/account">) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/account/login`);

  return (
    <AccountShell locale={locale} user={{ name: session.user.name, email: session.user.email }}>
      {children}
    </AccountShell>
  );
}
