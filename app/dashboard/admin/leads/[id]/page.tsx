import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import LeadStatusBadge from "@/components/admin/LeadStatusBadge";
import UpdateLeadForm from "@/components/admin/UpdateLeadForm";
import NotesSection from "@/components/admin/NotesSection";
import ConvertToLegendButton from "@/components/admin/ConvertToLegendButton";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lead = await prisma.enterpriseLead.findUnique({
    where: { id },
  });

  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/admin/leads"
            className="text-purple-400 hover:text-purple-300 mb-2 inline-block"
          >
            ← Back to Leads
          </Link>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500">
            {lead.name}
          </h1>
          <p className="text-gray-400 mt-1">
            Submitted{" "}
            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
          </p>
        </div>
        {lead.status !== "CONVERTED" && (
          <ConvertToLegendButton leadId={lead.id} email={lead.email} />
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
          <h3 className="text-xl font-black text-white mb-4">
            Contact Information
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-gray-400 text-sm mb-1">Email</dt>
              <dd className="text-white font-bold">
                <a
                  href={`mailto:${lead.email}`}
                  className="text-purple-400 hover:text-purple-300"
                >
                  {lead.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-gray-400 text-sm mb-1">Company</dt>
              <dd className="text-white">{lead.company || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-400 text-sm mb-1">Team Size</dt>
              <dd className="text-white">{lead.teamSize || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-400 text-sm mb-1">Status</dt>
              <dd>
                <LeadStatusBadge status={lead.status} />
              </dd>
            </div>
            {lead.convertedAt && (
              <div>
                <dt className="text-gray-400 text-sm mb-1">Converted At</dt>
                <dd className="text-green-400 font-bold">
                  {new Date(lead.convertedAt).toLocaleDateString("en-IN", {
                    dateStyle: "long",
                  })}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
          <h3 className="text-xl font-black text-white mb-4">Use Case</h3>
          <p className="text-gray-300 whitespace-pre-wrap mb-6">
            {lead.useCase}
          </p>

          {lead.message && (
            <>
              <h3 className="text-xl font-black text-white mb-4">
                Additional Message
              </h3>
              <p className="text-gray-300 whitespace-pre-wrap">
                {lead.message}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
        <h3 className="text-xl font-black text-white mb-4">Admin Actions</h3>
        <UpdateLeadForm lead={lead} />
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
        <h3 className="text-xl font-black text-white mb-4">Internal Notes</h3>
        <NotesSection leadId={lead.id} notes={lead.notes} />
      </div>
    </div>
  );
}
