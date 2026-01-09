import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/dashboard-nav";
import { TrialBanner } from "@/components/trial-banner";
import { checkTrialStatus } from "@/lib/subscription/subscription-utils";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
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
    redirect("/");
  }

  const trialStatus = await checkTrialStatus(session.user.id);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      {trialStatus.isInTrial && (
        <div className="sticky top-16 z-40 animate-in slide-in-from-top duration-300">
          <TrialBanner trialStatus={trialStatus} />
        </div>
      )}

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in slide-in-from-bottom duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
