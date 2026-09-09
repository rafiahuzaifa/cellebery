import type { MetadataRoute } from "next";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://cellebry.vercel.app";
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/account"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
