import { describe, expect, test } from "bun:test";
import cache from "@/content/generated/link-previews.json";
import { getCachedLinkPreview } from "@/lib/link-preview/previews";

describe("bundled link previews", () => {
	test("reads an existing preview without filesystem access", () => {
		const [url, expected] = Object.entries(cache)[0];
		expect(getCachedLinkPreview(url)).toEqual(expected);
	});
	test("falls back when no cached preview exists", () => {
		expect(
			getCachedLinkPreview("https://example.invalid/uncached"),
		).toBeUndefined();
	});
});
