"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
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
  Layers,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  ChevronRight,
  Compass,
  Flame,
  Activity,
  Award,
  Star,
  Timer,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Bookmark,
  Radio,
  Share2,
  Headphones,
  Briefcase,
  Globe,
  Smile,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { TiltCard } from "@/components/TiltCard";
import { HeroSocraticPreview } from "@/components/HeroSocraticPreview";
import { InteractiveFeatureTabs } from "@/components/InteractiveFeatureTabs";
import {
  MathGoldenGeometry,
  MathCalculusInfinity,
  PhysicsQuantumOrbital,
  PhysicsGravityPendulum,
  ChemLabFlask,
  ChemMolecularLattice,
} from "@/components/CardIllustrations";

const TOPIC_PILLS = [
  { name: "Calculus & Limits", subject: "Math", color: "bg-[#EBF3FE] text-[#1E3A8A] border-[#D1E2FB]" },
  { name: "Electromagnetism", subject: "Physics", color: "bg-[#D6E8FA] text-[#0C4A6E] border-[#BAE6FD]" },
  { name: "Organic Synthesis", subject: "Chemistry", color: "bg-[#D2F1E6] text-[#0D3E30] border-[#A7F3D0]" },
  { name: "Linear Algebra", subject: "Math", color: "bg-[#FEF0C3] text-[#713F12] border-[#FDE68A]" },
  { name: "Quantum Mechanics", subject: "Physics", color: "bg-[#FCD5CE] text-[#881337] border-[#FECDD3]" },
  { name: "Thermodynamics", subject: "Physics", color: "bg-[#EBF3FE] text-[#1E3A8A] border-[#D1E2FB]" },
  { name: "Chemical Equilibrium", subject: "Chemistry", color: "bg-[#D2F1E6] text-[#0D3E30] border-[#A7F3D0]" },
  { name: "Kinematics & Vectors", subject: "Physics", color: "bg-[#FEF0C3] text-[#713F12] border-[#FDE68A]" },
];

const CURRICULUM_SUBJECTS = [
  {
    title: "Mathematics",
    subtitle: "Calculus, Algebra & Geometry",
    description: "Understand derivatives, integrals, and formulas step by step with easy visual explanations.",
    color: "bg-white border-[#E6EAF2]",
    accentColor: "text-[#18181B]",
    badgeColor: "bg-[#EBF3FE] text-[#2F65F6] border-[#D1E2FB]",
    badge: "12 Chapters • 48 Topics",
    illustration: MathGoldenGeometry,
    topics: ["Derivatives & Chain Rule", "Integrals & Area", "Vectors & Matrices"],
  },
  {
    title: "Physics",
    subtitle: "Motion, Forces & Energy",
    description: "Learn how real-world physics works by answering questions and explaining concepts to your AI study buddies.",
    color: "bg-white border-[#E6EAF2]",
    accentColor: "text-[#18181B]",
    badgeColor: "bg-[#D6E8FA] text-[#0284C7] border-[#BAE6FD]",
    badge: "14 Chapters • 62 Topics",
    illustration: PhysicsQuantumOrbital,
    topics: ["Speed & Acceleration", "Electricity & Circuits", "Optics & Light"],
  },
  {
    title: "Chemistry",
    subtitle: "Reactions, Atoms & Bonds",
    description: "See how atoms connect, balance chemical equations, and understand reactions without memorizing.",
    color: "bg-white border-[#E6EAF2]",
    accentColor: "text-[#18181B]",
    badgeColor: "bg-[#D2F1E6] text-[#059669] border-[#A7F3D0]",
    badge: "10 Chapters • 38 Topics",
    illustration: ChemLabFlask,
    topics: ["Chemical Reactions", "Acids & Bases", "Thermodynamics"],
  },
];

