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
  Layers,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  ChevronRight,
  Compass,
  Flame,
  Activity,
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
  { name: "Calculus & Limits", subject: "Math", color: "chip-lavender" },
  { name: "Electromagnetism", subject: "Physics", color: "chip-sky" },
  { name: "Organic Synthesis", subject: "Chemistry", color: "chip-mint" },
  { name: "Linear Algebra", subject: "Math", color: "chip-butter" },
  { name: "Quantum Mechanics", subject: "Physics", color: "chip-peach" },
  { name: "Thermodynamics", subject: "Physics", color: "chip-pink" },
  { name: "Chemical Equilibrium", subject: "Chemistry", color: "chip-sky" },
  { name: "Kinematics & Vectors", subject: "Physics", color: "chip-butter" },
];

const CURRICULUM_SUBJECTS = [
  {
    title: "Mathematics",
    subtitle: "From Calculus to Linear Algebra",
    description: "Deconstruct multi-variable limits, integrals, and vector matrices into intuitive geometric mental models.",
    color: "card-lavender",
    accentColor: "text-[#2D1B4E]",
    badge: "12 Chapters • 48 Graph Nodes",
    illustration: MathGoldenGeometry,
    topics: ["Derivatives & Chain Rule", "Riemann Sums", "Eigenvalues"],
  },
  {
    title: "Physics",
    subtitle: "Classical Mechanics & Quantum",
    description: "Master conservative forces, wave optics, and relativistic momentum by debugging Toby's physical intuition.",
    color: "card-sky",
    accentColor: "text-[#13334E]",
    badge: "14 Chapters • 62 Graph Nodes",
    illustration: PhysicsQuantumOrbital,
    topics: ["Momentum Vectors", "Magnetic Flux", "Wave Interference"],
  },
  {
    title: "Chemistry",
    subtitle: "Atomic Theory & Reaction Kinetics",
    description: "Visualize electron orbital hybrids, thermodynamic enthalpy, and reversible equilibrium shifts in real time.",
    color: "card-mint",
    accentColor: "text-[#0D3E30]",
    badge: "10 Chapters • 38 Graph Nodes",
    illustration: ChemLabFlask,
    topics: ["Le Chatelier Shifts", "SN1 vs SN2 Mechanisms", "Gibbs Free Energy"],
  },
];

