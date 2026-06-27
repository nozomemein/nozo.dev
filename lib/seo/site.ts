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
