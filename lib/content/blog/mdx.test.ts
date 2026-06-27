import { describe, expect, test } from "bun:test";
import { listBlogSlugs } from "@/lib/content/blog/mdx";

describe("listBlogSlugs", () => {
	test("returns published blog slugs", () => {
		const slugs = listBlogSlugs();

		expect(slugs).toContain("hello");
		expect(slugs).toContain("2025-review");
	});
});
