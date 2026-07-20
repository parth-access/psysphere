"use server";

import { db } from "@/server/db";
import { bookings } from "@/db/schema/marketing/bookings";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

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

export async function submitBooking(input: BookingInput) {
  try {
    const validated = bookingSchema.parse(input);

    const result = await db.insert(bookings).values({
      studentName: validated.studentName,
      parentName: validated.parentName,
      email: validated.email,
      phone: validated.phone,
      class: validated.classLevel,
      package: validated.packageType,
      duration: validated.duration,
      preferredDate: validated.preferredDate,
      preferredTime: validated.preferredTime,
      notes: validated.notes || null,
      price: validated.price,
      status: "pending_demo",
    }).returning({ id: bookings.id });

    // Mock Email Notification
    console.log(`[Email Mock] Parent Confirmation sent to: ${validated.email}`);
    console.log(`[Email Mock] Admin Notification sent for booking: ${result[0].id}`);

    return { success: true, bookingId: result[0].id };
  } catch (error) {
    console.error("Booking failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validation failed" };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
