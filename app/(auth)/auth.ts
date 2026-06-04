// Compatibility module for Supabase Auth
// Replaces old NextAuth module

export type UserType = "guest" | "regular";

export { createClient as getSupabaseClient } from "@/lib/supabase/server";

import { cache } from "react";
import { guestRegex } from "@/lib/constants";
import { ensureAppUserFromSupabase } from "@/lib/db/queries";
import { getSafeUser } from "@/lib/supabase/safe-session";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolve the current session for this request.
 *
 * Wrapped in React `cache()` so multiple consumers in the same render
 * (layout + page + nav + sub-components) all share a single Supabase
 * round trip + DB sync instead of duplicating them.
 */
export const auth = cache(async () => {
  const supabase = await createClient();
  const user = await getSafeUser(supabase);

  if (!user?.email) {
    return null;
  }

  let appUser: Awaited<ReturnType<typeof ensureAppUserFromSupabase>>;
  try {
    appUser = await ensureAppUserFromSupabase({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name,
      image: user.user_metadata?.avatar_url ?? user.user_metadata?.image,
    });
  } catch (error) {
    if (process.env.VERCEL_ENV !== "preview") {
      throw error;
    }

    const userType: UserType = guestRegex.test(user.email)
      ? "guest"
      : "regular";

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        image: user.user_metadata?.avatar_url ?? user.user_metadata?.image,
        type: userType,
      },
    };
  }

  if (appUser.disabled) {
    return null;
  }

  const userType: UserType = guestRegex.test(appUser.email)
    ? "guest"
    : "regular";

  return {
    user: {
      id: appUser.id,
      email: appUser.email,
      name: appUser.name ?? user.user_metadata?.name,
      image: appUser.image ?? user.user_metadata?.image,
      type: userType,
    },
  };
});
