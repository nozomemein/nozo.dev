import { describe, expect, test } from "bun:test";
import { buildWebSiteJsonLd } from "@/lib/metadata/site-json-ld";
import { config } from "@/lib/site/config";

describe("buildWebSiteJsonLd", () => {
	test("builds WebSite JSON-LD with correct structure", () => {
		const jsonLd = buildWebSiteJsonLd();

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
		const jsonLd = buildWebSiteJsonLd();

		expect(jsonLd.author.sameAs).toContain("https://github.com/nozomemein");
		expect(jsonLd.author.sameAs).toContain("https://x.com/nozomemein");
	});
});
