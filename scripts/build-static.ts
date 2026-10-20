import assert from "node:assert/strict";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
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
	return {
		redirects: `${redirects}\n`,
		headers: "/feed.xml\n  Content-Type: application/rss+xml; charset=utf-8\n",
	};
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

export async function readStaticPage(directory: string, route: string) {
	const key = route === "/" ? "index" : route.slice(1);
	const html = await readFile(path.join(directory, `${key}.html`), "utf8");
	const data = JSON.parse(
		await readFile(path.join(directory, `_void/pages/${key}.json`), "utf8"),
	);
	assert.equal(data.url, route, `Wrong navigation URL for ${route}`);
	assert.equal(data.errors, null, `Prerender failed for ${route}`);
	const $ = cheerio.load(html);
	assert.deepEqual(
		JSON.parse($("#__VOID_PAGE_DATA__").text()),
		data,
		`HTML/navigation payload mismatch for ${route}`,
	);
	assert($("main").text().trim(), `Missing prerendered body for ${route}`);
	return $;
}

export async function verifyOgImage(filePath: string) {
	const png = await readFile(filePath);
	assert(
		png.length >= 24 &&
			png
				.subarray(0, 8)
				.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
			png.toString("ascii", 12, 16) === "IHDR",
		`Invalid PNG: ${filePath}`,
	);
	assert.equal(png.readUInt32BE(16), 1200, `Wrong PNG width: ${filePath}`);
	assert.equal(png.readUInt32BE(20), 630, `Wrong PNG height: ${filePath}`);
}

export async function verifyPrerenderedPages(
	directory: string,
	slugs: string[],
) {
	const routes = [
		"/",
		"/blog",
		"/privacy",
		"/404",
		...slugs.map((slug) => `/blog/${slug}`),
	];
	const keys = routes.map((route) =>
		route === "/" ? "index" : route.slice(1),
	);
	const files = await readdir(directory, { recursive: true });
	assert.deepEqual(
		files.filter((file) => file.endsWith(".html")).sort(),
		keys.map((key) => `${key}.html`).sort(),
		"Unexpected or missing static HTML routes",
	);
	assert.deepEqual(
		files
			.filter(
				(file) => file.startsWith("_void/pages/") && file.endsWith(".json"),
			)
			.sort(),
		keys.map((key) => `_void/pages/${key}.json`).sort(),
		"Unexpected or missing navigation routes",
	);
	const rewrites = new Map(
		(await readFile(path.join(directory, "_redirects"), "utf8"))
			.trim()
			.split("\n")
			.map((line) => line.trim().split(/\s+/))
			.filter(([, , status]) => status === "200")
			.map(([from, to]) => [from, to]),
	);
	for (const route of routes) {
		const $ = await readStaticPage(directory, route);
		if (route === "/404") continue;
		const image = $("head meta[property='og:image']").attr("content");
		assert(image, `Missing OG image for ${route}`);
		const url = new URL(image);
		assert.equal(
			url.origin,
			config.site.prodOrigin,
			`Unexpected OG image origin for ${route}`,
		);
		const target = rewrites.get(url.pathname) ?? url.pathname;
		await verifyOgImage(path.join(directory, target));
	}
}

if (import.meta.main) {
	const directory = "dist/client";
	await generateStaticAssets(directory);
	await verifyPrerenderedPages(
		directory,
		listBlogPostSummaries().map((post) => post.slug),
	);
	await rm("out", { recursive: true, force: true });
	await cp(directory, "out", { recursive: true });
}
