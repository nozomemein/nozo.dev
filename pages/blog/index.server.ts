import posts from "virtual:blog-posts";
import { defineHandler, type InferProps } from "void";
import { pageHead } from "@/lib/metadata/head";
import { config } from "@/lib/site/config";
import { ogImagePaths } from "@/lib/site/routes";

export const loader = defineHandler(() => ({
	posts: posts.map(({ slug, frontmatter }) => ({ slug, frontmatter })),
}));
export type Props = InferProps<typeof loader>;

export const head = () =>
	pageHead({
		title: "Blog",
		description: config.site.blogDescription,
		path: "/blog",
		imagePath: ogImagePaths.blog,
	});
