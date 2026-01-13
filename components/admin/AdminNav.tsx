// components/admin/AdminNav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard,
  TrendingUp,
  Clock,
  BarChart3,
  CreditCard,
  Users,
  Rocket,
  Settings,
  Activity,
  Shield,
  Timer,
  Ticket,
} from "lucide-react";
export default function AdminNav() {
  const pathname = usePathname();
  const links = [
    {
      href: "/dashboard/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/admin/subscription-analytics",
      label: "Revenue Analytics",
      icon: TrendingUp,
    },
    {
      href: "/dashboard/admin/jobs",
      label: "Cron Jobs",
      icon: Clock,
    },
    {
      href: "/dashboard/admin/analytics",
      label: "Cron Analytics",
      icon: BarChart3,
    },
    {
      href: "/dashboard/admin/subscription",
      label: "Subscriptions",
      icon: CreditCard,
    },
    {
      href: "/dashboard/admin/users",
      label: "Users",
      icon: Users,
    },
    {
      href: "/dashboard/admin/users/session-analytics",
      label: "Session Analytics",
      icon: Activity,
    },
    {
      href: "/dashboard/admin/users/cooling-periods",
      label: "Cooling Periods",
      icon: Timer,
    },
    {
      href: "/dashboard/admin/leads",
      label: "Leads",
      icon: Rocket,
    },
    {
      href: "/dashboard/admin/tier-config",
      label: "Tier Config",
      icon: Settings,
    },
    {
      href: "/dashboard/admin/system-health",
      label: "System Health",
      icon: Shield,
    },
    {
      href: "/dashboard/admin/support",
      label: "Support Tickets",
      icon: Ticket,
    },
  ];
  return (
    <Card className="mb-6 p-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
