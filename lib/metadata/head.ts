import type { HeadDescriptor } from "void";
import {
	pageAlternates,
	pageOpenGraph,
	pageTwitter,
} from "@/lib/metadata/page";
import { config } from "@/lib/site/config";

type PageOptions = Parameters<typeof pageOpenGraph>[0];

export function pageHead(options: PageOptions): HeadDescriptor {
	const graph = pageOpenGraph(options);
	const twitter = pageTwitter(
		options.title,
		options.description,
		options.imagePath,
	);
	const alternates = pageAlternates(options.path);
	const image = new URL(options.imagePath, config.site.prodOrigin).href;
	return {
		title:
			options.path === "/"
				? options.title
				: `${options.title} | ${config.site.name}`,
		meta: [
			{ name: "description", content: options.description },
			{ property: "og:title", content: graph.title },
			{ property: "og:description", content: graph.description },
			{ property: "og:url", content: graph.url },
			{ property: "og:site_name", content: graph.siteName },
			{ property: "og:locale", content: graph.locale },
			{ property: "og:type", content: graph.type },
			{ property: "og:image", content: image },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ name: "twitter:card", content: twitter.card },
			{ name: "twitter:title", content: twitter.title },
			{ name: "twitter:description", content: twitter.description },
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
			...(options.authors ?? []).map((author) => ({
				property: "article:author",
				content: author,
			})),
			...(options.tags ?? []).map((tag) => ({
				property: "article:tag",
				content: tag,
			})),
		],
		link: [
			{
				rel: "canonical",
				href: new URL(alternates.canonical, config.site.prodOrigin).href,
			},
			{
				rel: "alternate",
				type: "application/rss+xml",
				href: new URL(
					alternates.types["application/rss+xml"],
					config.site.prodOrigin,
				).href,
			},
		],
	};
}
