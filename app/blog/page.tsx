import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getAllPosts } from "@/lib/blog/posts";
import { buildPageOpenGraph, buildPageTwitter } from "@/lib/seo/page-metadata";
import { config } from "@/lib/site/config";
import { ogImagePaths } from "@/lib/site/routes";

const title = "Blog";
const description = config.site.blogDescription;
const imagePath = ogImagePaths.blog;

export const metadata: Metadata = {
	title,
	description,
	alternates: { canonical: "/blog" },
	openGraph: buildPageOpenGraph({
		title,
		description,
		path: "/blog",
		imagePath,
	}),
	twitter: buildPageTwitter(title, description, imagePath),
};

export default async function BlogIndexPage() {
	const posts = await getAllPosts();

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6 sm:p-12">
			<header className="space-y-2">
				<h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
				<p className="text-sm text-neutral-600 dark:text-muted-foreground">
					Thoughts, notes, and experiments.
				</p>
			</header>

			<section>
				<ul className="divide-y divide-neutral-200">
					{posts.map((post) => (
						<li key={post.slug} className="py-6 first:pt-0">
							<Link
								href={`/blog/${post.slug}`}
								className="group block space-y-2"
							>
								<h2 className="text-xl font-semibold tracking-tight group-hover:underline">
									{post.frontmatter.title}
								</h2>
								<p className="text-sm text-neutral-600 dark:text-muted-foreground">
									{post.frontmatter.description}
								</p>
								<div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
									<time dateTime={post.frontmatter.date}>
										{post.frontmatter.date}
									</time>
									{post.frontmatter.tags?.length ? (
										<span aria-hidden="true">•</span>
									) : null}
									{post.frontmatter.tags?.map((tag) => (
										<Badge key={tag} variant="secondary" className="text-xs">
											#{tag}
										</Badge>
									))}
								</div>
							</Link>
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
