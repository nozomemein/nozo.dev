import { getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
	const posts = await getAllPosts();

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-6 sm:p-12">
			<header className="space-y-2">
				<h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
				<p className="text-sm text-neutral-600">
					Thoughts, notes, and experiments.
				</p>
			</header>

			<section>
				<ul className="divide-y divide-neutral-200">
					{posts.map((post) => (
						<li key={post.slug} className="py-6">
							<Link
								href={`/blog/${post.slug}`}
								className="group block space-y-2"
							>
								<h2 className="text-xl font-semibold tracking-tight group-hover:underline">
									{post.frontmatter.title}
								</h2>
								<p className="text-sm text-neutral-600">
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
										<span
											key={tag}
											className="rounded-full bg-neutral-100 px-2 py-0.5"
										>
											#{tag}
										</span>
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
