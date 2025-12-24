"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  subscriptionTier: string;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
}

interface DashboardNavProps {
  user: User;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    if (user.subscriptionStatus === "TRIALING" && user.trialEndsAt) {
      const calculateDays = () => {
        const days = Math.ceil(
          (new Date(user.trialEndsAt!).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        );
        setDaysRemaining(Math.max(0, days));
      };

      calculateDays();

      const interval = setInterval(calculateDays, 1000 * 60 * 60);

      return () => clearInterval(interval);
    }
  }, [user.subscriptionStatus, user.trialEndsAt]);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "HERO":
        return "⚡";
      case "LEGEND":
        return "👑";
      default:
        return "🎮";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "HERO":
        return "bg-yellow-500/20 border-yellow-400 text-yellow-400";
      case "LEGEND":
        return "bg-purple-500/20 border-purple-400 text-purple-400";
      default:
        return "bg-gray-500/20 border-gray-400 text-gray-400";
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/submissions", label: "Submissions", icon: "📝" },
    { href: "/dashboard/new", label: "New Quest", icon: "⚔️" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-linear-to-r from-gray-900 via-purple-900 to-gray-900 border-b-4 border-purple-500/30 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="text-3xl">⚔️</div>
              <span className="hidden sm:block text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-pink-500 font-mono uppercase group-hover:scale-105 transition-transform">
                Code Arena
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-bold font-mono text-sm transition-all ${
                    isActive(link.href)
                      ? "bg-purple-500/30 text-purple-300 border-2 border-purple-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border-2 border-gray-700 transition-all"
              >
                {user.avatar ? (
                  <div className="relative w-8 h-8 rounded-full border-2 border-purple-400 overflow-hidden">
                    <Image
                      src={user.avatar}
                      alt={user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-black">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showUserDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-900 border-2 border-purple-500/30 rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b-2 border-purple-500/30">
                    <p className="text-sm font-black text-white font-mono">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400 font-mono truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-purple-500/10 transition-colors"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <span className="text-lg">⚙️</span>
                      <span className="text-sm font-bold text-gray-300 font-mono">
                        Settings
                      </span>
                    </Link>

                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <span className="text-lg">🚪</span>
                      <span className="text-sm font-bold text-red-400 font-mono">
                        Sign Out
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg bg-gray-800/50 border-2 border-gray-700"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  showMobileMenu
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div className="md:hidden border-t-2 border-purple-500/30 bg-gray-900/95 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b-2 border-purple-500/30">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${getTierColor(
                  user.subscriptionTier
                )}`}
              >
                <span className="text-lg">
                  {getTierIcon(user.subscriptionTier)}
                </span>
                <span className="text-sm font-black font-mono uppercase">
                  {user.subscriptionTier}
                </span>
              </div>

              {user.subscriptionStatus === "TRIALING" && (
                <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-black animate-pulse">
                  🎉 TRIAL: {daysRemaining}d
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold font-mono text-sm transition-all ${
                  isActive(link.href)
                    ? "bg-purple-500/30 text-purple-300 border-2 border-purple-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50 border-2 border-transparent"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t-2 border-purple-500/30 space-y-2">
              <Link
                href="/dashboard/settings"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-500/10 transition-colors text-gray-300"
              >
                <span className="text-lg">⚙️</span>
                <span className="text-sm font-bold font-mono">Settings</span>
              </Link>

              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-colors text-left"
              >
                <span className="text-lg">🚪</span>
                <span className="text-sm font-bold text-red-400 font-mono">
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
