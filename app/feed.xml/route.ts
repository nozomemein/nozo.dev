import { loadBlogFrontmatter } from "@/lib/content/blog/files";
import { listBlogSlugs } from "@/lib/content/blog/mdx";
import { buildRssFeed } from "@/lib/metadata/feed";
import { config } from "@/lib/site/config";

export const dynamic = "force-static";

export function GET() {
	const origin = config.site.prodOrigin;
	const posts = listBlogSlugs().map((slug) => {
		const frontmatter = loadBlogFrontmatter(slug);
		if (!frontmatter) {
			throw new Error(`Missing frontmatter for ${slug}`);
		}

		return { slug, frontmatter };
	});

	const feed = buildRssFeed({
		origin,
		siteName: config.site.name,
		siteDescription: config.site.description,
		posts,
	});

	return new Response(feed, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
		},
	});
}
