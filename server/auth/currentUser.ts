import { createClient } from "@/src/domains/auth/server";
import { redirect } from "next/navigation";

/**
 * Returns the currently authenticated user's profile from Supabase.
 */
export const getCurrentUser = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Ensures the user is authenticated and returns their profile.
 * Redirects if they are not authenticated.
 */
export const requireCurrentUser = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
};
