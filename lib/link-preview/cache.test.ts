import { describe, expect, test } from "bun:test";
import {
	getCachedLinkPreview,
	loadLinkPreviewCache,
} from "@/lib/link-preview/cache";

describe("link previews", () => {
	test("loads the generated cache", () => {
		const cache = loadLinkPreviewCache();

		expect(typeof cache).toBe("object");
	});

	test("returns a preview for a cached URL", () => {
		const preview = getCachedLinkPreview(
			"https://github.com/flutter/packages/pull/9868",
		);

		expect(preview?.title).toContain("go_router");
		expect(preview?.siteName).toBe("GitHub");
		expect(preview?.fetchedAt).toBeTruthy();
	});

	test("returns undefined for unknown URLs", () => {
		expect(
			getCachedLinkPreview("https://example.com/not-cached"),
		).toBeUndefined();
	});
});
