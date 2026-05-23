import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { auth } from "@/app/(auth)/auth";
import { ConvertExperience } from "@/features/doc2mcp/convert-experience";
import { getPlatformProjectById } from "@/lib/db/queries";
import { notFound, redirect } from "next/navigation";

async function ConvertLoader({ id }: { id: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/api/auth/guest?redirectUrl=${encodeURIComponent(`/convert/${id}`)}`);
  }

  if (session.user.type === "guest") {
    redirect(`/login?redirectUrl=${encodeURIComponent(`/convert/${id}`)}`);
  }

  const project = await getPlatformProjectById({
    id,
    userId: session.user.id,
  });

  if (!project) {
    notFound();
  }

  return <ConvertExperience initialProject={project} />;
}

function ConvertFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <p className="font-mono text-xs">loading conversion…</p>
      </div>
    </div>
  );
}

export default async function ConvertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<ConvertFallback />}>
      <ConvertLoader id={id} />
    </Suspense>
  );
}
