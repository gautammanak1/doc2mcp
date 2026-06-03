import { notFound } from "next/navigation";
import { DocBreadcrumbs } from "@/components/docs/doc-breadcrumbs";
import { DocContent } from "@/components/docs/doc-content";
import { DocPager } from "@/components/docs/doc-pager";
import { DocToc } from "@/components/docs/doc-toc";
import { DocsHome } from "@/components/docs/docs-home";
import { getDocNav, getDocPage } from "@/lib/docs/loader";

export async function DocPageLoader({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;

  if (slug.length === 0) {
    return <DocsHome />;
  }

  const page = await getDocPage(slug);

  if (!page) {
    notFound();
  }

  const nav = await getDocNav();
  const href = `/docs/${slug.join("/")}`;
  const index = nav.findIndex((item) => item.href === href);
  const prev = index > 0 ? nav[index - 1] : null;
  const next = index >= 0 && index < nav.length - 1 ? nav[index + 1] : null;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-10">
      <div className="min-w-0">
        <DocBreadcrumbs category={page.category} title={page.title} />
        <h1 className="mt-4 font-display font-semibold text-3xl tracking-tight">
          {page.title}
        </h1>
        {page.description ? (
          <p className="mt-2 text-lg text-muted-foreground">
            {page.description}
          </p>
        ) : null}
        <div className="mt-8">
          <DocContent content={page.content} />
        </div>
        <DocPager next={next} prev={prev} />
      </div>
      <aside className="hidden lg:block">
        <div className="sticky top-[88px]">
          <DocToc />
        </div>
      </aside>
    </div>
  );
}
