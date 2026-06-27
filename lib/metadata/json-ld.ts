import { config } from "@/lib/site/config";
import { blogPostOgImagePath } from "@/lib/site/routes";

/**
 * Base JSON-LD structure with required context.
 */
export type JsonLd<T extends string = string> = {
	"@context": "https://schema.org";
	"@type": T;
	[key: string]: unknown;
};

/**
 * Serialize JSON-LD data to a script-safe string.
 * Escapes `<` to prevent script injection.
 */
export function jsonLdScript(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Build WebSite JSON-LD for the home page.
 * @see https://schema.org/WebSite
 */
export function webSiteJsonLd(): JsonLd<"WebSite"> {
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

export type BlogPostingInput = {
	title: string;
	description: string;
	date: string;
	updatedAt?: string;
};

/**
 * Build BlogPosting JSON-LD for a blog article.
 * @see https://schema.org/BlogPosting
 */
export function blogPostingJsonLd(
	slug: string,
	frontmatter: BlogPostingInput,
): JsonLd<"BlogPosting"> {
	const ogImagePath = blogPostOgImagePath(slug);

	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: frontmatter.title,
		description: frontmatter.description,
		datePublished: frontmatter.date,
		...(frontmatter.updatedAt && { dateModified: frontmatter.updatedAt }),
		url: `${config.site.prodOrigin}/blog/${slug}`,
		image: `${config.site.prodOrigin}${ogImagePath}`,
		author: {
			"@type": "Person",
			name: config.site.authorName,
		},
		publisher: {
			"@type": "Organization",
			name: config.site.name,
		},
	};
}
