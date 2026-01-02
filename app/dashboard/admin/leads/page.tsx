import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LeadStatusBadge from "@/components/admin/LeadStatusBadge";

async function getLeadStats() {
  const leads = await prisma.enterpriseLead.findMany({
    select: { status: true },
  });

  return {
    total: leads.length,
    new: leads.filter((l) => l.status === "NEW").length,
    contacted: leads.filter((l) => l.status === "CONTACTED").length,
    qualified: leads.filter((l) => l.status === "QUALIFIED").length,
    converted: leads.filter((l) => l.status === "CONVERTED").length,
    lost: leads.filter((l) => l.status === "LOST").length,
  };
}

export default async function AdminLeads() {
  const [leads, stats] = await Promise.all([
    prisma.enterpriseLead.findMany({
      orderBy: { createdAt: "desc" },
    }),
    getLeadStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500 mb-2">
          ENTERPRISE LEADS
        </h1>
        <p className="text-gray-400">
          Manage Legend tier inquiries and conversions
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Total Leads</div>
          <div className="text-3xl font-black text-white">{stats.total}</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-blue-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">New</div>
          <div className="text-3xl font-black text-blue-400">{stats.new}</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-yellow-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Contacted</div>
          <div className="text-3xl font-black text-yellow-400">
            {stats.contacted}
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Qualified</div>
          <div className="text-3xl font-black text-purple-400">
            {stats.qualified}
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-green-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Converted</div>
          <div className="text-3xl font-black text-green-400">
            {stats.converted}
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-red-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Lost</div>
          <div className="text-3xl font-black text-red-400">{stats.lost}</div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
        {leads.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No enterprise leads yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b-2 border-purple-500/30">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-400 text-sm font-bold">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-gray-400 text-sm font-bold">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-gray-400 text-sm font-bold">
                    Team Size
                  </th>
                  <th className="px-6 py-4 text-left text-gray-400 text-sm font-bold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-gray-400 text-sm font-bold">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-gray-400 text-sm font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-all"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-white">{lead.name}</p>
                        <p className="text-sm text-gray-400">{lead.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {lead.company || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {lead.teamSize || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/admin/leads/${lead.id}`}>
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-all">
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
