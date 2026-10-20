import { describe, expect, test } from "bun:test";
import { pageHead } from "@/lib/metadata/head";

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
	});

	test("applies the title suffix and includes article dates and repeated tags", () => {
		const head = pageHead({
			title: "記事",
			description: "説明",
			path: "/blog/example",
			imagePath: "/blog/example/opengraph-image",
			type: "article",
			publishedTime: "2026-01-01",
			modifiedTime: "2026-02-01",
			authors: ["Author"],
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
		expect(
			head.meta?.filter((meta) => meta.property === "article:tag"),
		).toEqual([
			{ property: "article:tag", content: "react" },
			{ property: "article:tag", content: "mdx" },
		]);
	});
});
