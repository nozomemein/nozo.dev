import { describe, expect, test } from "bun:test";
import { listBlogPostSummaries, listBlogSlugs } from "@/lib/content/blog/mdx";

describe("listBlogSlugs", () => {
	test("returns published blog slugs", () => {
		const slugs = listBlogSlugs();

		expect(slugs).toContain("hello");
		expect(slugs).toContain("2025-review");
	});
});

describe("listBlogPostSummaries", () => {
	test("returns published posts sorted by date descending", () => {
		const posts = listBlogPostSummaries();

		expect(posts.length).toBeGreaterThanOrEqual(2);
		expect(posts.map((post) => post.slug)).toContain("hello");
		expect(posts.map((post) => post.slug)).toContain("2025-review");
		expect(posts[0]?.frontmatter.title).toBeTruthy();

		for (let index = 1; index < posts.length; index += 1) {
			const previousDate = Date.parse(posts[index - 1]?.frontmatter.date ?? "");
			const currentDate = Date.parse(posts[index]?.frontmatter.date ?? "");
			expect(previousDate).toBeGreaterThanOrEqual(currentDate);
		}
	});
});
