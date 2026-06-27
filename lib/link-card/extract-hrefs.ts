const LINK_CARD_TAG_RE = /<LinkCard\b([\s\S]*?)\/>/g;

function extractHrefFromJsxProps(props: string): string | undefined {
	const doubleQuoted = props.match(/\bhref\s*=\s*"([^"]+)"/);
	if (doubleQuoted?.[1]) {
		return doubleQuoted[1];
	}

	const singleQuoted = props.match(/\bhref\s*=\s*'([^']+)'/);
	if (singleQuoted?.[1]) {
		return singleQuoted[1];
	}

	return undefined;
}

export function extractLinkCardHrefs(content: string): string[] {
	const hrefs = new Set<string>();

	for (const match of content.matchAll(LINK_CARD_TAG_RE)) {
		const href = extractHrefFromJsxProps(match[1]);
		if (href) {
			hrefs.add(href);
		}
	}

	return [...hrefs];
}
