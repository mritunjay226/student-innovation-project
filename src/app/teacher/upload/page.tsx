"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
  Loader2,
  GitBranch,
  ShieldCheck,
  HelpCircle,
  Layers,
  ArrowRight,
} from "lucide-react";

type ExtractedConcept = {
  title: string;
  description: string;
  difficulty: number;
  approved: boolean | null;
};

type ExtractedQuestion = {
  question: string;
  type: "mcq" | "true_false";
  options?: string[];
  correctAnswer: string;
  approved: boolean | null;
};

type ExtractedPrereq = {
  from: string;
  to: string;
  approved: boolean | null;
};

export default function UploadLessonPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [concepts, setConcepts] = useState<ExtractedConcept[]>([]);
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [prereqs, setPrereqs] = useState<ExtractedPrereq[]>([]);
  const [extracted, setExtracted] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 25 * 1024 * 1024) {
        alert(`File size exceeds 25 MB limit.`);
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 25 * 1024 * 1024) {
        alert(`File size exceeds 25 MB limit.`);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setExtracting(true);

    await new Promise((r) => setTimeout(r, 1800));

    setConcepts([
      {
        title: "Chain Rule",
        description: "Differentiating composite functions: d/dx[f(g(x))] = f'(g(x)) · g'(x)",
        difficulty: 4,
        approved: null,
      },
      {
        title: "Implicit Differentiation",
        description: "Technique for finding derivatives when y is not explicitly isolated as a function of x",
        difficulty: 4,
        approved: null,
      },
      {
        title: "Related Rates",
        description: "Using derivatives to find how one physical rate changes relative to another over time",
        difficulty: 5,
        approved: null,
      },
    ]);

    setQuestions([
      {
        question: "What is the derivative of f(x) = sin(x²)?",
        type: "mcq",
        options: ["2x · cos(x²)", "cos(x²)", "2x · sin(x²)", "-2x · cos(x²)"],
        correctAnswer: "2x · cos(x²)",
        approved: null,
      },
      {
        question: "When applying implicit differentiation to x² + y² = 25, what is dy/dx?",
        type: "mcq",
        options: ["-x/y", "x/y", "-2x/2y", "25 - 2x"],
        correctAnswer: "-x/y",
        approved: null,
      },
    ]);

    setPrereqs([
      { from: "Power Rule", to: "Chain Rule", approved: null },
      { from: "Chain Rule", to: "Implicit Differentiation", approved: null },
      { from: "Chain Rule", to: "Related Rates", approved: null },
    ]);

    setExtracting(false);
    setExtracted(true);
  };

  const approveItem = (
    type: "concept" | "question" | "prereq",
    index: number,
    status: boolean
  ) => {
    if (type === "concept") {
      setConcepts((prev) =>
        prev.map((c, i) => (i === index ? { ...c, approved: status } : c))
      );
    } else if (type === "question") {
      setQuestions((prev) =>
        prev.map((q, i) => (i === index ? { ...q, approved: status } : q))
      );
    } else {
      setPrereqs((prev) =>
        prev.map((p, i) => (i === index ? { ...p, approved: status } : p))
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 text-[#1C1E23] font-sans antialiased">
      {/* ── 1. Header Bar ── */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-[#E6EAF2]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FE] text-[#2F65F6] text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Curriculum Ingestion Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight m-0">
          Upload Lesson Notes / Syllabus (PPT/PDF)
        </h1>
        <p className="text-xs sm:text-sm text-[#7E8494] font-medium mt-1 mb-0">
          Axiora AI extracts concept nodes, prerequisite links, and diagnostic test banks with human-in-the-loop verification.
        </p>
      </div>

      {/* ── 2. Drag & Drop Upload Arena ── */}
      {!extracted && (
        <div className="bg-white rounded-[28px] p-6 shadow-xs border border-[#E6EAF2]">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[#D1E2FB] hover:border-[#2F65F6] rounded-[24px] p-8 text-center transition-all cursor-pointer bg-[#F8FAFD]"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.pptx,.ppt,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="w-12 h-12 rounded-full bg-[#EBF3FE] text-[#2F65F6] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-[#18181B] mb-1">
              Drag and drop lecture slides, textbook chapters, or click to browse
            </p>
            <p className="text-xs text-[#7E8494] font-medium m-0">
              Supports .pdf, .pptx, .docx up to 25 MB
            </p>
          </div>

          {file && (
            <div className="mt-4 p-4 rounded-2xl bg-[#F4F6FB] border border-[#E2E6F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-[#2F65F6] flex items-center justify-center border border-[#E2E6F0]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#18181B] m-0">{file.name}</p>
                  <p className="text-[10px] text-[#7E8494] font-medium m-0">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={handleExtract}
                disabled={extracting}
                className="bg-[#2F65F6] hover:bg-[#2554D4] disabled:opacity-40 text-white text-xs font-bold py-2.5 px-5 rounded-full shadow-sm shadow-[#2F65F6]/25 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Document…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze & Extract</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 3. Extraction Approval Queue ── */}
      {extracted && (
        <div className="space-y-6">
          {/* Extracted Concepts */}
          <div className="bg-white rounded-[28px] p-6 shadow-xs border border-[#E6EAF2]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2F65F6]" />
                <h3 className="font-extrabold text-sm text-[#18181B] m-0">Extracted Concepts ({concepts.length})</h3>
              </div>
              <span className="text-[10px] font-bold text-[#2F65F6] bg-blue-50 px-2.5 py-0.5 rounded-full">
                Review & Approve
              </span>
            </div>

            <div className="space-y-3">
              {concepts.map((concept, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl flex items-start justify-between gap-4 transition-all bg-[#F8FAFD] border border-[#E2E6F0]"
                  style={{
                    borderColor: concept.approved === true ? "#10b981" : concept.approved === false ? "#f43f5e" : "#E2E6F0",
                    opacity: concept.approved === false ? 0.4 : 1,
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[#18181B]">{concept.title}</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full">
                        Level {concept.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-[#7E8494] font-medium m-0">{concept.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => approveItem("concept", i, true)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        concept.approved === true ? "bg-emerald-600 text-white font-bold" : "bg-white text-[#7E8494] hover:text-emerald-600 border border-[#E2E6F0]"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => approveItem("concept", i, false)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        concept.approved === false ? "bg-rose-600 text-white font-bold" : "bg-white text-[#7E8494] hover:text-rose-600 border border-[#E2E6F0]"
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Draft Diagnostic Questions */}
          <div className="bg-white rounded-[28px] p-6 shadow-xs border border-[#E6EAF2]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#2F65F6]" />
                <h3 className="font-extrabold text-sm text-[#18181B] m-0">Draft Diagnostic Questions ({questions.length})</h3>
              </div>
              <span className="text-[10px] font-bold text-[#2F65F6] bg-blue-50 px-2.5 py-0.5 rounded-full">
                AI Generated
              </span>
            </div>

            <div className="space-y-3">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl flex items-start justify-between gap-4 transition-all bg-[#F8FAFD] border border-[#E2E6F0]"
                  style={{
                    borderColor: q.approved === true ? "#10b981" : q.approved === false ? "#f43f5e" : "#E2E6F0",
                    opacity: q.approved === false ? 0.4 : 1,
                  }}
                >
                  <div className="flex-1">
                    <p className="font-bold text-xs sm:text-sm text-[#18181B] mb-2">{q.question}</p>
                    {q.options && (
                      <div className="flex flex-wrap gap-2">
                        {q.options.map((opt, j) => (
                          <span
                            key={j}
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                              opt === q.correctAnswer
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-white text-[#555C6E] border-[#E2E6F0]"
                            }`}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => approveItem("question", i, true)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        q.approved === true ? "bg-emerald-600 text-white font-bold" : "bg-white text-[#7E8494] hover:text-emerald-600 border border-[#E2E6F0]"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => approveItem("question", i, false)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        q.approved === false ? "bg-rose-600 text-white font-bold" : "bg-white text-[#7E8494] hover:text-rose-600 border border-[#E2E6F0]"
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Prerequisite Edges */}
          <div className="bg-white rounded-[28px] p-6 shadow-xs border border-[#E6EAF2]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#2F65F6]" />
                <h3 className="font-extrabold text-sm text-[#18181B] m-0">Suggested Prerequisite Edges ({prereqs.length})</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Dependencies
              </span>
            </div>

            <div className="space-y-3">
              {prereqs.map((p, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl flex items-center justify-between gap-4 transition-all bg-[#F8FAFD] border border-[#E2E6F0]"
                  style={{
                    borderColor: p.approved === true ? "#10b981" : p.approved === false ? "#f43f5e" : "#E2E6F0",
                    opacity: p.approved === false ? 0.4 : 1,
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
                    <span className="bg-[#EBF3FE] text-[#2F65F6] px-2.5 py-1 rounded-full">{p.from}</span>
                    <span className="text-[#8C93A4]">➔</span>
                    <span className="bg-[#F4F6FB] text-[#181A20] px-2.5 py-1 rounded-full border border-[#E2E6F0]">{p.to}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => approveItem("prereq", i, true)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        p.approved === true ? "bg-emerald-600 text-white font-bold" : "bg-white text-[#7E8494] hover:text-emerald-600 border border-[#E2E6F0]"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => approveItem("prereq", i, false)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        p.approved === false ? "bg-rose-600 text-white font-bold" : "bg-white text-[#7E8494] hover:text-rose-600 border border-[#E2E6F0]"
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commit Actions */}
          <div className="bg-white rounded-[24px] p-5 shadow-xs border border-[#E6EAF2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#7E8494] font-medium m-0">
              Approved: <strong className="text-[#18181B]">{concepts.filter((c) => c.approved).length} concepts</strong>, <strong className="text-[#18181B]">{questions.filter((q) => q.approved).length} questions</strong>, <strong className="text-[#18181B]">{prereqs.filter((p) => p.approved).length} dependencies</strong>
            </p>
            <button
              onClick={() => alert("Approved items committed to Axiora Knowledge Graph!")}
              className="bg-[#2F65F6] hover:bg-[#2554D4] text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-sm shadow-[#2F65F6]/25 flex items-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Commit To Knowledge Graph</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
