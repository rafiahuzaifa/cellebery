import { getAdminReviews } from "@/actions/reviews";
import { ReviewsTable } from "@/components/admin/reviews-table";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();
  return <ReviewsTable reviews={reviews} />;
}
