import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
	readStaticPage,
	staticAssetRules,
	staticOgImages,
	verifyPrerenderedPages,
} from "@/scripts/build-static";

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

let directory: string;

beforeEach(async () => {
	directory = await mkdtemp(path.join(os.tmpdir(), "portfolio-build-"));
});

afterEach(async () => {
	await rm(directory, { recursive: true, force: true });
});

async function writePage(route: string, errors: unknown = null, body = "Page") {
	const key = route === "/" ? "index" : route.slice(1);
	const data = { url: route, errors };
	await mkdir(path.dirname(path.join(directory, `${key}.html`)), {
		recursive: true,
	});
	await mkdir(path.dirname(path.join(directory, `_void/pages/${key}.json`)), {
		recursive: true,
	});
	await writeFile(
		path.join(directory, `${key}.html`),
		`<html><body><script id="__VOID_PAGE_DATA__" type="application/json">${JSON.stringify(data)}</script><main>${body}</main></body></html>`,
	);
	await writeFile(
		path.join(directory, `_void/pages/${key}.json`),
		JSON.stringify(data),
	);
}

describe("static prerender verification", () => {
	test("fails when a warned-about prerender did not produce HTML", async () => {
		await expect(readStaticPage(directory, "/blog/hello")).rejects.toThrow(
			"hello.html",
		);
	});

	test("fails when HTML exists but client navigation JSON is missing", async () => {
		await writeFile(path.join(directory, "index.html"), "<main>Home</main>");
		await expect(readStaticPage(directory, "/")).rejects.toThrow("index.json");
	});

	test("rejects prerender errors even when both output files exist", async () => {
		await writePage("/", { loader: "Failed" });
		await expect(readStaticPage(directory, "/")).rejects.toThrow(
			"Prerender failed",
		);
	});

	test("rejects an empty client-rendered shell", async () => {
		await writePage("/", null, "");
		await expect(readStaticPage(directory, "/")).rejects.toThrow(
			"Missing prerendered body",
		);
	});

	test("accepts the expected public pages and rejects an extra draft route", async () => {
		for (const route of ["/", "/blog", "/privacy", "/404", "/blog/hello"])
			await writePage(route);
		await verifyPrerenderedPages(directory, ["hello"]);
		await writePage("/blog/draft");
		await expect(verifyPrerenderedPages(directory, ["hello"])).rejects.toThrow(
			"Unexpected or missing static HTML routes",
		);
	});

	test("rejects an extra navigation payload even without an HTML page", async () => {
		for (const route of ["/", "/blog", "/privacy", "/404"])
			await writePage(route);
		await writeFile(path.join(directory, "_void/pages/draft.json"), "{}");
		await expect(verifyPrerenderedPages(directory, [])).rejects.toThrow(
			"Unexpected or missing navigation routes",
		);
	});
});
