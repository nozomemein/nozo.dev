import { describe, expect, test } from "bun:test";
import { parseLinkPreviewCache } from "@/lib/link-preview/parse";

describe("parseLinkPreviewCache", () => {
	test("parses a valid cache object", () => {
		const cache = parseLinkPreviewCache({
			"https://example.com": {
				title: "Example",
				description: "Test",
				fetchedAt: "2026-01-01T00:00:00.000Z",
			},
		});

		expect(cache).toEqual({
			"https://example.com": {
				title: "Example",
				description: "Test",
				fetchedAt: "2026-01-01T00:00:00.000Z",
			},
		});
	});

	test("returns an empty object for non-object input", () => {
		expect(parseLinkPreviewCache(null)).toEqual({});
		expect(parseLinkPreviewCache([])).toEqual({});
		expect(parseLinkPreviewCache("invalid")).toEqual({});
	});

	test("skips entries with invalid field types", () => {
		const cache = parseLinkPreviewCache({
			"https://valid.example.com": {
				title: "Valid",
				fetchedAt: "2026-01-01T00:00:00.000Z",
			},
			"https://invalid.example.com": {
				title: 123,
			},
		});

		expect(cache).toEqual({
			"https://valid.example.com": {
				title: "Valid",
				fetchedAt: "2026-01-01T00:00:00.000Z",
			},
		});
	});
});
