"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingSchema, BookingInput } from "@/server/actions/booking";
import { submitBooking } from "@/server/actions/booking";
import { pricing } from "@/constants/pricing";
import { Button } from "./Button";
import { H2, Body } from "./Typography";

const DATES = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
];

const TIMES = [
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
];

export function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultClass = searchParams.get("class") || "class11";
  const defaultPackage = searchParams.get("package") || "standard";
  const defaultDuration = searchParams.get("duration") || "11-std-monthly";
  const defaultPrice = Number(searchParams.get("price")) || 3000;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      studentName: "",
      parentName: "",
      email: "",
      phone: "",
      classLevel: defaultClass,
      packageType: defaultPackage,
      duration: defaultDuration,
      preferredDate: DATES[0].value,
      preferredTime: TIMES[0].value,
      notes: "",
      price: defaultPrice,
    },
  });

  const selectedClass = watch("classLevel");
  const selectedPackage = watch("packageType");
  const selectedDuration = watch("duration");

  const currentPricingTiers = pricing[selectedClass]?.[selectedPackage as "standard" | "cuet"] || [];
  const selectedTier = currentPricingTiers.find((t) => t.id === selectedDuration) || currentPricingTiers[0];

  useEffect(() => {
    if (selectedTier && selectedTier.price !== watch("price")) {
      setValue("price", selectedTier.price);
    }
  }, [selectedTier, setValue, watch]);

  const onSubmit = async (data: BookingInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await submitBooking(data);
      if (result.success) {
        router.push(`/book-demo/success?id=${result.bookingId}`);
      } else {
        setError(result.message || "Failed to submit booking");
      }
    } catch (e) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-brand-text mb-2">Student Name</label>
              <input
                id="studentName"
                {...register("studentName")}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-text/10 transition-shadow"
                placeholder="John Doe"
              />
              {errors.studentName && <p className="text-red-500 text-sm mt-1">{errors.studentName.message}</p>}
            </div>
            <div>
              <label htmlFor="parentName" className="block text-sm font-medium text-brand-text mb-2">Parent Name</label>
              <input
                id="parentName"
                {...register("parentName")}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-text/10 transition-shadow"
                placeholder="Jane Doe"
              />
              {errors.parentName && <p className="text-red-500 text-sm mt-1">{errors.parentName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-text mb-2">Email</label>
              <input
                id="email"
                {...register("email")}
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-text/10 transition-shadow"
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-text mb-2">Phone Number</label>
              <input
                id="phone"
                {...register("phone")}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-text/10 transition-shadow"
                placeholder="+91 98765 43210"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="classLevel" className="block text-sm font-medium text-brand-text mb-2">Class</label>
              <select
                id="classLevel"
                {...register("classLevel")}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-text/10 transition-shadow"
              >
                <option value="class11">Class XI</option>
                <option value="class12">Class XII</option>
              </select>
            </div>
            <div>
              <label htmlFor="packageType" className="block text-sm font-medium text-brand-text mb-2">Package</label>
              <select
                id="packageType"
                {...register("packageType")}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-text/10 transition-shadow"
              >
                <option value="standard">Standard</option>
                <option value="cuet">Standard + CUET</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-brand-text mb-2">Duration</label>
            <select
              id="duration"
              {...register("duration")}
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-text/10 transition-shadow"
            >
              {currentPricingTiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} - ₹{tier.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="preferredDate" className="block text-sm font-medium text-brand-text mb-2">Preferred Date</label>
              <select
                id="preferredDate"
                {...register("preferredDate")}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-text/10 transition-shadow"
              >
                {DATES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="preferredTime" className="block text-sm font-medium text-brand-text mb-2">Preferred Time Slot</label>
              <select
                id="preferredTime"
                {...register("preferredTime")}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-text/10 transition-shadow"
              >
                {TIMES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-brand-text mb-2">Additional Notes (Optional)</label>
            <textarea
              id="notes"
              {...register("notes")}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-text/10 transition-shadow resize-none"
              placeholder="Any specific topics you'd like to discuss?"
            />
          </div>

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm Booking"}
          </Button>
        </form>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-brand-charcoal text-white rounded-[32px] p-8 sticky top-32">
          <H2 className="text-white mb-6 text-2xl">Selected Plan</H2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-white/70">Class</span>
              <span className="font-semibold">{selectedClass === 'class11' ? 'Class XI' : 'Class XII'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-white/70">Package</span>
              <span className="font-semibold">{selectedPackage === 'standard' ? 'Standard' : 'Standard + CUET'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-white/70">Duration</span>
              <span className="font-semibold">{selectedTier?.name}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-white/70 text-lg">Total</span>
              <span className="font-serif text-3xl font-bold">₹{(selectedTier?.price || 0).toLocaleString()}</span>
            </div>
          </div>

          {selectedTier && (
            <div>
              <p className="text-white/70 mb-4 font-medium">Includes:</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent text-xs">✓</span>
                  <span className="text-sm">{selectedTier.classes} Live Classes</span>
                </li>
                {selectedTier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent text-xs">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
