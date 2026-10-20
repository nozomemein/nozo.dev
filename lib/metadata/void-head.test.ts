import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";

const { i: resolveHead, n: renderHeadToString } = await import(
	new URL("../../node_modules/void/dist/head-D2VF4ApL.mjs", import.meta.url)
		.href
);

describe("patched Void head resolution", () => {
	test("preserves repeated page tags while replacing earlier head layers", () => {
		const head = resolveHead(
			{
				meta: [
					{ name: "description", content: "Default" },
					{ property: "article:tag", content: "Default tag" },
				],
			},
			undefined,
			{
				meta: [
					{ name: "description", content: "Page" },
					{ property: "article:tag", content: "react" },
					{ property: "article:tag", content: "mdx" },
				],
			},
		);
		const $ = cheerio.load(renderHeadToString(head));
		expect($("meta[name=description]").attr("content")).toBe("Page");
		expect(
			$("meta[property='article:tag']")
				.toArray()
				.map((element) => $(element).attr("content")),
		).toEqual(["react", "mdx"]);
	});
});
