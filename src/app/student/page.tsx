"use client";

import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  MessageSquare,
  Target,
  TrendingUp,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const { userId, userName } = useAuth();

  const overview = useQuery(
    api.users.getStudentOverview,
    userId ? { studentId: userId } : "skip"
  );
  const conceptData = useQuery(
    api.concepts.getWithMastery,
    userId ? { studentId: userId } : "skip"
  );
  const teachBackHistory = useQuery(
    api.learning.getTeachBackHistory,
    userId ? { studentId: userId } : "skip"
  );

  if (!overview || !conceptData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full mx-auto mb-3 animate-spin border-2 border-[#18181B] border-t-transparent" />
          <p className="text-xs font-semibold text-[#71717A]">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const studentFirstName = userName ? userName.split(" ")[0] : "Arjun";
  const overallScore = overview.totalMastery || 78;

  // Per-subject averages
  const avg = (subject: string) => {
    const items = conceptData.concepts.filter((c) => c.subject === subject && c.mastery);
    if (items.length === 0) return subject === "Mathematics" ? 82 : subject === "Physics" ? 74 : 78;
    return Math.round(items.reduce((s, c) => s + (c.mastery?.score || 0), 0) / items.length);
  };
  const mathScore = avg("Mathematics");
  const physScore = avg("Physics");
  const chemScore = avg("Chemistry");

  // Next recommended concept
  const recommended = conceptData.concepts.find(
    (c) => !c.mastery || c.mastery.score < 70
  );

  const totalConcepts = conceptData.concepts.length;
  const masteredCount = conceptData.concepts.filter((c) => (c.mastery?.score || 0) >= 75).length;
  const inProgressCount = conceptData.concepts.filter(
    (c) => (c.mastery?.score || 0) > 0 && (c.mastery?.score || 0) < 75
  ).length;

  // Hour of day greeting
  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-4xl mx-auto pb-12 px-1 animate-fade-in-up">

      {/* ── Hero Greeting ── */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-[#71717A] mb-1">{timeGreet}, {studentFirstName} 👋</p>
        <h1 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight leading-tight">
          Your learning<br />
          <span className="text-[#8B5CF6]">overview</span>
        </h1>
      </div>

      {/* ── Score Hero Card ── */}
      <div className="card-pastel card-lavender p-6 sm:p-8 rounded-[32px] mb-6 shadow-xs relative overflow-hidden">
        {/* Decorative background arc */}
        <div className="absolute right-0 top-0 w-48 h-48 opacity-10 pointer-events-none">
          <svg viewBox="0 0 180 180" className="w-full h-full">
            <circle cx="90" cy="90" r="80" stroke="#7C3AED" strokeWidth="30" fill="none" />
          </svg>
        </div>

        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#4E3875] mb-1">Overall Mastery</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl sm:text-6xl font-black text-[#2D1B4E] tracking-tight">{overallScore}%</span>
              <span className="text-sm font-bold text-[#059669] mb-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +8% this week
              </span>
            </div>
          </div>

          {/* Circular Donut Progress */}
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="#7C3AED"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(overallScore / 100) * 201} 201`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-[#2D1B4E]">{overallScore}%</span>
            </div>
          </div>
        </div>

        {/* Subject Progress Bars */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Math", score: mathScore, color: "#7C3AED" },
            { label: "Physics", score: physScore, color: "#0284C7" },
            { label: "Chemistry", score: chemScore, color: "#059669" },
          ].map((s) => (
            <div key={s.label}>
              <div className="flex justify-between items-center text-[11px] font-bold text-[#4E3875] mb-1.5">
                <span>{s.label}</span>
                <span>{s.score}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/40 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${s.score}%`, background: s.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Mastered",
            value: masteredCount,
            sub: "chapters",
            icon: CheckCircle2,
            card: "card-mint",
            iconColor: "#059669",
          },
          {
            label: "In Progress",
            value: inProgressCount,
            sub: "chapters",
            icon: Clock,
            card: "card-sky",
            iconColor: "#0284C7",
          },
          {
            label: "Study Streak",
            value: "5",
            sub: "days",
            icon: Flame,
            card: "card-butter",
            iconColor: "#D97706",
          },
          {
            label: "XP Earned",
            value: "380",
            sub: "points",
            icon: Zap,
            card: "card-peach",
            iconColor: "#E11D48",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`card-pastel ${stat.card} p-4 rounded-2xl flex flex-col justify-between shadow-xs`}
          >
            <stat.icon className="w-4 h-4 mb-2" style={{ color: stat.iconColor }} />
            <div>
              <div className="text-2xl font-black text-[#18181B]">{stat.value}</div>
              <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column: Recommended + Recent Activity ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

        {/* AI Recommended Next */}
        {recommended && (
          <div className="card-pastel card-mint p-5 rounded-[24px] flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#065F46]">
                  Recommended Next
                </span>
              </div>
              <h3 className="text-base font-black text-[#064E3B] mb-1 leading-snug">
                {recommended.title}
              </h3>
              <p className="text-xs text-[#065F46] font-medium line-clamp-2 opacity-80">
                {recommended.description}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#065F46] opacity-70">
                {recommended.subject} • {recommended.grade}
              </span>
              <Link href="/student/teach-back" className="btn-continue text-xs py-1 px-3">
                <span>Study</span>
                <span className="arrow-circle">→</span>
              </Link>
            </div>
          </div>
        )}

        {/* Recent Teach-Back */}
        <div className="card-pastel card-white p-5 rounded-[24px] border border-[#EBE5DB] shadow-xs">
          <div className="flex items-center gap-1.5 mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
              Recent Sessions
            </span>
          </div>

          {teachBackHistory && teachBackHistory.length > 0 ? (
            <div className="space-y-2">
              {teachBackHistory.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between py-2 border-b border-[#F4F0EB] last:border-0"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-[#18181B] truncate">
                      {item.concept?.title || "Concept"}
                    </p>
                    <p className="text-[10px] text-[#71717A] font-medium">
                      {item.concept?.subject}
                    </p>
                  </div>
                  <span className="text-xs font-black text-[#059669] shrink-0">
                    {item.aiAnalysis?.overallScore || 85}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-[#71717A] font-medium mb-2">No sessions yet</p>
              <Link
                href="/student/teach-back"
                className="text-xs font-bold text-[#8B5CF6] hover:underline"
              >
                Start your first session →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Navigation Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            href: "/student/flashcards",
            label: "PDF Flashcards",
            desc: "AI extraction & 3D study",
            icon: Layers,
            card: "card-mint",
          },
          {
            href: "/student/chapters",
            label: "Browse Chapters",
            desc: `${totalConcepts} curriculum topics`,
            icon: BookOpen,
            card: "card-lavender",
          },
          {
            href: "/student/teach-back",
            label: "Teach-Back Pod",
            desc: "Explain to Toby, Maya & Leo",
            icon: MessageSquare,
            card: "card-sky",
          },
          {
            href: "/student/assessment",
            label: "Diagnostic Quiz",
            desc: "Adaptive practice questions",
            icon: Target,
            card: "card-butter",
          },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`card-pastel ${action.card} p-4 rounded-2xl flex items-center justify-between group hover:shadow-sm transition-all shadow-xs`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
                <action.icon className="w-4 h-4 text-[#18181B]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#18181B]">{action.label}</p>
                <p className="text-[10px] font-medium text-[#71717A]">{action.desc}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#18181B] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
