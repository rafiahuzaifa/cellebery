"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth/auth";

export type SignInState = { error: string } | undefined;

export async function signInAction(_prevState: SignInState, formData: FormData): Promise<SignInState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // signIn() throws a special redirect error on success — let it propagate.
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
