import { pricing, type PricingTier } from "@/constants/pricing";

export type ClassLevel = "class_11" | "class_12";
export type Track = "standard" | "cuet";

const PRICING_KEY: Record<ClassLevel, keyof typeof pricing> = {
  class_11: "class11",
  class_12: "class12",
};

export const CLASS_LABEL: Record<ClassLevel, string> = {
  class_11: "Class 11",
  class_12: "Class 12",
};

export const TRACK_LABEL: Record<Track, string> = {
  standard: "Boards",
  cuet: "Boards + CUET",
};

/** Every plan offered for a class and track. */
export function getPlans(classLevel: ClassLevel, track: Track): PricingTier[] {
  const course = pricing[PRICING_KEY[classLevel]];
  return (track === "cuet" ? course?.cuet : course?.standard) ?? [];
}

/**
 * Look up a plan on the server. The price always comes from here,
 * never from the browser.
 */
export function findPlan(classLevel: ClassLevel, track: Track, planId: string) {
  const plan = getPlans(classLevel, track).find((p) => p.id === planId);
  if (!plan) return null;
  return {
    id: plan.id,
    name: `${CLASS_LABEL[classLevel]} · ${TRACK_LABEL[track]} · ${plan.name}`,
    amountInr: plan.price,
    classes: plan.classes,
  };
}
