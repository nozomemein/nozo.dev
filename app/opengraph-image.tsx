import { contentType, createOgImage, size } from "@/lib/og-image/response";
import { config } from "@/lib/site/config";

export { contentType, size };
export const dynamic = "force-static";

export default async function OpenGraphImage() {
	return createOgImage({
		title: config.site.name,
		footer: null,
	});
}
