import { describe, expect, test } from "bun:test";
import { blogManifestSource } from "@/lib/content/blog/manifest";

describe("blogManifestSource", () => {
	test("emits only public MDX imports and safely serializes metadata", () => {
		const frontmatter = {
			title: 'A "quoted" title',
			description: "Description",
			date: "2026-01-01",
		};
		const source = blogManifestSource(
			[
				{ slug: "published", frontmatter },
				{ slug: "draft", frontmatter: { ...frontmatter, status: "draft" } },
				{ slug: "_private", frontmatter },
			],
			"/content/blog",
		);
		expect(source).toContain('import Post0 from "/content/blog/published.mdx"');
		expect(source).toContain(JSON.stringify(frontmatter));
		expect(source).not.toContain("draft");
		expect(source).not.toContain("_private");
	});

	test("supports an empty blog", () => {
		expect(blogManifestSource([], "/content/blog")).toContain(
			"export default []",
		);
	});
});
