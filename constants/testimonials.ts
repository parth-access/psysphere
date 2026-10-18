/**
 * Real student quotes only, each with the student's (and a parent's) permission.
 * The testimonials section on the homepage stays hidden while this list is empty.
 */
export type Testimonial = {
  name: string;
  detail: string; // e.g. "Class 12, 2026 boards"
  quote: string;
};

export const TESTIMONIALS: Testimonial[] = [];

/** Path under /public to a real photo of Dravina, e.g. "/dravina.jpg". Null shows a placeholder. */
export const DRAVINA_PHOTO: string | null = null;
