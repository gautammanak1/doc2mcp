import { notFound } from "next/navigation";
import { DocContent } from "@/components/docs/doc-content";
import { getDocPage } from "@/lib/docs/loader";

export async function DocPageLoader({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const page = await getDocPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div>
      <h1 className="font-display font-semibold text-3xl tracking-tight">
        {page.title}
      </h1>
      {page.description ? (
        <p className="mt-2 text-muted-foreground">{page.description}</p>
      ) : null}
      <div className="mt-8">
        <DocContent content={page.content} />
      </div>
    </div>
  );
}
