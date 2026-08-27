"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  GraduationCap,
  BookOpen,
  Brain,
  Zap,
  ArrowRight,
  Sparkles,
  GitBranch,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Cpu,
  Play,
  Volume2,
  Calendar,
  Award,
  Bell,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const { role, setRole } = useAuth();
  const seedDb = useMutation(api.seed.seedDatabase);
  const [seeded, setSeeded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    seedDb({})
      .then(() => setSeeded(true))
      .catch(console.error);
  }, [seedDb]);

  useEffect(() => {
    if (mounted && role === "student") router.push("/student");
    if (mounted && role === "teacher") router.push("/teacher");
  }, [role, router, mounted]);

  const handleRoleSelect = (selectedRole: "student" | "teacher") => {
    setRole(selectedRole);
    router.push(`/${selectedRole}`);
  };

  if (!mounted) return null;

  return (
    <div className="dreamy-canvas min-h-screen relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient glowing pastels */}
      <div className="dreamy-glows" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-md text-white"
            style={{ background: "var(--accent-gradient)" }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Learn<span style={{ color: "var(--accent)" }}>AI</span>
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-purple-600 transition-colors">
            Features
          </a>
          <a href="#toby" className="hover:text-purple-600 transition-colors">
            Reverse Tutoring
          </a>
          <a href="#prereqs" className="hover:text-purple-600 transition-colors">
            Prerequisite Map
          </a>
          <a href="#gaps" className="hover:text-purple-600 transition-colors">
            Class Diagnostics
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleRoleSelect("teacher")}
            className="hidden sm:inline-flex items-center text-sm font-bold text-slate-700 hover:text-purple-600 px-4 py-2"
          >
            Teacher Suite
          </button>
          <button
            onClick={() => handleRoleSelect("student")}
            className="btn-pill-primary text-sm py-2.5 px-6 cursor-pointer"
          >
            Launch App
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-6 pb-20 text-center flex-1 flex flex-col items-center">
        {/* FluenAI Gold Announcement Pill Badge */}
        <div className="animate-fade-in-up mb-6">
          <div className="announcement-badge cursor-pointer" onClick={() => handleRoleSelect("student")}>
            <span>New 1-on-1 Socratic Peer Toby is live 🎉</span>
            <span className="underline font-extrabold flex items-center gap-1">
              Try It Out <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Hero Title matching FluenAI typography */}
        <div className="animate-fade-in-up delay-1 max-w-3xl mx-auto mb-6">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-4">
            Perfect, Socratic, <br />
            <span style={{ color: "var(--accent)" }}>
              Learning with AI
            </span>
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto text-slate-600 font-medium leading-relaxed">
            Master Calculus with AI tools that diagnose prerequisite gaps, fix misconceptions, and build intuition in real time.
          </p>
        </div>

        {/* Dual Pill CTA Buttons */}
        <div className="animate-fade-in-up delay-2 flex items-center justify-center gap-4 mb-16">
          <a href="#features" className="btn-pill-secondary">
            Learn More
          </a>
          <button
            onClick={() => handleRoleSelect("student")}
            className="btn-pill-primary cursor-pointer"
          >
            <span>Launch Student App</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            FluenAI Floating App Mockup Showcase
        ══════════════════════════════════════════════════════════════ */}
        <div className="animate-fade-in-up delay-3 relative w-full max-w-4xl mx-auto mb-20 flex items-center justify-center">
          {/* Left Tilted Card: Waveform & Audio Teach-Back */}
          <div
            className="hidden sm:block absolute -left-4 md:left-4 top-12 w-64 p-5 rounded-3xl bg-white/95 border border-slate-200/80 shadow-2xl backdrop-blur-md transform -rotate-6 z-10 hover:rotate-0 transition-transform duration-300"
          >
            <p className="text-xs font-bold text-slate-900 text-left mb-3">
              Explain what you see and guide Toby!
            </p>
            <div className="flex items-center justify-center gap-1.5 py-4 px-3 bg-purple-50 rounded-2xl mb-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </div>
              <div className="flex items-center gap-1">
                {[12, 24, 16, 32, 20, 28, 14, 26, 18].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-purple-400 rounded-full"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
                Slope
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-[11px] font-bold text-purple-700">
                Speedometer
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
                Rate
              </span>
            </div>
          </div>

          {/* Center Mobile Phone App Mockup */}
          <div
            className="w-80 md:w-88 rounded-[40px] p-4 bg-slate-900 shadow-2xl border-4 border-slate-800 relative z-20"
          >
            <div className="w-full bg-white rounded-[32px] overflow-hidden p-4 text-left">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-3 px-1">
                <span>11:20</span>
                <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto" />
                <span>5G 100%</span>
              </div>

              {/* Phone User Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    AM
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Hello,</span>
                    <span className="text-xs font-extrabold text-slate-900">Arjun Mehta</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-extrabold flex items-center gap-1">
                    <span>💎</span> 505 XP
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Calendar Strip */}
              <div className="mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-2">
                  <span>←</span>
                  <span>January, 2026</span>
                  <span>→</span>
                </div>
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 gap-1">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-700 gap-1 mt-1">
                  <span>13</span><span>14</span><span>15</span><span>16</span>
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto shadow-sm">
                    17
                  </span>
                  <span>18</span><span>19</span>
                </div>
              </div>

              {/* Daily Socratic Challenge Card with Toby */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Daily Socratic Challenge</h4>
                    <p className="text-[10px] text-slate-500 font-semibold">🤖 5/20 Lessons with Toby</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white text-xl flex items-center justify-center shadow-md">
                    💡
                  </div>
                </div>
                <button
                  onClick={() => handleRoleSelect("student")}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-1"
                >
                  Continue Lesson →
                </button>
              </div>

              {/* Bottom Accuracy / Progress Summary */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <span className="font-extrabold text-slate-800">Concept Accuracy</span>
                <span className="font-bold text-purple-600">84% Mastered</span>
              </div>
            </div>
          </div>

          {/* Right Tilted Card: Class Insights & Growth Card */}
          <div
            className="hidden sm:block absolute -right-4 md:right-4 top-16 w-64 p-5 rounded-3xl bg-white/95 border border-slate-200/80 shadow-2xl backdrop-blur-md transform rotate-6 z-10 hover:rotate-0 transition-transform duration-300 text-left"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-900">This Month</span>
              <span className="text-xs text-slate-400">→</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold mb-3">
              <span>📈 +21%</span>
              <span className="text-slate-500">Growth in Calculus</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                  <span>Derivatives</span>
                  <span className="text-purple-600">91%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: "91%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                  <span>Limits & Continuity</span>
                  <span className="text-purple-400">78%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: "78%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            Interactive Portals: Student vs Teacher
        ══════════════════════════════════════════════════════════════ */}
        <div id="features" className="w-full max-w-4xl mx-auto my-12 text-left">
          <div className="text-center mb-10">
            <span className="badge badge-purple mb-2">Tailored Experiences</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Choose Your Learning Mode</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Card */}
            <div
              onClick={() => handleRoleSelect("student")}
              className="glass-card p-8 rounded-3xl cursor-pointer hover:border-purple-300 hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="badge badge-purple mb-3">For Students</span>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                Student Learning Portal
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Teach curious AI peer Toby, get adaptive diagnostics, and fix prerequisite gaps before exams.
              </p>
              <div className="flex items-center text-sm font-bold text-purple-600 gap-1">
                <span>Start Learning</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Teacher Card */}
            <div
              onClick={() => handleRoleSelect("teacher")}
              className="glass-card p-8 rounded-3xl cursor-pointer hover:border-purple-300 hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="badge badge-info mb-3">For Educators</span>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                Teacher Diagnostic Console
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Upload lessons, view class-wide misconception clusters, and edit the live curriculum graph.
              </p>
              <div className="flex items-center text-sm font-bold text-indigo-600 gap-1">
                <span>Open Console</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto w-full mt-6">
          {[
            { icon: Brain, title: "Prerequisite Tracing", desc: "Links calculus gaps back to fundamentals" },
            { icon: Cpu, title: "Misconception Genome", desc: "Clusters repeated error patterns" },
            { icon: Zap, title: "1-on-1 Reverse Tutoring", desc: "Teach curious peer Toby" },
            { icon: GitBranch, title: "Teacher Oversight", desc: "Editable knowledge dependency graph" },
          ].map((item, i) => (
            <div key={i} className="glass-card p-5 text-left rounded-2xl">
              <item.icon className="w-5 h-5 text-purple-600 mb-2" />
              <h4 className="text-xs font-bold text-slate-900 mb-1">{item.title}</h4>
              <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold">{seeded ? "Convex Cloud Connected & Synced" : "Connecting to Database..."}</span>
        </div>
        <p>© 2026 LearnAI • SIH Hackathon Prototype</p>
      </footer>
    </div>
  );
}
