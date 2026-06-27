import type { LinkPreview, LinkPreviewCache } from "@/lib/link-preview/types";

const PREVIEW_FIELDS = [
	"title",
	"description",
	"image",
	"siteName",
	"fetchedAt",
	"failedAt",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLinkPreview(value: unknown): value is LinkPreview {
	if (!isRecord(value)) {
		return false;
	}

	for (const field of PREVIEW_FIELDS) {
		const fieldValue = value[field];
		if (fieldValue !== undefined && typeof fieldValue !== "string") {
			return false;
		}
	}

	return true;
}

export function parseLinkPreviewCache(value: unknown): LinkPreviewCache {
	if (!isRecord(value)) {
		return {};
	}

	const cache: LinkPreviewCache = {};
	for (const [url, entry] of Object.entries(value)) {
		if (isLinkPreview(entry)) {
			cache[url] = entry;
		}
	}

	return cache;
}
