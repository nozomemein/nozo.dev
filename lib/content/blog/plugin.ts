import type { Plugin } from "vite-plus";
import { blogManifestSource } from "./manifest";
import { listBlogPostSummaries } from "./mdx";
import { blogDir } from "./paths";

const moduleId = "virtual:blog-posts";
const resolvedId = `\0${moduleId}`;

export function blogContent(): Plugin {
	return {
		name: "blog-content",
		resolveId(id) {
			if (id === moduleId) return resolvedId;
		},
		load(id) {
			if (id !== resolvedId) return;
			return blogManifestSource(listBlogPostSummaries(), blogDir);
		},
		configureServer(server) {
			server.watcher.add(blogDir);
		},
		hotUpdate({ file, modules }) {
			if (!file.startsWith(`${blogDir}/`) || !file.endsWith(".mdx")) return;
			const module = this.environment.moduleGraph.getModuleById(resolvedId);
			if (!module) return;
			this.environment.moduleGraph.invalidateModule(module);
			return [...modules, module];
		},
	};
}
