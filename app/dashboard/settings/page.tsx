"use client";

import { useState } from "react";
import { SettingsForm } from "@/components/settings-form";
import { PasswordForm } from "@/components/password-form";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { SubscriptionTab } from "@/components/subscription-tab";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  createdAt: Date;
  emailVerified: Date | null;
  _count: {
    submissions: number;
  };
}

export function SettingsClient({ user }: { user: UserProfile }) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "subscription" | "danger"
  >("profile");

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-4xl md:text-5xl font-black text-white font-mono uppercase"
          style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
        >
          ⚙️ Settings
        </h1>
        <p className="text-gray-400 mt-2 font-mono text-lg">
          Configure your warrior profile and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 p-4 shadow-xl sticky top-24">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-3 rounded-lg font-bold font-mono text-sm transition-all ${
                  activeTab === "profile"
                    ? "bg-purple-500/20 text-purple-300 border-2 border-purple-400/50"
                    : "hover:bg-purple-500/20 text-gray-400 hover:text-purple-300"
                }`}
              >
                ⚔️ Profile
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full text-left px-4 py-3 rounded-lg font-bold font-mono text-sm transition-all ${
                  activeTab === "security"
                    ? "bg-purple-500/20 text-purple-300 border-2 border-purple-400/50"
                    : "hover:bg-purple-500/20 text-gray-400 hover:text-purple-300"
                }`}
              >
                🔒 Security
              </button>
              <button
                onClick={() => setActiveTab("subscription")}
                className={`w-full text-left px-4 py-3 rounded-lg font-bold font-mono text-sm transition-all ${
                  activeTab === "subscription"
                    ? "bg-purple-500/20 text-purple-300 border-2 border-purple-400/50"
                    : "hover:bg-purple-500/20 text-gray-400 hover:text-purple-300"
                }`}
              >
                💳 Subscription
              </button>
              <button
                onClick={() => setActiveTab("danger")}
                className={`w-full text-left px-4 py-3 rounded-lg font-bold font-mono text-sm transition-all ${
                  activeTab === "danger"
                    ? "bg-purple-500/20 text-purple-300 border-2 border-purple-400/50"
                    : "hover:bg-purple-500/20 text-gray-400 hover:text-purple-300"
                }`}
              >
                ⚠️ Danger Zone
              </button>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === "profile" && (
            <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-blue-500/50 shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b-4 border-blue-500/30 bg-linear-to-r from-blue-900/20 to-cyan-900/20">
                <h2 className="text-2xl font-black text-white font-mono uppercase flex items-center gap-2">
                  <span>⚔️</span>
                  Profile Information
                </h2>
                <p className="text-sm text-gray-400 mt-1 font-mono">
                  Update your warrior details
                </p>
              </div>
              <div className="p-6">
                <SettingsForm user={user} />
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b-4 border-purple-500/30 bg-linear-to-r from-purple-900/20 to-pink-900/20">
                <h2 className="text-2xl font-black text-white font-mono uppercase flex items-center gap-2">
                  <span>🔒</span>
                  Change Password
                </h2>
                <p className="text-sm text-gray-400 mt-1 font-mono">
                  Strengthen your account defenses
                </p>
              </div>
              <div className="p-6">
                <PasswordForm />
              </div>
            </div>
          )}

          {activeTab === "subscription" && <SubscriptionTab userId={user.id} />}

          {activeTab === "danger" && (
            <div className="bg-linear-to-br from-red-900/30 to-red-950/30 rounded-2xl border-4 border-red-500 shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b-4 border-red-500/50 bg-linear-to-r from-red-900/40 to-orange-900/40">
                <h2 className="text-2xl font-black text-red-400 font-mono uppercase flex items-center gap-2">
                  <span>⚠️</span>
                  Danger Zone
                </h2>
                <p className="text-sm text-gray-400 mt-1 font-mono">
                  Permanently delete your warrior account
                </p>
              </div>
              <div className="p-6">
                <div className="bg-red-500/10 border-2 border-red-400/50 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-red-400 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div>
                      <h4 className="text-sm font-black text-red-300 mb-1 font-mono">
                        This action cannot be undone!
                      </h4>
                      <p className="text-xs text-red-400 font-mono">
                        All your quests, achievements, and data will be
                        permanently lost.
                      </p>
                    </div>
                  </div>
                </div>
                <DeleteAccountButton />
              </div>
            </div>
          )}

          <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 p-6 shadow-xl">
            <h3 className="text-lg font-black text-white mb-4 font-mono uppercase">
              📊 Account Stats
            </h3>
            <div className="space-y-4">
              <div className="bg-cyan-500/10 border-2 border-cyan-400/50 rounded-lg p-3">
                <p className="text-xs text-cyan-300 mb-1 font-mono uppercase font-bold">
                  Member Since
                </p>
                <p className="text-sm font-black text-white font-mono">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="bg-pink-500/10 border-2 border-pink-400/50 rounded-lg p-3">
                <p className="text-xs text-pink-300 mb-1 font-mono uppercase font-bold">
                  Total Quests
                </p>
                <p className="text-sm font-black text-white font-mono">
                  {user._count.submissions}
                </p>
              </div>
              <div className="bg-green-500/10 border-2 border-green-400/50 rounded-lg p-3">
                <p className="text-xs text-green-300 mb-1 font-mono uppercase font-bold">
                  Email Status
                </p>
                <div className="flex items-center gap-2">
                  {user.emailVerified ? (
                    <>
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-black text-green-400 font-mono">
                        ✓ Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span className="text-sm font-black text-yellow-400 font-mono">
                        ! Not Verified
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
