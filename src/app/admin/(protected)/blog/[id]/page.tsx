import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminBlogPostById } from "@/actions/blog";
import { BlogForm } from "@/components/admin/blog-form";

export default async function EditAdminBlogPostPage({ params }: PageProps<"/admin/blog/[id]">) {
  const { id } = await params;
  const post = await getAdminBlogPostById(id);

  if (!post) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#101416] px-6 py-16 text-center">
        <p className="text-sm text-white/50">Post not found.</p>
        <Link href="/admin/blog" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#22d3ee]"><ArrowLeft size={13} /> Back to journal</Link>
      </div>
    );
  }

  return <BlogForm initial={post} />;
}
