import { defineConfig } from "void/config";
import { config } from "./lib/site/config";

export default defineConfig({
	output: "static",
	cloudflare: {
		name: "nozodev",
		compatibility_date: "2026-01-31",
		assets: {
			directory: "./out",
			not_found_handling: "404-page",
			html_handling: "auto-trailing-slash",
		},
		env: {
			preview: { vars: { DEPLOY_ENV: "preview" } },
			production: {
				name: "nozodev",
				vars: { DEPLOY_ENV: "production" },
			},
		},
	},
	head: {
		title: config.site.name,
		htmlAttrs: { lang: "ja" },
		meta: [
			{ charset: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "description", content: config.site.description },
			{ name: "robots", content: "index, follow" },
		],
		script: [
			{
				src: "https://www.googletagmanager.com/gtag/js?id=G-BVCVM7BMVH",
				async: "",
			},
			{
				innerHTML:
					"window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-BVCVM7BMVH', {send_page_view: false});",
			},
		],
	},
});
