import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readStaticPage, verifyOgImage } from "@/scripts/finalize-static-build";

let directory: string;

beforeEach(async () => {
	directory = await mkdtemp(path.join(os.tmpdir(), "portfolio-build-"));
});

afterEach(async () => {
	await rm(directory, { recursive: true, force: true });
});

describe("readStaticPage", () => {
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
		await mkdir(path.join(directory, "_void/pages"), { recursive: true });
		await writeFile(path.join(directory, "index.html"), "<main>Home</main>");
		await writeFile(
			path.join(directory, "_void/pages/index.json"),
			JSON.stringify({ url: "/", errors: { loader: "Failed" } }),
		);
		await expect(readStaticPage(directory, "/")).rejects.toThrow(
			"Prerender failed",
		);
	});

	test("rejects an empty client-rendered shell", async () => {
		const data = { url: "/", errors: null };
		await mkdir(path.join(directory, "_void/pages"), { recursive: true });
		await writeFile(
			path.join(directory, "index.html"),
			`<html lang="ja"><body><script id="__VOID_PAGE_DATA__" type="application/json">${JSON.stringify(data)}</script><div id="app"></div></body></html>`,
		);
		await writeFile(
			path.join(directory, "_void/pages/index.json"),
			JSON.stringify(data),
		);
		await expect(readStaticPage(directory, "/")).rejects.toThrow(
			"Missing prerendered body",
		);
	});
});

describe("verifyOgImage", () => {
	test("rejects HTML accidentally served or saved as an OG image", async () => {
		const image = path.join(directory, "opengraph-image.png");
		await writeFile(image, "<!doctype html><html><body>404</body></html>");
		await expect(verifyOgImage(image)).rejects.toThrow("Invalid PNG");
	});

	test("rejects a PNG header with incorrect dimensions", async () => {
		const image = path.join(directory, "opengraph-image.png");
		const header = Buffer.alloc(24);
		Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(header);
		header.write("IHDR", 12, "ascii");
		header.writeUInt32BE(600, 16);
		header.writeUInt32BE(630, 20);
		await writeFile(image, header);
		await expect(verifyOgImage(image)).rejects.toThrow("Wrong PNG width");
	});
});
