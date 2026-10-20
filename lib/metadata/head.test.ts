import { describe, expect, test } from "bun:test";
import { pageHead, pageTitle } from "@/lib/metadata/head";
import { config } from "@/lib/site/config";
import { head as notFoundHead } from "@/pages/404.server";

describe("pageHead", () => {
	test("keeps the home title and resolves crawler URLs against the production origin", () => {
		const head = pageHead({
			title: "nozo.dev",
			description: "Home",
			path: "/",
			imagePath: "/opengraph-image",
		});
		expect(head.title).toBe("nozo.dev");
		expect(head.link).toContainEqual({
			rel: "canonical",
			href: "https://nozo.dev/",
		});
		expect(head.link).toContainEqual({
			rel: "alternate",
			type: "application/rss+xml",
			href: "https://nozo.dev/feed.xml",
		});
		expect(head.meta).toContainEqual({
			property: "og:image",
			content: "https://nozo.dev/opengraph-image",
		});
		expect(head.meta).toContainEqual({
			property: "og:type",
			content: "website",
		});
		expect(head.meta).toContainEqual({
			name: "twitter:card",
			content: "summary_large_image",
		});
		expect(head.meta?.some((meta) => meta.property === "article:tag")).toBe(
			false,
		);
	});

	test("includes article dates and only the first tag for Void's head merge", () => {
		const head = pageHead({
			title: "記事",
			description: "説明",
			path: "/blog/example",
			imagePath: "/blog/example/opengraph-image",
			type: "article",
			publishedTime: "2026-01-01",
			modifiedTime: "2026-02-01",
			author: "Author",
			tags: ["react", "mdx"],
		});
		expect(head.title).toBe("記事 | nozo.dev");
		expect(head.meta).toContainEqual({
			property: "og:type",
			content: "article",
		});
		expect(head.meta).toContainEqual({
			property: "article:published_time",
			content: "2026-01-01",
		});
		expect(head.meta).toContainEqual({
			property: "article:modified_time",
			content: "2026-02-01",
		});
		expect(head.meta).toContainEqual({
			property: "article:author",
			content: "Author",
		});
		expect(
			head.meta?.filter((meta) => meta.property === "article:tag"),
		).toEqual([{ property: "article:tag", content: "react" }]);
	});

	test("uses the shared title format for the noindex 404 page", () => {
		expect(pageTitle("Blog")).toBe(`Blog | ${config.site.name}`);
		expect(notFoundHead()).toEqual({
			title: pageTitle("404"),
			meta: [{ name: "robots", content: "noindex" }],
		});
	});
});
