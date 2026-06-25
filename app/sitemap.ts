import type { MetadataRoute } from "next";
import { config } from "@/lib/constants";
import { getPostFrontmatterBySlug } from "@/lib/post-frontmatter";
import { getAllSlugs } from "@/lib/posts";
import { buildSitemapEntries } from "@/lib/sitemap-entries";

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

	return buildSitemapEntries(origin, posts);
}
