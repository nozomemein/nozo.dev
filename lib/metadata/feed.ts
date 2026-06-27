import {
	type BlogFrontmatter,
	blogPostFreshnessDate,
} from "@/lib/content/blog/schema";

export type FeedBlogPost = {
	slug: string;
	frontmatter: BlogFrontmatter;
};

export type RssFeedOptions = {
	origin: string;
	siteName: string;
	siteDescription: string;
	posts: FeedBlogPost[];
};

export function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

export function formatRssPubDate(isoDate: string): string {
	const date = new Date(`${isoDate}T00:00:00.000Z`);
	return date.toUTCString();
}

function sortPostsByFreshness(posts: FeedBlogPost[]): FeedBlogPost[] {
	return [...posts].sort(
		(a, b) =>
			Date.parse(blogPostFreshnessDate(b.frontmatter)) -
			Date.parse(blogPostFreshnessDate(a.frontmatter)),
	);
}

function buildRssItem(origin: string, post: FeedBlogPost): string {
	const { title, description } = post.frontmatter;
	const link = `${origin}/blog/${post.slug}`;
	const pubDate = formatRssPubDate(blogPostFreshnessDate(post.frontmatter));

	return `<item>
<title>${escapeXml(title)}</title>
<link>${escapeXml(link)}</link>
<guid isPermaLink="true">${escapeXml(link)}</guid>
<pubDate>${pubDate}</pubDate>
<description>${escapeXml(description)}</description>
</item>`;
}

export function buildRssFeed(options: RssFeedOptions): string {
	const { origin, siteName, siteDescription, posts } = options;
	const feedUrl = `${origin}/feed.xml`;
	const blogUrl = `${origin}/blog`;
	const sortedPosts = sortPostsByFreshness(posts);
	const items = sortedPosts
		.map((post) => buildRssItem(origin, post))
		.join("\n");

	const latestPubDate = sortedPosts[0]
		? formatRssPubDate(blogPostFreshnessDate(sortedPosts[0].frontmatter))
		: formatRssPubDate(new Date().toISOString().slice(0, 10));

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(siteName)}</title>
<link>${escapeXml(blogUrl)}</link>
<description>${escapeXml(siteDescription)}</description>
<language>ja</language>
<lastBuildDate>${latestPubDate}</lastBuildDate>
<atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;
}
