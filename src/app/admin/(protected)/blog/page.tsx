import { getAdminBlogPosts } from "@/actions/blog";
import { BlogTable } from "@/components/admin/blog-table";

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts();
  return <BlogTable posts={posts} />;
}
