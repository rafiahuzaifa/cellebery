import { getSiteSettings } from "@/actions/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsForm initial={settings} />;
}
