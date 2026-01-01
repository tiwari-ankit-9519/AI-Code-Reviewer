"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/admin/jobs", label: "Jobs Dashboard", icon: "⚙️" },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: "📊" },
  ];

  return (
    <nav className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-4 mb-8">
      <div className="flex gap-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                px-6 py-3 rounded-xl font-bold transition-all
                ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white"
                }
              `}
            >
              <span className="mr-2">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
