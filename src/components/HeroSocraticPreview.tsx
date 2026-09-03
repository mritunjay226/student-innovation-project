"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Brain,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  GitBranch,
  Smile,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

interface Scenario {
  id: string;
  subject: string;
  topic: string;
  badgeColor: string;
  tobyDoubt: string;
  tobyMisconception: string;
  rootCauseGap: string;
  prerequisites: string[];
  options: {
    label: string;
    actionType: "guide" | "intuition" | "prereq";
    tobyReply: string;
    coachInsight: string;
    newMastery: number;
  }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "calc",
    subject: "Calculus",
    topic: "Chain Rule",
    badgeColor: "bg-blue-50 text-[#2F65F6] border-blue-200",
    tobyDoubt: "If y = sin(x²), isn't dy/dx just cos(x²)? Why do we multiply by 2x?",
    tobyMisconception: "Treats nested composite function like a standard single variable derivative.",
    rootCauseGap: "Prerequisite Gap: Rate of change of inner layer (Composite Functions)",
    prerequisites: ["Functions", "Product Rule", "Composite Functions (Root Gap)"],
    options: [
      {
        label: "Explain with Inner Gear Metaphor",
        actionType: "intuition",
        tobyReply: "Whoa! So the outer gear spins with cos(u), but the inner shaft u = x² is accelerating at 2x rate! That's why 2x multiplies the whole speed!",
        coachInsight: "Intuition Built: Toby connected mechanical gear ratios to composite chain rates.",
        newMastery: 94,
      },
      {
        label: "Ask Toby Socratic Question",
        actionType: "guide",
        tobyReply: "Wait... if x changes by dx, then u = x² changes by 2x·dx. So sin(u) changes by cos(u)·(2x·dx)... oh it cascades!",
        coachInsight: "Root Cause Resolved: Prerequisite 'Differential Cascades' mastered.",
        newMastery: 88,
      },
    ],
  },
  {
    id: "physics",
    subject: "Physics",
    topic: "Momentum in Inelastic Collision",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    tobyDoubt: "When two clay balls stick together, why does kinetic energy disappear if momentum is conserved?",
    tobyMisconception: "Confuses scalar kinetic energy conservation with directional momentum vectors.",
    rootCauseGap: "Prerequisite Gap: Internal work & thermal dissipation vs Net external force",
    prerequisites: ["Vectors", "Newton's 3rd Law", "Deformation Work"],
    options: [
      {
        label: "Ask: Where did the energy go?",
        actionType: "guide",
        tobyReply: "Aha! The clay deformed and heated up molecules! Energy wasn't destroyed, just turned into microscopic heat, while net external force was zero!",
        coachInsight: "Misconception Cleared: Toby decoupled vector momentum from microscopic thermal work.",
        newMastery: 96,
      },
      {
        label: "Trace Root Cause Vector Graph",
        actionType: "prereq",
        tobyReply: "Looking at the vector diagram, the center of mass velocity didn't change at all because no outside push occurred!",
        coachInsight: "Intuition Locked: System center-of-mass invariance reinforced.",
        newMastery: 91,
      },
    ],
  },
  {
    id: "chem",
    subject: "Chemistry",
    topic: "Le Chatelier's Principle",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    tobyDoubt: "If we increase pressure on N₂ + 3H₂ ⇌ 2NH₃, why doesn't equilibrium just stay the same since reactants and products both get compressed?",
    tobyMisconception: "Assumes pressure impacts both sides equally without counting gas moles.",
    rootCauseGap: "Prerequisite Gap: Partial pressure & molar volume density",
    prerequisites: ["Ideal Gas Law", "Reaction Quotient Q", "Molar Coefficients"],
    options: [
      {
        label: "Guide Toby to count total gas moles",
        actionType: "guide",
        tobyReply: "4 moles on left vs 2 moles on right! Shifting right reduces the crowded container pressure. It pushes back against the change!",
        coachInsight: "Core Mental Model Mastered: Dynamic stress relief equilibrium.",
        newMastery: 95,
      },
    ],
  },
];

