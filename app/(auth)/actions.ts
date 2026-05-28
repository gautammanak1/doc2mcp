"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDoc2McpBaseUrl } from "@/lib/doc2mcp/app-url";
import { createClient } from "@/lib/supabase/server";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
};

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      console.error("Login error:", error.message);
      return { status: "failed" };
    }

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
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const supabase = await createClient();
    const baseUrl = getDoc2McpBaseUrl();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${baseUrl}/auth/confirm?next=${encodeURIComponent("/chat")}`,
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
      revalidatePath("/", "layout");
      return { status: "success" };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (signInError) {
      console.error("Sign in after registration:", signInError.message);
      return { status: "failed" };
    }

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
