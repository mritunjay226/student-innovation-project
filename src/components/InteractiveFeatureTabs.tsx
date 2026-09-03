"use client";

import React, { useState } from "react";
import {
  GitBranch,
  Brain,
  Zap,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Target,
  Sparkles,
} from "lucide-react";

export function InteractiveFeatureTabs({ onExplore }: { onExplore: () => void }) {
  const [activeTab, setActiveTab] = useState<"graph" | "toby" | "genome">("graph");

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-16">
      {/* ── Section Title & Subheading ── */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-xs font-extrabold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>The 3 Pillars of Deep Intuition</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
          How Axiora fixes learning bottlenecks.
        </h2>
        <p className="text-sm sm:text-base text-[#52525B] font-medium mt-2">
          Traditional apps quiz for memorization. We pinpoint exact prerequisite fractures and fix them Socratically.
        </p>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-full bg-[#EFE9DF] max-w-md mx-auto mb-8 border border-[#E3DCD0]">
        {[
          { id: "graph" as const, label: "Prerequisite Graph", icon: GitBranch },
          { id: "toby" as const, label: "Reverse Tutoring", icon: Brain },
          { id: "genome" as const, label: "Misconception Genome", icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#121216] text-white shadow-md scale-102"
                  : "text-[#52525B] hover:text-[#18181B]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content Showcase ── */}
      <div className="rounded-[32px] bg-white border border-[#EBE5DB] p-6 sm:p-10 shadow-xl relative overflow-hidden transition-all duration-300">
        {activeTab === "graph" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in-up">
            <div className="lg:col-span-5 text-left space-y-4">
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                Dynamic Prerequisite Engine
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
                Trace gaps back to their true root cause.
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed font-medium">
                Struggling with Electromagnetism? The problem isn&apos;t Faraday&apos;s Law—it&apos;s usually a hidden gap in 3D Vector Cross Products from 6 months ago.
              </p>
              <ul className="space-y-2 text-xs font-bold text-[#18181B]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-time recursive dependency trees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Zero time wasted re-reading mastered topics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Sub-topic mastery clustering</span>
                </li>
              </ul>
              <div className="pt-2">
                <button onClick={onExplore} className="btn-pill-dark text-xs py-2.5 px-6">
                  <span>Explore Curriculum Graph</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Interactive Graph Simulation Card */}
            <div className="lg:col-span-7 rounded-2xl bg-[#FAF8F5] border border-[#EBE5DB] p-5">
              <div className="flex items-center justify-between text-xs font-mono mb-4 text-[#71717A] border-b border-[#E8E2D8] pb-2">
                <span>GRAPH_TOPOLOGY::PHYSICS_ELECTROMAGNETISM</span>
                <span className="text-amber-600 font-bold">GAP_DETECTED: [VECTORS_3D]</span>
              </div>
              <div className="space-y-3">
                {/* Node 1: Target Goal */}
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      🎯
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-purple-950">Lorentz Force & Magnetic Flux</div>
                      <div className="text-[11px] text-purple-700 font-medium">Target Topic (Grade 12 Physics)</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-purple-200 text-purple-900">Blocked</span>
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-xs font-mono text-amber-500 font-bold">
                  ↓ depends on Prerequisite #1
                </div>

                {/* Node 2: The Root Gap */}
                <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between shadow-sm animate-pulse-glow">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                      ⚠️
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-amber-950">Vector Cross Products (A × B)</div>
                      <div className="text-[11px] text-amber-800 font-semibold">Root Cause Prerequisite Gap Identified!</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-200 text-amber-900">Fixing Now</span>
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-xs font-mono text-emerald-600 font-bold">
                  ↓ depends on Mastered Foundation
                </div>

                {/* Node 3: Mastered Foundation */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-emerald-950">Trigonometry & Cartesian Coordinates</div>
                      <div className="text-[11px] text-emerald-700 font-medium">100% Mastered Baseline</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-200 text-emerald-900">Mastered</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "toby" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in-up">
            <div className="lg:col-span-5 text-left space-y-4">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                Reverse Socratic Tutoring
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
                You retain 90% of what you teach.
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed font-medium">
                Toby is an AI peer designed with realistic student cognitive blind spots. By guiding Toby step by step, you solidify concepts without boring flashcards.
              </p>
              <ul className="space-y-2 text-xs font-bold text-[#18181B]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Feynman Technique in an interactive sandbox</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dynamic counter-arguments that test edge cases</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-time explanation clarity assessment</span>
                </li>
              </ul>
              <div className="pt-2">
                <button onClick={onExplore} className="btn-pill-dark text-xs py-2.5 px-6">
                  <span>Start Teaching Toby</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Simulation Display */}
            <div className="lg:col-span-7 rounded-2xl bg-[#FAF8F5] border border-[#EBE5DB] p-5 space-y-3 text-left">
              <div className="p-3 rounded-xl bg-white border border-[#EBE5DB]">
                <div className="text-[11px] font-bold text-[#71717A] mb-1">Toby (AI Peer):</div>
                <p className="text-xs font-semibold text-[#18181B]">
                  &ldquo;Wait, in thermodynamics, if a gas expands adiabatically, why does temperature drop if no heat left the box?&rdquo;
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="text-[11px] font-bold text-indigo-700 mb-1">Your Explanation:</div>
                <p className="text-xs font-semibold text-indigo-950">
                  &ldquo;The gas pushed the piston, doing work W. That energy came from the molecules&apos; internal kinetic energy, so temperature had to decrease!&rdquo;
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] font-bold text-emerald-800 mb-1">Toby&apos;s Insight:</div>
                <p className="text-xs font-semibold text-emerald-950">
                  &ldquo;Oh!! ΔU = Q - W. Since Q = 0, ΔU = -W! So doing work literally drains internal temperature!&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "genome" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in-up">
            <div className="lg:col-span-5 text-left space-y-4">
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                Misconception Genome
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
                Catch mental traps before exam day.
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed font-medium">
                Our AI maps recurring cognitive missteps across STEM disciplines and inoculates students with intuitive counter-examples.
              </p>
              <ul className="space-y-2 text-xs font-bold text-[#18181B]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Distinguishes careless arithmetic from conceptual traps</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Generates tailored contrastive problem pairs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Provides teachers with class-wide misconception heatmaps</span>
                </li>
              </ul>
              <div className="pt-2">
                <button onClick={onExplore} className="btn-pill-dark text-xs py-2.5 px-6">
                  <span>View Diagnostic Suite</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Diagnostic Genome Breakdown Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {[
                {
                  code: "TRAP_M01",
                  title: "Boundary Overgeneralization",
                  desc: "Applying formulas outside valid constraints (e.g. constant acceleration equations in harmonic motion).",
                  severity: "High Frequency",
                  bg: "bg-rose-50 border-rose-200 text-rose-950",
                },
                {
                  code: "TRAP_M02",
                  title: "Scalar vs Vector Confusion",
                  desc: "Treating momentum or force directions like simple numeric magnitudes.",
                  severity: "Critical Trap",
                  bg: "bg-amber-50 border-amber-200 text-amber-950",
                },
                {
                  code: "TRAP_M03",
                  title: "Static Formula Memorization",
                  desc: "Remembering symbols without understanding physical dimensional units.",
                  severity: "Moderate",
                  bg: "bg-sky-50 border-sky-200 text-sky-950",
                },
                {
                  code: "TRAP_M04",
                  title: "Sign & Direction Inversion",
                  desc: "Dropping negative signs in Lenz's law, potential energy, and integrals.",
                  severity: "High Frequency",
                  bg: "bg-purple-50 border-purple-200 text-purple-950",
                },
              ].map((trap, i) => (
                <div key={i} className={`p-4 rounded-xl border ${trap.bg}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-bold opacity-75">{trap.code}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80">{trap.severity}</span>
                  </div>
                  <h4 className="text-xs font-bold mb-1">{trap.title}</h4>
                  <p className="text-[11px] opacity-80 leading-relaxed font-medium">{trap.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
