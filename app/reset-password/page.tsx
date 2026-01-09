// app/reset-password/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Lock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Code2,
  Shield,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { resetPasswordAction } from "@/lib/actions/reset-password";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token, email]);

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
    setNewPassword(pwd);
    setPasswordStrength(calculateStrength(pwd));
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

  function getStrengthText(strength: number): string {
    const texts = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
    return texts[strength] || "Very Weak";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 12) {
      setError("Password must be at least 12 characters long");
      return;
    }

    if (passwordStrength < 2) {
      setError("Please choose a stronger password");
      return;
    }

    if (!token || !email) {
      setError("Invalid reset link");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordAction(token, email, newPassword);

      if (!result.success) {
        setError(result.error || "Failed to reset password");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2000);
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 animate-pulse" />

        <div className="w-full max-w-md space-y-6 relative z-10">
          <Link href="/login">
            <Button
              variant="ghost"
              className="gap-2 -ml-2 group hover:gap-3 transition-all duration-300 mb-14"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Button>
          </Link>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 group-hover:rotate-6 transform">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <span className="bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                Reset Password
              </span>
            </h1>
            <p className="text-muted-foreground animate-fade-in">
              Enter your new password below
            </p>
          </div>

          {success && (
            <Alert className="border-green-500/50 bg-green-500/10 animate-in slide-in-from-top duration-300">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 animate-bounce" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Password reset successful! Redirecting to login...
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

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 hover:border-primary/20">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2 group">
                  <Label
                    htmlFor="newPassword"
                    className="flex items-center gap-2 group-focus-within:text-primary transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      required
                      disabled={loading}
                      minLength={12}
                      value={newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className="pl-10 pr-10 transition-all duration-300 focus:scale-[1.02] hover:border-primary/50"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {newPassword && (
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

                <div className="space-y-2 group">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 group-focus-within:text-primary transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      disabled={loading}
                      minLength={12}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pl-10 pr-10 transition-all duration-300 focus:scale-[1.02] hover:border-primary/50"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !token || !email || passwordStrength < 2}
                  className="w-full gap-2 group hover:gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      Reset Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
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

      <div className="hidden lg:flex items-center justify-center bg-linear-to-br from-primary/10 via-primary/5 to-background p-12 relative overflow-hidden border-l">
        <div className="absolute inset-0 bg-grid-white/5 bg-size[40px_40px] animate-pulse" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-ping" />
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-primary/20 rounded-full animate-ping animation-delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-primary/20 rounded-full animate-ping animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-md space-y-8 animate-in slide-in-from-right duration-700">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-12 transform shadow-lg">
              <Code2 className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
              Code Review AI
            </h2>
          </div>

          <h3 className="text-5xl font-bold tracking-tight bg-linear-to-br from-foreground via-foreground to-foreground/70 bg-clip-text leading-tight">
            Secure Your Account
          </h3>

          <p className="text-lg text-muted-foreground leading-relaxed flex items-start gap-3 group">
            <Sparkles className="h-6 w-6 text-primary mt-1 group-hover:rotate-12 transition-transform shrink-0" />
            <span>
              Choose a strong password to keep your code reviews and data
              secure.
            </span>
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Card className="bg-card/50 backdrop-blur border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer">
              <CardContent className="p-6">
                <Shield className="h-8 w-8 mb-3 text-primary group-hover:rotate-180 transition-transform duration-500" />
                <div className="text-3xl font-bold mb-2">Secure</div>
                <p className="text-sm text-muted-foreground">
                  Encrypted Storage
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer animation-delay-100">
              <CardContent className="p-6">
                <Lock className="h-8 w-8 mb-3 text-primary group-hover:rotate-180 transition-transform duration-500" />
                <div className="text-3xl font-bold mb-2">Protected</div>
                <p className="text-sm text-muted-foreground">Argon2 Hashing</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
