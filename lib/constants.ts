import type { Metadata } from "next";

const SITE_NAME = "nozo.dev";
const SITE_DESCRIPTION = "技術メモと備忘録をまとめるブログ。";
const PROD_ORIGIN = "https://nozo.dev";
const AUTHOR_NAME = "Nozomi Hijikata";
const SITE_LOCALE = "ja_JP";

const HOME_DESCRIPTION =
	"Hello, I'm Nozomi Hijikata (nozomemein), a passionate software engineer.";
const BLOG_DESCRIPTION = "Thoughts, notes, and experiments.";

export const config = {
	site: {
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		prodOrigin: PROD_ORIGIN,
		authorName: AUTHOR_NAME,
		locale: SITE_LOCALE,
		homeDescription: HOME_DESCRIPTION,
		blogDescription: BLOG_DESCRIPTION,
	},
	ogImagePaths: {
		home: "/opengraph-image",
		blog: "/blog/opengraph-image",
	},
} as const;

type OpenGraphPageOptions = {
	title: string;
	description: string;
	path: string;
	imagePath: string;
	type?: "website" | "article";
	publishedTime?: string;
	modifiedTime?: string;
	authors?: string[];
	tags?: string[];
};

export function buildPageOpenGraph(
	options: OpenGraphPageOptions,
): NonNullable<Metadata["openGraph"]> {
	const {
		title,
		description,
		path,
		imagePath,
		type = "website",
		publishedTime,
		modifiedTime,
		authors,
		tags,
	} = options;

	return {
		title,
		description,
		url: `${config.site.prodOrigin}${path}`,
		siteName: config.site.name,
		locale: config.site.locale,
		type,
		images: [{ url: imagePath }],
		...(publishedTime && { publishedTime }),
		...(modifiedTime && { modifiedTime }),
		...(authors && { authors }),
		...(tags && { tags }),
	};
}

export function buildPageTwitter(
	title: string,
	description: string,
	imagePath: string,
): NonNullable<Metadata["twitter"]> {
	return {
		card: "summary_large_image",
		title,
		description,
		images: [imagePath],
	};
}
