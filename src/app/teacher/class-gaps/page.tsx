"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

const SUBJECTS = ["All Subjects", "Mathematics", "Physics", "Chemistry"] as const;
const GRADES = ["All Grades", "Class 10", "Class 11", "Class 12"] as const;

export default function ClassGapsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects");
  const [selectedGrade, setSelectedGrade] = useState<string>("All Grades");
  const [filter, setFilter] = useState<"all" | "Strong" | "Watch" | "High gap">("all");

  const classGaps = useQuery(api.mastery.getClassGaps, {
    subject: selectedSubject !== "All Subjects" ? selectedSubject : undefined,
    grade: selectedGrade !== "All Grades" ? selectedGrade : undefined,
  });

  if (!classGaps) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-2xl mx-auto mb-3 animate-spin border-3 border-purple-600 border-t-transparent" />
          <p className="text-sm text-slate-500 font-bold">Analyzing class learning gaps...</p>
        </div>
      </div>
    );
  }

  const filtered =
    filter === "all" ? classGaps : classGaps.filter((g) => g.signal === filter);

  const highGapPercent =
    classGaps.length > 0
      ? Math.round(
          (classGaps.filter((g) => g.signal === "High gap").length /
            classGaps.length) *
            100
        )
      : 0;

  const getMasteryColor = (score: number) => {
    if (score >= 80) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#e11d48";
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <div className="pill-chip chip-butter mb-2 text-xs font-bold py-1 px-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Class-Wide Learning Diagnostics</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#18181B] mb-1">
          Class Learning Gaps
        </h1>
        <p className="text-sm text-[#71717A] font-medium">
          Identify shared misconceptions and prerequisite bottlenecks across your entire curriculum
        </p>
      </div>

      {/* Subject & Standard Filters */}
      <div className="card-pastel card-white p-3.5 rounded-2xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fade-in-up delay-1 border border-[#EBE5DB]">
        {/* Subject Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-[#71717A] mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Subject:
          </span>
          {SUBJECTS.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`pill-chip text-xs py-1 px-3 font-semibold ${
                selectedSubject === subj ? "chip-dark font-bold" : "chip-white"
              }`}
            >
              <BookOpen className="w-3 h-3" /> {subj}
            </button>
          ))}
        </div>

        {/* Standard Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" /> Standard:
          </span>
          {GRADES.map((grd) => (
            <button
              key={grd}
              onClick={() => setSelectedGrade(grd)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedGrade === grd
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {grd}
            </button>
          ))}
        </div>
      </div>

      {/* AI Insight Card */}
      {highGapPercent > 0 && (
        <div
          className="glass-card p-6 rounded-3xl mb-6 animate-fade-in-up delay-1 bg-amber-50/60 border-amber-200"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl bg-white border border-amber-200 shadow-sm"
            >
              💡
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-extrabold text-base text-amber-900">Actionable Intervention Detected</h3>
                <span className="badge badge-warning">AI Diagnostic</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed max-w-3xl font-medium">
                {highGapPercent}% of topics in this selection show prerequisite decay. Shared patterns detected in foundation stages. <strong>Suggested Action:</strong> Review foundational dependencies and assign a 5-question diagnostic before moving to advanced topics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Signal Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up delay-2">
        {(["all", "Strong", "Watch", "High gap"] as const).map((f) => {
          const count = f === "all" ? classGaps.length : classGaps.filter((g) => g.signal === f).length;
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f === "all" ? "All Statuses" : f}
              <span className="ml-1.5 opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Gaps Table */}
      <div className="glass-card p-6 rounded-3xl animate-fade-in-up delay-3">
        <table className="data-table">
          <thead>
            <tr>
              <th>Concept</th>
              <th>Class Mastery</th>
              <th>Status Signal</th>
              <th>Misconceptions</th>
              <th>Suggested Teacher Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((gap) => (
              <tr key={gap.concept._id}>
                <td>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-900 text-sm">
                        {gap.concept.title}
                      </span>
                      <span className="pill-chip chip-lavender text-[10px] font-bold py-0.5 px-2">
                        <BookOpen className="w-2.5 h-2.5 inline mr-1" /> {gap.concept.subject} • {gap.concept.grade}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold m-0">
                      {gap.studentCount} student{gap.studentCount !== 1 ? "s" : ""} tracked
                    </p>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar w-24">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${gap.avgMastery}%`,
                          background: getMasteryColor(gap.avgMastery),
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-black"
                      style={{ color: getMasteryColor(gap.avgMastery) }}
                    >
                      {gap.avgMastery}%
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    className={`badge ${
                      gap.signal === "Strong"
                        ? "badge-success"
                        : gap.signal === "Watch"
                          ? "badge-warning"
                          : "badge-danger"
                    }`}
                  >
                    {gap.signal}
                  </span>
                </td>
                <td>
                  {gap.misconceptionCount > 0 ? (
                    <span className="badge badge-warning">
                      <AlertTriangle className="w-3 h-3" />
                      {gap.misconceptionCount} pattern{gap.misconceptionCount > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold">
                      Clear
                    </span>
                  )}
                </td>
                <td>
                  <span className="text-xs font-bold text-slate-700">
                    {gap.suggestedAction}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
