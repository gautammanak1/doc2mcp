import type { Metadata } from "next";
import { Suspense } from "react";
import { DocPageFallback } from "@/components/docs/docs-shell";
import { DocPageLoader } from "@/components/docs/doc-page-loader";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export const metadata: Metadata = {
  title: "Docs — doc2mcp",
  description: "doc2mcp product documentation",
};

export default async function DocsPage({ params }: PageProps) {
  const { slug = [] } = await params;

  return (
    <Suspense fallback={<DocPageFallback />}>
      <DocPageLoader slug={slug} />
    </Suspense>
  );
}
