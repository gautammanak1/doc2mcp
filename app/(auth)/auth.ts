// Compatibility module for Supabase Auth
// Replaces old NextAuth module

export type UserType = "guest" | "regular";

export { createClient as getSupabaseClient } from "@/lib/supabase/server";

import { guestRegex } from "@/lib/constants";
import { ensureAppUserFromSupabase } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

export async function auth() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return null;
  }

  const appUser = await ensureAppUserFromSupabase({
    id: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata?.name,
    image:
      session.user.user_metadata?.avatar_url ??
      session.user.user_metadata?.image,
  });

  const userType: UserType = guestRegex.test(appUser.email)
    ? "guest"
    : "regular";

  return {
    user: {
      id: appUser.id,
      email: appUser.email,
      name: appUser.name ?? session.user.user_metadata?.name,
      image: appUser.image ?? session.user.user_metadata?.image,
      type: userType,
    },
  };
}
