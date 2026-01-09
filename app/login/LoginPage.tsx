// app/login/page.tsx
"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { loginAction } from "@/lib/actions/login";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  LogIn,
  Loader2,
  CheckCircle,
  AlertCircle,
  Code2,
  Infinity,
  Globe,
  Clock,
  Sparkles,
  Mail,
  Lock,
} from "lucide-react";

interface LoginState {
  success: boolean;
  message: string;
  redirect?: string;
}

const initialState: LoginState = {
  success: false,
  message: "",
};

// Helper function to get saved credentials
function getSavedCredentials() {
  if (typeof window === "undefined") return { email: "", rememberMe: false };

  const savedEmail = localStorage.getItem("rememberedEmail") || "";
  const savedRemember = localStorage.getItem("rememberMe") === "true";

  return {
    email: savedRemember ? savedEmail : "",
    rememberMe: savedRemember,
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [, startTransition] = useTransition();

  // Initialize state with saved credentials
  const [email, setEmail] = useState(() => getSavedCredentials().email);
  const [password, setPassword] = useState("");

  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    initialState
  );

  useEffect(() => {
    if (state.success && state.redirect && !isRedirecting) {
      startTransition(() => {
        setIsRedirecting(true);
        router.push(state.redirect!);
      });
    }
  }, [state.success, state.redirect, router, isRedirecting]);

  const isLoading = isPending || isRedirecting;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 animate-pulse" />

        <div className="w-full max-w-md space-y-6 relative z-10 ">
          {/* Back to Home Link with hover effect */}
          <Link href="/">
            <Button
              variant="ghost"
              className="gap-2 -ml-2 group hover:gap-3 transition-all duration-300 mb-10"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>

          {/* Animated Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 group-hover:rotate-6 transform">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
              <span className="bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                Welcome Back
              </span>
            </h1>
            <p className="text-muted-foreground animate-fade-in">
              Continue your coding journey
            </p>
          </div>

          {/* Animated Alert Messages */}
          {state.message && state.success && (
            <Alert className="border-green-500/50 bg-green-500/10 animate-in slide-in-from-top duration-300">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 animate-bounce" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                {state.message}
              </AlertDescription>
            </Alert>
          )}

          {state.message && !state.success && (
            <Alert
              variant="destructive"
              className="animate-in shake duration-300"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {/* Login Form with enhanced interactivity */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 hover:border-primary/20">
            <CardContent className="pt-6">
              <form action={formAction} className="space-y-5">
                {/* Email Field with icon */}
                <div className="space-y-2 group">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 group-focus-within:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      required
                      disabled={isLoading}
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 transition-all duration-300 focus:scale-[1.02] hover:border-primary/50"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Password Field with icon */}
                <div className="space-y-2 group">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 group-focus-within:text-primary transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      required
                      disabled={isLoading}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 transition-all duration-300 focus:scale-[1.02] hover:border-primary/50"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Remember Me & Forgot Password with hover effects */}
                <div className="flex items-center justify-between">
                  <Link
                    href="/forgot-password"
                    className={`text-sm text-primary hover:underline hover:translate-x-1 inline-block transition-all duration-200 ${
                      isLoading ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button with enhanced animation */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gap-2 group hover:gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {isRedirecting ? "Redirecting..." : "Logging in..."}
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      Login
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign Up Link with hover effect */}
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link
              href="/register"
              className={`text-primary font-semibold hover:underline hover:translate-x-1 inline-block transition-all duration-200 ${
                isLoading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Create an account →
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Enhanced Hero Section */}
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
          {/* Logo with animation */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-12 transform shadow-lg">
              <Code2 className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
              Code Review AI
            </h2>
          </div>

          {/* Main heading with linear */}
          <h3 className="text-5xl font-bold tracking-tight bg-linear-to-br from-foreground via-foreground to-foreground/70 bg-clip-text leading-tight">
            Return to Your Dashboard
          </h3>

          {/* Description with icon */}
          <p className="text-lg text-muted-foreground leading-relaxed flex items-start gap-3 group">
            <Sparkles className="h-6 w-6 text-primary mt-1 group-hover:rotate-12 transition-transform shrink-0" />
            <span>
              Continue analyzing your code with AI-powered reviews. Get instant
              feedback, improve code quality, and ship with confidence.
            </span>
          </p>

          {/* Animated stats cards */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Card className="bg-card/50 backdrop-blur border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer">
              <CardContent className="p-6">
                <Infinity className="h-8 w-8 mb-3 text-primary group-hover:rotate-180 transition-transform duration-500" />
                <div className="text-3xl font-bold mb-2">∞</div>
                <p className="text-sm text-muted-foreground">Code Reviews</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer animation-delay-100">
              <CardContent className="p-6">
                <Globe className="h-8 w-8 mb-3 text-primary group-hover:rotate-180 transition-transform duration-500" />
                <div className="text-3xl font-bold mb-2">50+</div>
                <p className="text-sm text-muted-foreground">Languages</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer animation-delay-200">
              <CardContent className="p-6">
                <Clock className="h-8 w-8 mb-3 text-primary group-hover:rotate-180 transition-transform duration-500" />
                <div className="text-3xl font-bold mb-2">24/7</div>
                <p className="text-sm text-muted-foreground">Availability</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer animation-delay-300">
              <CardContent className="p-6">
                <Sparkles className="h-8 w-8 mb-3 text-primary group-hover:rotate-180 transition-transform duration-500" />
                <div className="text-3xl font-bold mb-2">AI</div>
                <p className="text-sm text-muted-foreground">Powered</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
