"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  ArrowLeft,
  Sparkles,
  Shield,
  Code2,
} from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    async function verifyEmail() {
      if (!token || !email) {
        setError("Invalid verification link. Please check your email.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(true);
          setError("");

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 3000);
        } else {
          setError(data.error || "Verification failed. Please try again.");
          setSuccess(false);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("An error occurred during verification. Please try again.");
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    }

    verifyEmail();
  }, [token, email, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-2 h-2 bg-pink-400 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-60 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-linear-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl shadow-2xl shadow-purple-500/20 border-4 border-purple-500/50 p-8">
          {/* Loading State */}
          {loading && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full mb-6 shadow-lg shadow-blue-500/50 animate-pulse">
                  <Mail className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  Verifying Email
                  <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                </h1>
                <p className="text-gray-400">
                  Please wait while we verify your email address...
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
                <p className="text-gray-400 text-sm animate-pulse">
                  Activating your account
                </p>
              </div>
            </>
          )}

          {/* Success State */}
          {!loading && success && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg shadow-green-500/50 animate-bounce">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  Email Verified!
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </h1>
                <p className="text-gray-400">
                  Your email has been successfully verified.
                </p>
              </div>

              <Alert className="mb-6 bg-green-500/10 border-green-500/50">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  Your account is now active! You&apos;ll be redirected to the
                  login page in a few seconds.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/50"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Continue to Login
                </Button>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-blue-400" />
                    <span>AI-Powered</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span>Secure</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Error State */}
          {!loading && error && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-red-500 to-orange-500 rounded-full mb-6 shadow-lg shadow-red-500/50">
                  <AlertCircle className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Verification Failed
                </h1>
                <p className="text-gray-400">
                  We couldn&apos;t verify your email address.
                </p>
              </div>

              <Alert className="mb-6 bg-red-500/10 border-red-500/50">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button
                  onClick={() => router.push("/resend-verification")}
                  className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/50"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Resend Verification Email
                </Button>

                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-gray-700 hover:border-purple-500 text-white hover:bg-purple-500/10 font-medium py-6 rounded-xl transition-all duration-300"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <Link
                href="/support"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
