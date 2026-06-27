import type { Metadata } from "next";
import { config } from "@/lib/site/config";

export const rssFeedPath = "/feed.xml";

export function pageAlternates(
	canonical: string,
): NonNullable<Metadata["alternates"]> {
	return {
		canonical,
		types: {
			"application/rss+xml": rssFeedPath,
		},
	};
}

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

export function pageOpenGraph(
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

export function pageTwitter(
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
