// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Code2,
  Users,
  TrendingUp,
  Award,
  Mail,
  Lock,
  User,
  Sparkles,
  Info,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  function calculateStrength(pwd: string): number {
    let strength = 0;
    if (pwd.length >= 12) strength++;
    if (pwd.length >= 16) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    if (/(.)\1{2,}/.test(pwd)) strength--;
    if (/123|abc|qwerty/i.test(pwd)) strength--;
    return Math.max(0, Math.min(4, strength));
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(calculateStrength(pwd));
  }

  function getStrengthText(strength: number): string {
    const texts = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
    return texts[strength] || "Very Weak";
  }

  function getStrengthColor(strength: number): string {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];
    return colors[strength] || "bg-gray-300";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Registration failed");
        return;
      }

      setInfo("Account created. Check your email to verify your address.");
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1500);
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Registration Form */}
      <div className="flex items-center justify-center p-8 bg-background relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 animate-pulse" />

        <div className="w-full max-w-md space-y-6 relative z-10">
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
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <span className="bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                Create Account
              </span>
            </h1>
            <p className="text-muted-foreground animate-fade-in">
              Start your journey with AI-powered code reviews
            </p>
          </div>

          {/* Animated Alert Messages */}
          {info && !error && (
            <Alert className="border-green-500/50 bg-green-500/10 animate-in slide-in-from-top duration-300">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 animate-bounce" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                {info}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert
              variant="destructive"
              className="animate-in shake duration-300"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Registration Form */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 hover:border-primary/20">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-2 group">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 group-focus-within:text-primary transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      required
                      disabled={loading}
                      placeholder="Enter your name"
                      autoComplete="name"
                      className="pl-10 transition-all duration-300 focus:scale-[1.02] hover:border-primary/50"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2 group">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 group-focus-within:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      required
                      disabled={loading}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="pl-10 transition-all duration-300 focus:scale-[1.02] hover:border-primary/50"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Password Field */}
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
                      disabled={loading}
                      minLength={12}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      className="pl-10 transition-all duration-300 focus:scale-[1.02] hover:border-primary/50"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2 animate-in slide-in-from-top duration-300">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength
                                ? getStrengthColor(passwordStrength)
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        Strength:{" "}
                        <span className="font-semibold text-foreground">
                          {getStrengthText(passwordStrength)}
                        </span>
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Min 12 characters • Uppercase • Lowercase • Number • Special
                    character
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || passwordStrength < 2}
                  className="w-full gap-2 group hover:gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      Create Account
                    </>
                  )}
                </Button>

                {/* Info Alert */}
                <Alert className="border-blue-500/50 bg-blue-500/10">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-600 dark:text-blue-400 text-xs">
                    You&apos;ll receive a verification email. Verify your
                    address before your first login.
                  </AlertDescription>
                </Alert>
              </form>
            </CardContent>
          </Card>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className={`text-primary font-semibold hover:underline hover:translate-x-1 inline-block transition-all duration-200 ${
                loading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Sign in →
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
          {/* Logo with animation */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-12 transform shadow-lg">
              <Code2 className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
              Code Review AI
            </h2>
          </div>

          {/* Main heading with gradient */}
          <h3 className="text-5xl font-bold tracking-tight bg-linear-to-br from-foreground via-foreground to-foreground/70 bg-clip-text leading-tight">
            Begin Your Journey
          </h3>

          {/* Description with icon */}
          <p className="text-lg text-muted-foreground leading-relaxed flex items-start gap-3 group">
            <Sparkles className="h-6 w-6 text-primary mt-1 group-hover:rotate-12 transition-transform shrink-0" />
            <span>
              Join thousands of developers using AI to improve their code
              quality. Get instant feedback and ship with confidence.
            </span>
          </p>

          {/* Animated stats cards */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <Card className="bg-card/50 backdrop-blur border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mb-2 text-primary mx-auto group-hover:rotate-180 transition-transform duration-500" />
                <div className="text-2xl font-bold mb-1">10K+</div>
                <p className="text-xs text-muted-foreground">Developers</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer animation-delay-100">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mb-2 text-primary mx-auto group-hover:rotate-180 transition-transform duration-500" />
                <div className="text-2xl font-bold mb-1">50K+</div>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer animation-delay-200">
              <CardContent className="p-4 text-center">
                <Award className="h-6 w-6 mb-2 text-primary mx-auto group-hover:rotate-180 transition-transform duration-500" />
                <div className="text-2xl font-bold mb-1">99%</div>
                <p className="text-xs text-muted-foreground">Success</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
