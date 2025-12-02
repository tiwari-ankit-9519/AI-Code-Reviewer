import { auth } from "@/lib/auth";
import DashboardNav from "@/components/dashboard-nav"; // adjust path as needed

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  console.log(session);
  console.table(session);

  console.log(session?.user);
  console.table(session?.user);
  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <DashboardNav user={session.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
