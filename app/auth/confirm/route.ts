import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function buildErrorUrl(params: {
  error: string;
  errorCode?: string;
  errorDescription?: string;
}) {
  const search = new URLSearchParams();
  search.set("error", params.error);
  const hash = new URLSearchParams();
  hash.set("error", params.error);
  if (params.errorCode) {
    hash.set("error_code", params.errorCode);
  }
  if (params.errorDescription) {
    hash.set("error_description", params.errorDescription);
  }
  return `/auth/error?${search.toString()}#${hash.toString()}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      redirect(next);
    }

    const message = error.message ?? "verification_failed";
    const code = /expired/i.test(message)
      ? "otp_expired"
      : "verification_failed";
    redirect(
      buildErrorUrl({
        error: message,
        errorCode: code,
        errorDescription: message,
      })
    );
  }

  redirect(
    buildErrorUrl({
      error: "Missing confirmation token",
      errorCode: "missing_token",
      errorDescription:
        "The email link did not include a confirmation token. Request a new one below.",
    })
  );
}
