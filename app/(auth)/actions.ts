"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  APP_SESSION_COOKIE,
  appSessionCookieOptions,
  createAppSessionToken,
} from "@/lib/auth/app-session";
import { getConfirmRedirectUrl } from "@/lib/auth/redirect-url";
import { ensureAppUserFromSupabase } from "@/lib/db/queries";
import { isSupabasePublicConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
};

async function clearSupabaseAuthCookies() {
  const cookieStore = await cookies();
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      cookieStore.set(cookie.name, "", { path: "/", maxAge: 0 });
    }
  }
}

async function startAppSession(input: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  isAnonymous?: boolean;
}) {
  const appUser = await ensureAppUserFromSupabase({
    id: input.id,
    email: input.email,
    name: input.name,
    image: input.image,
  });
  const cookieStore = await cookies();
  const token = await createAppSessionToken({
    userId: appUser.id,
    email: appUser.email,
    type: input.isAnonymous ? "guest" : "regular",
  });
  cookieStore.set(APP_SESSION_COOKIE, token, appSessionCookieOptions());
  await clearSupabaseAuthCookies();
}

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    if (!isSupabasePublicConfigured()) {
      return { status: "failed" };
    }

    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      console.error("Login error:", error.message);
      return { status: "failed" };
    }

    if (!data.user?.email) {
      return { status: "failed" };
    }

    await startAppSession({
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name,
      image:
        data.user.user_metadata?.avatar_url ?? data.user.user_metadata?.image,
      isAnonymous: data.user.is_anonymous === true,
    });

    revalidatePath("/", "layout");
    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    console.error("Login exception:", error);
    return { status: "failed" };
  }
};

export type RegisterActionState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
};

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    if (!isSupabasePublicConfigured()) {
      return { status: "failed" };
    }

    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const supabase = await createClient();
    const emailRedirectTo = await getConfirmRedirectUrl("/chat");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo,
      },
    });

    if (signUpError) {
      const message = signUpError.message.toLowerCase();
      if (
        message.includes("already registered") ||
        message.includes("already exists")
      ) {
        return { status: "user_exists" };
      }
      console.error("Sign up error:", signUpError.message);
      return { status: "failed" };
    }

    if (data.session) {
      const sessionUser = data.session.user;
      if (sessionUser.email) {
        await startAppSession({
          id: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.user_metadata?.name,
          image:
            sessionUser.user_metadata?.avatar_url ??
            sessionUser.user_metadata?.image,
          isAnonymous: sessionUser.is_anonymous === true,
        });
      }
      revalidatePath("/", "layout");
      return { status: "success" };
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

    if (signInError) {
      console.error("Sign in after registration:", signInError.message);
      return { status: "failed" };
    }

    if (!signInData.user?.email) {
      return { status: "failed" };
    }

    await startAppSession({
      id: signInData.user.id,
      email: signInData.user.email,
      name: signInData.user.user_metadata?.name,
      image:
        signInData.user.user_metadata?.avatar_url ??
        signInData.user.user_metadata?.image,
      isAnonymous: signInData.user.is_anonymous === true,
    });

    revalidatePath("/", "layout");
    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    console.error("Register exception:", error);
    return { status: "failed" };
  }
};
