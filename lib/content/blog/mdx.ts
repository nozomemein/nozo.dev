import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { MDXContent } from "mdx/types";
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

type MdxModule = {
	default: MDXContent;
	frontmatter?: unknown;
};

function isMdxModule(value: unknown): value is MdxModule {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	if (!("default" in value)) {
		return false;
	}

	return typeof value.default === "function";
}

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

export async function loadBlogPost(slug: string): Promise<BlogPost> {
	let loaded: unknown;

	try {
		loaded = await import(`@/content/blog/${slug}.mdx`);
	} catch {
		throw new Error(`Post not found: ${slug}`);
	}

	if (!isMdxModule(loaded)) {
		throw new Error(`Missing default export in ${slug}`);
	}

	const frontmatter = parseBlogFrontmatter(loaded.frontmatter, slug, {
		missingFrontmatterError: `Missing frontmatter export in ${slug}`,
	});

	return {
		slug,
		frontmatter,
		Component: loaded.default,
	};
}

export async function listBlogPosts(options?: {
	includeDrafts?: boolean;
}): Promise<BlogPostSummary[]> {
	const includeDrafts = options?.includeDrafts ?? false;
	const slugs = getCandidateSlugs();

	const posts = await Promise.all(
		slugs.map(async (slug) => {
			const { frontmatter } = await loadBlogPost(slug);
			return { slug, frontmatter };
		}),
	);

	const filteredPosts = includeDrafts
		? posts
		: posts.filter((post) => post.frontmatter.status !== "draft");

	return filteredPosts.sort(
		(a, b) => Date.parse(b.frontmatter.date) - Date.parse(a.frontmatter.date),
	);
}
