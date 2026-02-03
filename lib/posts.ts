import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ComponentType } from "react";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostFrontmatter = {
	title: string;
	description: string;
	date: string;
	tags?: string[];
	ogImage?: string;
	status?: "draft" | "published";
};

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

const REQUIRED_FIELDS: Array<keyof PostFrontmatter> = [
	"title",
	"description",
	"date",
];

function getFrontmatterStatusFromFile(filePath: string) {
	const raw = fs.readFileSync(filePath, "utf8");
	const { data } = matter(raw);
	const status = data?.status;
	return status === "draft" || status === "published" ? status : undefined;
}

function assertFrontmatter(data: unknown, slug: string): PostFrontmatter {
	if (!data || typeof data !== "object") {
		throw new Error(`Missing frontmatter export in ${slug}`);
	}

	const frontmatter = data as Record<string, unknown>;

	for (const field of REQUIRED_FIELDS) {
		const value = frontmatter[field];
		if (typeof value !== "string" || value.trim().length === 0) {
			throw new Error(`Missing required frontmatter \"${field}\" in ${slug}`);
		}
	}

	const tags = frontmatter.tags;
	if (
		typeof tags !== "undefined" &&
		(!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string"))
	) {
		throw new Error(`Invalid frontmatter \"tags\" in ${slug}`);
	}

	const ogImage = frontmatter.ogImage;
	if (typeof ogImage !== "undefined" && typeof ogImage !== "string") {
		throw new Error(`Invalid frontmatter \"ogImage\" in ${slug}`);
	}

	const status = frontmatter.status;
	if (
		typeof status !== "undefined" &&
		status !== "draft" &&
		status !== "published"
	) {
		throw new Error(`Invalid frontmatter \"status\" in ${slug}`);
	}

	const date = frontmatter.date as string;
	if (Number.isNaN(Date.parse(date))) {
		throw new Error(`Invalid frontmatter \"date\" in ${slug}`);
	}

	return {
		title: frontmatter.title as string,
		description: frontmatter.description as string,
		date,
		tags: tags as string[] | undefined,
		ogImage: ogImage as string | undefined,
		status: status as "draft" | "published" | undefined,
	};
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

export async function getPostModule(slug: string): Promise<PostModule> {
	let mod: MdxModule;

	try {
		mod = (await import(`@/content/blog/${slug}.mdx`)) as MdxModule;
	} catch (error) {
		throw new Error(`Post not found: ${slug}`);
	}

	if (!mod.default) {
		throw new Error(`Missing default export in ${slug}`);
	}

	const frontmatter = assertFrontmatter(mod.frontmatter, slug);

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