const FAQS = [
  {
    q: "How does Axiora help me understand tough topics?",
    a: "When you get stuck on a topic, Axiora checks the basics you need first. For example, if calculus feels hard, it helps you brush up on basic algebra so the new concept clicks immediately.",
  },
  {
    q: "What is 'Learning by Teaching' with Toby & AI classmates?",
    a: "Studies show you remember 90% of what you explain to others. Toby, Maya, Leo, and Sam are AI classmates who ask you questions. Explaining things to them helps you truly master the topic.",
  },
  {
    q: "How do PDF flashcards work?",
    a: "Simply upload your lecture notes or textbook chapter. Axiora turns them into bite-sized flashcards and reminds you to review right before you forget.",
  },
  {
    q: "Is my progress saved automatically?",
    a: "Yes! Your flashcards, quiz scores, and study streak update in real time across your phone, tablet, and laptop.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { role, setRole, isSignedIn } = useAuth();
  const seedDb = useMutation(api.seed.seedDatabase);
  const [mounted, setMounted] = useState(false);
  const [searchTopic, setSearchTopic] = useState("");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [isPlayingSimulation, setIsPlayingSimulation] = useState(true);

  useEffect(() => {
    setMounted(true);
    seedDb({}).catch((err) => console.warn("Seed check:", err));
  }, [seedDb]);

  const handleRoleSelect = (selectedRole: "student" | "teacher") => {
    setRole(selectedRole);
    if (!isSignedIn && Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(`/${selectedRole}`)}`);
      return;
    }
    router.push(`/${selectedRole}`);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#DDE4F7] p-2 sm:p-5 lg:p-8 flex flex-col items-center justify-start text-[#1C1E23] font-sans antialiased selection:bg-[#FFE3D4] selection:text-[#C8400C]">
      {/* ── Outer Fluid Curved Ambient Background Waves ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-60">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none">
          <path
            d="M-100 200 C 300 100, 600 400, 1100 250 C 1400 150, 1600 350, 1700 450"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
          />
          <path
            d="M-50 450 C 400 350, 700 650, 1200 500 C 1500 400, 1700 600, 1800 700"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="1.5"
          />
          <path
            d="M 100 750 C 500 650, 800 950, 1300 800 C 1600 700, 1800 900, 1900 1000"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* ── Main Application Shell Container (Faithful Tablet-Viewport Aesthetic) ── */}
      <div className="w-full max-w-[1360px] bg-white rounded-[32px] sm:rounded-[42px] shadow-[0_24px_80px_rgba(30,45,95,0.08)] border border-[#E6EAF2] p-5 sm:p-8 lg:p-10 relative z-10 flex flex-col gap-10">

        {/* ══════════════════════════════════════════════════════════════
            1. TOP NAVIGATION BAR
            ══════════════════════════════════════════════════════════════ */}
        <header className="flex items-center justify-between gap-4 w-full">
          {/* Left Brand Logo */}
          <div
            onClick={() => handleRoleSelect("student")}
            className="flex items-center gap-1.5 cursor-pointer group"
          >
            <span className="text-2xl sm:text-3xl font-black text-[#FF642F] tracking-tight group-hover:opacity-90 transition-opacity">
              axiora
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FF642F] -mb-2" />
          </div>

          {/* Center Pill Navigation Bar */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F4F6FB] p-1.5 rounded-full border border-[#E2E6F0] text-xs font-bold text-[#555C6E]">
            <a
              href="#hero"
              className="bg-[#181A20] text-white px-4 py-1.5 rounded-full shadow-xs transition-all"
            >
              Home
            </a>
            <a
              href="#features"
              className="px-3.5 py-1.5 rounded-full hover:text-[#18181B] transition-colors"
            >
              Features
            </a>
            <a
              href="#curriculum"
              className="px-3.5 py-1.5 rounded-full hover:text-[#18181B] transition-colors"
            >
              Curriculum
            </a>
            <a
              href="#socratic"
              className="px-3.5 py-1.5 rounded-full hover:text-[#18181B] flex items-center gap-1 transition-colors"
            >
              <span>Axiora AI</span>
              <Sparkles className="w-3 h-3 text-[#FF642F]" />
            </a>
            <a
              href="#portals"
              className="px-3.5 py-1.5 rounded-full hover:text-[#18181B] transition-colors"
            >
              Portals
            </a>
            <a
              href="#faq"
              className="px-3.5 py-1.5 rounded-full hover:text-[#18181B] transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <button
                onClick={() => handleRoleSelect(role || "student")}
                className="bg-[#181A20] hover:bg-black text-white text-xs font-bold py-2.5 px-5 rounded-full shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/sign-in")}
                  className="text-xs font-bold text-[#555C6E] hover:text-[#18181B] px-3 py-2 cursor-pointer transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => router.push("/sign-up")}
                  className="bg-[#FF642F] hover:bg-[#E85520] text-white text-xs sm:text-sm font-bold py-2.5 px-5 sm:px-6 rounded-full shadow-md shadow-[#FF642F]/25 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════════
            2. HERO SECTION WITH FLOATING MULTI-LAYER INTERACTIVE CANVAS
            ══════════════════════════════════════════════════════════════ */}
        <section id="hero" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center pt-2 pb-6">
          
          {/* ── Left Column: Headline & Action CTAs ── */}
          <div className="lg:col-span-5 flex flex-col items-start text-left space-y-6">
            
            {/* Main Headline with Orange Accent */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black text-[#181A20] tracking-tight leading-[1.08]">
                Learn Math & Science <br />
                the <span className="text-[#FF642F]">Easy Way</span>
              </h1>
              <p className="text-sm sm:text-base text-[#555C6E] font-medium leading-relaxed pt-2 max-w-md">
                Stop cramming formulas. Understand concepts clearly by talking with friendly AI study buddies, making flashcards, and testing your skills.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full">
              <button
                onClick={() => handleRoleSelect("student")}
                className="bg-[#FF642F] hover:bg-[#E85520] text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-full shadow-lg shadow-[#FF642F]/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span>Start learning now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRoleSelect("teacher")}
                className="bg-[#F0F3F9] hover:bg-[#E4E9F2] text-[#555C6E] hover:text-[#181A20] text-xs sm:text-sm font-bold py-3 px-5 rounded-full transition-colors cursor-pointer"
              >
                Explore Axiora
              </button>
            </div>

            {/* Quick Search Pill */}
            <div className="w-full max-w-md pt-2">
              <div className="p-1.5 rounded-full bg-[#F8FAFD] border border-[#E2E6F0] flex items-center gap-2 shadow-xs">
                <Search className="w-4 h-4 text-[#8C93A4] ml-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Search any topic (e.g. Calculus, Optics, Chemical Bonds)..."
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRoleSelect("student");
                  }}
                  className="w-full bg-transparent border-none outline-none text-xs font-semibold text-[#181A20] placeholder-[#8C93A4]"
                />
                <button
                  onClick={() => handleRoleSelect("student")}
                  className="bg-[#181A20] hover:bg-black text-white text-[11px] font-bold py-1.5 px-3.5 rounded-full shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>

          </div>

          {/* ── Right Column: The Signature Floating Glass Interactive Canvas ── */}
          <div className="lg:col-span-7 relative w-full min-h-[460px] sm:min-h-[520px] flex items-center justify-center">
            
            {/* Ambient Soft Mesh Glow behind the composition */}
            <div className="absolute w-72 h-72 rounded-full bg-[#FFBFA8]/40 blur-[80px] -top-10 -left-10 pointer-events-none" />
            <div className="absolute w-80 h-80 rounded-full bg-[#A8E2F9]/40 blur-[90px] -bottom-10 -right-10 pointer-events-none" />

            {/* 1. CENTRAL SIMULATION / VIDEO PLAYER CARD */}
            <div className="w-full max-w-[420px] bg-[#181A20] rounded-[28px] overflow-hidden shadow-2xl border-4 border-white relative z-10 group">
              {/* Top Bar inside simulation card */}
              <div className="p-3.5 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF642F] animate-ping" />
                  <span className="font-bold text-[11px] text-white/90">Interactive Lesson Preview</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Volume2 className="w-3.5 h-3.5" />
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Simulation Visual Area with Blackboard Animation */}
              <div className="h-44 sm:h-52 bg-gradient-to-br from-[#1F2430] via-[#151922] to-[#0E1118] p-5 flex flex-col justify-between relative">
                {/* Chalkboard Math Diagram Preview */}
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-mono text-[#00E599] bg-[#00E599]/10 px-2 py-0.5 rounded-md border border-[#00E599]/20">
                    Calculus • Chain Rule Made Simple
                  </span>
                  <div className="text-sm font-mono text-white font-bold pt-1">
                    dy/dx = cos(u) · <span className="text-[#FF642F]">du/dx</span>
                  </div>
                  <div className="text-xs font-mono text-[#8C93A4]">
                    u = x² → du/dx = 2x
                  </div>
                </div>

                {/* Subtitle Dialogue Banner */}
                <div className="p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-center">
                  <p className="text-xs font-bold text-white m-0">
                    &ldquo;Step 1: Differentiate the outside, then multiply by the inside.&rdquo;
                  </p>
                  <p className="text-[10px] font-semibold text-[#FFBFA8] m-0 mt-0.5">
                    Clear step-by-step logic for your exams.
                  </p>
                </div>
              </div>

              {/* Player Timeline Bar */}
              <div className="p-3 bg-[#12141A] flex items-center justify-between text-[11px] text-white/70 font-mono">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlayingSimulation(!isPlayingSimulation)}
                    className="w-6 h-6 rounded-full bg-[#FF642F] text-white flex items-center justify-center cursor-pointer"
                  >
                    {isPlayingSimulation ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                  </button>
                  <span>01:24 / 03:45</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px]">HD Interactive Player</span>
                </div>
              </div>
            </div>

            {/* 2. FLOATING BADGE: TOP-LEFT "LEARNING STREAK 🔥 56 DAYS" */}
            <div className="absolute -top-3 left-2 sm:left-6 z-20 bg-gradient-to-br from-[#FFE4D6] to-[#FFA199] p-3 rounded-2xl shadow-lg border border-white/60 flex items-center gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-[#FF642F] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                🔥
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-[#5A2C18] uppercase tracking-wider">Study Streak</div>
                <div className="text-sm font-black text-[#1C1E23] leading-none">56 days</div>
              </div>
              {/* Mini sparkline bars */}
              <div className="flex items-end gap-0.5 h-4 ml-1">
                <span className="w-1 h-2 bg-[#FF642F] rounded-full" />
                <span className="w-1 h-3 bg-[#FF642F] rounded-full" />
                <span className="w-1 h-4 bg-[#FF642F] rounded-full" />
                <span className="w-1 h-2.5 bg-[#FF642F] rounded-full" />
              </div>
            </div>

            {/* 3. FLOATING BADGE: TOP-CENTER "UNDERSTAND REAL INTUITION 💡" */}
            <div className="absolute top-4 sm:top-2 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-[#E2E6F0] flex items-center gap-1.5 text-xs font-bold text-[#181A20]">
              <span>💡 Understand the concept</span>
            </div>

            {/* 4. FLOATING CARD & 3D BLUE AI SPHERE: TOP-RIGHT */}
            <div className="absolute -top-6 -right-2 sm:right-2 z-30 flex items-center gap-2">
              <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-[#E2E6F0] text-left">
                <div className="text-[10px] font-bold text-[#7E8494]">AI Study Buddy</div>
                <div className="text-xs font-extrabold text-[#18181B]">That makes total sense!</div>
              </div>
              
              {/* The Glowing Cute 3D AI Orb */}
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1E40AF] via-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-white shadow-xl shadow-[#3B82F6]/40 border-2 border-white ring-4 ring-blue-100">
                  <Smile className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-1 bg-white text-[10px] font-black text-[#059669] px-2 py-0.5 rounded-full shadow-md border border-[#E2E6F0]">
                  95%
                </div>
              </div>
            </div>

            {/* 5. FLOATING CARD: MIDDLE-LEFT "SAVED CONCEPT" */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-3 sm:left-0 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-[#E6EAF2] text-left w-36 sm:w-40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-[#7E8494]">Saved Formula</span>
                <Bookmark className="w-3.5 h-3.5 text-[#FF642F] fill-[#FF642F]" />
              </div>
              <div className="text-xs font-extrabold text-[#18181B]">Chain Rule</div>
              <div className="text-[10px] font-mono text-[#7E8494]">dy/dx = dy/du · du/dx</div>
              <div className="text-[10px] font-semibold text-[#555C6E] mt-1">Calculus Chapter 3</div>
            </div>

            {/* 6. FLOATING CARD: MIDDLE-RIGHT "CONCEPT PATHWAY" */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-3 sm:right-0 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-[#E6EAF2] text-left w-40 sm:w-44">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-[#7E8494]">Prerequisite Check</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-xs font-bold text-[#18181B]">Algebra Ready: 100%</div>
              <div className="text-[10px] font-semibold text-[#059669] mt-0.5">Ready to study Calculus.</div>
            </div>

            {/* 7. FLOATING CARD: BOTTOM-LEFT "AI EXPLANATION" */}
            <div className="absolute -bottom-4 left-4 sm:left-10 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-[#E6EAF2] text-left max-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-[#2F65F6]">Quick AI Tip</span>
                <Volume2 className="w-3.5 h-3.5 text-[#2F65F6]" />
              </div>
              <p className="text-[11px] font-semibold text-[#555C6E] leading-snug m-0">
                Break complex problems down into smaller simple steps.
              </p>
            </div>

            {/* 8. FLOATING CARD: BOTTOM-CENTER "MASTERY GAUGE & WAVEFORM" */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-[#E6EAF2] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EBF3FE] flex items-center justify-center text-xs font-black text-[#2F65F6] border-2 border-[#2F65F6]">
                86%
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-[#059669]">Mastered!</div>
                {/* Mini audio wave */}
                <div className="flex items-center gap-0.5 h-3 mt-0.5">
                  <span className="w-0.5 h-1.5 bg-[#2F65F6] rounded-full" />
                  <span className="w-0.5 h-3 bg-[#2F65F6] rounded-full" />
                  <span className="w-0.5 h-2 bg-[#2F65F6] rounded-full" />
                  <span className="w-0.5 h-3 bg-[#2F65F6] rounded-full" />
                  <span className="w-0.5 h-1 bg-[#2F65F6] rounded-full" />
                </div>
              </div>
            </div>

            {/* 9. FLOATING 3D KNOWLEDGE GLOBE: BOTTOM-RIGHT */}
            <div className="absolute -bottom-8 -right-4 sm:right-4 z-10 flex flex-col items-center">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#3B82F6] shadow-2xl flex items-center justify-center border-2 border-white overflow-hidden">
                <Globe className="w-16 h-16 text-cyan-400 opacity-70 animate-spin-slow" />
                <div className="absolute top-2 right-2 bg-white text-[9px] font-black text-[#18181B] px-2 py-0.5 rounded-full shadow-md">
                  Calculus!
                </div>
                <div className="absolute bottom-2 left-2 bg-[#FF642F] text-[9px] font-black text-white px-2 py-0.5 rounded-full shadow-md">
                  Physics!
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* ══════════════════════════════════════════════════════════════
            3. BOTTOM METRICS & FEATURE SHELF BAR
            ══════════════════════════════════════════════════════════════ */}
        <section className="w-full pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* Left Card: Trustpilot / Student Social Proof */}
            <div className="lg:col-span-3 bg-[#F8FAFD] rounded-[28px] p-5 border border-[#E6EAF2] flex flex-col justify-between text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#18181B]">Student Rating</span>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  ★ Trustpilot
                </span>
              </div>
              <div className="my-2">
                <span className="text-2xl font-black text-[#18181B]">4.9</span>
                <span className="text-xs text-[#7E8494] font-bold"> / 5</span>
              </div>
              {/* Stacked Circular Avatars */}
              <div className="flex items-center -space-x-2 pt-1">
                {["/avatar.jpg", "/avatar.jpg", "/avatar.jpg", "/avatar.jpg", "/avatar.jpg"].map((src, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow-xs">
                    <Image src={src} alt="Student" width={28} height={28} className="w-full h-full object-cover" />
                  </div>
                ))}
                <span className="text-[10px] font-bold text-[#555C6E] pl-3">12,000+ Students</span>
              </div>
            </div>

            {/* Right Shelf: 4 Interactive Learning Modules with 3D-style Icons */}
            <div className="lg:col-span-9 bg-[#F8FAFD] rounded-[28px] p-4 sm:p-5 border border-[#E6EAF2] grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 items-center">
              
              {/* Metric 1: Concept Mastery */}
              <div className="bg-white rounded-[22px] p-3.5 sm:p-4 border border-[#E6EAF2] shadow-xs flex flex-col justify-between text-left">
                <span className="text-[10px] font-bold text-[#7E8494] uppercase tracking-wider">Average Score</span>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xl sm:text-2xl font-black text-[#18181B]">88%</div>
                  <svg className="w-12 h-6 text-[#FF642F]" viewBox="0 0 60 24" fill="none">
                    <path d="M2 18 C 15 18, 25 6, 40 10 C 50 14, 55 2, 58 2" stroke="#FF642F" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-[10px] font-bold text-[#059669] mt-0.5">Top 10% in Class</div>
              </div>

              {/* Metric 2: Curriculum Chapters */}
              <div className="bg-white rounded-[22px] p-3.5 sm:p-4 border border-[#E6EAF2] shadow-xs flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] font-bold text-[#7E8494] uppercase tracking-wider">Curriculum</span>
                  <div className="text-xl sm:text-2xl font-black text-[#18181B] mt-0.5">18</div>
                  <div className="text-[10px] font-bold text-[#059669]">Chapters Ready</div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#FFE4D6] text-[#FF642F] flex items-center justify-center font-bold text-lg shadow-xs">
                  📚
                </div>
              </div>

              {/* Metric 3: Practice Minutes */}
              <div className="bg-white rounded-[22px] p-3.5 sm:p-4 border border-[#E6EAF2] shadow-xs flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] font-bold text-[#7E8494] uppercase tracking-wider">Practice Time</span>
                  <div className="text-xl sm:text-2xl font-black text-[#18181B] mt-0.5">128</div>
                  <div className="text-[10px] font-bold text-[#7E8494]">Mins Today</div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#C4F6EE] text-[#0D3E30] flex items-center justify-center font-bold text-lg shadow-xs">
                  ⏱️
                </div>
              </div>

              {/* Metric 4: Flashcards Mastered */}
              <div className="bg-white rounded-[22px] p-3.5 sm:p-4 border border-[#E6EAF2] shadow-xs flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] font-bold text-[#7E8494] uppercase tracking-wider">Flashcards</span>
                  <div className="text-xl sm:text-2xl font-black text-[#18181B] mt-0.5">2,350</div>
                  <div className="text-[10px] font-bold text-[#7E8494]">Cards Mastered</div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#EBF3FE] text-[#2F65F6] flex items-center justify-center font-bold text-lg shadow-xs">
                  ⚡
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            4. INTERACTIVE SOCRATIC SIMULATOR ARENA
            ══════════════════════════════════════════════════════════════ */}
        <section id="socratic" className="w-full pt-6">
          <HeroSocraticPreview onLaunch={() => handleRoleSelect("student")} />
        </section>

        {/* ══════════════════════════════════════════════════════════════
            5. DEDICATED ROLE PORTALS (STUDENT VS TEACHER)
            ══════════════════════════════════════════════════════════════ */}
        <section id="portals" className="w-full py-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="px-3.5 py-1 rounded-full bg-[#EBF3FE] text-[#2F65F6] text-xs font-bold border border-[#D1E2FB]">
              Two Simple Portals
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] mt-2">
              Choose your dashboard
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Student Portal Card */}
            <TiltCard
              maxTilt={6}
              scale={1.02}
              onClick={() => handleRoleSelect("student")}
              className="rounded-[32px]"
            >
              <div className="bg-white rounded-[32px] p-7 sm:p-8 h-full flex flex-col justify-between shadow-xs hover:shadow-xl border-2 border-[#E6EAF2] hover:border-[#FF642F] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FF642F] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-[#FF642F]/25">
                      🎓
                    </div>
                    <span className="bg-[#FFE4D6] text-[#5A2C18] border border-[#FFBFA8] px-3 py-1 rounded-full text-xs font-bold">
                      For Students
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-[#18181B] mb-2">
                    Student Study Portal
                  </h3>
                  <p className="text-xs sm:text-sm text-[#555C6E] leading-relaxed mb-6 font-medium">
                    Practice by teaching AI classmates (Toby, Maya, Leo), generate smart flashcards from your PDFs, and track your progress before exams.
                  </p>

                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
                      <CheckCircle2 className="w-4 h-4 text-[#FF642F]" />
                      <span>Teach AI friends to remember concepts faster</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
                      <CheckCircle2 className="w-4 h-4 text-[#FF642F]" />
                      <span>Find and fix weak topics step by step</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
                      <CheckCircle2 className="w-4 h-4 text-[#FF642F]" />
                      <span>Turn lecture notes and PDFs into study cards</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#F0F3F8]">
                  <span className="text-xs font-bold text-[#7E8494]">Student Space</span>
                  <span className="bg-[#FF642F] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <span>Open Student Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </TiltCard>

            {/* Teacher Diagnostic Console Card */}
            <TiltCard
              maxTilt={6}
              scale={1.02}
              onClick={() => handleRoleSelect("teacher")}
              className="rounded-[32px]"
            >
              <div className="bg-white rounded-[32px] p-7 sm:p-8 h-full flex flex-col justify-between shadow-xs hover:shadow-xl border-2 border-[#E6EAF2] hover:border-[#2F65F6] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#2F65F6] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-[#2F65F6]/25">
                      🔬
                    </div>
                    <span className="bg-[#EBF3FE] text-[#1E3A8A] border border-[#D1E2FB] px-3 py-1 rounded-full text-xs font-bold">
                      For Teachers & Faculty
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-[#18181B] mb-2">
                    Teacher Dashboard
                  </h3>
                  <p className="text-xs sm:text-sm text-[#555C6E] leading-relaxed mb-6 font-medium">
                    See where students get stuck, upload course syllabi to generate topic maps, and monitor class progress in real time.
                  </p>

                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
                      <CheckCircle2 className="w-4 h-4 text-[#2F65F6]" />
                      <span>See common student confusion points</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
                      <CheckCircle2 className="w-4 h-4 text-[#2F65F6]" />
                      <span>Interactive topic dependency map</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
                      <CheckCircle2 className="w-4 h-4 text-[#2F65F6]" />
                      <span>Upload syllabi to auto-generate practice questions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#F0F3F8]">
                  <span className="text-xs font-bold text-[#7E8494]">Instructor Space</span>
                  <span className="bg-[#2F65F6] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <span>Open Teacher Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </TiltCard>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            6. INTERACTIVE FEATURE PILLARS TABS
            ══════════════════════════════════════════════════════════════ */}
        <section id="features" className="w-full">
          <InteractiveFeatureTabs onExplore={() => handleRoleSelect("student")} />
        </section>

        {/* ══════════════════════════════════════════════════════════════
            7. STEM CURRICULUM SUBJECT EXPLORER (WITH BESPOKE SVG ART)
            ══════════════════════════════════════════════════════════════ */}
        <section id="curriculum" className="w-full text-left py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#FFE4D6] text-[#5A2C18] border border-[#FFBFA8] text-xs font-bold">
                Adaptive Curriculum
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight mt-2">
                Explore Full Subject Domains
              </h2>
              <p className="text-xs sm:text-sm text-[#555C6E] font-medium mt-1">
                Each subject features complete prerequisite graphs and Socratic dialogues.
              </p>
            </div>
            <button
              onClick={() => handleRoleSelect("student")}
              className="bg-[#181A20] hover:bg-black text-white text-xs font-bold py-2.5 px-5 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
            >
              <span>Explore All Subjects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CURRICULUM_SUBJECTS.map((subj, idx) => {
              const Illustration = subj.illustration;
              return (
                <TiltCard
                  key={idx}
                  maxTilt={8}
                  scale={1.03}
                  onClick={() => handleRoleSelect("student")}
                  className="rounded-[28px]"
                >
                  <div className="bg-white rounded-[28px] border border-[#E6EAF2] p-6 h-full flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#FF642F] transition-all group">
                    <div>
                      {/* Top Illustration Showcase */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${subj.badgeColor}`}>
                          {subj.badge}
                        </span>
                        <div className="w-16 h-16 flex items-center justify-center">
                          <Illustration className="w-16 h-16" />
                        </div>
                      </div>

                      <h3 className="text-xl font-black text-[#18181B] mb-1">
                        {subj.title}
                      </h3>
                      <div className="text-xs font-bold text-[#7E8494] mb-3">{subj.subtitle}</div>
                      <p className="text-xs text-[#555C6E] leading-relaxed font-medium mb-6">
                        {subj.description}
                      </p>

                      {/* Topic Pills */}
                      <div className="space-y-1.5 mb-6">
                        {subj.topics.map((t, ti) => (
                          <div
                            key={ti}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-[#555C6E]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF642F]" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F0F3F8] flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#18181B]">Start Diagnostic</span>
                      <span className="w-8 h-8 rounded-full bg-[#FF642F] text-white flex items-center justify-center group-hover:scale-110 shadow-xs shadow-[#FF642F]/25 transition-transform">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            8. INTERACTIVE FAQ ACCORDION
            ══════════════════════════════════════════════════════════════ */}
        <section id="faq" className="w-full max-w-4xl mx-auto text-left py-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="px-3.5 py-1 rounded-full bg-[#EBF3FE] text-[#1E3A8A] border border-[#D1E2FB] text-xs font-bold">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight mt-2">
              Everything you need to know
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, fIdx) => {
              const isOpen = openFaqIdx === fIdx;
              return (
                <div
                  key={fIdx}
                  className="rounded-[22px] bg-white border border-[#E6EAF2] shadow-xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : fIdx)}
                    className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#FAFBFD] transition-colors"
                  >
                    <span className="text-sm sm:text-base font-extrabold text-[#18181B]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#7E8494] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#FF642F]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#555C6E] leading-relaxed font-medium border-t border-[#F0F3F8] animate-fade-in-up">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            9. GRAND CALL TO ACTION BANNER
            ══════════════════════════════════════════════════════════════ */}
        <section className="w-full pb-4">
          <div className="rounded-[36px] bg-[#181A20] text-white p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FF642F]/30 blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#2F65F6]/25 blur-[90px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/15 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#FEF0C3]" />
                <span>Zero Setup Required • Instant Socratic Diagnostic</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Ready to experience the future of STEM learning?
              </h2>

              <p className="text-xs sm:text-sm text-[#A1A1AA] font-medium leading-relaxed">
                Join thousands of students and teachers unlocking deep mathematical, physical, and chemical intuition in real time with Axiora.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => handleRoleSelect("student")}
                  className="bg-[#FF642F] hover:bg-[#E85520] text-white text-xs sm:text-sm font-bold py-3 px-8 rounded-full shadow-lg shadow-[#FF642F]/30 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-white" />
                  <span>Launch Student Portal</span>
                </button>
                <button
                  onClick={() => handleRoleSelect("teacher")}
                  className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white border border-white/20 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Teacher Console</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            10. CLEAN FOOTER
            ══════════════════════════════════════════════════════════════ */}
        <footer className="w-full pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7E8494] border-t border-[#E6EAF2]">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#18181B]">Convex Real-Time Database Online</span>
            <span className="opacity-50">•</span>
            <span>Axiora Socratic Engine v2.4</span>
          </div>
          <p className="font-medium m-0">© 2026 Axiora • Multi-Subject STEM Intuition Engine</p>
        </footer>

      </div>
    </div>
  );
}
