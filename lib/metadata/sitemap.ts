import type { MetadataRoute } from "next";
import {
	type BlogFrontmatter,
	blogPostFreshnessDate,
} from "@/lib/content/blog/schema";

export type SitemapBlogPost = {
	slug: string;
	frontmatter: BlogFrontmatter;
};

export function sitemapEntries(
	origin: string,
	posts: SitemapBlogPost[],
): MetadataRoute.Sitemap {
	const sortedPosts = [...posts].sort(
		(a, b) =>
			Date.parse(blogPostFreshnessDate(b.frontmatter)) -
			Date.parse(blogPostFreshnessDate(a.frontmatter)),
	);

	const postEntries: MetadataRoute.Sitemap = sortedPosts.map((post) => ({
		url: `${origin}/blog/${post.slug}`,
		lastModified: blogPostFreshnessDate(post.frontmatter),
	}));

	const latestPostDate = sortedPosts[0]
		? blogPostFreshnessDate(sortedPosts[0].frontmatter)
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
