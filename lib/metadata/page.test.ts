import { describe, expect, test } from "bun:test";
import { pageOpenGraph, pageTwitter } from "@/lib/metadata/page";
import { config } from "@/lib/site/config";
import { ogImagePaths } from "@/lib/site/routes";

describe("pageOpenGraph", () => {
	test("builds website metadata with defaults", () => {
		const openGraph = pageOpenGraph({
			title: config.site.name,
			description: config.site.homeDescription,
			path: "/",
			imagePath: ogImagePaths.home,
		});

		expect(openGraph).toEqual({
			title: config.site.name,
			description: config.site.homeDescription,
			url: `${config.site.prodOrigin}/`,
			siteName: config.site.name,
			locale: config.site.locale,
			type: "website",
			images: [{ url: ogImagePaths.home }],
		});
	});

	test("builds article metadata with optional fields", () => {
		const openGraph = pageOpenGraph({
			title: "Test article",
			description: "Test description",
			path: "/blog/test",
			imagePath: "/blog/test/opengraph-image",
			type: "article",
			publishedTime: "2026-01-01",
			modifiedTime: "2026-02-01",
			authors: [config.site.authorName],
			tags: ["nextjs"],
		});

		expect(openGraph).toEqual({
			title: "Test article",
			description: "Test description",
			url: `${config.site.prodOrigin}/blog/test`,
			siteName: config.site.name,
			locale: config.site.locale,
			type: "article",
			images: [{ url: "/blog/test/opengraph-image" }],
			publishedTime: "2026-01-01",
			modifiedTime: "2026-02-01",
			authors: [config.site.authorName],
			tags: ["nextjs"],
		});
	});

	test("omits modifiedTime when not provided", () => {
		const openGraph = pageOpenGraph({
			title: "Test article",
			description: "Test description",
			path: "/blog/test",
			imagePath: "/blog/test/opengraph-image",
			type: "article",
			publishedTime: "2026-01-01",
		});

		expect(openGraph.modifiedTime).toBeUndefined();
		expect(openGraph.publishedTime).toBe("2026-01-01");
	});
});

describe("pageTwitter", () => {
	test("builds summary_large_image metadata", () => {
		const twitter = pageTwitter(
			"Test title",
			"Test description",
			ogImagePaths.home,
		);

		expect(twitter).toEqual({
			card: "summary_large_image",
			title: "Test title",
			description: "Test description",
			images: [ogImagePaths.home],
		});
	});
});
