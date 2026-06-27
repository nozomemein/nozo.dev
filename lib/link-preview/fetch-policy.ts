import type { LinkPreview } from "@/lib/link-preview/types";

export const successTtlMs = 30 * 24 * 60 * 60 * 1000;
export const failureTtlMs = 60 * 60 * 1000;

function isWithinTtl(isoDate: string, ttlMs: number, now: number): boolean {
	const parsed = Date.parse(isoDate);
	if (Number.isNaN(parsed)) {
		return false;
	}

	return now - parsed < ttlMs;
}

export function shouldSkipFetch(
	entry: LinkPreview | undefined,
	now = Date.now(),
): boolean {
	if (!entry) {
		return false;
	}

	if (entry.fetchedAt && isWithinTtl(entry.fetchedAt, successTtlMs, now)) {
		return true;
	}

	if (
		!entry.fetchedAt &&
		entry.failedAt &&
		isWithinTtl(entry.failedAt, failureTtlMs, now)
	) {
		return true;
	}

	return false;
}

export function resolveImageUrl(image: string, pageUrl: string): string {
	try {
		return new URL(image, pageUrl).toString();
	} catch {
		return image;
	}
}
