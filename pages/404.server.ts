import { pageTitle } from "@/lib/metadata/head";

export const head = () => ({
	title: pageTitle("404"),
	meta: [{ name: "robots", content: "noindex" }],
});
