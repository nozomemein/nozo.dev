import posts from "virtual:blog-posts";
import { HTTPException } from "hono/http-exception";
import { defineHandler, defineHead, type InferProps } from "void";
import { pageHead } from "@/lib/metadata/head";
import { config } from "@/lib/site/config";
import { blogPostOgImagePath } from "@/lib/site/routes";

export function getPrerenderPaths() {
	return posts.map(({ slug }) => ({ slug }));
}

export const loader = defineHandler((c) => {
	const post = posts.find((post) => post.slug === c.req.param("slug"));
	if (!post) throw new HTTPException(404);
	return { slug: post.slug, frontmatter: post.frontmatter };
});
export type Props = InferProps<typeof loader>;

export const head = defineHead<Props>((_c, { slug, frontmatter }) =>
	pageHead({
		title: frontmatter.title,
		description: frontmatter.description,
		path: `/blog/${slug}`,
		imagePath: blogPostOgImagePath(slug),
		type: "article",
		publishedTime: frontmatter.date,
		modifiedTime: frontmatter.updatedAt,
		authors: [config.site.authorName],
		tags: frontmatter.tags,
	}),
);
