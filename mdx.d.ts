declare module "*.mdx" {
	import type { ComponentType } from "react";
	import type { BaseFrontmatter } from "./lib/posts";

	const MDXComponent: ComponentType;
	export const frontmatter: BaseFrontmatter;
	export default MDXComponent;
}
