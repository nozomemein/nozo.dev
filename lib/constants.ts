const SITE_NAME = "nozo.dev";
const SITE_DESCRIPTION = "技術メモと備忘録をまとめるブログ。";
const PROD_ORIGIN = "https://nozo.dev";

export const config = {
	site: {
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		prodOrigin: PROD_ORIGIN,
	},
} as const;
