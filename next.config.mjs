import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  // もし入ってたら、これは OFF 推奨（pluginが効かない/挙動が違うことがある）
  // experimental: { mdxRs: true },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [
      'remark-frontmatter',
      ['remark-mdx-frontmatter', { name: "frontmatter" }],
    ],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
