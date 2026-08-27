"use client";

import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import {
  Brain,
  Zap,
  Target,
  ArrowRight,
  BookOpen,
  Sparkles,
  ShieldAlert,
  MessageSquare,
  Lock,
  Award,
  Layers,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

const SUBJECTS = ["All Subjects", "Mathematics", "Physics", "Chemistry"] as const;
const GRADES = ["All Grades", "Class 10", "Class 11", "Class 12"] as const;

export default function StudentDashboard() {
  const { userId, userName } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects");
  const [selectedGrade, setSelectedGrade] = useState<string>("All Grades");

  const overview = useQuery(
    api.users.getStudentOverview,
    userId ? { studentId: userId } : "skip"
  );
  const conceptData = useQuery(
    api.concepts.getWithMastery,
    userId
      ? {
          studentId: userId,
          subject: selectedSubject !== "All Subjects" ? selectedSubject : undefined,
          grade: selectedGrade !== "All Grades" ? selectedGrade : undefined,
        }
      : "skip"
  );

  if (!overview || !conceptData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 animate-spin border-3 border-purple-600 border-t-transparent" />
          <p className="text-sm font-bold text-slate-500">
            Calibrating your multi-subject knowledge graph...
          </p>
        </div>
      </div>
    );
  }

  // Calculate what to study next — prioritize by prerequisite gaps
  const weakConcepts = conceptData.concepts
    .filter((c) => c.mastery && c.mastery.score < 60)
    .sort((a, b) => (a.mastery?.score || 0) - (b.mastery?.score || 0));

  // "Don't study yet" — concepts where prerequisites are too weak
  const dontStudyYet = conceptData.concepts.filter((c) => {
    if (!c.mastery || c.mastery.score >= 60) return false;
    const prereqEdges = conceptData.edges.filter((e) => e.toConceptId === c._id);
    return prereqEdges.some((edge) => {
      const prereqConcept = conceptData.concepts.find(
        (pc) => pc._id === edge.fromConceptId
      );
      return prereqConcept?.mastery && prereqConcept.mastery.score < 50;
    });
  });

  const dontStudyIds = new Set(dontStudyYet.map((c) => c._id));
  const recommended = weakConcepts.filter((c) => !dontStudyIds.has(c._id));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // Emerald
    if (score >= 50) return "#f59e0b"; // Amber
    return "#e11d48"; // Rose
  };

  const getSubjectEmoji = (subject: string) => {
    if (subject === "Mathematics") return "📐";
    if (subject === "Physics") return "⚡";
    if (subject === "Chemistry") return "🧪";
    return "📚";
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in-up">
        <div>
          <div className="announcement-badge mb-2 text-xs">
            <span>✨ Multi-Subject Learning Matrix Active</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
            Hello, {userName ? userName.split(" ")[0] : "Arjun"} 👋
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Personalized learning paths across <strong>Mathematics, Physics & Chemistry</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/student/teach-back" className="btn-pill-primary text-xs py-2.5 px-5">
            <MessageSquare className="w-3.5 h-3.5" />
            Teach Toby 1-on-1
          </Link>
          <Link href="/student/assessment" className="btn-pill-secondary text-xs py-2.5 px-5">
            <Target className="w-3.5 h-3.5" />
            Take Diagnostic
          </Link>
        </div>
      </div>

      {/* Subject & Standard Filter Controls */}
      <div className="glass-card p-4 rounded-3xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in-up delay-1">
        {/* Subject Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Subject:
          </span>
          {SUBJECTS.map((subj) => {
            const isActive = selectedSubject === subj;
            return (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-200"
                    : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {getSubjectEmoji(subj)} {subj}
              </button>
            );
          })}
        </div>

        {/* Grade / Standard Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" /> Standard:
          </span>
          {GRADES.map((grd) => {
            const isActive = selectedGrade === grd;
            return (
              <button
                key={grd}
                onClick={() => setSelectedGrade(grd)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {grd}
              </button>
            );
          })}
        </div>
      </div>

      {/* FluenAI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Brain,
            value: `${overview.totalMastery}%`,
            label: "Cumulative Mastery",
            color: "#7c3aed",
            bg: "#f3f0ff",
            border: "#e9d5ff",
            delay: "delay-1",
          },
          {
            icon: BookOpen,
            value: `${conceptData.concepts.length} Topics`,
            label: "Filtered Curriculum",
            color: "#0284c7",
            bg: "#f0f9ff",
            border: "#bae6fd",
            delay: "delay-2",
          },
          {
            icon: ShieldAlert,
            value: dontStudyYet.length,
            label: "Prerequisite Blocks",
            color: "#e11d48",
            bg: "#fff1f2",
            border: "#fecdd3",
            delay: "delay-3",
          },
          {
            icon: Zap,
            value: overview.activeMisconceptions,
            label: "Active Misconceptions",
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

      {/* Main Grid: Priority Recommendations + Don't Study Yet Interlock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recommended Action (2 cols) */}
        <div className="glass-card p-6 lg:col-span-2 rounded-3xl animate-fade-in-up delay-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Recommended Repair Targets</h3>
                <p className="text-xs text-slate-500 font-medium">Concepts ready for practice without prerequisite bottlenecks</p>
              </div>
            </div>
            <span className="badge badge-purple">AI Priority</span>
          </div>

          <div className="space-y-3">
            {recommended.slice(0, 3).map((concept) => {
              const score = concept.mastery?.score || 0;
              const color = getScoreColor(score);
              return (
                <div
                  key={concept._id}
                  className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all bg-slate-50/70 border border-slate-100 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0"
                      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                    >
                      {score}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-sm text-slate-900">{concept.title}</h4>
                        <span className="badge badge-purple text-[10px]">
                          {getSubjectEmoji(concept.subject)} {concept.subject} • {concept.grade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{concept.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/student/teach-back`}
                      className="px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 bg-purple-600 text-white shadow-sm hover:bg-purple-700 transition-all"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Teach Toby
                    </Link>
                    <Link
                      href={`/student/assessment?concept=${concept._id}`}
                      className="px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
                    >
                      <Target className="w-3 h-3" />
                      Quiz
                    </Link>
                  </div>
                </div>
              );
            })}

            {recommended.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-400 font-semibold">
                No weak concepts requiring immediate repair in this filter! 🎉
              </p>
            )}
          </div>
        </div>

        {/* Don't Study Yet Safety Interlock (1 col) */}
        <div
          className="glass-card p-6 rounded-3xl animate-fade-in-up delay-3 flex flex-col justify-between border-rose-200/80 bg-rose-50/40"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-rose-700">Prerequisite Interlock</h3>
                <p className="text-[11px] text-rose-500 font-semibold">Blocked until foundation is repaired</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
              Studying these advanced concepts now will cause confusion because earlier dependencies in the knowledge graph are still below 50%.
            </p>

            <div className="space-y-2.5">
              {dontStudyYet.map((concept) => {
                const prereqEdge = conceptData.edges.find((e) => e.toConceptId === concept._id);
                const prereq = prereqEdge
                  ? conceptData.concepts.find((c) => c._id === prereqEdge.fromConceptId)
                  : null;

                return (
                  <div
                    key={concept._id}
                    className="p-3 rounded-2xl bg-white border border-rose-200/80 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{concept.title}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {concept.mastery?.score || 0}%
                      </span>
                    </div>
                    {prereq && (
                      <p className="text-[11px] text-amber-700 font-semibold m-0">
                        ← Weak prerequisite: <strong className="text-slate-900">{prereq.title} ({prereq.mastery?.score || 0}%)</strong>
                      </p>
                    )}
                  </div>
                );
              })}

              {dontStudyYet.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-xs text-emerald-600 font-bold">
                    ✓ All selected concepts have healthy prerequisite foundations!
                  </p>
                </div>
              )}
            </div>
          </div>

          {dontStudyYet.length > 0 && (
            <div className="mt-4 pt-3 border-t border-rose-200">
              <span className="text-[11px] font-bold text-rose-600">
                💡 Fix foundational concepts first to unlock!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Misconception Genome Section */}
      {overview.misconceptions.length > 0 && (
        <div className="glass-card p-6 rounded-3xl mb-8 animate-fade-in-up delay-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Misconception Genome (Detected Patterns)</h3>
                <p className="text-xs text-slate-500 font-medium">AI clusters reasoning errors across Math, Physics, and Chemistry</p>
              </div>
            </div>
            <span className="badge badge-warning">{overview.misconceptions.length} Active Patterns</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {overview.misconceptions.map((m) => (
              <div
                key={m._id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 border-l-4 border-l-amber-500 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
                      {m.pattern.replace("_", " ")}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {Math.round(m.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mb-2 leading-snug">
                    {m.description}
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    "{m.evidence.substring(0, 100)}..."
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Concepts Matrix Grid */}
      <div className="glass-card p-6 rounded-3xl animate-fade-in-up delay-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            {selectedSubject} Curriculum Concepts ({selectedGrade})
          </h3>
          <span className="text-xs font-bold text-purple-600">
            {conceptData.concepts.length} Topics Total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {conceptData.concepts.map((concept) => {
            const score = concept.mastery?.score || 0;
            const color = getScoreColor(score);
            return (
              <div
                key={concept._id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 transition-transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-800 truncate max-w-[140px]">
                    {concept.title}
                  </span>
                  <span className="font-black text-xs" style={{ color }}>
                    {score}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-2">
                  <span>{concept.grade}</span>
                  <span>{getSubjectEmoji(concept.subject)} {concept.subject}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${score}%`,
                      background: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
