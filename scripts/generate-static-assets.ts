import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
	type BlogPostSummary,
	listBlogPostSummaries,
} from "@/lib/content/blog/mdx";
import { buildRssFeed } from "@/lib/metadata/feed";
import { buildSitemap } from "@/lib/metadata/sitemap";
import { createOgImage } from "@/lib/og-image/response";
import { config } from "@/lib/site/config";
import { blogPostOgImagePath, ogImagePaths } from "@/lib/site/routes";

export type StaticOgImage = {
	path: string;
	title: string;
	footer?: string | null;
};

export function staticOgImages(
	posts: BlogPostSummary[],
	privacyTitle: string,
): StaticOgImage[] {
	return [
		{ path: ogImagePaths.home, title: config.site.name, footer: null },
		{ path: ogImagePaths.blog, title: "Blog" },
		{ path: "/privacy/opengraph-image", title: privacyTitle },
		...posts.map(({ slug, frontmatter }) => ({
			path: blogPostOgImagePath(slug),
			title: frontmatter.title,
		})),
	];
}

export function staticAssetRules(images: StaticOgImage[]) {
	const redirects = images
		.map((image) => `${image.path} ${image.path}.png 200`)
		.join("\n");
	const imageHeaders = images.flatMap((image) =>
		[image.path, `${image.path}.png`].map(
			(url) => `${url}\n  Content-Type: image/png`,
		),
	);
	const headers = [
		"/feed.xml\n  Content-Type: application/rss+xml; charset=utf-8",
		"/sitemap.xml\n  Content-Type: application/xml; charset=utf-8",
		...imageHeaders,
	].join("\n\n");
	return { redirects: `${redirects}\n`, headers: `${headers}\n` };
}

export async function generateStaticAssets(outputDir = "dist/client") {
	const posts = listBlogPostSummaries();
	const privacy = matter(
		await readFile("content/pages/privacy.mdx", "utf8"),
	).data;
	if (typeof privacy.title !== "string" || !privacy.title.trim()) {
		throw new Error("Missing privacy page title");
	}
	const images = staticOgImages(posts, privacy.title);
	const rules = staticAssetRules(images);
	await mkdir(outputDir, { recursive: true });
	await Promise.all([
		writeFile(
			path.join(outputDir, "feed.xml"),
			buildRssFeed({
				origin: config.site.prodOrigin,
				siteName: config.site.name,
				siteDescription: config.site.description,
				posts,
			}),
		),
		writeFile(
			path.join(outputDir, "sitemap.xml"),
			buildSitemap(config.site.prodOrigin, posts),
		),
		writeFile(path.join(outputDir, "_redirects"), rules.redirects),
		writeFile(path.join(outputDir, "_headers"), rules.headers),
	]);
	for (const image of images) {
		const filePath = path.join(outputDir, `${image.path.slice(1)}.png`);
		await mkdir(path.dirname(filePath), { recursive: true });
		const response = await createOgImage(image);
		await writeFile(filePath, new Uint8Array(await response.arrayBuffer()));
	}
}

if (import.meta.main) {
	await generateStaticAssets();
}
