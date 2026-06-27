import type { MetadataRoute } from "next";
import { getPostFrontmatterBySlug } from "@/lib/blog/frontmatter";
import { getAllSlugs } from "@/lib/blog/posts";
import { sitemapEntries } from "@/lib/metadata/sitemap";
import { config } from "@/lib/site/config";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const origin = config.site.prodOrigin;
	const posts = getAllSlugs().map((slug) => {
		const frontmatter = getPostFrontmatterBySlug(slug);
		if (!frontmatter) {
			throw new Error(`Missing frontmatter for ${slug}`);
		}

		return { slug, frontmatter };
	});

	return sitemapEntries(origin, posts);
}
