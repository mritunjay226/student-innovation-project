"use client";

import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Brain,
  AlertTriangle,
  Clock,
  Sparkles,
  Award,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 animate-spin border-3 border-purple-600 border-t-transparent" />
          <p className="text-sm font-bold text-slate-500">
            Rendering radar charts...
          </p>
        </div>
      </div>
    );
  }

  const getMasteryColor = (score: number) => {
    if (score >= 80) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#e11d48";
  };

  const radarData = masteryData
    .sort((a, b) => (a.concept?.order || 0) - (b.concept?.order || 0))
    .map((m) => ({
      subject: m.concept?.title || "Unknown",
      mastery: m.score,
      fullMark: 100,
    }));

  const barData = masteryData
    .sort((a, b) => (a.concept?.order || 0) - (b.concept?.order || 0))
    .map((m) => ({
      name: m.concept?.title || "Unknown",
      score: m.score,
      color: getMasteryColor(m.score),
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="announcement-badge mb-2 text-xs">
          <span>✨ Multi-dimensional Learner Model</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
          Knowledge Radar & Analytics
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Visualizing your strengths, prerequisite blindspots, and cognitive retention
        </p>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: Brain,
            value: `${overallMastery}%`,
            label: "Cumulative Mastery",
            color: "#7c3aed",
            bg: "#f3f0ff",
            border: "#e9d5ff",
            delay: "delay-1",
          },
          {
            icon: AlertTriangle,
            value: highRiskCount,
            label: "Decay Risk Concepts",
            color: "#e11d48",
            bg: "#fff1f2",
            border: "#fecdd3",
            delay: "delay-2",
          },
          {
            icon: Sparkles,
            value: misconceptions.filter((m) => !m.resolved).length,
            label: "Active Misconceptions",
            color: "#d97706",
            bg: "#fffbeb",
            border: "#fde68a",
            delay: "delay-3",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`glass-card p-6 animate-fade-in-up ${stat.delay} rounded-3xl`}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
              style={{ background: stat.bg, color: stat.color, border: `1px solid ${stat.border}` }}
            >
              <stat.icon className="w-5 h-5" />
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

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Radar Chart */}
        <div className="glass-card p-6 rounded-3xl animate-fade-in-up delay-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Prerequisite Radar (Curriculum Coverage)
            </h3>
            <span className="badge badge-purple">Feynman Diagnostic</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
              />
              <Radar
                name="Mastery"
                dataKey="mastery"
                stroke="#7c3aed"
                fill="#7c3aed"
                fillOpacity={0.25}
                strokeWidth={2.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="glass-card p-6 rounded-3xl animate-fade-in-up delay-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Concept Mastery Levels
            </h3>
            <span className="badge badge-info">Target &gt; 80%</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={110}
                tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  color: "#0f172a",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown Matrix Table */}
      <div className="glass-card p-6 rounded-3xl animate-fade-in-up delay-4 mb-8">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4">
          Detailed Mastery & Retention Status
        </h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Concept</th>
              <th>Mastery Score</th>
              <th>Retention Risk</th>
              <th>Attempts</th>
              <th>Last Revised</th>
            </tr>
          </thead>
          <tbody>
            {masteryData
              .sort((a, b) => (a.concept?.order || 0) - (b.concept?.order || 0))
              .map((m) => (
                <tr key={m._id}>
                  <td>
                    <span className="font-bold text-slate-900 text-sm">
                      {m.concept?.title}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-24">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${m.score}%`,
                            background: getMasteryColor(m.score),
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-black"
                        style={{ color: getMasteryColor(m.score) }}
                      >
                        {m.score}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        m.retentionRisk === "low"
                          ? "badge-success"
                          : m.retentionRisk === "medium"
                            ? "badge-warning"
                            : "badge-danger"
                      }`}
                    >
                      {m.retentionRisk.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-slate-600 font-bold text-xs">{m.attemptCount}</td>
                  <td>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(m.lastSeen).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Misconception Genome */}
      {misconceptions.filter((m) => !m.resolved).length > 0 && (
        <div
          className="p-6 rounded-3xl animate-fade-in-up delay-5 bg-amber-50/50 border border-amber-200"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-extrabold text-sm text-amber-900">
                Misconception Genome Analysis
              </h3>
              <p className="text-xs text-amber-700 font-medium">
                Traces current performance back to where the cognitive gap began
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {misconceptions
              .filter((m) => !m.resolved)
              .map((m) => (
                <div
                  key={m._id}
                  className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900">
                      {m.concept?.title}
                    </span>
                    <span className="badge badge-warning text-[10px]">
                      {Math.round(m.confidence * 100)}% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 mb-2 font-semibold">
                    {m.description}
                  </p>
                  <p className="text-[11px] text-slate-500 italic font-medium">
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
