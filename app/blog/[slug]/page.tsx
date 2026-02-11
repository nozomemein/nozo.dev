import { Badge } from "@/components/ui/badge";
import { config } from "@/lib/constants";
import { getAllSlugs, getPostModule } from "@/lib/posts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

	const title = `${frontmatter.title} | ${config.site.name}`;
	const description = frontmatter.description;
	const images = frontmatter.ogImage ? [frontmatter.ogImage] : undefined;

	return {
		title,
		description,
		alternates: { canonical: `/blog/${slug}` },
		// TODO: setup ogimage
		// openGraph: {
		//   title,
		//   description,
		//   images,
		// },
		// twitter: {
		//   card: images ? "summary_large_image" : "summary",
		//   title,
		//   description,
		//   images,
		// },
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

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-6 sm:p-12">
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
