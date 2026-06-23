import type { LinkPreview } from "@/lib/link/previews";

export const LINK_PREVIEW_SUCCESS_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const LINK_PREVIEW_FAILURE_TTL_MS = 60 * 60 * 1000;

function isWithinTtl(isoDate: string, ttlMs: number, now: number): boolean {
	const parsed = Date.parse(isoDate);
	if (Number.isNaN(parsed)) {
		return false;
	}

	return now - parsed < ttlMs;
}

export function shouldSkipLinkPreviewFetch(
	entry: LinkPreview | undefined,
	now = Date.now(),
): boolean {
	if (!entry) {
		return false;
	}

	if (
		entry.fetchedAt &&
		isWithinTtl(entry.fetchedAt, LINK_PREVIEW_SUCCESS_TTL_MS, now)
	) {
		return true;
	}

	if (
		!entry.fetchedAt &&
		entry.failedAt &&
		isWithinTtl(entry.failedAt, LINK_PREVIEW_FAILURE_TTL_MS, now)
	) {
		return true;
	}

	return false;
}

export function resolvePreviewImageUrl(image: string, pageUrl: string): string {
	try {
		return new URL(image, pageUrl).toString();
	} catch {
		return image;
	}
}
