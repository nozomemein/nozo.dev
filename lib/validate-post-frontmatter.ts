export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type PostFrontmatterFields = {
	title: string;
	description: string;
	date: string;
	updatedAt?: string;
	tags?: string[];
	status?: "draft" | "published";
};

const REQUIRED_FIELDS: Array<"title" | "description" | "date"> = [
	"title",
	"description",
	"date",
];

function parseIsoDateField(
	value: unknown,
	field: string,
	slug: string,
): string {
	if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) {
		throw new Error(`Invalid frontmatter "${field}" in ${slug}`);
	}

	if (Number.isNaN(Date.parse(value))) {
		throw new Error(`Invalid frontmatter "${field}" in ${slug}`);
	}

	return value;
}

export function validatePostFrontmatterFields(
	data: unknown,
	slug: string,
	options?: { missingFrontmatterError?: string },
): PostFrontmatterFields {
	const missingError =
		options?.missingFrontmatterError ?? `Missing frontmatter export in ${slug}`;

	if (!data || typeof data !== "object") {
		throw new Error(missingError);
	}

	const frontmatter = data as Record<string, unknown>;

	for (const field of REQUIRED_FIELDS) {
		const value = frontmatter[field];
		if (typeof value !== "string" || value.trim().length === 0) {
			throw new Error(`Missing required frontmatter "${field}" in ${slug}`);
		}
	}

	const tags = frontmatter.tags;
	if (
		typeof tags !== "undefined" &&
		(!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string"))
	) {
		throw new Error(`Invalid frontmatter "tags" in ${slug}`);
	}

	const status = frontmatter.status;
	if (
		typeof status !== "undefined" &&
		status !== "draft" &&
		status !== "published"
	) {
		throw new Error(`Invalid frontmatter "status" in ${slug}`);
	}

	const date = parseIsoDateField(frontmatter.date, "date", slug);

	const updatedAtRaw = frontmatter.updatedAt;
	let updatedAt: string | undefined;
	if (typeof updatedAtRaw !== "undefined") {
		updatedAt = parseIsoDateField(updatedAtRaw, "updatedAt", slug);
		if (Date.parse(updatedAt) < Date.parse(date)) {
			throw new Error(
				`Invalid frontmatter "updatedAt" must be on or after "date" in ${slug}`,
			);
		}
	}

	return {
		title: frontmatter.title as string,
		description: frontmatter.description as string,
		date,
		updatedAt,
		tags: tags as string[] | undefined,
		status: status as "draft" | "published" | undefined,
	};
}

export function getPostFreshnessDate(frontmatter: {
	date: string;
	updatedAt?: string;
}): string {
	return frontmatter.updatedAt ?? frontmatter.date;
}
