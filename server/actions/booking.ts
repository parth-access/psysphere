"use server";

import { db } from "@/db";
import { admissions } from "@/db/schema/core/admissions";
import { z } from "zod";
import { bookingSchema, BookingInput } from "@/features/marketing/validations";
import { emailService } from "@/src/domains/email/service";

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

    const bookingId = result[0].id;

    // 1. Send Confirmation Email to Applicant (Parent/Student)
    try {
      await emailService.sendDemoRequestReceived(validated.email, {
        studentName: validated.studentName,
        classLevel: validated.classLevel,
        programType: validated.packageType,
        preferredDate: validated.preferredDate,
        preferredTime: validated.preferredTime
      });
    } catch (err) {
      console.error("⚠️ Failed to send applicant demo request confirmation email:", err);
    }

    // 2. Send Lead Notification to PsySphere Admin Email
    try {
      await emailService.sendNewLeadInternal({
        studentName: validated.studentName,
        parentName: validated.parentName,
        email: validated.email,
        phone: validated.phone,
        classLevel: validated.classLevel,
        programType: validated.packageType,
        preferredDate: validated.preferredDate,
        preferredTime: validated.preferredTime,
        notes: validated.notes || undefined
      });
    } catch (err) {
      console.error("⚠️ Failed to send internal new lead notification email:", err);
    }

    return { success: true, bookingId };
  } catch (error) {
    console.error("Booking failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validation failed" };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
