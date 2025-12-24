import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/dashboard-nav";
import { TrialBanner } from "@/components/trial-banner";
import { checkTrialStatus } from "@/lib/subscription/subscription-utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      trialEndsAt: true,
    },
  });

  if (!user) {
    return null;
  }

  const trialStatus = await checkTrialStatus(session.user.id);

  return (
    <div className="min-h-screen bg-[#0a0e27] relative">
      <DashboardNav user={user} />

      {trialStatus.isInTrial && <TrialBanner trialStatus={trialStatus} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

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
