"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth/auth";

export type CustomerSignInState = { error: string } | undefined;

export async function customerSignInAction(_prevState: CustomerSignInState, formData: FormData): Promise<CustomerSignInState> {
  const locale = String(formData.get("locale") ?? "en");
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: `/${locale}/account`,
    });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) return { error: "Invalid email or password." };
    throw error;
  }
}

export async function customerSignOutAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  await signOut({ redirectTo: `/${locale}/account/login` });
}
