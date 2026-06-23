import { config } from "@/lib/constants";
import {
	createOgImageResponse,
	ogImageContentType,
	ogImageSize,
} from "@/lib/og/image-response";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const dynamic = "force-static";

export default async function OpenGraphImage() {
	return createOgImageResponse({
		title: config.site.name,
		footer: null,
	});
}
