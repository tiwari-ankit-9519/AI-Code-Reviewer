"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Verification Status */}
      <div className="flex items-center justify-center p-8 bg-background relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 animate-pulse" />

        <div className="w-full max-w-md space-y-6 relative z-10">
          {/* Back to Home Link */}
          <Link href="/">
            <Button
              variant="ghost"
              className="gap-2 -ml-2 group hover:gap-3 transition-all duration-300 mb-10"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>

          {/* Loading State */}
          {loading && (
            <Card className="border-2 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="p-4 rounded-2xl bg-primary/10 animate-pulse">
                      <Mail className="h-12 w-12 text-primary" />
                    </div>
                  </div>

                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
                      Verifying Email
                      <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    </h1>
                    <p className="text-muted-foreground">
                      Please wait while we verify your email address...
                    </p>
                  </div>

                  {/* Loading Spinner */}
                  <div className="flex flex-col items-center gap-4 py-6">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">
                      Activating your account
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success State */}
          {!loading && success && (
            <Card className="border-2 border-green-500/50 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Success Icon */}
                  <div className="flex justify-center">
                    <div className="p-4 rounded-2xl bg-green-500/10 animate-bounce">
                      <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
                      Email Verified!
                      <Sparkles className="h-6 w-6 text-primary" />
                    </h1>
                    <p className="text-muted-foreground">
                      Your email has been successfully verified.
                    </p>
                  </div>

                  {/* Success Alert */}
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-600 dark:text-green-400">
                      Your account is now active! You&apos;ll be redirected to
                      the login page in a few seconds.
                    </AlertDescription>
                  </Alert>

                  {/* Action Button */}
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full gap-2 group hover:gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    size="lg"
                  >
                    <Shield className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    Continue to Login
                  </Button>

                  {/* Footer Info */}
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground pt-4">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-primary" />
                      <span>AI-Powered</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Secure</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {!loading && error && (
            <Card className="border-2 border-red-500/50 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Error Icon */}
                  <div className="flex justify-center">
                    <div className="p-4 rounded-2xl bg-red-500/10">
                      <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                  </div>

                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                      Verification Failed
                    </h1>
                    <p className="text-muted-foreground">
                      We couldn&apos;t verify your email address.
                    </p>
                  </div>

                  {/* Error Alert */}
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-600 dark:text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push("/resend-verification")}
                      className="w-full gap-2 group hover:gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                      size="lg"
                    >
                      <Mail className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      Resend Verification Email
                    </Button>

                    <Link href="/login" className="block">
                      <Button
                        variant="outline"
                        className="w-full gap-2 group hover:gap-3 transition-all duration-300"
                        size="lg"
                      >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Support Link */}
          <p className="text-center text-sm text-muted-foreground">
            Need help?{" "}
            <Link
              href="/support"
              className="text-primary font-semibold hover:underline hover:translate-x-1 inline-block transition-all duration-200"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex items-center justify-center bg-linear-to-br from-primary/10 via-primary/5 to-background p-12 relative overflow-hidden border-l">
        {/* Animated background patterns */}
        <div className="absolute inset-0 bg-grid-white/5 bg-size[40px_40px] animate-pulse" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-ping" />
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-primary/20 rounded-full animate-ping animation-delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-primary/20 rounded-full animate-ping animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-md space-y-8 animate-in slide-in-from-right duration-700">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-12 transform shadow-lg">
              <Code2 className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
              Code Review AI
            </h2>
          </div>

          {/* Main heading */}
          <h3 className="text-5xl font-bold tracking-tight bg-linear-to-br from-foreground via-foreground to-foreground/70 bg-clip-text leading-tight">
            {loading && "Verifying Your Account"}
            {success && "Welcome Aboard!"}
            {error && "Let's Try Again"}
          </h3>

          {/* Description */}
          <p className="text-lg text-muted-foreground leading-relaxed flex items-start gap-3 group">
            <Sparkles className="h-6 w-6 text-primary mt-1 group-hover:rotate-12 transition-transform shrink-0" />
            <span>
              {loading &&
                "We're setting up your account. This will only take a moment."}
              {success &&
                "Your account is ready! Start analyzing your code with AI-powered reviews and improve your code quality today."}
              {error &&
                "Don't worry - we can resend the verification email. Make sure to check your spam folder too."}
            </span>
          </p>

          {/* Feature badges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer hover:scale-105">
              <Shield className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold mb-1">Secure</p>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade security
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer hover:scale-105">
              <Sparkles className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold mb-1">AI-Powered</p>
              <p className="text-sm text-muted-foreground">
                Smart code analysis
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
