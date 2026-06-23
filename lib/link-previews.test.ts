import { describe, expect, test } from "bun:test";
import { getLinkPreview, getLinkPreviewCache } from "@/lib/link-previews";

describe("link previews", () => {
	test("loads the generated cache", () => {
		const cache = getLinkPreviewCache();

		expect(typeof cache).toBe("object");
	});

	test("returns a preview for a cached URL", () => {
		const preview = getLinkPreview(
			"https://github.com/flutter/packages/pull/9868",
		);

		expect(preview?.title).toContain("go_router");
		expect(preview?.siteName).toBe("GitHub");
		expect(preview?.fetchedAt).toBeTruthy();
	});

	test("returns undefined for unknown URLs", () => {
		expect(getLinkPreview("https://example.com/not-cached")).toBeUndefined();
	});
});
