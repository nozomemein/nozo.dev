import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";

const moduleId = "virtual:blog-posts";
const resolvedId = `\0${moduleId}`;

export function blogContent(): Plugin {
	const root = process.cwd();
	const blogDir = path.join(root, "content/blog");
	return {
		name: "blog-content",
		resolveId(id) {
			if (id === moduleId) return resolvedId;
		},
		load(id) {
			if (id !== resolvedId) return;
			execFileSync("bun", ["scripts/prepare-content.ts"], { cwd: root });
			return readFileSync(path.join(root, ".void/blog-posts.ts"), "utf8");
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
