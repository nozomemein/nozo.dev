import { mkdir, writeFile } from "node:fs/promises";
import { blogManifestSource } from "@/lib/content/blog/manifest";
import { listBlogPostSummaries } from "@/lib/content/blog/mdx";
import { blogDir } from "@/lib/content/blog/paths";

await mkdir(".void", { recursive: true });
await writeFile(
	".void/blog-posts.ts",
	blogManifestSource(listBlogPostSummaries(), blogDir),
);
