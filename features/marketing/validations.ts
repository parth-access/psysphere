import { z } from "zod";

export const bookingSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  parentName: z.string().min(1, "Parent name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  classLevel: z.string().min(1, "Class is required"),
  packageType: z.string().min(1, "Package is required"),
  duration: z.string().min(1, "Duration is required"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  notes: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
});

export type BookingInput = z.infer<typeof bookingSchema>;
