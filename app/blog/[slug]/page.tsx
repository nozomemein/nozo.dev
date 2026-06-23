import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { config } from "@/lib/constants";
import { getAllSlugs, getPostModule } from "@/lib/posts";

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
	const ogImage = frontmatter.ogImage;

	return {
		title,
		description,
		alternates: { canonical: `/blog/${slug}` },
		openGraph: {
			title,
			description,
			type: "article",
			publishedTime: frontmatter.date,
			images: ogImage ? [{ url: ogImage }] : undefined,
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: ogImage ? [ogImage] : undefined,
		},
	};
}

function buildBlogPostingJsonLd(
	slug: string,
	frontmatter: {
		title: string;
		description: string;
		date: string;
		ogImage?: string;
	},
) {
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: frontmatter.title,
		description: frontmatter.description,
		datePublished: frontmatter.date,
		url: `${config.site.prodOrigin}/blog/${slug}`,
		image: frontmatter.ogImage
			? `${config.site.prodOrigin}${frontmatter.ogImage}`
			: undefined,
		author: {
			"@type": "Person",
			name: config.site.authorName,
		},
		publisher: {
			"@type": "Organization",
			name: config.site.name,
		},
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
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
