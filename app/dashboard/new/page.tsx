"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { submitCode } from "@/lib/actions/submissions";
import { toast } from "sonner";

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript", extensions: [".js", ".jsx"] },
  { value: "typescript", label: "TypeScript", extensions: [".ts", ".tsx"] },
  { value: "python", label: "Python", extensions: [".py"] },
  { value: "java", label: "Java", extensions: [".java"] },
  { value: "cpp", label: "C++", extensions: [".cpp", ".cc", ".cxx"] },
  { value: "c", label: "C", extensions: [".c", ".h"] },
  { value: "csharp", label: "C#", extensions: [".cs"] },
  { value: "go", label: "Go", extensions: [".go"] },
  { value: "rust", label: "Rust", extensions: [".rs"] },
  { value: "php", label: "PHP", extensions: [".php"] },
  { value: "ruby", label: "Ruby", extensions: [".rb"] },
  { value: "swift", label: "Swift", extensions: [".swift"] },
  { value: "kotlin", label: "Kotlin", extensions: [".kt"] },
];

export default function NewSubmissionPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const detectLanguage = (filename: string): string => {
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    const detected = SUPPORTED_LANGUAGES.find((lang) =>
      lang.extensions.includes(ext)
    );
    return detected?.value || "javascript";
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > 100000) {
      setError("File size must be less than 100KB");
      toast.error("File too large", {
        description: "File size must be less than 100KB",
      });
      return;
    }

    const text = await file.text();
    setCode(text);
    setFileName(file.name);
    setLanguage(detectLanguage(file.name));
    setError("");
    toast.success("File loaded successfully");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!code.trim()) {
      setError("Please enter or upload code");
      setLoading(false);
      return;
    }

    try {
      const result = await submitCode({
        code,
        language,
        fileName: fileName || `untitled.${language}`,
      });

      if (result.success) {
        toast.success("Code submitted successfully", {
          description: "Analysis is in progress...",
        });
        router.push(`/dashboard/submissions/${result.id}`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Submission failed", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#15192c]">New Code Review</h1>
        <p className="text-[#6c7681] mt-2">
          Submit your code for AI-powered analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg border border-[#ececec] p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#21242c] mb-2">
                File Name (Optional)
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="example.js"
                className="w-full px-4 py-2 border border-[#ececec] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#21242c] mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-[#ececec] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-[#ececec] hover:border-blue-300"
            }`}
          >
            <svg
              className="w-12 h-12 text-[#b2b5be] mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-[#6c7681] font-medium mb-2">
              Drop your code file here
            </p>
            <p className="text-sm text-[#b2b5be] mb-4">or</p>
            <label className="inline-block px-4 py-2 bg-[#f9f9fa] border border-[#ececec] rounded-lg text-sm font-medium text-[#15192c] hover:bg-gray-100 cursor-pointer transition">
              Browse Files
              <input
                type="file"
                className="hidden"
                accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.go,.rs,.php,.rb,.swift,.kt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>
            <p className="text-xs text-[#b2b5be] mt-4">
              Supports: JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust,
              PHP, Ruby, Swift, Kotlin
            </p>
            <p className="text-xs text-[#b2b5be]">Maximum file size: 100KB</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#ececec] shadow-sm overflow-hidden">
          <div className="bg-[#1e1e1e] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              {fileName || `untitled.${language}`}
            </span>
          </div>

          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full h-96 p-4 font-mono text-sm bg-[#1e1e1e] text-gray-100 resize-none focus:outline-none"
              style={{ tabSize: 2 }}
            />
          </div>

          {code && (
            <div className="border-t border-[#2d2d2d]">
              <div className="bg-[#252526] px-4 py-2">
                <p className="text-xs text-gray-400">Preview</p>
              </div>
              <div className="max-h-64 overflow-auto">
                <SyntaxHighlighter
                  language={language}
                  style={vscDarkPlus}
                  showLineNumbers
                  wrapLines
                  customStyle={{
                    margin: 0,
                    fontSize: "13px",
                    background: "#1e1e1e",
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-[#ececec] rounded-lg font-medium text-[#15192c] hover:bg-[#f9f9fa] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit for Review"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
