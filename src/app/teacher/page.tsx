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
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 animate-spin border-3 border-purple-600 border-t-transparent" />
          <p className="text-sm font-bold text-slate-500">
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
    if (score >= 80) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#e11d48";
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <div className="announcement-badge mb-2 text-xs">
            <span>✨ Class Analytics & Teacher Oversight</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
            Teacher Console • Dr. Sharma
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Calculus 12th Grade • Automated learning gap diagnostics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/teacher/upload" className="btn-pill-primary text-xs py-2.5 px-5">
            <Upload className="w-3.5 h-3.5" />
            Upload Lesson PPT/PDF
          </Link>
          <Link href="/teacher/concept-map" className="btn-pill-secondary text-xs py-2.5 px-5">
            <GitBranch className="w-3.5 h-3.5" />
            Prerequisite Graph
          </Link>
        </div>
      </div>

      {/* FluenAI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Users,
            value: students.length,
            label: "Enrolled Students",
            color: "#7c3aed",
            bg: "#f3f0ff",
            border: "#e9d5ff",
            delay: "delay-1",
          },
          {
            icon: Brain,
            value: `${avgClassMastery}%`,
            label: "Avg Class Mastery",
            color: "#0284c7",
            bg: "#f0f9ff",
            border: "#bae6fd",
            delay: "delay-2",
          },
          {
            icon: AlertTriangle,
            value: highGapConcepts.length,
            label: "Critical Bottlenecks",
            color: "#e11d48",
            bg: "#fff1f2",
            border: "#fecdd3",
            delay: "delay-3",
          },
          {
            icon: Sparkles,
            value: totalMisconceptions,
            label: "Misconceptions Flagged",
            color: "#d97706",
            bg: "#fffbeb",
            border: "#fde68a",
            delay: "delay-4",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`glass-card p-6 animate-fade-in-up ${stat.delay} rounded-3xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: stat.bg, color: stat.color, border: `1px solid ${stat.border}` }}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full" style={{ background: stat.bg, color: stat.color }}>
                Live
              </span>
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
              {stat.value}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* AI Class Intervention Alert Banner */}
      {highGapConcepts.length > 0 && (
        <div
          className="glass-card p-6 rounded-3xl mb-8 animate-fade-in-up delay-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-purple-50/70 border-purple-200"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl bg-white border border-purple-200 shadow-sm"
            >
              💡
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-extrabold text-base text-slate-900">AI Diagnostic Insight: Shared Prerequisite Bottleneck</h3>
                <span className="badge badge-purple">Class-Wide Signal</span>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed font-medium">
                62% of the class shows the same derivative misconception (treating derivative as a static value rather than rate of change). <strong className="text-purple-700">Recommendation:</strong> Review the limits-to-derivatives prerequisite transition and assign a 5-question targeted diagnostic before continuing integrals.
              </p>
            </div>
          </div>

          <Link href="/teacher/class-gaps" className="btn-pill-primary text-xs py-2 px-5 shrink-0">
            View Class Gaps <ArrowRight className="w-3.5 h-3.5" />
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
            color: "#7c3aed",
          },
          {
            href: "/teacher/concept-map",
            title: "Editable Concept Graph",
            desc: "Add concepts, verify AI dependencies, and connect curriculum prerequisites",
            icon: GitBranch,
            color: "#0284c7",
          },
          {
            href: "/teacher/upload",
            title: "AI Lesson Ingestion",
            desc: "Drop PPT/PDF to auto-extract concepts and draft assessment questions",
            icon: Upload,
            color: "#059669",
          },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="glass-card p-6 rounded-3xl group no-underline transition-all hover:scale-[1.02] hover:border-purple-300"
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
              style={{ background: `${item.color}15`, color: item.color }}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-purple-600 transition-colors mb-1">
              {item.title}
            </h4>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
              {item.desc}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600">
              <span>Open Tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Class Knowledge Table Preview */}
      <div className="glass-card p-6 rounded-3xl animate-fade-in-up delay-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Curriculum Concept Mastery & Action Signals
          </h3>
          <Link href="/teacher/class-gaps" className="text-xs font-bold text-purple-600 hover:underline">
            Full Table →
          </Link>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Concept</th>
              <th>Class Mastery</th>
              <th>Status Signal</th>
              <th>Suggested Teacher Action</th>
            </tr>
          </thead>
          <tbody>
            {classGaps.slice(0, 5).map((gap) => (
              <tr key={gap.concept._id}>
                <td>
                  <span className="font-bold text-slate-900 text-sm">
                    {gap.concept.title}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar w-20">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${gap.avgMastery}%`,
                          background: getMasteryColor(gap.avgMastery),
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
                <td className="text-xs font-semibold text-slate-600">
                  {gap.suggestedAction}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
