import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ className, ...props }) => (
      <a
        className={cn(
          "text-blue-600 underline underline-offset-4 hover:text-blue-700",
          className
        )}
        {...props}
      />
    ),
    h1: ({ className, ...props }) => (
      <h1
        className={cn("text-3xl font-semibold tracking-tight", className)}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <h2
        className={cn("mt-8 text-2xl font-semibold tracking-tight", className)}
        {...props}
      />
    ),
    pre: ({ className, ...props }) => (
      <pre
        className={cn(
          "my-6 overflow-x-auto rounded-md bg-neutral-900 p-4 text-neutral-100",
          className
        )}
        {...props}
      />
    ),
    code: ({ className, ...props }) => (
      <code
        className={cn(
          "rounded bg-neutral-100 px-1.5 py-0.5 text-sm text-neutral-800",
          className
        )}
        {...props}
      />
    ),
    ...components,
  };
}
