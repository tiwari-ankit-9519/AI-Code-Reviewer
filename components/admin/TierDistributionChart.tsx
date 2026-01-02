"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface TierDistribution {
  starter: number;
  hero: number;
  legend: number;
}

interface TierDistributionChartProps {
  distribution: TierDistribution;
}

export default function TierDistributionChart({
  distribution,
}: TierDistributionChartProps) {
  const data = [
    { name: "Starter", value: distribution.starter, color: "#6b7280" },
    { name: "Hero", value: distribution.hero, color: "#a855f7" },
    { name: "Legend", value: distribution.legend, color: "#fbbf24" },
  ];

  const COLORS = ["#6b7280", "#a855f7", "#fbbf24"];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
      <h2 className="text-2xl font-black text-white mb-4">
        User Distribution by Tier
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => {
                const percent = entry.percent || 0;
                return `${entry.name} ${(percent * 100).toFixed(0)}%`;
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="text-2xl font-black text-gray-400">
            {distribution.starter}
          </div>
          <div className="text-xs text-gray-500">Starter</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-purple-400">
            {distribution.hero}
          </div>
          <div className="text-xs text-gray-500">Hero</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-yellow-400">
            {distribution.legend}
          </div>
          <div className="text-xs text-gray-500">Legend</div>
        </div>
      </div>
    </div>
  );
}
