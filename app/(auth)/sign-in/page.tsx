"use client";

import * as React from "react";
import { useActionState } from "react";
import { signInAction } from "@/src/domains/auth/actions";
import { KeyRound, Mail, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInAction, null);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-brand-charcoal flex items-center justify-center text-white font-serif italic text-2xl rounded-xs">
            P
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-gray-900 tracking-tight">
          Welcome to PsySphere
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Sign in to access your dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-[#E7E0D8] rounded-xs sm:px-10">
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="rounded-xs bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-red-800">{state.error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1 relative rounded-xs shadow-3xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isPending}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#E7E0D8] rounded-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-charcoal focus:border-brand-charcoal disabled:opacity-50"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="mt-1 relative rounded-xs shadow-3xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isPending}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#E7E0D8] rounded-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-charcoal focus:border-brand-charcoal disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 border border-transparent rounded-xs shadow-xs text-sm font-semibold text-white bg-brand-charcoal hover:bg-brand-charcoal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-charcoal disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-[#E7E0D8] pt-6 text-center">
            <p className="text-xs text-gray-500">
              Need account assistance? Please contact your Admissions Representative.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
