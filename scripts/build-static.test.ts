import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
	readStaticPage,
	staticAssetRules,
	staticOgImages,
	verifyOgImage,
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
	test("rewrites extensionless images and overrides only the RSS MIME type", () => {
		const rules = staticAssetRules([
			{ path: "/blog/hello/opengraph-image", title: "Hello" },
		]);

		expect(rules.redirects).toBe(
			"/blog/hello/opengraph-image /blog/hello/opengraph-image.png 200\n",
		);
		expect(rules.headers).toBe(
			"/feed.xml\n  Content-Type: application/rss+xml; charset=utf-8\n",
		);
	});
});

let directory: string;

function pngHeader(width = 1200, height = 630) {
	const header = Buffer.alloc(24);
	Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(header);
	header.write("IHDR", 12, "ascii");
	header.writeUInt32BE(width, 16);
	header.writeUInt32BE(height, 20);
	return header;
}

beforeEach(async () => {
	directory = await mkdtemp(path.join(os.tmpdir(), "portfolio-build-"));
	await writeFile(path.join(directory, "opengraph-image.png"), pngHeader());
	await writeFile(
		path.join(directory, "_redirects"),
		"/opengraph-image /opengraph-image.png 200\n",
	);
});

afterEach(async () => {
	await rm(directory, { recursive: true, force: true });
});

async function writePage(
	route: string,
	errors: unknown = null,
	body = "Page",
	image = "/opengraph-image",
) {
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
		`<html><head><meta property="og:image" content="https://nozo.dev${image}"></head><body><script id="__VOID_PAGE_DATA__" type="application/json">${JSON.stringify(data)}</script><main>${body}</main></body></html>`,
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

	test("rejects an OG image URL that does not resolve to a generated file", async () => {
		for (const route of ["/", "/blog", "/privacy", "/404"])
			await writePage(route);
		await writePage("/", null, "Home", "/not-generated");
		await expect(verifyPrerenderedPages(directory, [])).rejects.toThrow(
			"not-generated",
		);
	});
});

describe("OG image output verification", () => {
	test("rejects HTML saved in place of a PNG", async () => {
		const image = path.join(directory, "opengraph-image.png");
		await writeFile(image, "<!doctype html><main>404</main>");
		await expect(verifyOgImage(image)).rejects.toThrow("Invalid PNG");
	});

	test("rejects a PNG with incorrect dimensions", async () => {
		const image = path.join(directory, "opengraph-image.png");
		await writeFile(image, pngHeader(600));
		await expect(verifyOgImage(image)).rejects.toThrow("Wrong PNG width");
		await writeFile(image, pngHeader(1200, 315));
		await expect(verifyOgImage(image)).rejects.toThrow("Wrong PNG height");
	});
});
