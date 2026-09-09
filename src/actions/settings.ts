"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export type SiteSettings = {
  siteName: string;
  supportEmail: string;
  supportWhatsapp: string;
  currency: string;
  defaultCountry: string;
};

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "CELIBERY",
  supportEmail: "support@celibery.sa",
  supportWhatsapp: "",
  currency: "SAR",
  defaultCountry: "Saudi Arabia",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(row.settings as Partial<SiteSettings>) };
}

export async function updateSiteSettingsAction(input: SiteSettings): Promise<{ error?: string }> {
  if (!input.siteName.trim()) return { error: "Site name is required." };
  if (!/.+@.+\..+/.test(input.supportEmail)) return { error: "Please enter a valid support email." };

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: { settings: input },
    create: { id: "default", settings: input },
  });

  revalidatePath("/admin/settings");
  return {};
}
