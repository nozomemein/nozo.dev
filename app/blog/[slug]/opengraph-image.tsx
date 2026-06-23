import { notFound } from "next/navigation";
import {
	createOgImageResponse,
	ogImageContentType,
	ogImageSize,
} from "@/lib/og/image-response";
import { getPostFrontmatterBySlug } from "@/lib/post-frontmatter";
import { getAllSlugs } from "@/lib/posts";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const dynamic = "force-static";

export function generateStaticParams() {
	return getAllSlugs({ includeDrafts: false }).map((slug) => ({ slug }));
}

export default async function OpenGraphImage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const frontmatter = getPostFrontmatterBySlug(slug);

	if (!frontmatter || frontmatter.status === "draft") {
		notFound();
	}

	return createOgImageResponse({
		title: frontmatter.title,
	});
}
