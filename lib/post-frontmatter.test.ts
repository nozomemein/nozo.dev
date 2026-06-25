import { afterEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import {
	getBlogPostOgImagePath,
	getPostFrontmatterBySlug,
} from "@/lib/post-frontmatter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const tempFiles: string[] = [];

function writeTempPost(slug: string, frontmatter: string) {
	const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
	fs.writeFileSync(
		filePath,
		`---\n${frontmatter}\n---\n\nTemporary test post.\n`,
	);
	tempFiles.push(filePath);
}

afterEach(() => {
	for (const filePath of tempFiles) {
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	}
	tempFiles.length = 0;
});

describe("getPostFrontmatterBySlug", () => {
	test("reads frontmatter from a published post file", () => {
		const frontmatter = getPostFrontmatterBySlug("hello");

		expect(frontmatter?.title).toBe("個人ブログ立ち上げ");
		expect(frontmatter?.status).toBe("published");
		expect(frontmatter?.updatedAt).toBeUndefined();
	});

	test("returns null for unknown slugs", () => {
		expect(getPostFrontmatterBySlug("does-not-exist")).toBeNull();
	});

	test("reads optional updatedAt from a post file", () => {
		writeTempPost(
			"_test-updated-at",
			'title: "Updated post"\ndescription: "Test description"\ndate: "2026-01-01"\nupdatedAt: "2026-02-01"\nstatus: "published"',
		);

		const frontmatter = getPostFrontmatterBySlug("_test-updated-at");

		expect(frontmatter?.updatedAt).toBe("2026-02-01");
	});

	test("rejects invalid updatedAt in a post file", () => {
		writeTempPost(
			"_test-invalid-updated-at",
			'title: "Bad post"\ndescription: "Test description"\ndate: "2026-01-01"\nupdatedAt: "not-a-date"\nstatus: "draft"',
		);

		expect(() => getPostFrontmatterBySlug("_test-invalid-updated-at")).toThrow(
			'Invalid frontmatter "updatedAt"',
		);
	});
});

describe("getBlogPostOgImagePath", () => {
	test("returns the opengraph-image route path", () => {
		expect(getBlogPostOgImagePath("hello")).toBe("/blog/hello/opengraph-image");
	});
});
