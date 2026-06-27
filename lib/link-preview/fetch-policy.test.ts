import { describe, expect, test } from "bun:test";
import {
	failureTtlMs,
	resolveImageUrl,
	shouldSkipFetch,
	successTtlMs,
} from "@/lib/link-preview/fetch-policy";
import type { LinkPreview } from "@/lib/link-preview/types";

describe("shouldSkipFetch", () => {
	const now = Date.parse("2026-06-23T12:00:00.000Z");

	test("skips fresh successful previews", () => {
		const entry: LinkPreview = {
			title: "Example",
			fetchedAt: new Date(now - successTtlMs + 60_000).toISOString(),
		};

		expect(shouldSkipFetch(entry, now)).toBe(true);
	});

	test("refetches stale successful previews", () => {
		const entry: LinkPreview = {
			title: "Example",
			fetchedAt: new Date(now - successTtlMs - 60_000).toISOString(),
		};

		expect(shouldSkipFetch(entry, now)).toBe(false);
	});

	test("skips recent failures with a short TTL", () => {
		const entry: LinkPreview = {
			failedAt: new Date(now - failureTtlMs + 60_000).toISOString(),
		};

		expect(shouldSkipFetch(entry, now)).toBe(true);
	});

	test("retries stale failures", () => {
		const entry: LinkPreview = {
			failedAt: new Date(now - failureTtlMs - 60_000).toISOString(),
		};

		expect(shouldSkipFetch(entry, now)).toBe(false);
	});

	test("retries when there is no cache entry", () => {
		expect(shouldSkipFetch(undefined, now)).toBe(false);
	});
});

describe("resolveImageUrl", () => {
	test("resolves root-relative image URLs against the page URL", () => {
		expect(resolveImageUrl("/og.png", "https://example.com/blog/post")).toBe(
			"https://example.com/og.png",
		);
	});

	test("resolves path-relative image URLs against the page URL", () => {
		expect(
			resolveImageUrl("images/card.png", "https://example.com/blog/post"),
		).toBe("https://example.com/blog/images/card.png");
	});

	test("keeps absolute image URLs unchanged", () => {
		expect(
			resolveImageUrl(
				"https://cdn.example.com/card.png",
				"https://example.com/blog/post",
			),
		).toBe("https://cdn.example.com/card.png");
	});
});
