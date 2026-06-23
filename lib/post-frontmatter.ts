import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostFileFrontmatter = {
	title: string;
	description: string;
	date: string;
	tags?: string[];
	status?: "draft" | "published";
};

function parsePostFileFrontmatter(
	data: Record<string, unknown>,
	slug: string,
): PostFileFrontmatter {
	const title = data.title;
	const description = data.description;
	const date = data.date;

	if (typeof title !== "string" || title.trim().length === 0) {
		throw new Error(`Missing required frontmatter "title" in ${slug}`);
	}
	if (typeof description !== "string" || description.trim().length === 0) {
		throw new Error(`Missing required frontmatter "description" in ${slug}`);
	}
	if (typeof date !== "string" || Number.isNaN(Date.parse(date))) {
		throw new Error(`Invalid frontmatter "date" in ${slug}`);
	}

	const tags = data.tags;
	if (
		typeof tags !== "undefined" &&
		(!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string"))
	) {
		throw new Error(`Invalid frontmatter "tags" in ${slug}`);
	}

	const status = data.status;
	if (
		typeof status !== "undefined" &&
		status !== "draft" &&
		status !== "published"
	) {
		throw new Error(`Invalid frontmatter "status" in ${slug}`);
	}

	return {
		title,
		description,
		date,
		tags: tags as string[] | undefined,
		status: status as "draft" | "published" | undefined,
	};
}

export function getPostFrontmatterBySlug(
	slug: string,
): PostFileFrontmatter | null {
	const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
	if (!fs.existsSync(filePath)) {
		return null;
	}

	const raw = fs.readFileSync(filePath, "utf8");
	const { data } = matter(raw);
	return parsePostFileFrontmatter(data, slug);
}

export function getBlogPostOgImagePath(slug: string): string {
	return `/blog/${slug}/opengraph-image`;
}
