"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TrialCountdownProps {
  trialEndsAt: Date;
  variant?: "badge" | "card" | "banner";
  showUpgradeCTA?: boolean;
}

export function TrialCountdown({
  trialEndsAt,
  variant = "card",
  showUpgradeCTA = true,
}: TrialCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(trialEndsAt);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [trialEndsAt]);

  const getUrgencyLevel = () => {
    if (timeRemaining.days >= 7) return "normal";
    if (timeRemaining.days >= 3) return "medium";
    if (timeRemaining.days >= 1) return "high";
    return "critical";
  };

  const urgency = getUrgencyLevel();

  const getMessage = () => {
    if (timeRemaining.days >= 7) {
      return {
        icon: "🎉",
        text: `${timeRemaining.days} days of Hero features remaining!`,
      };
    }
    if (timeRemaining.days >= 3) {
      return {
        icon: "⏰",
        text: `${timeRemaining.days} days left in your trial`,
      };
    }
    if (timeRemaining.days >= 1) {
      return {
        icon: "⚠️",
        text: `Trial ends in ${timeRemaining.days} ${
          timeRemaining.days === 1 ? "day" : "days"
        } - Upgrade now!`,
      };
    }
    return {
      icon: "🚨",
      text: "Last day of trial! Upgrade to keep unlimited access",
    };
  };

  const getColors = () => {
    switch (urgency) {
      case "critical":
        return {
          bg: "from-red-500 to-orange-600",
          border: "border-red-500",
          text: "text-red-300",
          badge: "bg-red-500/20 border-red-400",
        };
      case "high":
        return {
          bg: "from-orange-500 to-yellow-500",
          border: "border-orange-500",
          text: "text-orange-300",
          badge: "bg-orange-500/20 border-orange-400",
        };
      case "medium":
        return {
          bg: "from-yellow-400 to-orange-500",
          border: "border-yellow-500",
          text: "text-yellow-300",
          badge: "bg-yellow-500/20 border-yellow-400",
        };
      default:
        return {
          bg: "from-yellow-400 to-orange-500",
          border: "border-yellow-500",
          text: "text-yellow-300",
          badge: "bg-yellow-500/20 border-yellow-400",
        };
    }
  };

  const colors = getColors();
  const message = getMessage();

  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-2 ${colors.badge} border-2 rounded-lg px-3 py-1.5 shadow-lg`}
      >
        <span className="text-sm">{message.icon}</span>
        <span className="text-sm font-black font-mono">
          {timeRemaining.days}d {timeRemaining.hours}h
        </span>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={`bg-linear-to-r ${colors.bg} border-b-4 ${colors.border} shadow-2xl`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-2xl shadow-lg animate-bounce">
                {message.icon}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-gray-900 font-black text-lg font-mono uppercase">
                  {message.text}
                </p>
                <div className="flex items-center gap-3 mt-1 justify-center sm:justify-start flex-wrap">
                  <span className="px-3 py-1 bg-gray-900 text-yellow-400 rounded-lg text-sm font-black border-2 border-gray-800 shadow-lg font-mono">
                    {timeRemaining.days}d {timeRemaining.hours}h{" "}
                    {timeRemaining.minutes}m
                  </span>
                  <span className="text-gray-800 text-sm font-mono font-bold">
                    {new Date(trialEndsAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {showUpgradeCTA && (
              <Link
                href="/pricing"
                className="px-6 py-3 bg-gray-900 text-yellow-400 rounded-xl font-black hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 font-mono uppercase text-sm border-4 border-gray-800 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Upgrade Now
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 ${colors.border} p-6 shadow-2xl`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-black text-white font-mono uppercase flex items-center gap-2">
            <span>{message.icon}</span>
            Trial Status
          </h3>
          <p className={`text-sm font-mono mt-1 font-bold ${colors.text}`}>
            {message.text}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-800/50 rounded-xl p-3 text-center border-2 border-purple-500/30">
          <p className="text-3xl font-black text-white font-mono">
            {timeRemaining.days}
          </p>
          <p className="text-xs text-gray-400 font-mono uppercase mt-1">Days</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 text-center border-2 border-purple-500/30">
          <p className="text-3xl font-black text-white font-mono">
            {timeRemaining.hours}
          </p>
          <p className="text-xs text-gray-400 font-mono uppercase mt-1">
            Hours
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 text-center border-2 border-purple-500/30">
          <p className="text-3xl font-black text-white font-mono">
            {timeRemaining.minutes}
          </p>
          <p className="text-xs text-gray-400 font-mono uppercase mt-1">Mins</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 text-center border-2 border-purple-500/30">
          <p className="text-3xl font-black text-white font-mono animate-pulse">
            {timeRemaining.seconds}
          </p>
          <p className="text-xs text-gray-400 font-mono uppercase mt-1">Secs</p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-3 mb-4 border-2 border-purple-500/30">
        <p className="text-xs text-gray-400 font-mono mb-1">Trial Ends</p>
        <p className="text-sm text-white font-bold font-mono">
          {new Date(trialEndsAt).toLocaleString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {showUpgradeCTA && (
        <Link
          href="/pricing"
          className="block w-full text-center px-6 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase text-sm border-4 border-yellow-600"
        >
          🔥 Keep Hero Forever - $29/month
        </Link>
      )}
    </div>
  );
}
