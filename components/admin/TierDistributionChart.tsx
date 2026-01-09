"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Award, Zap, Crown } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Distribution by Tier
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {distribution.starter}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Starter</div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {distribution.hero}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Hero</div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {distribution.legend}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Legend</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
