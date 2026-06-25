import { describe, expect, test } from "bun:test";
import { buildSitemapEntries } from "@/lib/sitemap-entries";

const origin = "https://nozo.dev";

describe("buildSitemapEntries", () => {
	test("includes static routes and post URLs", () => {
		const entries = buildSitemapEntries(origin, [
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
		const entries = buildSitemapEntries(origin, [
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
		const entries = buildSitemapEntries(origin, [
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
		const entries = buildSitemapEntries(origin, [
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
		const entries = buildSitemapEntries(origin, [
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
