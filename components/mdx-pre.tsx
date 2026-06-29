"use client";

import { Check, Copy } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MdxPre({
	className,
	children,
	...props
}: ComponentPropsWithoutRef<"pre">) {
	const preRef = useRef<HTMLPreElement>(null);
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		const text = preRef.current?.textContent ?? "";
		if (!text) {
			return;
		}

		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	}

	return (
		<div className="group relative my-6">
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="absolute top-2 right-2 z-10 size-8 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
				onClick={handleCopy}
				aria-label={copied ? "Copied" : "Copy code"}
			>
				{copied ? (
					<Check className="size-4" aria-hidden="true" />
				) : (
					<Copy className="size-4" aria-hidden="true" />
				)}
			</Button>
			<pre
				ref={preRef}
				className={cn(
					"overflow-x-auto rounded-md border bg-muted p-4 text-sm",
					className,
				)}
				{...props}
			>
				{children}
			</pre>
		</div>
	);
}
