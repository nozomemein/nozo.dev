import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ComponentType } from "react";
import {
	type PostFrontmatterFields,
	validatePostFrontmatterFields,
} from "@/lib/blog/validate-frontmatter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BaseFrontmatter = {
	title: string;
	description: string;
};

export type PostFrontmatter = PostFrontmatterFields;

export type PostSummary = { slug: string; frontmatter: PostFrontmatter };
export type PostModule = {
	slug: string;
	frontmatter: PostFrontmatter;
	Component: ComponentType;
};

type MdxModule = {
	default?: ComponentType;
	frontmatter?: unknown;
};

function getFrontmatterStatusFromFile(filePath: string) {
	const raw = fs.readFileSync(filePath, "utf8");
	const { data } = matter(raw);
	const status = data?.status;
	return status === "draft" || status === "published" ? status : undefined;
}

function validatePostFrontmatter(data: unknown, slug: string): PostFrontmatter {
	return validatePostFrontmatterFields(data, slug, {
		missingFrontmatterError: `Missing frontmatter export in ${slug}`,
	});
}

export function getAllSlugs(_options?: { includeDrafts?: boolean }): string[] {
	if (!fs.existsSync(BLOG_DIR)) {
		return [];
	}

	const includeDrafts = _options?.includeDrafts ?? false;

	return fs
		.readdirSync(BLOG_DIR, { withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((name) => name.endsWith(".mdx"))
		.filter((name) => !name.startsWith("_"))
		.filter((name) => {
			if (includeDrafts) {
				return true;
			}
			const status = getFrontmatterStatusFromFile(path.join(BLOG_DIR, name));
			return status !== "draft";
		})
		.map((name) => name.replace(/\.mdx$/, ""));
}

export { validatePostFrontmatter };

export async function getPostModule(slug: string): Promise<PostModule> {
	let mod: MdxModule;

	try {
		mod = (await import(`@/content/blog/${slug}.mdx`)) as MdxModule;
	} catch {
		throw new Error(`Post not found: ${slug}`);
	}

	if (!mod.default) {
		throw new Error(`Missing default export in ${slug}`);
	}

	const frontmatter = validatePostFrontmatter(mod.frontmatter, slug);

	return {
		slug,
		frontmatter,
		Component: mod.default,
	};
}

export async function getAllPosts(options?: {
	includeDrafts?: boolean;
}): Promise<PostSummary[]> {
	const includeDrafts = options?.includeDrafts ?? false;
	const slugs = getAllSlugs({ includeDrafts });

	const posts = await Promise.all(
		slugs.map(async (slug) => {
			const { frontmatter } = await getPostModule(slug);
			return { slug, frontmatter };
		}),
	);

	return posts.sort(
		(a, b) => Date.parse(b.frontmatter.date) - Date.parse(a.frontmatter.date),
	);
}
