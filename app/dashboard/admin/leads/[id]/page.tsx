import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LeadStatusBadge from "@/components/admin/LeadStatusBadge";
import UpdateLeadForm from "@/components/admin/UpdateLeadForm";
import NotesSection from "@/components/admin/NotesSection";
import ConvertToLegendButton from "@/components/admin/ConvertToLegendButton";
import {
  ArrowLeft,
  Mail,
  Building2,
  Users,
  FileText,
  MessageSquare,
  Settings,
  StickyNote,
} from "lucide-react";

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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link href="/dashboard/admin/leads">
            <Button variant="ghost" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Leads
            </Button>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">{lead.name}</h1>
          <p className="text-muted-foreground">
            Submitted{" "}
            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
          </p>
        </div>
        {lead.status !== "CONVERTED" && (
          <ConvertToLegendButton leadId={lead.id} email={lead.email} />
        )}
      </div>

      {/* Contact & Use Case Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">
                  Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {lead.email}
                  </a>
                </dd>
              </div>

              <Separator />

              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company
                </dt>
                <dd className="font-medium">{lead.company || "—"}</dd>
              </div>

              <Separator />

              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Size
                </dt>
                <dd className="font-medium">{lead.teamSize || "—"}</dd>
              </div>

              <Separator />

              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">
                  Status
                </dt>
                <dd>
                  <LeadStatusBadge status={lead.status} />
                </dd>
              </div>

              {lead.convertedAt && (
                <>
                  <Separator />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">
                      Converted At
                    </dt>
                    <dd className="font-semibold text-green-600 dark:text-green-400">
                      {new Date(lead.convertedAt).toLocaleDateString("en-IN", {
                        dateStyle: "long",
                      })}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Use Case & Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Use Case
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {lead.useCase}
              </p>
            </div>

            {lead.message && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Additional Message
                  </h4>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {lead.message}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateLeadForm lead={lead} />
        </CardContent>
      </Card>

      {/* Internal Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Internal Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotesSection leadId={lead.id} notes={lead.notes} />
        </CardContent>
      </Card>
    </div>
  );
}
