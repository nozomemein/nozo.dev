import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "export",
	pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

const withMDX = createMDX({
	extension: /\.(md|mdx)$/,
	options: {
		remarkPlugins: [
			"remark-gfm",
			"remark-frontmatter",
			["remark-mdx-frontmatter", { name: "frontmatter" }],
		],
		rehypePlugins: [
			[
				"rehype-pretty-code",
				{
					theme: {
						light: "github-light",
						dark: "github-dark",
					},
					keepBackground: false,
				},
			],
		],
	},
});

export default withBundleAnalyzer(withMDX(nextConfig));
