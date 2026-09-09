import { getAdminPromotions, getPromotionProductOptions, getPromotionCategoryOptions } from "@/actions/promotions";
import { PromotionsManager } from "@/components/admin/promotions-manager";

export default async function AdminPromotionsPage() {
  const [promotions, productOptions, categoryOptions] = await Promise.all([
    getAdminPromotions(),
    getPromotionProductOptions(),
    getPromotionCategoryOptions(),
  ]);
  return <PromotionsManager promotions={promotions} productOptions={productOptions} categoryOptions={categoryOptions} />;
}
