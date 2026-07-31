"use server";

import { requireRole } from "@/server/authorization/requireRole";
import { disconnectGoogle } from "@/server/integrations/google";
import { revalidatePath } from "next/cache";

export async function disconnectGoogleAction() {
  // Disconnect is restricted strictly to Admins
  await requireRole(["admin"]);
  await disconnectGoogle();
  revalidatePath("/dashboard/settings");
}
