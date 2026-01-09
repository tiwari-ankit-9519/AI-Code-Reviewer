import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import LeadStatusBadge from "@/components/admin/LeadStatusBadge";
import {
  Rocket,
  Users,
  Circle,
  Phone,
  Star,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

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
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Rocket className="h-8 w-8" />
          Enterprise Leads
        </h1>
        <p className="text-muted-foreground">
          Manage Legend tier inquiries and conversions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Circle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-600 dark:text-blue-400">New</p>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.new}
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Contacted
              </p>
            </div>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.contacted}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-primary" />
              <p className="text-sm text-primary">Qualified</p>
            </div>
            <p className="text-3xl font-bold text-primary">{stats.qualified}</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-600 dark:text-green-400">
                Converted
              </p>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.converted}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">Lost</p>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.lost}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        {leads.length === 0 ? (
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Rocket className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No enterprise leads yet</p>
            </div>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Team Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{lead.company || "—"}</TableCell>
                    <TableCell>{lead.teamSize || "—"}</TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/admin/leads/${lead.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
