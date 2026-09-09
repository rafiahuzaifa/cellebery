import { getHomepageSections } from "@/actions/homepage";
import { HomepageBuilder } from "@/components/admin/homepage-builder";

export default async function AdminHomepagePage() {
  const sections = await getHomepageSections();
  return <HomepageBuilder sections={sections} />;
}
