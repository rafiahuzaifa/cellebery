import type { Metadata } from "next";
import { getPublicBlogPosts } from "@/actions/blog";
import { BlogList } from "@/components/blog/blog-list";

export async function generateMetadata({ params }: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic ? "المجلة | CELIBERY" : "Journal | CELIBERY",
    description: isArabic ? "قصص عن الصوت والتصميم والحرفية من CELIBERY." : "Stories on sound, design, and craft from CELIBERY.",
    alternates: { canonical: `/${locale}/blog` },
  };
}

export default async function BlogPage({ params }: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  const posts = await getPublicBlogPosts(locale as "en" | "ar");
  return <BlogList posts={posts} />;
}
