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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full mx-auto mb-3 animate-spin border-2 border-[#2F65F6] border-t-transparent" />
          <p className="text-xs font-bold text-[#8C93A4]">Analyzing class learning gaps…</p>
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-[#1C1E23] font-sans antialiased">
      {/* ── 1. Header Bar ── */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-[#E6EAF2]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FE] text-[#2F65F6] text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Class-Wide Learning Diagnostics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight m-0">
          Class Learning Gaps & Prerequisite Bottlenecks
        </h1>
        <p className="text-xs sm:text-sm text-[#7E8494] font-medium mt-1 mb-0">
          Identify shared misconceptions and prerequisite fractures across your entire enrolled cohort.
        </p>
      </div>

      {/* ── 2. Filters ── */}
      <div className="bg-white rounded-2xl p-4 border border-[#E6EAF2] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Subject Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#7E8494] mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Subject:
          </span>
          {SUBJECTS.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                selectedSubject === subj
                  ? "bg-[#2F65F6] text-white shadow-sm shadow-[#2F65F6]/25"
                  : "bg-[#F4F6FB] text-[#555C6E] hover:text-[#181A20] border border-[#E2E6F0]"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Grade Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#7E8494] mr-1 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" /> Grade:
          </span>
          {GRADES.map((grd) => (
            <button
              key={grd}
              onClick={() => setSelectedGrade(grd)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                selectedGrade === grd
                  ? "bg-[#181A20] text-white"
                  : "bg-[#F4F6FB] text-[#7E8494] hover:text-[#181A20] border border-[#E2E6F0]"
              }`}
            >
              {grd}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. AI Intervention Insight Banner ── */}
      {highGapPercent > 0 && (
        <div className="bg-white rounded-[26px] p-5 shadow-xs border border-[#E6EAF2] flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 text-lg">
            💡
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-extrabold text-sm text-[#18181B] m-0">Actionable Remediation Triggered</h3>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                AI Diagnostic
              </span>
            </div>
            <p className="text-xs text-[#7E8494] font-medium leading-relaxed max-w-3xl m-0">
              {highGapPercent}% of topics in this selection show prerequisite decay. Shared patterns detected in foundation stages. <strong className="text-[#18181B]">Suggested Action:</strong> Assign a targeted 5-question Socratic review before assigning exams.
            </p>
          </div>
        </div>
      )}

      {/* ── 4. Status Signal Filter Tabs ── */}
      <div className="flex flex-wrap gap-2">
        {(["all", "Strong", "Watch", "High gap"] as const).map((f) => {
          const count = f === "all" ? classGaps.length : classGaps.filter((g) => g.signal === f).length;
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer ${
                isActive
                  ? "bg-[#2F65F6] text-white shadow-sm shadow-[#2F65F6]/25"
                  : "bg-white text-[#555C6E] border border-[#E2E6F0] hover:bg-[#F4F6FB]"
              }`}
            >
              {f === "all" ? "All Statuses" : f}
              <span className="ml-1.5 opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* ── 5. Gaps Table ── */}
      <div className="bg-white rounded-[28px] p-6 shadow-xs border border-[#E6EAF2]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#F0F3F8] text-[#8C93A4] font-bold">
                <th className="pb-3 px-3">Concept</th>
                <th className="pb-3 px-3">Class Mastery</th>
                <th className="pb-3 px-3">Status Signal</th>
                <th className="pb-3 px-3">Misconceptions</th>
                <th className="pb-3 px-3">Suggested Teacher Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F8]">
              {filtered.map((gap) => (
                <tr key={gap.concept._id} className="hover:bg-[#FAFBFD] transition-colors">
                  <td className="py-3.5 px-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#18181B] text-sm">
                          {gap.concept.title}
                        </span>
                        <span className="text-[10px] font-bold text-[#7E8494] bg-[#F4F6FB] border border-[#E2E6F0] py-0.5 px-2 rounded-full">
                          {gap.concept.subject} • {gap.concept.grade}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8C93A4] font-medium m-0">
                        {gap.studentCount} student{gap.studentCount !== 1 ? "s" : ""} tracked
                      </p>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-24 h-1.5 rounded-full bg-[#E5E9F2] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#2F65F6] transition-all"
                          style={{ width: `${gap.avgMastery}%` }}
                        />
                      </div>
                      <span className="font-black text-[#18181B]">
                        {gap.avgMastery}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        gap.signal === "Strong"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : gap.signal === "Watch"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {gap.signal}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    {gap.misconceptionCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        {gap.misconceptionCount} pattern{gap.misconceptionCount > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-[#8C93A4] font-semibold">
                        Clear
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-xs font-bold text-[#555C6E]">
                      {gap.suggestedAction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
