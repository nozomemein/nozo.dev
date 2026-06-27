declare module "*.mdx" {
	import type { MDXContent } from "mdx/types";
	import type { BlogFrontmatterBase } from "./lib/content/blog/mdx";

	const MDXComponent: MDXContent;
	export const frontmatter: BlogFrontmatterBase;
	export default MDXComponent;
}
