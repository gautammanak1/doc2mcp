import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { SparklesIcon } from "@/components/chat/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          className="mb-8 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          href="/"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to doc2mcp
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground ring-1 ring-border/50">
              <SparklesIcon size={14} />
            </div>
            {children}
          </div>
        </div>

        <p className="mt-6 text-center text-muted-foreground text-xs">
          By continuing you agree to our{" "}
          <Link
            className="underline hover:text-foreground"
            href="/terms-and-conditions"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            className="underline hover:text-foreground"
            href="/privacy-policy"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
