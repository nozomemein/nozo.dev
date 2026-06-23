import { describe, expect, test } from "bun:test";
import {
	LINK_PREVIEW_FAILURE_TTL_MS,
	LINK_PREVIEW_SUCCESS_TTL_MS,
	resolvePreviewImageUrl,
	shouldSkipLinkPreviewFetch,
} from "@/lib/link/preview-utils";
import type { LinkPreview } from "@/lib/link/previews";

describe("shouldSkipLinkPreviewFetch", () => {
	const now = Date.parse("2026-06-23T12:00:00.000Z");

	test("skips fresh successful previews", () => {
		const entry: LinkPreview = {
			title: "Example",
			fetchedAt: new Date(
				now - LINK_PREVIEW_SUCCESS_TTL_MS + 60_000,
			).toISOString(),
		};

		expect(shouldSkipLinkPreviewFetch(entry, now)).toBe(true);
	});

	test("refetches stale successful previews", () => {
		const entry: LinkPreview = {
			title: "Example",
			fetchedAt: new Date(
				now - LINK_PREVIEW_SUCCESS_TTL_MS - 60_000,
			).toISOString(),
		};

		expect(shouldSkipLinkPreviewFetch(entry, now)).toBe(false);
	});

	test("skips recent failures with a short TTL", () => {
		const entry: LinkPreview = {
			failedAt: new Date(
				now - LINK_PREVIEW_FAILURE_TTL_MS + 60_000,
			).toISOString(),
		};

		expect(shouldSkipLinkPreviewFetch(entry, now)).toBe(true);
	});

	test("retries stale failures", () => {
		const entry: LinkPreview = {
			failedAt: new Date(
				now - LINK_PREVIEW_FAILURE_TTL_MS - 60_000,
			).toISOString(),
		};

		expect(shouldSkipLinkPreviewFetch(entry, now)).toBe(false);
	});

	test("retries when there is no cache entry", () => {
		expect(shouldSkipLinkPreviewFetch(undefined, now)).toBe(false);
	});
});

describe("resolvePreviewImageUrl", () => {
	test("resolves root-relative image URLs against the page URL", () => {
		expect(
			resolvePreviewImageUrl("/og.png", "https://example.com/blog/post"),
		).toBe("https://example.com/og.png");
	});

	test("resolves path-relative image URLs against the page URL", () => {
		expect(
			resolvePreviewImageUrl(
				"images/card.png",
				"https://example.com/blog/post",
			),
		).toBe("https://example.com/blog/images/card.png");
	});

	test("keeps absolute image URLs unchanged", () => {
		expect(
			resolvePreviewImageUrl(
				"https://cdn.example.com/card.png",
				"https://example.com/blog/post",
			),
		).toBe("https://cdn.example.com/card.png");
	});
});
