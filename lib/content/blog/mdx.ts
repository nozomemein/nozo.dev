import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { MDXContent } from "mdx/types";
import { loadBlogFrontmatter } from "@/lib/content/blog/files";
import { blogDir } from "@/lib/content/blog/paths";
import {
	type BlogFrontmatter,
	parseBlogFrontmatter,
} from "@/lib/content/blog/schema";

export type BlogFrontmatterBase = {
	title: string;
	description: string;
};

export type { BlogFrontmatter };

export type BlogPostSummary = { slug: string; frontmatter: BlogFrontmatter };
export type BlogPost = {
	slug: string;
	frontmatter: BlogFrontmatter;
	Component: MDXContent;
};

function getFrontmatterStatusFromFile(filePath: string) {
	const raw = fs.readFileSync(filePath, "utf8");
	const { data } = matter(raw);
	const status = data?.status;
	return status === "draft" || status === "published" ? status : undefined;
}

export { parseBlogFrontmatter };

function getCandidateSlugs(): string[] {
	if (!fs.existsSync(blogDir)) {
		return [];
	}

	return fs
		.readdirSync(blogDir, { withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((name) => name.endsWith(".mdx"))
		.filter((name) => !name.startsWith("_"))
		.map((name) => name.replace(/\.mdx$/, ""));
}

export function listBlogSlugs(_options?: {
	includeDrafts?: boolean;
}): string[] {
	const includeDrafts = _options?.includeDrafts ?? false;
	const slugs = getCandidateSlugs();

	if (includeDrafts) {
		return slugs;
	}

	return slugs.filter((slug) => {
		const status = getFrontmatterStatusFromFile(
			path.join(blogDir, `${slug}.mdx`),
		);
		return status !== "draft";
	});
}

export function listBlogPostSummaries(options?: {
	includeDrafts?: boolean;
}): BlogPostSummary[] {
	const slugs = listBlogSlugs(options);

	return slugs
		.map((slug) => {
			const frontmatter = loadBlogFrontmatter(slug);
			if (!frontmatter) {
				return null;
			}

			return { slug, frontmatter };
		})
		.filter((post): post is BlogPostSummary => post !== null)
		.sort(
			(a, b) => Date.parse(b.frontmatter.date) - Date.parse(a.frontmatter.date),
		);
}

export async function listBlogPosts(options?: {
	includeDrafts?: boolean;
}): Promise<BlogPostSummary[]> {
	return listBlogPostSummaries(options);
}
