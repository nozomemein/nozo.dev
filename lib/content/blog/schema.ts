export const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export type BlogFrontmatter = {
	title: string;
	description: string;
	date: string;
	updatedAt?: string;
	tags?: string[];
	status?: "draft" | "published";
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(
	record: Record<string, unknown>,
	field: string,
	slug: string,
): string {
	const value = record[field];
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new Error(`Missing required frontmatter "${field}" in ${slug}`);
	}

	return value;
}

function parseOptionalTags(value: unknown, slug: string): string[] | undefined {
	if (typeof value === "undefined") {
		return undefined;
	}

	if (!Array.isArray(value) || value.some((tag) => typeof tag !== "string")) {
		throw new Error(`Invalid frontmatter "tags" in ${slug}`);
	}

	return value;
}

function parseOptionalStatus(
	value: unknown,
	slug: string,
): "draft" | "published" | undefined {
	if (typeof value === "undefined") {
		return undefined;
	}

	if (value !== "draft" && value !== "published") {
		throw new Error(`Invalid frontmatter "status" in ${slug}`);
	}

	return value;
}

function parseIsoDateField(
	value: unknown,
	field: string,
	slug: string,
): string {
	if (typeof value !== "string" || !isoDatePattern.test(value)) {
		throw new Error(`Invalid frontmatter "${field}" in ${slug}`);
	}

	if (Number.isNaN(Date.parse(value))) {
		throw new Error(`Invalid frontmatter "${field}" in ${slug}`);
	}

	return value;
}

export function parseBlogFrontmatter(
	data: unknown,
	slug: string,
	options?: { missingFrontmatterError?: string },
): BlogFrontmatter {
	const missingError =
		options?.missingFrontmatterError ?? `Missing frontmatter export in ${slug}`;

	if (!isRecord(data)) {
		throw new Error(missingError);
	}

	const title = requireString(data, "title", slug);
	const description = requireString(data, "description", slug);
	const date = parseIsoDateField(data.date, "date", slug);
	const tags = parseOptionalTags(data.tags, slug);
	const status = parseOptionalStatus(data.status, slug);

	let updatedAt: string | undefined;
	if (typeof data.updatedAt !== "undefined") {
		updatedAt = parseIsoDateField(data.updatedAt, "updatedAt", slug);
		if (Date.parse(updatedAt) < Date.parse(date)) {
			throw new Error(
				`Invalid frontmatter "updatedAt" must be on or after "date" in ${slug}`,
			);
		}
	}

	return {
		title,
		description,
		date,
		updatedAt,
		tags,
		status,
	};
}

export function blogPostFreshnessDate(frontmatter: {
	date: string;
	updatedAt?: string;
}): string {
	return frontmatter.updatedAt ?? frontmatter.date;
}
