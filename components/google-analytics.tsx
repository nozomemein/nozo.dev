import { useRouter } from "@void/react";
import { useEffect } from "react";

export function GoogleAnalytics() {
	const url = useRouter().url.href;
	useEffect(() => {
		const analytics = window as Window & {
			gtag?: (
				event: string,
				name: string,
				options: Record<string, string>,
			) => void;
		};
		analytics.gtag?.("event", "page_view", {
			page_location: url,
			page_title: document.title,
		});
	}, [url]);
	return null;
}
