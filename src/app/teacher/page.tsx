"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Users,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Brain,
  Sparkles,
  ArrowRight,
  GitBranch,
  Upload,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

export default function TeacherDashboard() {
  const classGaps = useQuery(api.mastery.getClassGaps, {});
  const users = useQuery(api.users.getAll, {});

  if (!classGaps || !users) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full mx-auto mb-3 animate-spin border-2 border-[#2F65F6] border-t-transparent" />
          <p className="text-xs font-bold text-[#8C93A4]">
            Aggregating class diagnostics…
          </p>
        </div>
      </div>
    );
  }

  const students = users.filter((u) => u.role === "student");
  const avgClassMastery =
    classGaps.length > 0
      ? Math.round(
          classGaps.reduce((sum, g) => sum + g.avgMastery, 0) / classGaps.length
        )
      : 0;
  const highGapConcepts = classGaps.filter((g) => g.signal === "High gap");
  const totalMisconceptions = classGaps.reduce(
    (sum, g) => sum + g.misconceptionCount,
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-[#1C1E23] font-sans antialiased">
      {/* ── 1. Header Bar ── */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-[#E6EAF2]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FE] text-[#2F65F6] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Class Analytics & Pedagogical Oversight</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight m-0">
              Teacher Console • Dr. Priya Sharma
            </h1>
            <p className="text-xs sm:text-sm text-[#7E8494] font-medium mt-1 mb-0">
              Multi-Subject STEM Curriculum • Automated prerequisite bottleneck diagnostics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/teacher/upload"
              className="bg-[#2F65F6] hover:bg-[#2554D4] text-white text-xs font-bold py-2.5 px-5 rounded-full shadow-sm shadow-[#2F65F6]/25 flex items-center gap-2 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Syllabus PPT/PDF</span>
            </Link>
            <Link
              href="/teacher/concept-map"
              className="bg-white hover:bg-[#F4F6FB] text-[#181A20] text-xs font-bold py-2.5 px-5 rounded-full border border-[#E2E6F0] flex items-center gap-2 transition-all"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#2F65F6]" />
              <span>Prerequisite Graph</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#FFE4D6] via-[#FFBFA8] to-[#FFA199] rounded-[24px] p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A2C18]">Enrolled Students</span>
            <div className="w-7 h-7 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-[#2A1208]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#1C1E23] tracking-tight">{students.length}</div>
            <div className="text-[11px] font-semibold text-[#5A2C18] mt-0.5">Active Class 12 Roster</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#C4F6EE] via-[#A8E2F9] to-[#99B6F9] rounded-[24px] p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E3830]">Avg Class Mastery</span>
            <div className="w-7 h-7 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-[#082420]">
              <Brain className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#1C1E23] tracking-tight">{avgClassMastery}%</div>
            <div className="text-[11px] font-semibold text-[#0E3830] mt-0.5">Across all concepts</div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-5 border border-[#E6EAF2] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8494]">Critical Bottlenecks</span>
            <div className="w-7 h-7 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#FF7A00]">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">{highGapConcepts.length}</div>
            <div className="text-[11px] font-semibold text-[#7E8494] mt-0.5">High learning gap nodes</div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-5 border border-[#E6EAF2] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8494]">Misconceptions Flagged</span>
            <div className="w-7 h-7 rounded-full bg-[#EBF3FE] flex items-center justify-center text-[#2F65F6]">
              <Sparkles className="w-3.5 h-3.5 fill-[#2F65F6]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">{totalMisconceptions}</div>
            <div className="text-[11px] font-semibold text-[#7E8494] mt-0.5">Cognitive errors detected</div>
          </div>
        </div>
      </div>

      {/* ── 3. AI Class Intervention Alert Banner ── */}
      {highGapConcepts.length > 0 && (
        <div className="bg-white rounded-[28px] p-6 shadow-xs border border-[#E6EAF2] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-extrabold text-base text-[#18181B] m-0">
                  AI Diagnostic Insight: Shared Prerequisite Bottlenecks
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Signal
                </span>
              </div>
              <p className="text-xs text-[#7E8494] font-medium max-w-2xl leading-relaxed m-0">
                Multiple students show prerequisite fractures in downstream physics & calculus. <strong className="text-[#18181B]">Recommendation:</strong> Assign a targeted 5-question Socratic teach-back review.
              </p>
            </div>
          </div>

          <Link
            href="/teacher/class-gaps"
            className="bg-[#2F65F6] hover:bg-[#2554D4] text-white text-xs font-bold py-2.5 px-5 rounded-full shadow-xs shadow-[#2F65F6]/25 flex items-center gap-1.5 shrink-0"
          >
            <span>View Gaps</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── 4. Quick Navigation Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            href: "/teacher/class-gaps",
            title: "Class Learning Gaps",
            desc: "Concept-by-concept mastery breakdown and actionable remediation triggers.",
            icon: TrendingUp,
          },
          {
            href: "/teacher/concept-map",
            title: "Editable Concept Graph",
            desc: "Add concepts, verify AI dependencies, and connect curriculum prerequisites.",
            icon: GitBranch,
          },
          {
            href: "/teacher/upload",
            title: "AI Lesson Ingestion",
            desc: "Drop PPT/PDF to auto-extract concepts and draft assessment questions.",
            icon: Upload,
          },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="bg-white rounded-[26px] p-6 border border-[#E6EAF2] shadow-xs group no-underline transition-all hover:scale-[1.01] hover:border-[#2F65F6] flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-2xl bg-[#F4F6FB] text-[#2F65F6] flex items-center justify-center mb-3 border border-[#E2E6F0] group-hover:bg-[#2F65F6] group-hover:text-white transition-colors">
                <item.icon className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-base text-[#18181B] mb-1.5 group-hover:text-[#2F65F6] transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-[#7E8494] font-medium leading-relaxed mb-4">
                {item.desc}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#F2F4F8] text-xs font-bold text-[#2F65F6]">
              <span>Open Tool</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* ── 5. Class Knowledge Table Preview ── */}
      <div className="bg-white rounded-[28px] p-6 shadow-xs border border-[#E6EAF2]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#18181B] m-0">
            Curriculum Concept Mastery & Action Signals
          </h3>
          <Link
            href="/teacher/class-gaps"
            className="text-xs font-bold text-[#2F65F6] hover:underline"
          >
            Full Table →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#F0F3F8] text-[#8C93A4] font-bold">
                <th className="pb-3 px-2">Concept</th>
                <th className="pb-3 px-2">Class Mastery</th>
                <th className="pb-3 px-2">Status Signal</th>
                <th className="pb-3 px-2">Suggested Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F8]">
              {classGaps.slice(0, 5).map((gap) => (
                <tr key={gap.concept._id} className="hover:bg-[#FAFBFD] transition-colors">
                  <td className="py-3 px-2 font-bold text-[#18181B]">
                    {gap.concept.title}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 h-1.5 rounded-full bg-[#E5E9F2] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#2F65F6] transition-all"
                          style={{ width: `${gap.avgMastery}%` }}
                        />
                      </div>
                      <span className="font-black text-[#18181B]">{gap.avgMastery}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
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
                  <td className="py-3 px-2 font-medium text-[#7E8494]">
                    {gap.suggestedAction}
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
