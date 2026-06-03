import { NextResponse } from "next/server";
import { z } from "zod";
import { getConfirmRedirectUrl } from "@/lib/auth/redirect-url";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  email: z.string().email(),
});

const inflight = new Map<string, number>();
const COOLDOWN_MS = 60_000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  const last = inflight.get(email);
  if (last && Date.now() - last < COOLDOWN_MS) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  inflight.set(email, Date.now());

  const supabase = await createClient();
  const emailRedirectTo = await getConfirmRedirectUrl("/chat");

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    const status = error.status === 429 ? 429 : 400;
    return NextResponse.json(
      { error: error.message ?? "failed_to_resend" },
      { status }
    );
  }

  return NextResponse.json({ ok: true });
}
