import { describe, expect, test } from "bun:test";
import {
	staticAssetRules,
	staticOgImages,
} from "@/scripts/generate-static-assets";

describe("staticOgImages", () => {
	test("preserves all public OG image paths and per-page titles", () => {
		const images = staticOgImages(
			[
				{
					slug: "hello",
					frontmatter: {
						title: "こんにちは",
						description: "Test",
						date: "2026-02-04",
					},
				},
			],
			"プライバシーポリシー",
		);

		expect(images).toEqual([
			{ path: "/opengraph-image", title: "nozo.dev", footer: null },
			{ path: "/blog/opengraph-image", title: "Blog" },
			{
				path: "/privacy/opengraph-image",
				title: "プライバシーポリシー",
			},
			{ path: "/blog/hello/opengraph-image", title: "こんにちは" },
		]);
	});
});

describe("staticAssetRules", () => {
	test("rewrites extensionless image URLs and sets image and XML MIME types", () => {
		const rules = staticAssetRules([
			{ path: "/blog/hello/opengraph-image", title: "Hello" },
		]);

		expect(rules.redirects).toBe(
			"/blog/hello/opengraph-image /blog/hello/opengraph-image.png 200\n",
		);
		expect(rules.headers).toContain(
			"/blog/hello/opengraph-image\n  Content-Type: image/png",
		);
		expect(rules.headers).toContain(
			"/blog/hello/opengraph-image.png\n  Content-Type: image/png",
		);
		expect(rules.headers).toContain(
			"/feed.xml\n  Content-Type: application/rss+xml; charset=utf-8",
		);
		expect(rules.headers).toContain(
			"/sitemap.xml\n  Content-Type: application/xml; charset=utf-8",
		);
	});
});
