import { describe, expect, test } from "bun:test";
import { getAllSlugs, validatePostFrontmatter } from "@/lib/posts";

describe("validatePostFrontmatter", () => {
	test("accepts a valid published post", () => {
		const frontmatter = validatePostFrontmatter(
			{
				title: "Test post",
				description: "Test description",
				date: "2026-01-01",
				status: "published",
			},
			"test-post",
		);

		expect(frontmatter.title).toBe("Test post");
	});

	test("accepts a draft without extra fields", () => {
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
