import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parseBlogFrontmatter } from "@/lib/content/blog/schema";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export function loadBlogFrontmatter(
	slug: string,
	options?: { blogDir?: string },
) {
	const blogDir = options?.blogDir ?? BLOG_DIR;
	const filePath = path.join(blogDir, `${slug}.mdx`);
	if (!fs.existsSync(filePath)) {
		return null;
	}

	const raw = fs.readFileSync(filePath, "utf8");
	const { data } = matter(raw);
	return parseBlogFrontmatter(data, slug);
}
