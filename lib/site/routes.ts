export const ogImagePaths = {
	home: "/opengraph-image",
	blog: "/blog/opengraph-image",
} as const;

export function blogPostOgImagePath(slug: string): string {
	return `/blog/${slug}/opengraph-image`;
}
