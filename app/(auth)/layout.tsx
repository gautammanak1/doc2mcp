import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Doc2McpLogo } from "@/components/doc2mcp/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(66,133,244,0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(138,180,248,0.12),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(66,133,244,0.08),transparent_45%)]"
      />

      <div className="relative w-full max-w-md">
        <Link
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          href="/"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to doc2mcp
        </Link>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="h-1 bg-gradient-to-r from-[#4285f4] via-[#8ab4f8] to-[#34a853] dark:from-[#8ab4f8] dark:via-[#4285f4] dark:to-[#34a853]" />
          <div className="p-6 sm:p-8">
            <Link className="mb-6 inline-flex" href="/">
              <Doc2McpLogo size={32} />
            </Link>
            {children}
          </div>
        </div>

        <p className="mt-6 text-center text-muted-foreground text-xs leading-relaxed">
          By continuing you agree to our{" "}
          <Link
            className="underline underline-offset-2 hover:text-foreground"
            href="/terms-and-conditions"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            className="underline underline-offset-2 hover:text-foreground"
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
