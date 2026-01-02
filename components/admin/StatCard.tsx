"use client";

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  trend: number;
  trendLabel?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
}: StatCardProps) {
  const getTrendColor = () => {
    if (trend > 0) return "text-green-400";
    if (trend < 0) return "text-red-400";
    return "text-gray-400";
  };

  const getTrendIcon = () => {
    if (trend > 0) return "↗";
    if (trend < 0) return "↘";
    return "→";
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className={`text-sm font-bold ${getTrendColor()}`}>
          {getTrendIcon()} {trendLabel || `${trend.toFixed(1)}%`}
        </span>
      </div>
      <div className="text-gray-400 text-sm mb-1">{title}</div>
      <div className="text-3xl font-black text-white">{value}</div>
    </div>
  );
}
