"use server";

import { db } from "@/db";
import { admissions } from "@/db/schema/core/admissions";
import { z } from "zod";
import { bookingSchema, BookingInput } from "@/features/marketing/validations";

export async function submitBooking(input: BookingInput) {
  try {
    const validated = bookingSchema.parse(input);

    const result = await db.insert(admissions).values({
      studentName: validated.studentName,
      parentName: validated.parentName,
      email: validated.email,
      phone: validated.phone,
      class: validated.classLevel,
      program: validated.packageType,
      package: validated.packageType,
      duration: validated.duration,
      preferredDate: validated.preferredDate,
      preferredTime: validated.preferredTime,
      notes: validated.notes || null,
      price: validated.price,
      status: "LEAD",
    }).returning({ id: admissions.id });

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
