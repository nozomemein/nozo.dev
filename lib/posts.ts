import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  ogImage?: string;
};

export type PostSummary = { slug: string; frontmatter: PostFrontmatter };
export type PostDetail = {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
};

const REQUIRED_FIELDS: Array<keyof PostFrontmatter> = [
  "title",
  "description",
  "date",
];

function getPostFilePath(slug: string) {
  return path.join(BLOG_DIR, `${slug}.mdx`);
}

function assertFrontmatter(
  data: Record<string, unknown>,
  slug: string
): PostFrontmatter {
  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`Missing required frontmatter \"${field}\" in ${slug}`);
    }
  }

  const tags = data.tags;
  if (
    typeof tags !== "undefined" &&
    (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string"))
  ) {
    throw new Error(`Invalid frontmatter \"tags\" in ${slug}`);
  }

  const ogImage = data.ogImage;
  if (typeof ogImage !== "undefined" && typeof ogImage !== "string") {
    throw new Error(`Invalid frontmatter \"ogImage\" in ${slug}`);
  }

  const date = data.date as string;
  if (Number.isNaN(Date.parse(date))) {
    throw new Error(`Invalid frontmatter \"date\" in ${slug}`);
  }

  return {
    title: data.title as string,
    description: data.description as string,
    date,
    tags: tags as string[] | undefined,
    ogImage: ogImage as string | undefined,
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".mdx"))
    .filter((name) => !name.startsWith("_"))
    .map((name) => name.replace(/\.mdx$/, ""));
}

export function getAllPosts(): PostSummary[] {
  return getAllSlugs()
    .map((slug) => {
      const { frontmatter } = getPostBySlug(slug);
      return { slug, frontmatter };
    })
    .sort(
      (a, b) =>
        Date.parse(b.frontmatter.date) - Date.parse(a.frontmatter.date)
    );
}

export function getPostBySlug(slug: string): PostDetail {
  const filePath = getPostFilePath(slug);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Post not found: ${slug}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(raw);
  const frontmatter = assertFrontmatter(data, slug);

  return { slug, frontmatter, content };
}
