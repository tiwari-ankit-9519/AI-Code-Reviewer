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
        toast.success("Quest started!", {
          description: "Analysis is in progress...",
        });
        router.push(`/dashboard/submissions/${result.id}`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Quest failed", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-4xl md:text-5xl font-black text-white font-mono uppercase"
          style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
        >
          ⚔️ New Quest
        </h1>
        <p className="text-gray-400 mt-2 font-mono text-lg">
          Submit your code for AI-powered battle analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-500/20 border-2 border-red-400 text-red-300 px-6 py-4 rounded-xl font-mono shadow-lg shadow-red-500/20">
            ✗ {error}
          </div>
        )}

        <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 p-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-black text-gray-300 mb-2 font-mono uppercase">
                📄 File Name (Optional)
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="example.js"
                className="w-full px-4 py-3 bg-[#0a0e27] border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-300 mb-2 font-mono uppercase">
                💻 Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0e27] border-2 border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition font-mono"
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
            className={`border-4 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragging
                ? "border-yellow-400 bg-yellow-500/10 shadow-lg shadow-yellow-500/50"
                : "border-purple-500/50 hover:border-yellow-400/50 hover:bg-purple-500/5"
            }`}
          >
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all ${
                isDragging ? "bg-yellow-500 scale-110" : "bg-purple-500"
              }`}
            >
              <svg
                className="w-8 h-8 text-white"
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
            </div>
            <p className="text-white font-black mb-2 font-mono text-lg">
              Drop your code file here
            </p>
            <p className="text-sm text-gray-400 mb-4 font-mono">or</p>
            <label className="inline-block px-6 py-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-black hover:from-blue-400 hover:to-cyan-400 cursor-pointer transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:-translate-y-1 font-mono uppercase border-4 border-blue-600">
              📁 Browse Files
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
            <p className="text-xs text-gray-500 mt-6 font-mono">
              Supports: JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust,
              PHP, Ruby, Swift, Kotlin
            </p>
            <p className="text-xs text-gray-500 font-mono">
              Maximum file size: 100KB
            </p>
          </div>
        </div>

        <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 shadow-2xl overflow-hidden">
          <div className="bg-[#1e1e1e] px-4 py-3 flex items-center justify-between border-b-2 border-[#2d2d2d]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <span className="text-xs text-gray-400 font-mono font-bold">
              📄 {fileName || `untitled.${language}`}
            </span>
          </div>

          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here to begin your quest..."
              className="w-full h-96 p-4 font-mono text-sm bg-[#1e1e1e] text-gray-100 resize-none focus:outline-none placeholder-gray-600"
              style={{ tabSize: 2 }}
            />
          </div>

          {code && (
            <div className="border-t-2 border-[#2d2d2d]">
              <div className="bg-[#252526] px-4 py-2">
                <p className="text-xs text-purple-400 font-mono font-bold uppercase">
                  👁️ Preview
                </p>
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

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-700 text-white rounded-xl font-black hover:bg-gray-600 transition-all border-4 border-gray-800 font-mono uppercase"
          >
            ← Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-8 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase border-4 border-yellow-600"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-6 w-6"
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
              "⚔️ Start Quest"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
