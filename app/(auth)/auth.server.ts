import { isSupabasePublicConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function getSession() {
  if (!isSupabasePublicConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  if (!isSupabasePublicConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function signOut() {
  if (!isSupabasePublicConfigured()) {
    return;
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
}
