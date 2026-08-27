"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  X,
  Loader2,
  GitBranch,
  ShieldCheck,
  HelpCircle,
  Layers,
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
    if (droppedFile) setFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleExtract = async () => {
    if (!file) return;
    setExtracting(true);

    await new Promise((r) => setTimeout(r, 2200));

    setConcepts([
      {
        title: "Chain Rule",
        description:
          "Differentiating composite functions: d/dx[f(g(x))] = f'(g(x)) · g'(x)",
        difficulty: 4,
        approved: null,
      },
      {
        title: "Implicit Differentiation",
        description:
          "Technique for finding derivatives when y is not explicitly isolated as a function of x",
        difficulty: 4,
        approved: null,
      },
      {
        title: "Related Rates",
        description:
          "Using derivatives to find how one physical rate changes relative to another over time",
        difficulty: 5,
        approved: null,
      },
    ]);

    setQuestions([
      {
        question: "Using the chain rule, what is d/dx of sin(3x²)?",
        type: "mcq",
        options: ["6x·cos(3x²)", "cos(3x²)", "3x·sin(3x²)", "6x·sin(3x²)"],
        correctAnswer: "6x·cos(3x²)",
        approved: null,
      },
      {
        question: "The chain rule is required when taking derivatives of nested/composite functions.",
        type: "true_false",
        correctAnswer: "true",
        approved: null,
      },
      {
        question: "If x² + y² = 25, what is dy/dx via implicit differentiation?",
        type: "mcq",
        options: ["-x/y", "x/y", "-y/x", "y/x"],
        correctAnswer: "-x/y",
        approved: null,
      },
    ]);

    setPrereqs([
      { from: "Derivatives", to: "Chain Rule", approved: null },
      { from: "Chain Rule", to: "Implicit Differentiation", approved: null },
      { from: "Implicit Differentiation", to: "Related Rates", approved: null },
    ]);

    setExtracted(true);
    setExtracting(false);
  };

  const approveItem = (
    type: "concept" | "question" | "prereq",
    index: number,
    value: boolean
  ) => {
    if (type === "concept") {
      setConcepts((prev) =>
        prev.map((c, i) => (i === index ? { ...c, approved: value } : c))
      );
    } else if (type === "question") {
      setQuestions((prev) =>
        prev.map((q, i) => (i === index ? { ...q, approved: value } : q))
      );
    } else {
      setPrereqs((prev) =>
        prev.map((p, i) => (i === index ? { ...p, approved: value } : p))
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="announcement-badge mb-2 text-xs">
          <span>✨ Automated Curriculum Ingestion</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
          Upload Lesson Material
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          AI parses your slides or notes, proposing concepts, prerequisite links, and draft diagnostic questions for teacher validation
        </p>
      </div>

      {/* Human in the loop assurance card */}
      <div
        className="glass-card p-5 rounded-3xl mb-8 animate-fade-in-up delay-1 flex items-start gap-4 bg-purple-50/60 border-purple-200"
      >
        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          <strong className="text-purple-900">Human-In-The-Loop Design:</strong> AI creates drafts; educators approve, modify, or reject every relationship. No opaque black-box curriculum graphs.
        </p>
      </div>

      {/* Upload Drop Zone */}
      {!extracted && (
        <div className="animate-fade-in-up delay-2">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="glass-card p-14 rounded-3xl text-center cursor-pointer transition-all duration-300 group border-2 border-dashed border-purple-200 hover:border-purple-500"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.pptx,.ppt,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              Drop your PPT / PDF lesson file here
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Supports slides, lecture notes, textbook chapters (.pdf, .pptx)
            </p>
          </div>

          {file && (
            <div
              className="glass-card mt-4 p-5 rounded-2xl flex items-center justify-between animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 mb-0.5">{file.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={handleExtract}
                disabled={extracting}
                className="btn-pill-primary text-xs py-2 px-5"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting Concepts...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze & Extract
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Extraction Approval Panes */}
      {extracted && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Concepts */}
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Extracted Concepts ({concepts.length})</h3>
              </div>
              <span className="badge badge-purple">Approve to add to graph</span>
            </div>

            <div className="space-y-3">
              {concepts.map((concept, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl flex items-start justify-between gap-4 transition-all bg-slate-50 border"
                  style={{
                    borderColor: concept.approved === true ? "#10b981" : concept.approved === false ? "#f43f5e" : "#e2e8f0",
                    opacity: concept.approved === false ? 0.4 : 1,
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">{concept.title}</span>
                      <span className="badge badge-purple text-[10px]">Difficulty {concept.difficulty}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{concept.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveItem("concept", i, true)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm ${concept.approved === true ? "bg-emerald-500 text-white font-bold" : "bg-white text-slate-400 hover:text-emerald-600 border border-slate-200"}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => approveItem("concept", i, false)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm ${concept.approved === false ? "bg-rose-500 text-white font-bold" : "bg-white text-slate-400 hover:text-rose-600 border border-slate-200"}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Draft Questions */}
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Draft Diagnostic Questions ({questions.length})</h3>
              </div>
              <span className="badge badge-purple">AI Generated</span>
            </div>

            <div className="space-y-3">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl flex items-start justify-between gap-4 transition-all bg-slate-50 border"
                  style={{
                    borderColor: q.approved === true ? "#10b981" : q.approved === false ? "#f43f5e" : "#e2e8f0",
                    opacity: q.approved === false ? 0.4 : 1,
                  }}
                >
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 mb-2">{q.question}</p>
                    {q.options && (
                      <div className="flex flex-wrap gap-2">
                        {q.options.map((opt, j) => (
                          <span
                            key={j}
                            className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                            style={{
                              background: opt === q.correctAnswer ? "#ecfdf5" : "#ffffff",
                              color: opt === q.correctAnswer ? "#059669" : "#64748b",
                              border: `1px solid ${opt === q.correctAnswer ? "#a7f3d0" : "#e2e8f0"}`,
                            }}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveItem("question", i, true)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm ${q.approved === true ? "bg-emerald-500 text-white font-bold" : "bg-white text-slate-400 hover:text-emerald-600 border border-slate-200"}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => approveItem("question", i, false)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm ${q.approved === false ? "bg-rose-500 text-white font-bold" : "bg-white text-slate-400 hover:text-rose-600 border border-slate-200"}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Prerequisite Edges */}
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Suggested Prerequisite Edges ({prereqs.length})</h3>
              </div>
              <span className="badge badge-success">Dependencies</span>
            </div>

            <div className="space-y-3">
              {prereqs.map((p, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl flex items-center justify-between gap-4 transition-all bg-slate-50 border"
                  style={{
                    borderColor: p.approved === true ? "#10b981" : p.approved === false ? "#f43f5e" : "#e2e8f0",
                    opacity: p.approved === false ? 0.4 : 1,
                  }}
                >
                  <div className="flex items-center gap-3 font-bold text-xs">
                    <span className="badge badge-purple">{p.from}</span>
                    <span className="text-slate-400">➔</span>
                    <span className="badge badge-info">{p.to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approveItem("prereq", i, true)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm ${p.approved === true ? "bg-emerald-500 text-white font-bold" : "bg-white text-slate-400 hover:text-emerald-600 border border-slate-200"}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => approveItem("prereq", i, false)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm ${p.approved === false ? "bg-rose-500 text-white font-bold" : "bg-white text-slate-400 hover:text-rose-600 border border-slate-200"}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commit Actions */}
          <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
            <p className="text-xs text-slate-600 font-medium">
              Approved: <strong className="text-slate-900">{concepts.filter((c) => c.approved).length} concepts</strong>, <strong className="text-slate-900">{questions.filter((q) => q.approved).length} questions</strong>, <strong className="text-slate-900">{prereqs.filter((p) => p.approved).length} dependencies</strong>
            </p>
            <button className="btn-pill-primary">
              <CheckCircle className="w-4 h-4" /> Commit To Knowledge Graph
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
