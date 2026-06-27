import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getBlogPostOgImagePath } from "@/lib/blog/frontmatter";
import { getAllSlugs, getPostModule } from "@/lib/blog/posts";
import { buildBlogPostingJsonLd } from "@/lib/seo/blog-json-ld";
import { buildPageOpenGraph, buildPageTwitter } from "@/lib/seo/page-metadata";
import { serializeJsonLd } from "@/lib/seo/serialize-json-ld";
import { config } from "@/lib/seo/site";

export const dynamicParams = false;

export function generateStaticParams() {
	return getAllSlugs({ includeDrafts: false }).map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;

	const { frontmatter } = await getPostModule(slug);
	if (frontmatter.status === "draft") {
		notFound();
	}

	const title = frontmatter.title;
	const description = frontmatter.description;
	const imagePath = getBlogPostOgImagePath(slug);
	const path = `/blog/${slug}`;

	return {
		title,
		description,
		alternates: { canonical: path },
		openGraph: buildPageOpenGraph({
			title,
			description,
			path,
			imagePath,
			type: "article",
			publishedTime: frontmatter.date,
			modifiedTime: frontmatter.updatedAt,
			authors: [config.site.authorName],
			tags: frontmatter.tags,
		}),
		twitter: buildPageTwitter(title, description, imagePath),
	};
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const { frontmatter, Component: Post } = await getPostModule(slug);
	if (frontmatter.status === "draft") {
		notFound();
	}

	const jsonLd = buildBlogPostingJsonLd(slug, frontmatter);

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-6 sm:p-12">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted build-time data
				dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
			/>
			<article className="space-y-6">
				<header className="space-y-3">
					<h1 className="text-3xl font-semibold tracking-tight">
						{frontmatter.title}
					</h1>
					<p className="text-sm text-neutral-600 dark:text-muted-foreground">
						{frontmatter.description}
					</p>
					<div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
						<time dateTime={frontmatter.date}>{frontmatter.date}</time>
						{frontmatter.tags?.length ? (
							<span aria-hidden="true">•</span>
						) : null}
						{frontmatter.tags?.map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								#{tag}
							</Badge>
						))}
					</div>
				</header>

				<div className="space-y-6">
					<Post />
				</div>
			</article>
		</main>
	);
}
