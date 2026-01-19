// components/export-buttons.tsx

"use client";

import { useState } from "react";
import {
  exportAnalysisJSON,
  exportAnalysisMarkdown,
} from "@/lib/actions/exports";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileText, FileType, Loader2 } from "lucide-react";

export function ExportButtons({ submissionId }: { submissionId: string }) {
  const [loading, setLoading] = useState<"json" | "markdown" | "pdf" | null>(
    null,
  );

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = async () => {
    setLoading("json");
    try {
      const data = await exportAnalysisJSON(submissionId);
      const json = JSON.stringify(data ?? {}, null, 2);
      downloadFile(json, `analysis-${submissionId}.json`, "application/json");
      toast.success("JSON exported successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to export JSON");
    } finally {
      setLoading(null);
    }
  };

  const handleExportMarkdown = async () => {
    setLoading("markdown");
    try {
      const markdown = (await exportAnalysisMarkdown(submissionId)) ?? "";
      downloadFile(markdown, `analysis-${submissionId}.md`, "text/markdown");
      toast.success("Markdown exported successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to export Markdown");
    } finally {
      setLoading(null);
    }
  };

  const handleExportPDF = async () => {
    setLoading("pdf");
    try {
      const markdown = (await exportAnalysisMarkdown(submissionId)) ?? "";
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      const maxWidth = pageWidth - margin * 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Code Analysis Report", margin, margin + 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      let y = margin + 25;
      const lineHeight = 5;

      const lines = markdown.split("\n");

      for (const line of lines) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        if (line.startsWith("# ")) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          y += lineHeight;
        } else if (line.startsWith("## ")) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          y += lineHeight / 2;
        } else if (line.startsWith("### ")) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          y += lineHeight / 2;
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
        }

        const wrapped = doc.splitTextToSize(
          line.replace(/^#+\s/, ""),
          maxWidth,
        );

        for (const txt of wrapped) {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(txt, margin, y);
          y += lineHeight;
        }

        y += lineHeight / 2;
      }

      doc.save(`analysis-${submissionId}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to export PDF");
    } finally {
      setLoading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading !== null}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleExportJSON}
          disabled={loading !== null}
        >
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportMarkdown}
          disabled={loading !== null}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} disabled={loading !== null}>
          <FileType className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
