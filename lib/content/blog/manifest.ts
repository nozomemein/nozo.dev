import path from "node:path";
import {
	type BlogPostSummary,
	listBlogPostSummaries,
} from "@/lib/content/blog/mdx";
import { blogDir } from "@/lib/content/blog/paths";

export function blogManifestSource(
	posts: BlogPostSummary[],
	directory: string,
) {
	const published = posts.filter(
		(post) => !post.slug.startsWith("_") && post.frontmatter.status !== "draft",
	);
	const imports = published.map(
		(post, index) =>
			`import Post${index} from ${JSON.stringify(path.join(directory, `${post.slug}.mdx`))};`,
	);
	const entries = published.map(
		(post, index) =>
			`{ slug: ${JSON.stringify(post.slug)}, frontmatter: ${JSON.stringify(post.frontmatter)}, Component: Post${index} }`,
	);
	return `${imports.join("\n")}\nexport default [${entries.join(",\n")}];\n`;
}

if (import.meta.main) {
	process.stdout.write(blogManifestSource(listBlogPostSummaries(), blogDir));
}
