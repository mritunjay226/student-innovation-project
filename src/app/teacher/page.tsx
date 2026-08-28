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
} from "lucide-react";
import Link from "next/link";

export default function TeacherDashboard() {
  const classGaps = useQuery(api.mastery.getClassGaps, {});
  const users = useQuery(api.users.getAll, {});

  if (!classGaps || !users) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full mx-auto mb-4 animate-spin border-3 border-[#18181B] border-t-transparent" />
          <p className="text-sm font-semibold text-[#71717A]">
            Aggregating class diagnostics...
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

  const getMasteryColor = (score: number) => {
    if (score >= 80) return "#0D3E30";
    if (score >= 50) return "#713F12";
    return "#702114";
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <div className="pill-chip chip-butter mb-2 text-xs font-bold">
            <span>✨ Class Analytics & Teacher Oversight</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#18181B] mb-1">
            Teacher Console • Dr. Priya Sharma
          </h1>
          <p className="text-sm text-[#71717A] font-medium">
            Multi-Subject Curriculum • Automated learning gap diagnostics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/teacher/upload" className="btn-pill-dark text-xs py-2.5 px-5">
            <Upload className="w-3.5 h-3.5" />
            Upload Lesson PPT/PDF
          </Link>
          <Link href="/teacher/concept-map" className="btn-pill-white text-xs py-2.5 px-5">
            <GitBranch className="w-3.5 h-3.5" />
            Prerequisite Graph
          </Link>
        </div>
      </div>

      {/* Pastel Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Users,
            value: students.length,
            label: "Enrolled Students",
            cardClass: "card-lavender",
            delay: "delay-1",
          },
          {
            icon: Brain,
            value: `${avgClassMastery}%`,
            label: "Avg Class Mastery",
            cardClass: "card-mint",
            delay: "delay-2",
          },
          {
            icon: AlertTriangle,
            value: highGapConcepts.length,
            label: "Critical Bottlenecks",
            cardClass: "card-peach",
            delay: "delay-3",
          },
          {
            icon: Sparkles,
            value: totalMisconceptions,
            label: "Misconceptions Flagged",
            cardClass: "card-butter",
            delay: "delay-4",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`card-pastel ${stat.cardClass} p-6 animate-fade-in-up ${stat.delay} rounded-[28px]`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#121216] text-white flex items-center justify-center shadow-xs">
                <stat.icon className="w-5 h-5 text-[#FAF8F5]" />
              </div>
              <span className="pill-chip chip-white text-[10px] font-bold">
                Live
              </span>
            </div>
            <div className="text-3xl font-black tracking-tight mb-1">
              {stat.value}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-75">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* AI Class Intervention Alert Banner */}
      {highGapConcepts.length > 0 && (
        <div className="card-pastel card-lavender p-6 rounded-[28px] mb-8 animate-fade-in-up delay-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl bg-white border border-[#D5C4FA] shadow-xs">
              💡
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-black text-base text-[#2D1B4E] m-0">
                  AI Diagnostic Insight: Shared Prerequisite Bottlenecks
                </h3>
                <span className="pill-chip chip-white text-[10px] font-bold">
                  Class Signal
                </span>
              </div>
              <p className="text-xs text-[#4E3875] max-w-2xl leading-relaxed font-medium m-0">
                Multiple students show prerequisite gaps on foundational concepts. <strong className="text-[#2D1B4E]">Recommendation:</strong> Run a targeted 5-question Socratic review before assigning upcoming unit tests.
              </p>
            </div>
          </div>

          <Link href="/teacher/class-gaps" className="btn-continue shrink-0">
            <span>View Gaps</span>
            <span className="arrow-circle">→</span>
          </Link>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            href: "/teacher/class-gaps",
            title: "Class Learning Gaps",
            desc: "Concept-by-concept mastery breakdown and actionable teacher interventions",
            icon: TrendingUp,
            cardClass: "card-mint",
          },
          {
            href: "/teacher/concept-map",
            title: "Editable Concept Graph",
            desc: "Add concepts, verify AI dependencies, and connect curriculum prerequisites",
            icon: GitBranch,
            cardClass: "card-sky",
          },
          {
            href: "/teacher/upload",
            title: "AI Lesson Ingestion",
            desc: "Drop PPT/PDF to auto-extract concepts and draft assessment questions",
            icon: Upload,
            cardClass: "card-butter",
          },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className={`card-pastel ${item.cardClass} p-6 rounded-[28px] group no-underline transition-all hover:scale-[1.02] flex flex-col justify-between`}
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#121216] text-white flex items-center justify-center mb-4 shadow-xs">
                <item.icon className="w-5 h-5" />
              </div>
              <h4 className="font-black text-lg mb-1 tracking-tight">
                {item.title}
              </h4>
              <p className="text-xs opacity-75 mb-6 leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold opacity-80">Open Tool</span>
              <span className="btn-continue">
                <span>Launch</span>
                <span className="arrow-circle">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Class Knowledge Table Preview */}
      <div className="card-pastel card-white p-6 rounded-[28px] animate-fade-in-up delay-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#71717A] m-0">
            Curriculum Concept Mastery & Action Signals
          </h3>
          <Link href="/teacher/class-gaps" className="pill-chip chip-dark text-xs font-bold no-underline">
            Full Table →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Concept</th>
                <th>Class Mastery</th>
                <th>Status Signal</th>
                <th>Suggested Action</th>
              </tr>
            </thead>
            <tbody>
              {classGaps.slice(0, 5).map((gap) => (
                <tr key={gap.concept._id}>
                  <td>
                    <span className="font-bold text-[#18181B] text-sm">
                      {gap.concept.title}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-track w-20 h-2">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${gap.avgMastery}%`,
                            backgroundColor: getMasteryColor(gap.avgMastery),
                          }}
                        />
                      </div>
                      <span className="text-xs font-black" style={{ color: getMasteryColor(gap.avgMastery) }}>
                        {gap.avgMastery}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`pill-chip text-xs font-bold ${
                        gap.signal === "Strong"
                          ? "chip-mint"
                          : gap.signal === "Watch"
                            ? "chip-butter"
                            : "chip-peach"
                      }`}
                    >
                      {gap.signal}
                    </span>
                  </td>
                  <td className="text-xs font-medium text-[#52525B]">
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
