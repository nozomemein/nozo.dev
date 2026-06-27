import { notFound } from "next/navigation";
import { loadBlogFrontmatter } from "@/lib/content/blog/files";
import { listBlogSlugs } from "@/lib/content/blog/mdx";
import { contentType, createOgImage, size } from "@/lib/og-image/response";

export { contentType, size };
export const dynamic = "force-static";

export function generateStaticParams() {
	return listBlogSlugs({ includeDrafts: false }).map((slug) => ({ slug }));
}

export default async function OpenGraphImage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const frontmatter = loadBlogFrontmatter(slug);

	if (!frontmatter || frontmatter.status === "draft") {
		notFound();
	}

	return createOgImage({
		title: frontmatter.title,
	});
}
