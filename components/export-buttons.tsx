/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  exportAnalysisJSON,
  exportAnalysisMarkdown,
} from "@/lib/actions/exports";
import { toast } from "sonner";

export function ExportButtons({ submissionId }: { submissionId: string }) {
  const [loading, setLoading] = useState<"json" | "markdown" | "pdf" | null>(
    null
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
          maxWidth
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
      toast.error("Failed to export PDF");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleExportJSON}
        disabled={loading !== null}
        className="flex items-center gap-2 px-4 py-2 border border-[#ececec] rounded-lg font-medium text-[#15192c] hover:bg-[#f9f9fa] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading === "json" ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
        JSON
      </button>

      <button
        onClick={handleExportMarkdown}
        disabled={loading !== null}
        className="flex items-center gap-2 px-4 py-2 border border-[#ececec] rounded-lg font-medium text-[#15192c] hover:bg-[#f9f9fa] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading === "markdown" ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
        Markdown
      </button>

      <button
        onClick={handleExportPDF}
        disabled={loading !== null}
        className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading === "pdf" ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
        PDF
      </button>
    </div>
  );
}
