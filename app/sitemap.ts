import type { MetadataRoute } from "next";
import { loadBlogFrontmatter } from "@/lib/content/blog/files";
import { listBlogSlugs } from "@/lib/content/blog/mdx";
import { sitemapEntries } from "@/lib/metadata/sitemap";
import { config } from "@/lib/site/config";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const origin = config.site.prodOrigin;
	const posts = listBlogSlugs().map((slug) => {
		const frontmatter = loadBlogFrontmatter(slug);
		if (!frontmatter) {
			throw new Error(`Missing frontmatter for ${slug}`);
		}

		return { slug, frontmatter };
	});

	return sitemapEntries(origin, posts);
}
