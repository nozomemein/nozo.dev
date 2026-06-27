import {
	createOgImageResponse,
	ogImageContentType,
	ogImageSize,
} from "@/lib/og/image-response";
import { config } from "@/lib/seo/site";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const dynamic = "force-static";

export default async function OpenGraphImage() {
	return createOgImageResponse({
		title: config.site.name,
		footer: null,
	});
}
