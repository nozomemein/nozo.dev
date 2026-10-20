import type { HeadDescriptor } from "void";
import { config } from "@/lib/site/config";

type PageOptions = {
	title: string;
	description: string;
	path: string;
	imagePath: string;
	type?: "website" | "article";
	publishedTime?: string;
	modifiedTime?: string;
	author?: string;
	tags?: string[];
};

export function pageTitle(title: string) {
	return `${title} | ${config.site.name}`;
}

export function pageHead(options: PageOptions): HeadDescriptor {
	const url = new URL(options.path, config.site.prodOrigin).href;
	const image = new URL(options.imagePath, config.site.prodOrigin).href;
	const tag = options.tags?.[0];
	return {
		title: options.path === "/" ? options.title : pageTitle(options.title),
		meta: [
			{ name: "description", content: options.description },
			{ property: "og:title", content: options.title },
			{ property: "og:description", content: options.description },
			{ property: "og:url", content: url },
			{ property: "og:site_name", content: config.site.name },
			{ property: "og:locale", content: config.site.locale },
			{ property: "og:type", content: options.type ?? "website" },
			{ property: "og:image", content: image },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: options.title },
			{ name: "twitter:description", content: options.description },
			{ name: "twitter:image", content: image },
			...(options.publishedTime
				? [
						{
							property: "article:published_time",
							content: options.publishedTime,
						},
					]
				: []),
			...(options.modifiedTime
				? [{ property: "article:modified_time", content: options.modifiedTime }]
				: []),
			...(options.author
				? [{ property: "article:author", content: options.author }]
				: []),
			...(tag ? [{ property: "article:tag", content: tag }] : []),
		],
		link: [
			{
				rel: "canonical",
				href: url,
			},
			{
				rel: "alternate",
				type: "application/rss+xml",
				href: new URL("/feed.xml", config.site.prodOrigin).href,
			},
		],
	};
}
