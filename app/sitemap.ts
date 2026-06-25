import type { MetadataRoute } from "next";
import { config } from "@/lib/constants";
import { getPostFrontmatterBySlug } from "@/lib/post-frontmatter";
import { getAllSlugs } from "@/lib/posts";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const origin = config.site.prodOrigin;
	const posts = getAllSlugs()
		.map((slug) => {
			const frontmatter = getPostFrontmatterBySlug(slug);
			if (!frontmatter) {
				throw new Error(`Missing frontmatter for ${slug}`);
			}

			return { slug, frontmatter };
		})
		.sort(
			(a, b) =>
				Date.parse(b.frontmatter.updatedAt ?? b.frontmatter.date) -
				Date.parse(a.frontmatter.updatedAt ?? a.frontmatter.date),
		);

	const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
		url: `${origin}/blog/${post.slug}`,
		lastModified: post.frontmatter.updatedAt ?? post.frontmatter.date,
	}));

	const latestPostDate =
		posts[0]?.frontmatter.updatedAt ?? posts[0]?.frontmatter.date;

	return [
		{
			url: origin,
		},
		{
			url: `${origin}/blog`,
			...(latestPostDate && { lastModified: latestPostDate }),
		},
		{
			url: `${origin}/privacy`,
		},
		...postEntries,
	];
}
