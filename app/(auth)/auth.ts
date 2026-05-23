// Compatibility module for Supabase Auth
// Replaces old NextAuth module

import { createClient } from "@/lib/supabase/server";

export type UserType = "guest" | "regular";

export async function auth() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.name,
      image: session.user.user_metadata?.image,
      type: "regular" as UserType,
    },
  };
}

export { createClient as getSupabaseClient };
