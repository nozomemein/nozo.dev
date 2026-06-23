import { describe, expect, test } from "bun:test";
import { getAllSlugs, validatePostFrontmatter } from "@/lib/posts";

describe("validatePostFrontmatter", () => {
	test("accepts a valid published post with ogImage", () => {
		const frontmatter = validatePostFrontmatter(
			{
				title: "Test post",
				description: "Test description",
				date: "2026-01-01",
				status: "published",
				ogImage: "/og/hello.png",
			},
			"test-post",
		);

		expect(frontmatter.ogImage).toBe("/og/hello.png");
	});

	test("accepts a draft without ogImage", () => {
		const frontmatter = validatePostFrontmatter(
			{
				title: "Draft post",
				description: "Draft description",
				date: "2026-01-01",
				status: "draft",
			},
			"draft-post",
		);

		expect(frontmatter.status).toBe("draft");
		expect(frontmatter.ogImage).toBeUndefined();
	});

	test("rejects published posts without ogImage", () => {
		expect(() =>
			validatePostFrontmatter(
				{
					title: "Missing ogImage",
					description: "Test description",
					date: "2026-01-01",
					status: "published",
				},
				"missing-og-image",
			),
		).toThrow('Missing required frontmatter "ogImage"');
	});

	test("rejects ogImage that is not root-relative", () => {
		expect(() =>
			validatePostFrontmatter(
				{
					title: "Bad ogImage",
					description: "Test description",
					date: "2026-01-01",
					status: "published",
					ogImage: "https://example.com/og.png",
				},
				"bad-og-image",
			),
		).toThrow("must be a root-relative path");
	});

	test("rejects ogImage when the public asset is missing", () => {
		expect(() =>
			validatePostFrontmatter(
				{
					title: "Missing asset",
					description: "Test description",
					date: "2026-01-01",
					status: "published",
					ogImage: "/og/does-not-exist.png",
				},
				"missing-asset",
			),
		).toThrow("file not found");
	});

	test("rejects invalid dates", () => {
		expect(() =>
			validatePostFrontmatter(
				{
					title: "Bad date",
					description: "Test description",
					date: "not-a-date",
					status: "draft",
				},
				"bad-date",
			),
		).toThrow('Invalid frontmatter "date"');
	});
});

describe("getAllSlugs", () => {
	test("returns published blog slugs", () => {
		const slugs = getAllSlugs();

		expect(slugs).toContain("hello");
		expect(slugs).toContain("2025-review");
	});
});
