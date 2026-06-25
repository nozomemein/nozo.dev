import { describe, expect, test } from "bun:test";
import { getAllSlugs } from "@/lib/posts";

describe("getAllSlugs", () => {
	test("returns published blog slugs", () => {
		const slugs = getAllSlugs();

		expect(slugs).toContain("hello");
		expect(slugs).toContain("2025-review");
	});
});
