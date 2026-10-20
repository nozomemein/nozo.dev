import posts from "virtual:blog-posts";
import { Badge } from "@/components/ui/badge";
import { blogPostingJsonLd, jsonLdScript } from "@/lib/metadata/json-ld";
import { DemotedMdxH1 } from "@/mdx-components";
import type { Props } from "@/pages/blog/[slug].server";

export default function BlogPostPage({ slug, frontmatter }: Props) {
	const post = posts.find((post) => post.slug === slug);
	if (!post) return null;
	const Post = post.Component;
	const jsonLd = blogPostingJsonLd(slug, frontmatter);

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-6 sm:p-12">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted build-time data
				dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
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
					<Post components={{ h1: DemotedMdxH1 }} />
				</div>
			</article>
		</main>
	);
}
