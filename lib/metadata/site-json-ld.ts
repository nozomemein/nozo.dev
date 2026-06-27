import { config } from "@/lib/site/config";

/**
 * Build WebSite JSON-LD for the home page.
 * @see https://schema.org/WebSite
 */
export function buildWebSiteJsonLd() {
	return {
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
	};
}
