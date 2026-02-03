import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "export",
	pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
	extension: /\.(md|mdx)$/,
	options: {
		remarkPlugins: [
			"remark-frontmatter",
			["remark-mdx-frontmatter", { name: "frontmatter" }],
		],
		rehypePlugins: [],
	},
});

export default withMDX(nextConfig);
