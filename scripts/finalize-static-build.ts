import assert from "node:assert/strict";
import {
	access,
	cp,
	lstat,
	mkdtemp,
	readdir,
	readFile,
	rename,
	rm,
} from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import matter from "gray-matter";
import { listBlogPostSummaries } from "@/lib/content/blog/mdx";
import { blogDir } from "@/lib/content/blog/paths";
import { blogPostingJsonLd, webSiteJsonLd } from "@/lib/metadata/json-ld";
import { config } from "@/lib/site/config";
import {
	staticAssetRules,
	staticOgImages,
} from "@/scripts/generate-static-assets";

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
	assert.equal($("html").attr("lang"), "ja", `Missing lang for ${route}`);
	assert($("main").text().trim(), `Missing prerendered body for ${route}`);
	return { $, data };
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

function normalized(value: string) {
	return value.replace(/\s+/g, "").trim();
}

export async function verifyStaticBuild(directory = "dist/client") {
	const posts = listBlogPostSummaries();
	const privacy = matter(
		await readFile("content/pages/privacy.mdx", "utf8"),
	).data;
	const routes = [
		"/",
		"/blog",
		"/privacy",
		"/404",
		...posts.map((post) => `/blog/${post.slug}`),
	];
	const expectedPages = routes.map((route) =>
		route === "/" ? "index" : route.slice(1),
	);
	const files = await readdir(directory, { recursive: true });
	assert.deepEqual(
		files.filter((file) => file.endsWith(".html")).sort(),
		expectedPages.map((key) => `${key}.html`).sort(),
		"Unexpected or missing static HTML routes",
	);
	assert.deepEqual(
		files
			.filter(
				(file) => file.startsWith("_void/pages/") && file.endsWith(".json"),
			)
			.sort(),
		expectedPages.map((key) => `_void/pages/${key}.json`).sort(),
		"Unexpected or missing navigation routes",
	);
	const stylesheets = new Set<string>();
	for (const route of routes) {
		const { $, data } = await readStaticPage(directory, route);
		const post = posts.find((post) => `/blog/${post.slug}` === route);
		const title =
			route === "/"
				? config.site.name
				: route === "/blog"
					? `Blog | ${config.site.name}`
					: route === "/privacy"
						? `${privacy.title} | ${config.site.name}`
						: route === "/404"
							? `404 | ${config.site.name}`
							: `${post?.frontmatter.title} | ${config.site.name}`;
		const description =
			route === "/"
				? config.site.homeDescription
				: route === "/blog"
					? config.site.blogDescription
					: route === "/privacy"
						? privacy.description
						: route === "/404"
							? config.site.description
							: post?.frontmatter.description;
		assert.equal($("title").text(), title, `Wrong title for ${route}`);
		assert.equal(data.head.title, title, `Wrong navigation title for ${route}`);
		assert.equal(
			$("meta[name=description]").attr("content"),
			description,
			`Wrong description for ${route}`,
		);
		if (route === "/404") {
			assert(
				$("meta[name=robots]").attr("content")?.includes("noindex"),
				"404 must be noindex",
			);
		} else {
			const canonical = new URL(route, config.site.prodOrigin).href;
			assert.equal(
				$("link[rel=canonical]").attr("href"),
				canonical,
				`Wrong canonical for ${route}`,
			);
			assert.equal(
				$("meta[property='og:url']").attr("content"),
				canonical,
				`Wrong OG URL for ${route}`,
			);
			assert.equal(
				$("link[rel=alternate][type='application/rss+xml']").attr("href"),
				`${config.site.prodOrigin}/feed.xml`,
				`Missing RSS discovery for ${route}`,
			);
		}
		if (route === "/") {
			assert.deepEqual(
				JSON.parse($("script[type='application/ld+json']").text()),
				webSiteJsonLd(),
			);
		}
		if (route === "/blog") {
			for (const post of posts)
				assert(
					$(`main a[href='/blog/${post.slug}']`).length,
					`Missing blog listing: ${post.slug}`,
				);
		}
		if (post) {
			assert.deepEqual(
				$("head meta[property='article:tag']")
					.toArray()
					.map((element) => $(element).attr("content")),
				post.frontmatter.tags ?? [],
				`Missing article tags for ${route}`,
			);
			assert.deepEqual(
				data.head.meta
					.filter(
						(entry: { property?: string }) => entry.property === "article:tag",
					)
					.map((entry: { content?: string }) => entry.content),
				post.frontmatter.tags ?? [],
				`Missing navigation article tags for ${route}`,
			);
			assert.equal(
				$("article h1").length,
				1,
				`Incorrect article headings for ${route}`,
			);
			assert.equal($("article h1").text(), post.frontmatter.title);
			const body = $("article > div").text();
			assert(body.trim(), `Missing MDX body for ${route}`);
			const source = matter(
				await readFile(path.join(blogDir, `${post.slug}.mdx`), "utf8"),
			).content;
			const paragraph = source
				.split(/\n\s*\n/)
				.find(
					(part) =>
						/^[\p{L}\p{N}]/u.test(part.trim()) && !/[[\]`*_]/.test(part),
				);
			if (paragraph)
				assert(
					normalized(body).includes(normalized(paragraph)),
					`MDX body does not match ${post.slug}`,
				);
			assert.deepEqual(
				JSON.parse($("script[type='application/ld+json']").text()),
				blogPostingJsonLd(post.slug, post.frontmatter),
			);
		}
		const references = $(
			"link[href^='/assets/'], script[src^='/assets/']",
		).toArray();
		assert($("link[rel=stylesheet]").length, `Missing CSS for ${route}`);
		for (const element of references) {
			const url = $(element).attr("href") ?? $(element).attr("src");
			assert(url);
			const asset = path.join(
				directory,
				new URL(url, config.site.prodOrigin).pathname,
			);
			await access(asset);
			if (asset.endsWith(".css")) stylesheets.add(asset);
		}
	}
	let fontCount = 0;
	for (const stylesheet of stylesheets) {
		const css = await readFile(stylesheet, "utf8");
		for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
			const url = match[1];
			if (!url || /^(data:|https?:|#)/.test(url)) continue;
			const asset = url.startsWith("/")
				? path.join(directory, url)
				: path.resolve(path.dirname(stylesheet), url);
			await access(asset);
			if (/\.woff2?(?:\?|$)/.test(url)) fontCount++;
		}
	}
	assert(fontCount > 0, "Missing locally bundled font references");
	const images = staticOgImages(posts, privacy.title);
	for (const image of images)
		await verifyOgImage(path.join(directory, `${image.path}.png`));
	assert.deepEqual(
		files.filter((file) => /(?:^|\/)opengraph-image\.png$/.test(file)).sort(),
		images.map((image) => `${image.path.slice(1)}.png`).sort(),
		"Unexpected or missing OG images",
	);
	const rules = staticAssetRules(images);
	assert.equal(
		await readFile(path.join(directory, "_redirects"), "utf8"),
		rules.redirects,
	);
	assert.equal(
		await readFile(path.join(directory, "_headers"), "utf8"),
		rules.headers,
	);
	assert.equal(
		await readFile(path.join(directory, "robots.txt"), "utf8"),
		await readFile("public/robots.txt", "utf8"),
	);
	const rss = cheerio.load(
		await readFile(path.join(directory, "feed.xml"), "utf8"),
		{ xmlMode: true },
	);
	assert.equal(rss("rss > channel > title").text(), config.site.name);
	assert.deepEqual(
		rss("item > link")
			.toArray()
			.map((entry) => rss(entry).text())
			.sort(),
		posts.map((post) => `${config.site.prodOrigin}/blog/${post.slug}`).sort(),
	);
	const sitemap = cheerio.load(
		await readFile(path.join(directory, "sitemap.xml"), "utf8"),
		{ xmlMode: true },
	);
	assert.equal(
		sitemap("urlset").attr("xmlns"),
		"http://www.sitemaps.org/schemas/sitemap/0.9",
	);
	assert.deepEqual(
		sitemap("url > loc")
			.toArray()
			.map((entry) => sitemap(entry).text())
			.sort(),
		routes
			.filter((route) => route !== "/404")
			.map((route) => new URL(route, config.site.prodOrigin).href)
			.sort(),
	);
}

export async function finalizeStaticBuild() {
	await verifyStaticBuild();
	const output = path.resolve("out");
	const existing = await lstat(output).catch((error: NodeJS.ErrnoException) => {
		if (error.code !== "ENOENT") throw error;
		return null;
	});
	assert(
		!existing || existing.isDirectory(),
		"Refusing to replace a non-directory out path",
	);
	const staged = await mkdtemp(path.resolve(".out-"));
	const backup = `${staged}-previous`;
	let backedUp = false;
	try {
		await cp("dist/client", staged, { recursive: true });
		if (existing) {
			await rename(output, backup);
			backedUp = true;
		}
		try {
			await rename(staged, output);
		} catch (error) {
			if (backedUp) await rename(backup, output);
			throw error;
		}
		if (backedUp) await rm(backup, { recursive: true });
	} finally {
		await rm(staged, { recursive: true, force: true });
	}
}

if (import.meta.main) {
	await finalizeStaticBuild();
}
