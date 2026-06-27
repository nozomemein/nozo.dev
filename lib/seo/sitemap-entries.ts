import type { MetadataRoute } from "next";
import {
	getPostFreshnessDate,
	type PostFrontmatterFields,
} from "@/lib/blog/validate-frontmatter";

export type SitemapPost = {
	slug: string;
	frontmatter: PostFrontmatterFields;
};

export function buildSitemapEntries(
	origin: string,
	posts: SitemapPost[],
): MetadataRoute.Sitemap {
	const sortedPosts = [...posts].sort(
		(a, b) =>
			Date.parse(getPostFreshnessDate(b.frontmatter)) -
			Date.parse(getPostFreshnessDate(a.frontmatter)),
	);

	const postEntries: MetadataRoute.Sitemap = sortedPosts.map((post) => ({
		url: `${origin}/blog/${post.slug}`,
		lastModified: getPostFreshnessDate(post.frontmatter),
	}));

	const latestPostDate = sortedPosts[0]
		? getPostFreshnessDate(sortedPosts[0].frontmatter)
		: undefined;

	return [
		{
			url: `${origin}/`,
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
