import { describe, expect, test } from "bun:test";
import { blogPostingJsonLd } from "@/lib/metadata/blog-posting";
import { config } from "@/lib/site/config";

describe("blogPostingJsonLd", () => {
	const frontmatter = {
		title: "Test article",
		description: "Test description",
		date: "2026-01-01",
	};

	test("builds BlogPosting JSON-LD without dateModified by default", () => {
		const jsonLd = blogPostingJsonLd("test", frontmatter);

		expect(jsonLd).toEqual({
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			headline: "Test article",
			description: "Test description",
			datePublished: "2026-01-01",
			url: `${config.site.prodOrigin}/blog/test`,
			image: `${config.site.prodOrigin}/blog/test/opengraph-image`,
			author: {
				"@type": "Person",
				name: config.site.authorName,
			},
			publisher: {
				"@type": "Organization",
				name: config.site.name,
			},
		});
		expect(jsonLd).not.toHaveProperty("dateModified");
	});

	test("includes dateModified when updatedAt is set", () => {
		const jsonLd = blogPostingJsonLd("test", {
			...frontmatter,
			updatedAt: "2026-02-01",
		});

		expect(jsonLd.dateModified).toBe("2026-02-01");
	});
});
