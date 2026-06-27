import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { blogDir } from "@/lib/content/blog/paths";
import { parseBlogFrontmatter } from "@/lib/content/blog/schema";

export function loadBlogFrontmatter(
	slug: string,
	options?: { blogDir?: string },
) {
	const dir = options?.blogDir ?? blogDir;
	const filePath = path.join(dir, `${slug}.mdx`);
	if (!fs.existsSync(filePath)) {
		return null;
	}

	const raw = fs.readFileSync(filePath, "utf8");
	const { data } = matter(raw);
	return parseBlogFrontmatter(data, slug);
}
