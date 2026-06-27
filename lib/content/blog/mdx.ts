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
	default?: MDXContent;
	frontmatter?: unknown;
};

function getFrontmatterStatusFromFile(filePath: string) {
	const raw = fs.readFileSync(filePath, "utf8");
	const { data } = matter(raw);
	const status = data?.status;
	return status === "draft" || status === "published" ? status : undefined;
}

export { parseBlogFrontmatter };

export function listBlogSlugs(_options?: {
	includeDrafts?: boolean;
}): string[] {
	if (!fs.existsSync(blogDir)) {
		return [];
	}

	const includeDrafts = _options?.includeDrafts ?? false;

	return fs
		.readdirSync(blogDir, { withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((name) => name.endsWith(".mdx"))
		.filter((name) => !name.startsWith("_"))
		.filter((name) => {
			if (includeDrafts) {
				return true;
			}
			const status = getFrontmatterStatusFromFile(path.join(blogDir, name));
			return status !== "draft";
		})
		.map((name) => name.replace(/\.mdx$/, ""));
}

export async function loadBlogPost(slug: string): Promise<BlogPost> {
	let mod: MdxModule;

	try {
		mod = (await import(`@/content/blog/${slug}.mdx`)) as MdxModule;
	} catch {
		throw new Error(`Post not found: ${slug}`);
	}

	if (!mod.default) {
		throw new Error(`Missing default export in ${slug}`);
	}

	const frontmatter = parseBlogFrontmatter(mod.frontmatter, slug, {
		missingFrontmatterError: `Missing frontmatter export in ${slug}`,
	});

	return {
		slug,
		frontmatter,
		Component: mod.default,
	};
}

export async function listBlogPosts(options?: {
	includeDrafts?: boolean;
}): Promise<BlogPostSummary[]> {
	const includeDrafts = options?.includeDrafts ?? false;
	const slugs = listBlogSlugs({ includeDrafts });

	const posts = await Promise.all(
		slugs.map(async (slug) => {
			const { frontmatter } = await loadBlogPost(slug);
			return { slug, frontmatter };
		}),
	);

	return posts.sort(
		(a, b) => Date.parse(b.frontmatter.date) - Date.parse(a.frontmatter.date),
	);
}
