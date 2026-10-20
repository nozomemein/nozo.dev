import { frontmatter } from "@/content/pages/privacy.mdx";
import { pageHead } from "@/lib/metadata/head";

export const head = () =>
	pageHead({
		title: frontmatter.title,
		description: frontmatter.description,
		path: "/privacy",
		imagePath: "/privacy/opengraph-image",
	});
