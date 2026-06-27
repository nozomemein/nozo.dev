import { describe, expect, test } from "bun:test";
import { blogPostOgImagePath } from "@/lib/site/routes";

describe("blogPostOgImagePath", () => {
	test("returns the opengraph-image route path", () => {
		expect(blogPostOgImagePath("hello")).toBe("/blog/hello/opengraph-image");
	});
});
