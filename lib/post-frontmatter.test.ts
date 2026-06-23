import { describe, expect, test } from "bun:test";
import {
	getBlogPostOgImagePath,
	getPostFrontmatterBySlug,
} from "@/lib/post-frontmatter";

describe("getPostFrontmatterBySlug", () => {
	test("reads frontmatter from a published post file", () => {
		const frontmatter = getPostFrontmatterBySlug("hello");

		expect(frontmatter?.title).toBe("個人ブログ立ち上げ");
		expect(frontmatter?.status).toBe("published");
	});

	test("returns null for unknown slugs", () => {
		expect(getPostFrontmatterBySlug("does-not-exist")).toBeNull();
	});
});

describe("getBlogPostOgImagePath", () => {
	test("returns the opengraph-image route path", () => {
		expect(getBlogPostOgImagePath("hello")).toBe("/blog/hello/opengraph-image");
	});
});
