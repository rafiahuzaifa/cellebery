import type { Metadata } from "next";
import { getPublicBlogPostBySlug } from "@/actions/blog";
import { BlogPostDetail } from "@/components/blog/blog-post-detail";

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPublicBlogPostBySlug(slug, locale as "en" | "ar");
  if (!post) return { title: "Article not found | CELIBERY" };

  const title = post.seoTitle || `${post.title} | CELIBERY`;
  const description = post.seoDescription || post.excerpt || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/blog/${slug}` },
    openGraph: { title, description, images: post.featuredImage ? [{ url: post.featuredImage }] : undefined, type: "article" },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { slug, locale } = await params;
  const post = await getPublicBlogPostBySlug(slug, locale as "en" | "ar");
  return <BlogPostDetail post={post} />;
}
