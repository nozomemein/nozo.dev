import path from "node:path";
import mdx from "@mdx-js/rollup";
import { voidReact } from "@void/react/plugin";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite-plus";
import { voidPlugin } from "void";
import { blogContent } from "./lib/content/blog/plugin";

export default defineConfig({
	resolve: { alias: { "@": path.resolve(import.meta.dirname) } },
	server: { port: 3000, strictPort: true },
	plugins: [
		blogContent(),
		{
			...mdx({
				providerImportSource: "@/mdx-components",
				remarkPlugins: [
					remarkGfm,
					remarkFrontmatter,
					[remarkMdxFrontmatter, { name: "frontmatter" }],
				],
				rehypePlugins: [
					[
						rehypePrettyCode,
						{
							theme: { light: "github-light", dark: "github-dark" },
							keepBackground: false,
						},
					],
				],
			}),
			enforce: "pre",
		},
		voidPlugin(),
		voidReact({ react: { include: /\.(js|jsx|ts|tsx|mdx)$/ } }),
	],
});
