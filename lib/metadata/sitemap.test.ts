import { describe, expect, test } from "bun:test";
import { buildSitemap, sitemapEntries } from "@/lib/metadata/sitemap";

const origin = "https://nozo.dev";

describe("buildSitemap", () => {
	test("serializes sitemap XML with escaped URLs and optional lastmod", () => {
		const xml = buildSitemap(origin, [
			{
				slug: "hello&world",
				frontmatter: {
					title: "Hello",
					description: "Test",
					date: "2026-02-04",
					updatedAt: "2026-03-01",
				},
			},
		]);

		expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
		expect(xml).toContain(
			'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		);
		expect(xml).toContain("<url><loc>https://nozo.dev/</loc></url>");
		expect(xml).toContain(
			"<url><loc>https://nozo.dev/blog/hello&amp;world</loc><lastmod>2026-03-01</lastmod></url>",
		);
	});

	test("includes only static routes when no posts are published", () => {
		const xml = buildSitemap(origin, []);

		expect(xml.match(/<url>/g)).toHaveLength(3);
		expect(xml).not.toContain("<lastmod>");
	});
});

describe("sitemapEntries", () => {
	test("includes static routes and post URLs", () => {
		const entries = sitemapEntries(origin, [
			{
				slug: "hello",
				frontmatter: {
					title: "Hello",
					description: "Test",
					date: "2026-02-04",
					status: "published",
				},
			},
			{
				slug: "2025-review",
				frontmatter: {
					title: "Review",
					description: "Test",
					date: "2026-02-11",
					status: "published",
				},
			},
		]);
		const urls = entries.map((entry) => entry.url);

		expect(urls).toContain(`${origin}/`);
		expect(urls).toContain(`${origin}/blog`);
		expect(urls).toContain(`${origin}/privacy`);
		expect(urls).toContain(`${origin}/blog/hello`);
		expect(urls).toContain(`${origin}/blog/2025-review`);
	});

	test("uses date as lastModified when updatedAt is absent", () => {
		const entries = sitemapEntries(origin, [
			{
				slug: "hello",
				frontmatter: {
					title: "Hello",
					description: "Test",
					date: "2026-02-04",
					status: "published",
				},
			},
		]);
		const hello = entries.find((entry) => entry.url === `${origin}/blog/hello`);

		expect(hello?.lastModified).toBe("2026-02-04");
	});

	test("prefers updatedAt for post lastModified when set", () => {
		const entries = sitemapEntries(origin, [
			{
				slug: "updated-post",
				frontmatter: {
					title: "Updated",
					description: "Test",
					date: "2026-01-01",
					updatedAt: "2026-06-25",
					status: "published",
				},
			},
		]);
		const updatedPost = entries.find(
			(entry) => entry.url === `${origin}/blog/updated-post`,
		);

		expect(updatedPost?.lastModified).toBe("2026-06-25");
	});

	test("sets blog index lastModified from the freshest post", () => {
		const entries = sitemapEntries(origin, [
			{
				slug: "older",
				frontmatter: {
					title: "Older",
					description: "Test",
					date: "2026-01-01",
					status: "published",
				},
			},
			{
				slug: "newer",
				frontmatter: {
					title: "Newer",
					description: "Test",
					date: "2026-02-11",
					status: "published",
				},
			},
		]);
		const blogIndex = entries.find((entry) => entry.url === `${origin}/blog`);

		expect(blogIndex?.lastModified).toBe("2026-02-11");
	});

	test("uses updatedAt when choosing the freshest post for blog index", () => {
		const entries = sitemapEntries(origin, [
			{
				slug: "older-date",
				frontmatter: {
					title: "Older date",
					description: "Test",
					date: "2026-02-11",
					status: "published",
				},
			},
			{
				slug: "updated-later",
				frontmatter: {
					title: "Updated later",
					description: "Test",
					date: "2026-01-01",
					updatedAt: "2026-06-25",
					status: "published",
				},
			},
		]);
		const blogIndex = entries.find((entry) => entry.url === `${origin}/blog`);

		expect(blogIndex?.lastModified).toBe("2026-06-25");
	});
});
