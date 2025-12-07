"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DashboardNav({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-linear-to-r from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] border-b-4 border-purple-500/30 sticky top-0 z-50 shadow-2xl shadow-purple-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/50 border-4 border-yellow-600">
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <span className="text-xl font-black text-white font-mono">
                CODE<span className="text-yellow-400">QUEST</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-lg transition-all font-mono font-bold uppercase text-sm ${
                  isActive("/dashboard")
                    ? "text-yellow-400 bg-purple-500/20"
                    : "text-gray-400 hover:text-yellow-400 hover:bg-purple-500/20"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/new"
                className={`px-4 py-2 rounded-lg transition-all font-mono font-bold uppercase text-sm ${
                  isActive("/dashboard/new")
                    ? "text-yellow-400 bg-purple-500/20"
                    : "text-gray-400 hover:text-yellow-400 hover:bg-purple-500/20"
                }`}
              >
                New Quest
              </Link>
              <Link
                href="/dashboard/submissions"
                className={`px-4 py-2 rounded-lg transition-all font-mono font-bold uppercase text-sm ${
                  isActive("/dashboard/submissions")
                    ? "text-yellow-400 bg-purple-500/20"
                    : "text-gray-400 hover:text-yellow-400 hover:bg-purple-500/20"
                }`}
              >
                History
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* XP Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-purple-500/20 border-2 border-purple-400 rounded-lg px-3 py-1.5 shadow-lg">
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-black text-white font-mono">
                2,450 XP
              </span>
            </div>

            {/* User Profile Card */}

            {/* Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-all border-2 border-transparent hover:border-purple-500/50"
                aria-label="Menu"
              >
                <svg
                  className="w-6 h-6 text-gray-400 hover:text-yellow-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2m0 7a1 1 0 110-2 1 1 0 010 2m0 7a1 1 0 110-2 1 1 0 010 2"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#1a1f3a] border-4 border-purple-500/50 rounded-xl shadow-2xl overflow-hidden z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b-2 border-purple-500/30 bg-linear-to-r from-purple-900/20 to-pink-900/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-black font-mono shadow-lg">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white font-mono truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/profile"
                    className="w-full text-left px-4 py-3 text-gray-300 hover:bg-purple-500/20 hover:text-yellow-400 transition-all font-mono flex items-center gap-3"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="text-lg">⚔️</span>
                    <span className="font-bold">Profile</span>
                  </Link>
                  <Link
                    href="/dashboard/achievements"
                    className="w-full text-left px-4 py-3 text-gray-300 hover:bg-purple-500/20 hover:text-yellow-400 transition-all font-mono flex items-center gap-3"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="text-lg">🏆</span>
                    <span className="font-bold">Achievements</span>
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="w-full text-left px-4 py-3 text-gray-300 hover:bg-purple-500/20 hover:text-yellow-400 transition-all font-mono flex items-center gap-3"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="text-lg">⚙️</span>
                    <span className="font-bold">Settings</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all font-mono border-t-2 border-purple-500/30 flex items-center gap-3 font-bold"
                  >
                    <span className="text-lg">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile User Info - Shows on small screens */}
    </nav>
  );
}
