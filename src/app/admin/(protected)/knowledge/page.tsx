import { getAdminFaqs, getAdminKnowledgeArticles } from "@/actions/knowledge";
import { KnowledgeManager } from "@/components/admin/knowledge-manager";

export default async function AdminKnowledgePage() {
  const [faqs, articles] = await Promise.all([getAdminFaqs(), getAdminKnowledgeArticles()]);
  return <KnowledgeManager faqs={faqs} articles={articles} />;
}
