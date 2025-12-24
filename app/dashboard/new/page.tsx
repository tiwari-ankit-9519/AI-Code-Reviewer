"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { UsageProgress } from "@/components/subscription/usage-progress";
import { submitCode } from "@/lib/actions/submissions";

export default function NewSubmissionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usageData, setUsageData] = useState<{
    tier: string;
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    nextResetDate: string;
  } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formData, setFormData] = useState({
    fileName: "",
    language: "javascript",
    code: "",
  });

  useEffect(() => {
    async function checkUsage() {
      try {
        const response = await fetch("/api/subscription/usage");
        const data = await response.json();
        setUsageData(data);
      } catch (error) {
        console.error("Failed to fetch usage data:", error);
      }
    }
    checkUsage();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitCode({
        code: formData.code,
        language: formData.language,
        fileName: formData.fileName || `untitled.${formData.language}`,
      });

      toast.success("Quest submitted successfully!", {
        description: "Your code is being reviewed by the AI warriors",
      });

      router.push(`/dashboard/submissions/${result.id}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit quest";
      const errorName = error instanceof Error ? error.name : "";

      if (
        errorName === "SubmissionLimitError" ||
        errorMessage.includes("limit")
      ) {
        setShowUpgradeModal(true);
        toast.error("Monthly limit reached", {
          description: "Upgrade to Hero for unlimited submissions",
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextResetDate = usageData?.nextResetDate
    ? new Date(usageData.nextResetDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors font-mono text-sm mb-4"
          >
            <span className="mr-2">←</span> BACK TO DASHBOARD
          </Link>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 via-pink-500 to-purple-500 uppercase font-mono mb-2">
            ⚔️ NEW QUEST
          </h1>
          <p className="text-gray-400 font-mono">
            Submit your code for AI-powered review and level up your skills
          </p>
        </div>

        {usageData?.tier === "STARTER" && usageData.remaining > 0 && (
          <div className="bg-blue-500/20 border-2 border-blue-400 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-black text-blue-300 mb-2 font-mono uppercase text-sm">
                  {usageData.remaining} / {usageData.limit} quests remaining
                </p>
                <UsageProgress
                  current={usageData.used}
                  limit={usageData.limit}
                  tier="STARTER"
                />
              </div>
              {usageData.percentage >= 80 && (
                <Link href="/pricing">
                  <button className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-black hover:bg-yellow-300 transition-all ml-4">
                    UPGRADE
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}

        {usageData?.remaining === 0 ? (
          <div className="bg-red-500/20 border-4 border-red-400 rounded-2xl p-8 text-center shadow-2xl shadow-red-500/20">
            <h2 className="text-3xl font-black text-red-400 mb-4 uppercase font-mono">
              ⚠️ QUEST LIMIT REACHED
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              You&apos;ve used all 5 quests this month. Upgrade to Hero for
              unlimited submissions!
            </p>
            <Link href="/pricing">
              <button className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-black hover:bg-yellow-300 transition-all shadow-lg hover:shadow-yellow-400/50 uppercase">
                UPGRADE TO HERO - ₹2999/MONTH
              </button>
            </Link>
            <p className="text-gray-500 text-sm mt-4 font-mono">
              Or wait until {nextResetDate} for your free quests to reset
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="fileName"
                className="block text-sm font-black text-purple-400 mb-2 uppercase font-mono"
              >
                FILE NAME *
              </label>
              <input
                type="text"
                id="fileName"
                name="fileName"
                required
                value={formData.fileName}
                onChange={handleInputChange}
                placeholder="e.g., MyComponent.jsx or script.py"
                className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
              />
            </div>

            <div>
              <label
                htmlFor="language"
                className="block text-sm font-black text-purple-400 mb-2 uppercase font-mono"
              >
                PROGRAMMING LANGUAGE *
              </label>
              <select
                id="language"
                name="language"
                required
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl text-white focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-mono cursor-pointer"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="code"
                className="block text-sm font-black text-purple-400 mb-2 uppercase font-mono"
              >
                CODE *
              </label>
              <textarea
                id="code"
                name="code"
                required
                value={formData.code}
                onChange={handleInputChange}
                rows={15}
                placeholder="Paste your code here..."
                className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-mono text-sm resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-black hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed uppercase font-mono"
              >
                {isSubmitting ? "⚔️ SUBMITTING..." : "⚔️ SUBMIT QUEST"}
              </button>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-gray-700 text-white rounded-xl font-black hover:bg-gray-600 transition-all text-center uppercase font-mono"
              >
                CANCEL
              </Link>
            </div>
          </form>
        )}
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-linear-to-br from-gray-900 to-purple-900 border-4 border-yellow-400 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-yellow-400/20">
            <h2 className="text-3xl font-black text-yellow-400 mb-4 uppercase font-mono">
              🎮 UPGRADE TO HERO
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              You&apos;ve reached your monthly limit of 5 submissions. Upgrade
              to Hero tier for unlimited code reviews!
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-green-400">
                <span className="mr-2">✓</span>
                <span className="font-mono">Unlimited submissions</span>
              </div>
              <div className="flex items-center text-green-400">
                <span className="mr-2">✓</span>
                <span className="font-mono">Priority AI reviews</span>
              </div>
              <div className="flex items-center text-green-400">
                <span className="mr-2">✓</span>
                <span className="font-mono">Advanced analytics</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/pricing" className="flex-1">
                <button className="w-full bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-black hover:bg-yellow-300 transition-all uppercase">
                  UPGRADE NOW
                </button>
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-6 py-3 bg-gray-700 text-white rounded-xl font-black hover:bg-gray-600 transition-all uppercase"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
