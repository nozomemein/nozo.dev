declare module "*.mdx" {
	import type { MDXContent } from "mdx/types";
	import type { BaseFrontmatter } from "./lib/blog/posts";

	const MDXComponent: MDXContent;
	export const frontmatter: BaseFrontmatter;
	export default MDXComponent;
}
