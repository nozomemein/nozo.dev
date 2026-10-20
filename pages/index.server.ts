import { pageHead } from "@/lib/metadata/head";
import { config } from "@/lib/site/config";
import { ogImagePaths } from "@/lib/site/routes";

export const head = () =>
	pageHead({
		title: config.site.name,
		description: config.site.homeDescription,
		path: "/",
		imagePath: ogImagePaths.home,
	});
