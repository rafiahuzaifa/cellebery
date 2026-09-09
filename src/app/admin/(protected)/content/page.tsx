import { getAdminContentPages } from "@/actions/content-pages";
import { ContentPagesManager } from "@/components/admin/content-pages-manager";

export default async function AdminContentPage() {
  const pages = await getAdminContentPages();
  return <ContentPagesManager pages={pages} />;
}
