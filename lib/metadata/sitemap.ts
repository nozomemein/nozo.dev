import {
	type BlogFrontmatter,
	blogPostFreshnessDate,
} from "@/lib/content/blog/schema";
import { escapeXml } from "@/lib/metadata/feed";

export type SitemapBlogPost = {
	slug: string;
	frontmatter: BlogFrontmatter;
};

export type SitemapEntry = {
	url: string;
	lastModified?: string;
};

export function sitemapEntries(
	origin: string,
	posts: SitemapBlogPost[],
): SitemapEntry[] {
	const sortedPosts = [...posts].sort(
		(a, b) =>
			Date.parse(blogPostFreshnessDate(b.frontmatter)) -
			Date.parse(blogPostFreshnessDate(a.frontmatter)),
	);

	const postEntries: SitemapEntry[] = sortedPosts.map((post) => ({
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

export function buildSitemap(origin: string, posts: SitemapBlogPost[]): string {
	const entries = sitemapEntries(origin, posts).map(({ url, lastModified }) => {
		const modified = lastModified
			? `<lastmod>${escapeXml(lastModified)}</lastmod>`
			: "";
		return `<url><loc>${escapeXml(url)}</loc>${modified}</url>`;
	});

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
}
