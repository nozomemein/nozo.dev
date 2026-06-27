import { describe, expect, test } from "bun:test";
import { extractLinkCardHrefs } from "@/lib/link-card/extract-hrefs";

describe("extractLinkCardHrefs", () => {
	test("extracts href from the minimal self-closing form", () => {
		expect(
			extractLinkCardHrefs('<LinkCard href="https://example.com/page" />'),
		).toEqual(["https://example.com/page"]);
	});

	test("extracts href when className is present", () => {
		expect(
			extractLinkCardHrefs(
				'<LinkCard className="my-4" href="https://example.com/page" />',
			),
		).toEqual(["https://example.com/page"]);
	});

	test("extracts href when props are reordered", () => {
		expect(
			extractLinkCardHrefs(
				'<LinkCard href="https://example.com/page" className="my-4" />',
			),
		).toEqual(["https://example.com/page"]);
	});

	test("extracts href from single-quoted attributes", () => {
		expect(
			extractLinkCardHrefs("<LinkCard href='https://example.com/page' />"),
		).toEqual(["https://example.com/page"]);
	});

	test("extracts href from multiline JSX", () => {
		expect(
			extractLinkCardHrefs(`<LinkCard
  className="my-4"
  href="https://example.com/page"
/>`),
		).toEqual(["https://example.com/page"]);
	});

	test("deduplicates repeated hrefs", () => {
		expect(
			extractLinkCardHrefs(`
<LinkCard href="https://example.com/page" />
<LinkCard href="https://example.com/page" className="mt-2" />
`),
		).toEqual(["https://example.com/page"]);
	});

	test("ignores LinkCard tags without href", () => {
		expect(extractLinkCardHrefs('<LinkCard className="my-4" />')).toEqual([]);
	});
});
