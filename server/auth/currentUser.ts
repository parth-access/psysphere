import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Returns the currently authenticated user's profile from Clerk.
 */
export const getCurrentUser = async () => {
  return await currentUser();
};

/**
 * Ensures the user is authenticated and returns their profile.
 * Redirects if they are not authenticated.
 */
export const requireCurrentUser = async () => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
};
