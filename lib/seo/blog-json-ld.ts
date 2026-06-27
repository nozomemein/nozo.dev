import { getBlogPostOgImagePath } from "@/lib/blog/frontmatter";
import { config } from "@/lib/seo/site";

export type BlogPostingFrontmatter = {
	title: string;
	description: string;
	date: string;
	updatedAt?: string;
};

export function buildBlogPostingJsonLd(
	slug: string,
	frontmatter: BlogPostingFrontmatter,
) {
	const ogImagePath = getBlogPostOgImagePath(slug);

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
