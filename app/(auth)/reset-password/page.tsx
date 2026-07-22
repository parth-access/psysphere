"use client";

import * as React from "react";
import { createClient } from "@/src/domains/auth/client";
import { useRouter } from "next/navigation";
import { KeyRound, AlertCircle, CheckCircle, ArrowRight, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = React.useState<any>(() => createClient());

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [checkingSession, setCheckingSession] = React.useState(true);

  React.useEffect(() => {
    if (!supabase) return;

    // Supabase needs a brief moment to process the access_token in the hash fragment
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // If no session is found, we can wait a bit or listen for auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            if (session) {
              setCheckingSession(false);
            }
          });

          // Wait up to 3 seconds for hash fragment parsing
          const timer = setTimeout(() => {
            setCheckingSession(false);
            subscription.unsubscribe();
          }, 3000);

          return () => {
            clearTimeout(timer);
            subscription.unsubscribe();
          };
        } else {
          setCheckingSession(false);
        }
      } catch (err) {
        console.error("Session check error:", err);
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!supabase) {
      setError("Authentication client not initialized.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);

      // Sign out from the temporary session to force them to sign in with their new credentials
      await supabase.auth.signOut();

      setTimeout(() => {
        router.push("/sign-in?updated=true");
      }, 2500);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-brand-charcoal flex items-center justify-center text-white font-serif italic text-2xl rounded-xs">
            P
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-gray-900 tracking-tight">
          Secure Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Set your new access password to complete setup
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-[#E7E0D8] rounded-xs sm:px-10">
          {checkingSession ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-brand-charcoal animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Verifying your secure invitation link...</p>
            </div>
          ) : success ? (
            <div className="rounded-xs bg-green-50 p-6 border border-green-200 text-center space-y-3">
              <div className="flex justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-md font-serif font-semibold text-green-900">Password Set Successfully</h3>
              <p className="text-xs text-green-800">
                Your credentials have been updated. Redirecting you to the sign-in portal...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xs bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  New Password
                </label>
                <div className="mt-1 relative rounded-xs shadow-3xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#E7E0D8] rounded-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-charcoal focus:border-brand-charcoal disabled:opacity-50"
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-xs shadow-3xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#E7E0D8] rounded-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-charcoal focus:border-brand-charcoal disabled:opacity-50"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2.5 border border-transparent rounded-xs shadow-xs text-sm font-semibold text-white bg-brand-charcoal hover:bg-brand-charcoal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-charcoal disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    <>
                      Confirm Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
