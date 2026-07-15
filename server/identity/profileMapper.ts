import type { UserJSON } from "@clerk/nextjs/server";
import type { profiles } from "../../db/schema/core/profiles";
import { type InferInsertModel } from "drizzle-orm";
import { DEFAULT_ROLE } from "../../constants/auth";

type ProfileInsert = InferInsertModel<typeof profiles>;

export const mapClerkUserToProfile = (user: UserJSON): ProfileInsert => {
  const primaryEmail = user.email_addresses.find(
    (email) => email.id === user.primary_email_address_id
  )?.email_address || user.email_addresses[0]?.email_address || "";

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || "Unknown User";

  return {
    clerkId: user.id,
    email: primaryEmail,
    fullName: fullName,
    avatarUrl: user.image_url,
    role: DEFAULT_ROLE,
    isActive: true,
  };
};
