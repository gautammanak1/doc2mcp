import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign up",
};

/** Legacy /register URLs funnel to the single Google sign-in page. */
export default function RegisterPage() {
  redirect("/login");
}
