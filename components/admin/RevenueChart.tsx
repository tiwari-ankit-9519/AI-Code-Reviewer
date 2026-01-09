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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenue Trend
        </CardTitle>
        <CardDescription>Last 12 months revenue performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                opacity={0.3}
              />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))",
                }}
                labelStyle={{
                  color: "hsl(var(--popover-foreground))",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
                formatter={(value: number | string | undefined) => {
                  const amount = typeof value === "number" ? value : 0;
                  return [`₹${amount.toLocaleString("en-IN")}`, "MRR"];
                }}
              />
              <Line
                type="monotone"
                dataKey="mrr"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{
                  fill: "hsl(var(--primary))",
                  r: 4,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
