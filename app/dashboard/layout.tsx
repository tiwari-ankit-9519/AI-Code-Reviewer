import { auth } from "@/lib/auth";
import DashboardNav from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] relative">
      {/* Navigation - handled by DashboardNav component */}
      <DashboardNav user={session.user} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-2 h-2 bg-pink-400 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-60 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>
    </div>
  );
}
