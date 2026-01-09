"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Code2,
  Menu,
  ArrowRight,
  Play,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  FileCode,
  Globe,
  Users,
  TrendingUp,
  Award,
  Twitter,
  Github,
  Linkedin,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 group-hover:rotate-6 transform">
                <Code2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xl font-bold">CodeReview AI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
              >
                How It Works
              </a>

              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
              >
                Pricing
              </a>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="gap-2 group">
                  Get Started
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-6 mt-8">
                  <SheetClose asChild>
                    <a
                      href="#features"
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      Features
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a
                      href="#how-it-works"
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      How It Works
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a
                      href="#pricing"
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      Pricing
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/register">
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-primary/5 animate-pulse" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
          <div className="absolute top-40 right-20 w-2 h-2 bg-pink-400 rounded-full animate-ping animation-delay-500" />
          <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping animation-delay-1000" />
          <div className="absolute top-60 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-ping animation-delay-1500" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Status Badge */}
            <Badge
              variant="outline"
              className="border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 text-sm animate-in slide-in-from-top duration-500"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-semibold">10,000+ Developers Online</span>
              </div>
            </Badge>

            {/* Main Heading */}
            <div className="space-y-4 animate-in slide-in-from-bottom duration-700">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Start Your
              </h1>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Code Review Adventure
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom duration-700 animation-delay-200">
              AI-powered code analysis • Find bugs instantly • Level up your
              skills
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom duration-700 animation-delay-300">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 group text-lg px-8 py-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto gap-2 group text-lg px-8 py-6 hover:scale-105 transition-all duration-300"
                >
                  <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto pt-8 animate-in slide-in-from-bottom duration-700 animation-delay-400">
              <Card className="bg-card/50 backdrop-blur border-2 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer">
                <CardContent className="p-4 md:p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-cyan-500 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="text-3xl md:text-4xl font-bold mb-1">
                    10K+
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Active Users
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-2 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer animation-delay-100">
                <CardContent className="p-4 md:p-6 text-center">
                  <FileCode className="h-8 w-8 mx-auto mb-2 text-pink-500 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="text-3xl md:text-4xl font-bold mb-1">1M+</div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Code Reviews
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-2 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer animation-delay-200">
                <CardContent className="p-4 md:p-6 text-center">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-yellow-500 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="text-3xl md:text-4xl font-bold mb-1">50+</div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Languages
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-2 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer animation-delay-300">
                <CardContent className="p-4 md:p-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="text-3xl md:text-4xl font-bold mb-1">
                    99.9%
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Accuracy
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Power-Ups & Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock legendary abilities for your code
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Security Shield */}
            <Card className="group border-2 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer bg-linear-to-br from-blue-500/5 to-transparent">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300 group-hover:rotate-6 transform">
                  <Shield className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Security Shield</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Detect SQL injection, XSS, CSRF vulnerabilities. Get instant
                  alerts with CWE/CVE references.
                </p>
              </CardContent>
            </Card>

            {/* Speed Boost */}
            <Card className="group border-2 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer bg-linear-to-br from-purple-500/5 to-transparent animation-delay-100">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors duration-300 group-hover:rotate-6 transform">
                  <Zap className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Speed Boost</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Identify bottlenecks and memory leaks. Optimize execution
                  speed and crush performance issues.
                </p>
              </CardContent>
            </Card>

            {/* Quality Master */}
            <Card className="group border-2 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer bg-linear-to-br from-emerald-500/5 to-transparent animation-delay-200">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors duration-300 group-hover:rotate-6 transform">
                  <CheckCircle className="h-8 w-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Quality Master</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Detect code smells and style violations. Maintain legendary
                  code quality across your codebase.
                </p>
              </CardContent>
            </Card>

            {/* Bug Hunter */}
            <Card className="group border-2 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer bg-linear-to-br from-orange-500/5 to-transparent animation-delay-300">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors duration-300 group-hover:rotate-6 transform">
                  <AlertTriangle className="h-8 w-8 text-orange-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Bug Hunter</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Find runtime errors and logic bugs before they strike. Prevent
                  production crashes.
                </p>
              </CardContent>
            </Card>

            {/* Quest Reports */}
            <Card className="group border-2 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer bg-linear-to-br from-pink-500/5 to-transparent animation-delay-400">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors duration-300 group-hover:rotate-6 transform">
                  <FileCode className="h-8 w-8 text-pink-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Quest Reports</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Comprehensive battle reports with severity levels. Share
                  victories with your team.
                </p>
              </CardContent>
            </Card>

            {/* Multi-Verse */}
            <Card className="group border-2 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer bg-linear-to-br from-indigo-500/5 to-transparent animation-delay-500">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors duration-300 group-hover:rotate-6 transform">
                  <Code2 className="h-8 w-8 text-indigo-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Multi-Verse</h3>
                <p className="text-muted-foreground leading-relaxed">
                  50+ languages supported. JavaScript, Python, Java, Go, Rust
                  and more. One tool rules them all.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-background to-muted/30"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Your Quest Path
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to coding mastery
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="relative group">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Number Badge */}
                <div className="relative">
                  <div className="w-20 h-20 bg-linear-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 border-primary/20">
                    1
                  </div>
                  {/* Connecting Line (hidden on mobile, shown on md+) */}
                  <div className="hidden md:block absolute top-10 left-20 w-full h-0.5 bg-linear-to-r from-primary to-purple-500 animate-pulse" />
                </div>

                {/* Icon */}
                <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 group-hover:rotate-6 transform">
                  <FileCode className="h-12 w-12 text-primary" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold">
                    Upload Code
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Paste code, upload files, or connect your Git repository.
                    Ready for battle.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group animation-delay-200">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Number Badge */}
                <div className="relative">
                  <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 border-purple-500/20">
                    2
                  </div>
                  {/* Connecting Line */}
                  <div className="hidden md:block absolute top-10 left-20 w-full h-0.5 bg-linear-to-r from-purple-500 to-green-500 animate-pulse animation-delay-500" />
                </div>

                {/* Icon */}
                <div className="p-4 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors duration-300 group-hover:rotate-6 transform">
                  <Sparkles className="h-12 w-12 text-purple-500" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold">
                    AI Analysis
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Advanced AI scans for security, performance, and quality
                    issues in seconds.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group animation-delay-400">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Number Badge */}
                <div className="w-20 h-20 bg-linear-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 border-green-500/20">
                  3
                </div>

                {/* Icon */}
                <div className="p-4 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors duration-300 group-hover:rotate-6 transform">
                  <Award className="h-12 w-12 text-green-500" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold">
                    Victory Report
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Detailed findings with actionable fixes. Level up your code
                    instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Choose Your Level
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              All plans include 7-day free trial • No credit card required
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Plan Header */}
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Starter</h3>
                    <p className="text-muted-foreground">Try the basics</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">₹0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 min-h-[200px]">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">5 reviews/month</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Basic security</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Community support</span>
                    </li>
                  </ul>

                  {/* CTA Button */}
                  <Link href="/register" className="block">
                    <Button variant="outline" className="w-full group">
                      Start Free
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Hero Plan (Popular) */}
            <Card className="border-2 border-primary relative hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl bg-linear-to-b from-primary/5 to-transparent">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="px-4 py-1 text-sm font-bold shadow-lg">
                  ⭐ Popular
                </Badge>
              </div>

              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Plan Header */}
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Hero</h3>
                    <p className="text-muted-foreground">For champions</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">₹2999</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 min-h-[200px]">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">
                        Unlimited reviews
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">
                        Advanced security & performance
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">
                        Priority support
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">API access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">
                        Up to 100KB file size
                      </span>
                    </li>
                  </ul>

                  {/* CTA Button */}
                  <Link href="/register" className="block">
                    <Button className="w-full group shadow-lg hover:shadow-xl">
                      Start Trial
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Legend Plan */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl animation-delay-200">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Plan Header */}
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Legend</h3>
                    <p className="text-muted-foreground">For elite teams</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">Custom</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 min-h-[200px]">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Everything in Hero</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Dedicated support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Custom integrations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">SLA guarantee</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited file size</span>
                    </li>
                  </ul>

                  {/* CTA Button */}
                  <Link href="/contact" className="block">
                    <Button variant="outline" className="w-full group">
                      Contact Sales
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-primary/10 via-purple-500/10 to-pink-500/10 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-white/5 bg-size[40px_40px]" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Ready To Level Up?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join the coding revolution. Start your epic journey today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 group text-lg px-10 py-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-10 py-6 hover:scale-105 transition-all duration-300"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <Code2 className="h-6 w-6 text-primary" />
                </div>
                <span className="text-lg font-bold">CodeReview AI</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Level up your code with AI-powered reviews
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#features"
                    className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block duration-200"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 CodeReview AI. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 transform duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>

              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 transform duration-200"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>

              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 transform duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
