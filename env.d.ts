/// <reference types="vite-plus/client" />

declare module "virtual:blog-posts" {
	const posts: import("@/lib/content/blog/mdx").BlogPost[];
	export default posts;
}
