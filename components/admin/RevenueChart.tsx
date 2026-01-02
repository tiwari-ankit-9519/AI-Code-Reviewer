"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueData {
  periodStart: Date;
  mrr: number | null;
  totalUsers: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    month: new Date(item.periodStart).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    }),
    mrr: item.mrr ? item.mrr / 100 : 0,
    users: item.totalUsers,
  }));

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
      <h2 className="text-2xl font-black text-white mb-4">Revenue Trend</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              formatter={(value: number | undefined) => {
                const amount = value || 0;
                return [`₹${amount.toLocaleString("en-IN")}`, "MRR"];
              }}
            />
            <Line
              type="monotone"
              dataKey="mrr"
              stroke="#a855f7"
              strokeWidth={3}
              dot={{ fill: "#a855f7", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-400">
        Last 12 months revenue performance
      </div>
    </div>
  );
}
