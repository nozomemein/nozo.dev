import { describe, expect, test } from "bun:test";
import {
	blogPostingJsonLd,
	jsonLdScript,
	webSiteJsonLd,
} from "@/lib/metadata/json-ld";
import { config } from "@/lib/site/config";

describe("jsonLdScript", () => {
	test("escapes less-than characters to prevent script breakout", () => {
		const serialized = jsonLdScript({
			headline: "</script><script>alert(1)</script>",
		});

		expect(serialized).not.toContain("</script>");
		expect(serialized).toContain("\\u003c/script");
	});
});

describe("webSiteJsonLd", () => {
	test("builds WebSite JSON-LD with correct structure", () => {
		const jsonLd = webSiteJsonLd();

		expect(jsonLd).toEqual({
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: config.site.name,
			url: config.site.prodOrigin,
			description: config.site.description,
			author: {
				"@type": "Person",
				name: config.site.authorName,
				url: config.site.prodOrigin,
				sameAs: ["https://github.com/nozomemein", "https://x.com/nozomemein"],
			},
			publisher: {
				"@type": "Person",
				name: config.site.authorName,
			},
		});
	});

	test("includes sameAs links for social profiles", () => {
		const jsonLd = webSiteJsonLd();

		expect(jsonLd.author.sameAs).toContain("https://github.com/nozomemein");
		expect(jsonLd.author.sameAs).toContain("https://x.com/nozomemein");
	});
});

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
