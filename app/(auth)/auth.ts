// Compatibility module for Supabase Auth
// Replaces old NextAuth module

export type UserType = "guest" | "regular";

export { createClient as getSupabaseClient } from "@/lib/supabase/server";

import { cache } from "react";
import { guestRegex } from "@/lib/constants";
import { ensureAppUserFromSupabase } from "@/lib/db/queries";
import { isSupabasePublicConfigured } from "@/lib/supabase/env";
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
  if (!isSupabasePublicConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const user = await getSafeUser(supabase);

  if (!user) {
    return null;
  }

  // Anonymous Supabase users have no email — synthesize a stable, digit-only
  // guest identifier (matches `guestRegex`) so they're treated as guests
  // throughout the app and can chat with the limited guest entitlement.
  const isAnonymous = user.is_anonymous === true || !user.email;
  const email =
    user.email && user.email.length > 0
      ? user.email
      : `guest-${user.id.replace(/\D/g, "").slice(0, 15) || Date.now().toString()}`;

  let appUser: Awaited<ReturnType<typeof ensureAppUserFromSupabase>>;
  try {
    appUser = await ensureAppUserFromSupabase({
      id: user.id,
      email,
      name: isAnonymous ? null : user.user_metadata?.name,
      image: isAnonymous
        ? null
        : (user.user_metadata?.avatar_url ?? user.user_metadata?.image),
    });
  } catch (error) {
    if (process.env.VERCEL_ENV !== "preview") {
      throw error;
    }

    const userType: UserType = guestRegex.test(email) ? "guest" : "regular";

    return {
      user: {
        id: user.id,
        email,
        name: isAnonymous ? undefined : user.user_metadata?.name,
        image: isAnonymous
          ? undefined
          : (user.user_metadata?.avatar_url ?? user.user_metadata?.image),
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
