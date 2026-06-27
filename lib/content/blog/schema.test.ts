import { describe, expect, test } from "bun:test";
import { parseBlogFrontmatter } from "@/lib/content/blog/schema";

describe("parseBlogFrontmatter", () => {
	test("accepts a valid published post", () => {
		const frontmatter = parseBlogFrontmatter(
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

	test("accepts optional updatedAt on or after date", () => {
		const frontmatter = parseBlogFrontmatter(
			{
				title: "Updated post",
				description: "Test description",
				date: "2026-01-01",
				updatedAt: "2026-02-01",
				status: "published",
			},
			"updated-post",
		);

		expect(frontmatter.updatedAt).toBe("2026-02-01");
	});

	test("accepts a draft without extra fields", () => {
		const frontmatter = parseBlogFrontmatter(
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
			parseBlogFrontmatter(
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

	test("rejects non-ISO date formats", () => {
		expect(() =>
			parseBlogFrontmatter(
				{
					title: "Bad date",
					description: "Test description",
					date: "2026/01/01",
					status: "draft",
				},
				"bad-date-format",
			),
		).toThrow('Invalid frontmatter "date"');
	});

	test("rejects invalid updatedAt", () => {
		expect(() =>
			parseBlogFrontmatter(
				{
					title: "Bad updatedAt",
					description: "Test description",
					date: "2026-01-01",
					updatedAt: "not-a-date",
					status: "draft",
				},
				"bad-updated-at",
			),
		).toThrow('Invalid frontmatter "updatedAt"');
	});

	test("rejects updatedAt before date", () => {
		expect(() =>
			parseBlogFrontmatter(
				{
					title: "Bad updatedAt",
					description: "Test description",
					date: "2026-02-01",
					updatedAt: "2026-01-01",
					status: "draft",
				},
				"updated-before-date",
			),
		).toThrow(
			'Invalid frontmatter "updatedAt" must be on or after "date" in updated-before-date',
		);
	});
});
