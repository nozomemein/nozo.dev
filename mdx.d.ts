declare module "*.mdx" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType;
  export const frontmatter: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
  export default MDXComponent;
}
