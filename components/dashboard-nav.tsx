"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function DashboardNav({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <nav className="bg-white border-b border-[#ececec] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
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
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-[#15192c]">
                Code Review AI
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-[#6c7681] hover:text-[#15192c] text-sm font-medium transition"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/new"
                className="text-[#6c7681] hover:text-[#15192c] text-sm font-medium transition"
              >
                New Review
              </Link>
              <Link
                href="/dashboard/submissions"
                className="text-[#6c7681] hover:text-[#15192c] text-sm font-medium transition"
              >
                History
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-[#f9f9fa] rounded-lg border border-[#ececec]">
              <div className="w-8 h-8 bg-linear-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#15192c]">
                  {user.name}
                </span>
                <span className="text-xs text-[#b2b5be]">{user.email}</span>
              </div>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2 hover:bg-[#f9f9fa] rounded-lg transition"
                aria-label="Menu"
              >
                <svg
                  className="w-6 h-6 text-[#6c7681]"
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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#ececec] rounded-lg shadow-lg z-50">
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-3 text-sm text-[#15192c] hover:bg-[#f9f9fa] rounded-t-lg transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-[#f9f9fa] rounded-b-lg transition"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
