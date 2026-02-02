import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { useMDXComponents } from "@/mdx-components";

const SITE_NAME = "My Blog";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const { frontmatter } = getPostBySlug(params.slug);
  const title = `${frontmatter.title} | ${SITE_NAME}`;
  const description = frontmatter.description;
  const images = frontmatter.ogImage ? [frontmatter.ogImage] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images,
    },
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { frontmatter, content } = getPostBySlug(params.slug);
  const components = useMDXComponents({});

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-6 sm:p-12">
      <article className="space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {frontmatter.title}
          </h1>
          <p className="text-sm text-neutral-600">
            {frontmatter.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <time dateTime={frontmatter.date}>{frontmatter.date}</time>
            {frontmatter.tags?.length ? <span aria-hidden="true">•</span> : null}
            {frontmatter.tags?.map((tag) => (
              <span key={tag} className="rounded-full bg-neutral-100 px-2 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
        </header>

        <div className="space-y-6">
          <MDXRemote source={content} components={components} />
        </div>
      </article>
    </main>
  );
}