const FAQS = [
  {
    q: "How does LearnAI find hidden prerequisite gaps?",
    a: "Unlike typical quiz apps that simply score correct or incorrect, LearnAI builds a dynamic dependency graph for each STEM topic. When you or Toby encounter difficulty, the engine traverses the prerequisite chain upstream to isolate whether the root confusion stems from algebra, geometry, or conceptual definitions.",
  },
  {
    q: "What is Reverse Socratic Tutoring with Toby?",
    a: "Toby is an interactive AI student peer with tailored cognitive blind spots. Research shows you retain 90% of what you teach. By identifying Toby's subtle mistakes and explaining concepts in your own words, you cement deep intuition without passive memorization.",
  },
  {
    q: "How do teachers use the Diagnostic Suite?",
    a: "Teachers can upload their syllabus PDF to generate instant curriculum knowledge graphs, monitor class-wide misconception clusters, identify silent prerequisite bottlenecks before major exams, and assign targeted Socratic teach-back modules.",
  },
  {
    q: "Is LearnAI connected to real-time sync?",
    a: "Yes! Powered by Convex reactive database and Google Gemini AI, your knowledge mastery radar, diagnostic history, and live conversations update with sub-second reactivity across all devices.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { role, setRole } = useAuth();
  const seedDb = useMutation(api.seed.seedDatabase);
  const [mounted, setMounted] = useState(false);
  const [searchTopic, setSearchTopic] = useState("");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

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
    <div className="min-h-screen text-[#18181B] flex flex-col justify-between selection:bg-[#E8DEFF] relative selection:text-[#2D1B4E] overflow-x-hidden">
      {/* ── Multi-Layer Parallax Background ── */}
      <ParallaxBackground />

      {/* ── Sticky Glassmorphic Top Navigation ── */}
      <header className="w-full sticky top-0 z-50 backdrop-blur-md bg-[#FAF8F5]/80 border-b border-[#EBE5DB]/80 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => handleRoleSelect("student")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white bg-[#121216] shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#FEF0C3] group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tight text-[#18181B] leading-none">
                Learn<span className="text-[#8B5CF6]">AI</span>
              </span>
              <span className="text-[10px] font-bold text-[#71717A] tracking-wider uppercase mt-0.5">
                Socratic STEM Engine
              </span>
            </div>
          </div>

          {/* Quick Nav Anchor Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#52525B]">
            <a
              href="#simulator"
              className="hover:text-[#18181B] transition-colors flex items-center gap-1.5"
            >
              <Brain className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Simulator</span>
            </a>
            <a
              href="#pillars"
              className="hover:text-[#18181B] transition-colors flex items-center gap-1.5"
            >
              <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
              <span>How It Works</span>
            </a>
            <a
              href="#curriculum"
              className="hover:text-[#18181B] transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Curriculum</span>
            </a>
            <a
              href="#faq"
              className="hover:text-[#18181B] transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>FAQ</span>
            </a>
          </nav>

          {/* Right CTA Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRoleSelect("teacher")}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#52525B] hover:text-[#18181B] px-3.5 py-2 rounded-full border border-transparent hover:border-[#EBE5DB] hover:bg-white transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Teacher Suite</span>
            </button>
            <button
              onClick={() => handleRoleSelect("student")}
              className="btn-pill-dark text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Landing Body ── */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {/* ══════════════════════════════════════════════════════════════
            HERO SECTION
            ══════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-6 pt-12 pb-10 text-center flex flex-col items-center">
          {/* Status Pill Announcement */}
          <div className="animate-fade-in-up mb-6">
            <div
              className="pill-chip chip-butter cursor-pointer font-bold text-xs shadow-sm hover:scale-105 transition-transform"
              onClick={() => handleRoleSelect("student")}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>AI Socratic Peer & Prerequisite Debugger</span>
              <span className="underline ml-1 font-extrabold text-[#713F12]">Try Live Demo ↓</span>
            </div>
          </div>

          {/* Main Punchy Heading */}
          <div className="animate-fade-in-up delay-1 max-w-4xl mx-auto mb-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#18181B] tracking-tight leading-[1.08] mb-5">
              Stop memorizing formulas. <br className="hidden sm:block" />
              <span className="text-gradient-purple">Diagnose root causes.</span>
            </h1>
            <p className="text-base sm:text-xl max-w-2xl mx-auto text-[#52525B] font-medium leading-relaxed">
              When you struggle with a concept, the problem is almost always a hidden prerequisite gap from months ago. We trace it, teach you Socratically, and build unbreakable intuition.
            </p>
          </div>

          {/* ── Interactive Search & Instant Diagnostic Omnibar ── */}
          <div className="animate-fade-in-up delay-2 w-full max-w-xl mx-auto mb-8">
            <div className="p-2 rounded-full bg-white border-2 border-[#EBE5DB] shadow-xl hover:border-[#8B5CF6] transition-all flex items-center gap-2">
              <div className="pl-3">
                <Search className="w-5 h-5 text-[#8B5CF6] shrink-0" />
              </div>
              <input
                type="text"
                placeholder="Search any topic (e.g. Chain Rule, Quantum Orbitals, Le Chatelier)..."
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRoleSelect("student");
                }}
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-[#18181B] placeholder:text-[#A1A1AA] py-2"
              />
              <button
                onClick={() => handleRoleSelect("student")}
                className="btn-pill-dark text-xs py-2 px-4 shrink-0 flex items-center gap-1.5"
              >
                <span>Diagnose</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Topic Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-[11px] font-bold text-[#71717A] flex items-center gap-1 mr-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Popular:
              </span>
              {TOPIC_PILLS.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRoleSelect("student")}
                  className={`pill-chip ${pill.color} text-xs py-1.5 px-3.5 cursor-pointer hover:shadow-md hover:scale-105 transition-all`}
                >
                  {pill.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            HERO SOCRATIC SIMULATOR PREVIEW
            ══════════════════════════════════════════════════════════════ */}
        <section id="simulator" className="w-full max-w-5xl mx-auto px-6 pb-20">
          <HeroSocraticPreview onLaunch={() => handleRoleSelect("student")} />
        </section>

        {/* ══════════════════════════════════════════════════════════════
            3D TILT ROLE PORTAL CARDS (STUDENT & TEACHER)
            ══════════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-5xl mx-auto px-6 pb-16">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              Two Dedicated Portals
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] mt-2">
              Choose your entry point
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Student Portal Card with 3D Tilt */}
            <TiltCard
              maxTilt={7}
              scale={1.02}
              onClick={() => handleRoleSelect("student")}
              className="rounded-[32px]"
            >
              <div className="card-pastel card-lavender p-8 h-full flex flex-col justify-between shadow-lg hover:shadow-2xl border-2 border-[#D5C4FA]">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#121216] text-white flex items-center justify-center font-bold text-2xl shadow-md">
                      <GraduationCap className="w-7 h-7 text-[#E8DEFF]" />
                    </div>
                    <span className="pill-chip chip-white text-xs font-extrabold shadow-sm">
                      🎓 Student Experience
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#2D1B4E] mb-3">
                    Student Learning Portal
                  </h3>
                  <p className="text-sm text-[#4E3875] leading-relaxed mb-6 font-semibold">
                    Learn by teaching AI peer Toby, solve adaptive diagnostic quizzes, and track your personalized mastery radar with live prerequisite gap tracing.
                  </p>

                  <div className="space-y-2.5 mb-8">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2D1B4E]">
                      <CheckCircle2 className="w-4 h-4 text-purple-700" />
                      <span>Reverse Socratic Tutoring (Teach Toby)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2D1B4E]">
                      <CheckCircle2 className="w-4 h-4 text-purple-700" />
                      <span>Root Cause Prerequisite Gap Isolator</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2D1B4E]">
                      <CheckCircle2 className="w-4 h-4 text-purple-700" />
                      <span>Instant AI Flashcards & PDF Syllabus Ingestion</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-purple-200/60">
                  <span className="text-xs font-bold text-[#4E3875]">Instant Access • No Login Required</span>
                  <span className="btn-continue">
                    <span>Enter Portal</span>
                    <span className="arrow-circle">→</span>
                  </span>
                </div>
              </div>
            </TiltCard>

            {/* Teacher Diagnostic Console Card with 3D Tilt */}
            <TiltCard
              maxTilt={7}
              scale={1.02}
              onClick={() => handleRoleSelect("teacher")}
              className="rounded-[32px]"
            >
              <div className="card-pastel card-mint p-8 h-full flex flex-col justify-between shadow-lg hover:shadow-2xl border-2 border-[#B2E5D3]">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#121216] text-white flex items-center justify-center font-bold text-2xl shadow-md">
                      <BookOpen className="w-7 h-7 text-[#D2F1E6]" />
                    </div>
                    <span className="pill-chip chip-white text-xs font-extrabold shadow-sm">
                      🔬 Teacher Console
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#0D3E30] mb-3">
                    Teacher Diagnostic Suite
                  </h3>
                  <p className="text-sm text-[#1D5E4C] leading-relaxed mb-6 font-semibold">
                    Uncover class-wide prerequisite bottlenecks, upload curriculum syllabi, inspect misconception clusters, and edit the live curriculum graph.
                  </p>

                  <div className="space-y-2.5 mb-8">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0D3E30]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Class Misconception Cluster Heatmap</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0D3E30]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Interactive Prerequisite Graph Visualizer</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0D3E30]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Automated Diagnostic Assessment Generation</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-emerald-200/60">
                  <span className="text-xs font-bold text-[#1D5E4C]">Instructor Analytics • Curriculum AI</span>
                  <span className="btn-continue">
                    <span>Enter Console</span>
                    <span className="arrow-circle">→</span>
                  </span>
                </div>
              </div>
            </TiltCard>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            LIVE STATS & SOCIAL PROOF METRICS
            ══════════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-5xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Prerequisite Gap Resolution", val: "94.2%", icon: TrendingUp, color: "text-purple-600" },
              { label: "Faster Intuition Building", val: "3.2x", icon: Zap, color: "text-amber-500" },
              { label: "Misconception Traps Mapped", val: "14,800+", icon: Brain, color: "text-emerald-600" },
              { label: "Rote Memorization Needed", val: "0%", icon: ShieldCheck, color: "text-sky-600" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white/90 border border-[#EBE5DB] shadow-sm text-center hover:shadow-md transition-shadow"
              >
                <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">{stat.val}</div>
                <div className="text-[11px] font-bold text-[#71717A] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            INTERACTIVE FEATURE PILLARS TABS
            ══════════════════════════════════════════════════════════════ */}
        <section id="pillars" className="w-full">
          <InteractiveFeatureTabs onExplore={() => handleRoleSelect("student")} />
        </section>

        {/* ══════════════════════════════════════════════════════════════
            STEM CURRICULUM SUBJECT EXPLORER (WITH BESPOKE SVG ART)
            ══════════════════════════════════════════════════════════════ */}
        <section id="curriculum" className="w-full max-w-5xl mx-auto px-6 py-16 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold">
                Adaptive Curriculum
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight mt-2">
                Explore Full Subject Domains
              </h2>
              <p className="text-sm text-[#52525B] font-medium mt-1">
                Each subject features complete prerequisite graphs and Socratic dialogues.
              </p>
            </div>
            <button
              onClick={() => handleRoleSelect("student")}
              className="btn-pill-dark text-xs py-2 px-5 shrink-0"
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
                  <div className={`card-pastel ${subj.color} p-6 h-full flex flex-col justify-between shadow-md hover:shadow-xl group`}>
                    <div>
                      {/* Top Illustration Showcase */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="pill-chip chip-white text-[11px] font-bold">
                          {subj.badge}
                        </span>
                        <div className="w-16 h-16 flex items-center justify-center">
                          <Illustration className="w-16 h-16" />
                        </div>
                      </div>

                      <h3 className={`text-xl font-black ${subj.accentColor} mb-1`}>
                        {subj.title}
                      </h3>
                      <div className="text-xs font-bold opacity-80 mb-3">{subj.subtitle}</div>
                      <p className="text-xs opacity-90 leading-relaxed font-medium mb-6">
                        {subj.description}
                      </p>

                      {/* Topic Pills */}
                      <div className="space-y-1.5 mb-6">
                        {subj.topics.map((t, ti) => (
                          <div
                            key={ti}
                            className="flex items-center gap-1.5 text-[11px] font-bold opacity-85"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                      <span className="text-xs font-extrabold">Start Diagnostic</span>
                      <span className="w-8 h-8 rounded-full bg-[#121216] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
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
            INTERACTIVE FAQ ACCORDION
            ══════════════════════════════════════════════════════════════ */}
        <section id="faq" className="w-full max-w-4xl mx-auto px-6 py-16 text-left">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight mt-2">
              Everything you need to know
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, fIdx) => {
              const isOpen = openFaqIdx === fIdx;
              return (
                <div
                  key={fIdx}
                  className="rounded-2xl bg-white border border-[#EBE5DB] shadow-sm overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : fIdx)}
                    className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#FAF8F5] transition-colors"
                  >
                    <span className="text-sm sm:text-base font-extrabold text-[#18181B]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#71717A] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#8B5CF6]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#52525B] leading-relaxed font-medium border-t border-[#F0EBE1] animate-fade-in-up">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            FINAL CALL TO ACTION BANNER
            ══════════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-5xl mx-auto px-6 pb-20">
          <div className="rounded-[36px] bg-[#121216] text-white p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#8B5CF6]/30 blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#10B981]/25 blur-[90px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FEF0C3] border border-white/15 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Setup Required • Instant Diagnostic</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Ready to experience the future of STEM learning?
              </h2>

              <p className="text-sm sm:text-base text-[#A1A1AA] font-medium leading-relaxed">
                Join thousands of students and teachers unlocking deep mathematical and physical intuition in real time.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => handleRoleSelect("student")}
                  className="btn-pill-white text-sm py-3 px-8 shadow-lg hover:scale-105 transition-transform"
                >
                  <GraduationCap className="w-4 h-4 text-purple-700" />
                  <span>Launch Student Portal</span>
                </button>
                <button
                  onClick={() => handleRoleSelect("teacher")}
                  className="px-6 py-3 rounded-full text-sm font-bold text-white border border-white/20 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 inline-block mr-2 text-emerald-400" />
                  <span>Teacher Console</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717A] border-t border-[#EBE5DB]/80">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-[#18181B]">Convex Real-Time Database Online</span>
          <span className="opacity-50">•</span>
          <span>Socratic Engine v2.4</span>
        </div>
        <p className="font-medium">© 2026 LearnAI • Multi-Subject STEM Intuition Engine</p>
      </footer>
    </div>
  );
}
