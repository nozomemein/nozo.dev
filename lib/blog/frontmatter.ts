import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
	type PostFrontmatterFields,
	validatePostFrontmatterFields,
} from "@/lib/blog/validate-frontmatter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostFileFrontmatter = PostFrontmatterFields;

export function getPostFrontmatterBySlug(
	slug: string,
	options?: { blogDir?: string },
): PostFileFrontmatter | null {
	const blogDir = options?.blogDir ?? BLOG_DIR;
	const filePath = path.join(blogDir, `${slug}.mdx`);
	if (!fs.existsSync(filePath)) {
		return null;
	}

	const raw = fs.readFileSync(filePath, "utf8");
	const { data } = matter(raw);
	return validatePostFrontmatterFields(data, slug);
}