export function HeroSocraticPreview({ onLaunch }: { onLaunch: () => void }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeOptionIdx, setActiveOptionIdx] = useState<number | null>(null);

  const scenario = SCENARIOS[selectedIdx];
  const selectedOption = activeOptionIdx !== null ? scenario.options[activeOptionIdx] : null;
  const currentMastery = selectedOption ? selectedOption.newMastery : 38;

  const handleSelectScenario = (idx: number) => {
    setSelectedIdx(idx);
    setActiveOptionIdx(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[32px] p-6 sm:p-8 bg-white border border-[#E6EAF2] shadow-[0_12px_40px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all duration-300">
      {/* ── Top Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#F0F3F8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2F65F6] text-white flex items-center justify-center font-bold shadow-md shadow-[#2F65F6]/25">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-[#18181B]">
                Interactive Socratic Simulator
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Demo
              </span>
            </div>
            <p className="text-xs text-[#7E8494] font-medium m-0 mt-0.5">
              Teach AI peer Toby. Experience real-time prerequisite gap detection.
            </p>
          </div>
        </div>

        {/* Topic Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-[#F4F6FB] p-1.5 rounded-full border border-[#E2E6F0]">
          {SCENARIOS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedIdx === idx
                  ? "bg-[#2F65F6] text-white shadow-sm shadow-[#2F65F6]/25 scale-105"
                  : "text-[#7E8494] hover:text-[#18181B]"
              }`}
            >
              {s.subject}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scenario Metadata & Prerequisite Tree Preview ── */}
      <div className="py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#7E8494]">Concept:</span>
          <span className={`px-2.5 py-1 rounded-full font-bold border ${scenario.badgeColor}`}>
            {scenario.topic}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-[#555C6E]">
          <GitBranch className="w-3.5 h-3.5 text-[#2F65F6]" />
          <span className="hidden sm:inline">Prerequisite Chain:</span>
          {scenario.prerequisites.map((p, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded-md ${
                p.includes("Root Gap")
                  ? "bg-amber-100 text-amber-900 font-bold border border-amber-300 animate-pulse"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {p}
              {i < scenario.prerequisites.length - 1 && " →"}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main Interactive Dialogue Container ── */}
      <div className="my-2 space-y-3.5">
        {/* Toby's Doubt Bubble (AI Peer) */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F8FAFD] border border-[#E2E6F0]">
          <div className="w-9 h-9 rounded-2xl bg-[#2F65F6] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm shadow-[#2F65F6]/20">
            🤖
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                Toby (AI Peer)
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  ⚠️ Misconception Active
                </span>
              </span>
              <span className="text-[10px] text-[#7E8494] font-medium">Just now</span>
            </div>
            <p className="text-sm font-semibold text-[#18181B] leading-relaxed m-0">
              &ldquo;{scenario.tobyDoubt}&rdquo;
            </p>
            <div className="mt-2 text-[11px] text-[#7E8494] flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{scenario.tobyMisconception}</span>
            </div>
          </div>
        </div>

        {/* Tutor Response Selection or Result */}
        {selectedOption ? (
          <div className="space-y-3 animate-fade-in-up">
            {/* Student Guide Bubble */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#EBF3FE] border border-[#D1E2FB]">
              <div className="w-9 h-9 rounded-2xl bg-[#2F65F6] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm shadow-[#2F65F6]/25">
                🎓
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1E3A8A]">You (Student Tutor)</span>
                  <span className="text-[10px] text-[#2F65F6] font-bold">Reverse Socratic</span>
                </div>
                <p className="text-sm font-semibold text-[#18181B] m-0">
                  {selectedOption.label}
                </p>
              </div>
            </div>

            {/* Toby's Eureka Moment Bubble */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                ✨
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    Toby&apos;s Understanding
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.2 rounded-full font-bold">
                      Eureka!
                    </span>
                  </span>
                </div>
                <p className="text-sm font-semibold text-emerald-900 leading-relaxed m-0">
                  &ldquo;{selectedOption.tobyReply}&rdquo;
                </p>
                <div className="mt-2 text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{selectedOption.coachInsight}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Prompt Choices to Test */
          <div className="p-4 rounded-2xl bg-white border border-dashed border-[#D6CEC2] text-left">
            <div className="text-xs font-bold text-[#555C6E] mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2F65F6]" />
              <span>Choose your Socratic response to guide Toby:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scenario.options.map((opt, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => setActiveOptionIdx(optIdx)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFD] hover:bg-[#EBF3FE] text-[#18181B] border border-[#E2E6F0] hover:border-[#2F65F6] text-xs font-bold transition-all text-left group cursor-pointer shadow-xs"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    👉 {opt.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#2F65F6] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Live Mastery Radar & Action Footer ── */}
      <div className="pt-4 border-t border-[#F0F3F8] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Real-time Progress Bar */}
        <div className="w-full sm:w-1/2 text-left">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-[#7E8494]">Toby&apos;s Deep Intuition Score</span>
            <span className={currentMastery > 80 ? "text-emerald-600 font-extrabold" : "text-amber-600 font-extrabold"}>
              {currentMastery}%
            </span>
          </div>
          <div className="bg-[#E5E9F2] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                currentMastery > 80 ? "bg-[#2F65F6]" : "bg-amber-400"
              }`}
              style={{ width: `${currentMastery}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {selectedOption && (
            <button
              onClick={() => setActiveOptionIdx(null)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#7E8494] hover:text-[#18181B] bg-[#F4F6FB] rounded-full border border-[#E2E6F0] cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Step
            </button>
          )}
          <button
            onClick={onLaunch}
            className="bg-[#2F65F6] hover:bg-[#2554D4] text-white text-xs font-bold py-2.5 px-5 rounded-full shadow-sm shadow-[#2F65F6]/25 flex items-center gap-2 cursor-pointer transition-all w-full sm:w-auto justify-center"
          >
            <span>Launch Full Socratic App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
