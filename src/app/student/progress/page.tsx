"use client";

import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Brain,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  Target,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";

export default function ProgressPage() {
  const { userId } = useAuth();
  const masteryData = useQuery(
    api.mastery.getStudentMastery,
    userId ? { studentId: userId } : "skip"
  );
  const misconceptions = useQuery(
    api.learning.getByStudent,
    userId ? { studentId: userId } : "skip"
  );

  if (!masteryData || !misconceptions) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full mx-auto mb-3 animate-spin border-2 border-[#FF642F] border-t-transparent" />
          <p className="text-xs font-bold text-[#8C93A4]">
            Rendering mastery radar…
          </p>
        </div>
      </div>
    );
  }

  const radarData = masteryData
    .sort((a, b) => (a.concept?.order || 0) - (b.concept?.order || 0))
    .map((m) => ({
      subject: m.concept?.title || "Unknown",
      mastery: m.score,
      fullMark: 100,
    }));

  const overallMastery =
    masteryData.length > 0
      ? Math.round(
          masteryData.reduce((sum, m) => sum + m.score, 0) / masteryData.length
        )
      : 0;

  const highRiskCount = masteryData.filter(
    (m) => m.retentionRisk === "high"
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-[#1C1E23] font-sans antialiased">
      {/* ── 1. Top Header Bar ── */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-[#E6EAF2]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE4D6] text-[#FF642F] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Study Progress</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#181A20] tracking-tight m-0">
              My Progress & Strengths
            </h1>
            <p className="text-xs sm:text-sm text-[#7E8494] font-medium mt-1 mb-0">
              See what you've mastered, which topics need a quick review, and what to practice next.
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. KPI Summary Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Overall Mastery (Sunset Peach Gradient) */}
        <div className="bg-gradient-to-br from-[#FFE4D6] via-[#FFBFA8] to-[#FFA199] rounded-[28px] p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A2C18]">Overall Mastery</span>
            <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-[#2A1208]">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-6">
            <div className="text-3xl sm:text-4xl font-black text-[#1C1E23] tracking-tight">{overallMastery}%</div>
            <div className="text-xs font-bold text-[#5A2C18] mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Across all studied topics
            </div>
          </div>
        </div>

        {/* KPI 2: Need Review (Sky Cyan Gradient) */}
        <div className="bg-gradient-to-br from-[#C4F6EE] via-[#A8E2F9] to-[#99B6F9] rounded-[28px] p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E3830]">Need Quick Review</span>
            <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-[#082420]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-6">
            <div className="text-3xl sm:text-4xl font-black text-[#1C1E23] tracking-tight">{highRiskCount}</div>
            <div className="text-xs font-bold text-[#0E3830] mt-1">
              Topics to review before exams
            </div>
          </div>
        </div>

        {/* KPI 3: Topics with Doubts (White Card) */}
        <div className="bg-white rounded-[28px] p-6 border border-[#E6EAF2] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7E8494]">Topics with Doubts</span>
            <div className="w-8 h-8 rounded-full bg-[#F4F6FB] flex items-center justify-center text-[#FF642F] border border-[#E2E6F0]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-6">
            <div className="text-3xl sm:text-4xl font-black text-[#181A20] tracking-tight">
              {misconceptions.filter((m) => !m.resolved).length}
            </div>
            <div className="text-xs font-bold text-[#7E8494] mt-1">
              Practice these with Toby & friends
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Visual Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Recharts Radar (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] p-6 shadow-xs border border-[#E6EAF2] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#181A20] leading-none mb-1">
                Prerequisite Mastery Radar
              </h3>
              <p className="text-xs text-[#8C93A4] font-medium leading-none m-0">
                Curriculum knowledge coverage
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#FF642F] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              Socratic Engine
            </span>
          </div>

          <div className="w-full h-[320px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#555C6E", fontSize: 11, fontWeight: 700 }}
                />
                <Radar
                  name="Mastery"
                  dataKey="mastery"
                  stroke="#FF642F"
                  fill="#FF642F"
                  fillOpacity={0.25}
                  strokeWidth={2.5}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Developed Areas Progress List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[28px] p-6 shadow-xs border border-[#E6EAF2] flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-[#181A20] leading-none mb-1">
                Concept Proficiency
              </h3>
              <p className="text-xs text-[#8C93A4] font-medium leading-none m-0">
                Live mastery scores per topic
              </p>
            </div>

            <div className="space-y-3.5">
              {masteryData
                .sort((a, b) => b.score - a.score)
                .slice(0, 6)
                .map((m) => (
                  <div key={m._id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-[#181A20] w-28 shrink-0 truncate">
                      {m.concept?.title}
                    </span>

                    <div className="flex-1 h-2 rounded-full bg-[#E5E9F2] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FF642F] transition-all duration-700"
                        style={{ width: `${m.score}%` }}
                      />
                    </div>

                    <span className="text-xs font-bold text-[#7E8494] w-8 text-right shrink-0">
                      {m.score}%
                    </span>

                    <div className="shrink-0">
                      {m.score >= 75 ? (
                        <div className="w-4 h-4 rounded-full bg-[#EBF3FE] text-[#FF642F] flex items-center justify-center">
                          <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-[#FFF0E6] text-[#FF7A00] flex items-center justify-center">
                          <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── 4. Detailed Mastery & Retention Table ── */}
      <div className="bg-white rounded-[28px] p-6 shadow-xs border border-[#E6EAF2]">
        <h3 className="text-base font-bold text-[#181A20] mb-4">
          Detailed Retention & Diagnostic Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#F0F3F8] text-[#8C93A4] font-bold">
                <th className="pb-3 px-2">Concept</th>
                <th className="pb-3 px-2">Mastery Score</th>
                <th className="pb-3 px-2">Retention Risk</th>
                <th className="pb-3 px-2">Attempts</th>
                <th className="pb-3 px-2">Last Revised</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F8]">
              {masteryData
                .sort((a, b) => (a.concept?.order || 0) - (b.concept?.order || 0))
                .map((m) => (
                  <tr key={m._id} className="hover:bg-[#FAFBFD] transition-colors">
                    <td className="py-3 px-2 font-bold text-[#181A20]">
                      {m.concept?.title}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 h-1.5 rounded-full bg-[#E5E9F2] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#FF642F] transition-all"
                            style={{ width: `${m.score}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-[#181A20]">{m.score}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          m.retentionRisk === "low"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : m.retentionRisk === "medium"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {m.retentionRisk.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-bold text-[#555C6E]">
                      {m.attemptCount}
                    </td>
                    <td className="py-3 px-2 text-[#8C93A4] font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(m.lastSeen).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Misconception Genome Analysis ── */}
      {misconceptions.filter((m) => !m.resolved).length > 0 && (
        <div className="bg-white rounded-[28px] p-6 border border-[#E6EAF2] shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#181A20] m-0">
                Active Misconception Genome
              </h3>
              <p className="text-xs text-[#7E8494] font-medium m-0">
                Pinpointing root-cause confusion before advanced topics
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {misconceptions
              .filter((m) => !m.resolved)
              .map((m) => (
                <div
                  key={m._id}
                  className="p-4 rounded-2xl bg-[#FAFBFD] border border-[#E6EAF2]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-[#181A20]">
                      {m.concept?.title}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {Math.round(m.confidence * 100)}% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-[#555C6E] font-medium mb-2">
                    {m.description}
                  </p>
                  <p className="text-[11px] text-[#8C93A4] italic">
                    Diagnostic evidence: {m.evidence}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}
