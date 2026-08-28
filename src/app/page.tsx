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
  Sparkles,
  GitBranch,
  Search,
  ArrowRight,
  TrendingUp,
  Cpu,
  CheckCircle2,
  FileText,
  Lock,
} from "lucide-react";
import { useEffect, useState } from "react";

const TOPIC_PILLS = [
  { name: "Mathematics", color: "chip-peach" },
  { name: "Physics", color: "chip-mint" },
  { name: "Chemistry", color: "chip-butter" },
  { name: "AI Diagnostics", color: "chip-sky" },
  { name: "Calculus", color: "chip-lavender" },
  { name: "Kinematics", color: "chip-peach" },
  { name: "Thermodynamics", color: "chip-mint" },
  { name: "Organic Chemistry", color: "chip-butter" },
];

export default function LandingPage() {
  const router = useRouter();
  const { role, setRole } = useAuth();
  const seedDb = useMutation(api.seed.seedDatabase);
  const [mounted, setMounted] = useState(false);
  const [searchTopic, setSearchTopic] = useState("");

  useEffect(() => {
    setMounted(true);
    seedDb({}).catch((err) => console.warn("Seed check:", err));
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
    <div className="min-h-screen bg-[#FAF8F5] text-[#18181B] flex flex-col justify-between selection:bg-[#E8DEFF]">
      {/* ── Top Header Navigation ── */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white bg-[#121216] shadow-sm">
            <Sparkles className="w-5 h-5 text-[#FEF0C3]" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#18181B]">
            Learn<span className="text-[#8B5CF6]">AI</span>
          </span>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleRoleSelect("teacher")}
            className="hidden sm:inline-flex items-center text-sm font-bold text-[#52525B] hover:text-[#18181B] px-4 py-2 transition-colors cursor-pointer"
          >
            Teacher Suite
          </button>
          <button
            onClick={() => handleRoleSelect("student")}
            className="btn-pill-dark text-sm py-2.5 px-6"
          >
            Launch App
          </button>
        </div>
      </header>

      {/* ── Main Hero Section ── */}
      <main className="max-w-5xl mx-auto px-6 pt-8 pb-16 text-center flex-1 flex flex-col items-center justify-center">
        {/* Status Pill Badge */}
        <div className="animate-fade-in-up mb-6">
          <div
            className="pill-chip chip-butter cursor-pointer font-bold text-xs"
            onClick={() => handleRoleSelect("student")}
          >
            <span>✨ AI Socratic Peer & Prerequisite Debugger</span>
            <span className="underline ml-1">Try Now →</span>
          </div>
        </div>

        {/* Main Punchy Heading */}
        <div className="animate-fade-in-up delay-1 max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-6xl font-black text-[#18181B] tracking-tight leading-[1.12] mb-4">
            Enter a topic or explore your curriculum. <br className="hidden sm:block" />
            <span className="text-[#8B5CF6]">Learn fast.</span>
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto text-[#52525B] font-medium leading-relaxed">
            Mix and match subjects. We’ll diagnose prerequisite gaps, fix misconceptions, and build deep intuition in real time.
          </p>
        </div>

        {/* ── Interactive Search & Topic Card (Matches Reference Image) ── */}
        <div className="animate-fade-in-up delay-2 w-full max-w-xl mx-auto mb-12">
          <div className="card-pastel card-sky p-6 text-left shadow-md">
            <label className="text-xs font-bold text-[#13334E] uppercase tracking-wider block mb-2">
              Start a Diagnostic or Search Topic
            </label>

            <div className="pill-search bg-white mb-4">
              <Search className="w-5 h-5 text-[#71717A] shrink-0" />
              <input
                type="text"
                placeholder="Type a topic or concept (e.g. Calculus, Vectors, Chemical Bonding)..."
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRoleSelect("student");
                }}
              />
              <button
                onClick={() => handleRoleSelect("student")}
                className="w-8 h-8 rounded-full bg-[#121216] text-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-[#13334E] font-medium">
              <span className="flex items-center gap-1.5 opacity-80">
                <FileText className="w-3.5 h-3.5" /> PDF, Syllabus, or Interactive Socratic Mode
              </span>
              <span className="font-bold">Instant Setup</span>
            </div>
          </div>
        </div>

        {/* ── Topic Bubble Pills ── */}
        <div className="animate-fade-in-up delay-3 flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto mb-16">
          {TOPIC_PILLS.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleRoleSelect("student")}
              className={`pill-chip ${pill.color} text-sm py-2 px-5 cursor-pointer hover:shadow-sm`}
            >
              {pill.name}
            </button>
          ))}
        </div>

        {/* ── Role Portal Cards (Lavender & Mint) ── */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-16">
          {/* Student Portal Card (Pastel Lavender) */}
          <div
            onClick={() => handleRoleSelect("student")}
            className="card-pastel card-lavender cursor-pointer hover:shadow-xl group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#121216] text-white flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-[#E8DEFF]" />
              </div>
              <span className="pill-chip chip-white text-xs font-bold">
                Student Portal
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#2D1B4E] mb-2">
              Student Learning Experience
            </h3>
            <p className="text-sm text-[#4E3875] leading-relaxed mb-6 font-medium">
              Learn by teaching AI peer Toby, take bite-sized diagnostic quizzes, and track your personalized mastery radar.
            </p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-[#4E3875]">3 Active Subjects • Adaptive Path</span>
              <span className="btn-continue">
                <span>Enter Portal</span>
                <span className="arrow-circle">→</span>
              </span>
            </div>
          </div>

          {/* Teacher Console Card (Pastel Mint) */}
          <div
            onClick={() => handleRoleSelect("teacher")}
            className="card-pastel card-mint cursor-pointer hover:shadow-xl group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#121216] text-white flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 text-[#D2F1E6]" />
              </div>
              <span className="pill-chip chip-white text-xs font-bold">
                Teacher Console
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#0D3E30] mb-2">
              Teacher Diagnostic Suite
            </h3>
            <p className="text-sm text-[#1D5E4C] leading-relaxed mb-6 font-medium">
              Detect class-wide prerequisite bottlenecks, upload curriculum syllabi, and inspect student misconception clusters.
            </p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-[#1D5E4C]">Class Analytics • Graph Editor</span>
              <span className="btn-continue">
                <span>Enter Console</span>
                <span className="arrow-circle">→</span>
              </span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto w-full text-left">
          {[
            { icon: Brain, title: "Root Cause Engine", desc: "Traces gaps back to foundational concepts", bg: "card-butter" },
            { icon: Zap, title: "Reverse Tutoring", desc: "Teach AI peer Toby to solidify understanding", bg: "card-peach" },
            { icon: Cpu, title: "Misconception Genome", desc: "Catches recurring student mental traps", bg: "card-sky" },
            { icon: GitBranch, title: "Prerequisite Graph", desc: "Live curriculum dependency matrix", bg: "card-lilac" },
          ].map((item, i) => (
            <div key={i} className={`card-pastel ${item.bg} p-4 rounded-2xl`}>
              <item.icon className="w-5 h-5 mb-2 opacity-80" />
              <h4 className="text-xs font-bold mb-1">{item.title}</h4>
              <p className="text-[11px] opacity-75 font-medium leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717A] border-t border-[#EBE5DB]">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold">Convex Backend Connected</span>
        </div>
        <p className="font-medium">© 2026 LearnAI • Multi-Subject Socratic System</p>
      </footer>
    </div>
  );
}
