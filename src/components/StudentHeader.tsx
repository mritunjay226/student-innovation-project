"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useGamification } from "@/lib/gamificationContext";
import { calculateStudentLevel, ALL_BADGES } from "@/lib/badgesData";
import {
  Sparkles,
  Zap,
  Flame,
  Award,
  TrendingUp,
  HelpCircle,
  X,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  RotateCw,
} from "lucide-react";

export function StudentHeader() {
  const pathname = usePathname();
  const { userName } = useAuth();
  const {
    xp,
    credits,
    maxCredits,
    streak,
    unlockedBadgeIds,
    celebrationBadge,
    dismissCelebration,
    refillCredits,
  } = useGamification();

  const [showCreditsTooltip, setShowCreditsTooltip] = useState(false);
  const [showXpTooltip, setShowXpTooltip] = useState(false);

  const levelInfo = calculateStudentLevel(xp);
  const unlockedCount = unlockedBadgeIds.length;
  const totalBadges = ALL_BADGES.length;

  return (
    <>
      {/* ── TOP STATS HEADER BAR ── */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#FAF8F5]/90 border-b border-[#EBE5DB] px-4 sm:px-8 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Breadcrumbs / Page Identity */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-black text-[#18181B] truncate hidden md:inline">
              Welcome back, <span className="text-[#7C3AED]">{userName || "Alex"}</span> 👋
            </span>
            <span className="text-[10px] font-bold text-[#71717A] bg-[#EBE5DB]/60 py-0.5 px-2 rounded-md hidden lg:inline">
              Class 12 STEM
            </span>
          </div>

          {/* Right: Gamification Badges & Status Pills */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            
            {/* 1. ⚡ AI CREDITS PILL */}
            <div className="relative">
              <button
                onClick={() => setShowCreditsTooltip((p) => !p)}
                onMouseEnter={() => setShowCreditsTooltip(true)}
                onMouseLeave={() => setShowCreditsTooltip(false)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-2xl border text-xs font-extrabold cursor-pointer transition-all shadow-xs ${
                  credits > 30
                    ? "bg-[#FEF0C3] border-[#FDE089] text-[#713F12] hover:bg-[#FDE089]"
                    : "bg-[#FCD5CE] border-[#F9BFB4] text-[#702114] animate-pulse"
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current text-amber-600" />
                <span>{credits}</span>
                <span className="text-[10px] font-semibold opacity-70">/{maxCredits}</span>
              </button>

              {/* Credits Popover Tooltip */}
              {showCreditsTooltip && (
                <div className="absolute right-0 top-full mt-2 w-64 p-3.5 rounded-2xl bg-white border border-[#EBE5DB] shadow-xl z-50 animate-fade-in text-left text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-[#18181B] flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> AI Generation Credits
                    </span>
                    <span className="text-[10px] font-bold text-[#059669]">Refills Daily</span>
                  </div>
                  <p className="text-[11px] text-[#71717A] leading-relaxed mb-2.5">
                    Used for Gemini Multimodal OCR PDF ingestion & deep Feynman Socratic teach-back evaluations.
                  </p>
                  <div className="w-full bg-[#EBE5DB] h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${(credits / maxCredits) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#71717A] font-bold">
                    <span>{credits} remaining today</span>
                    <button
                      onClick={refillCredits}
                      className="text-[#7C3AED] hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <RotateCw className="w-2.5 h-2.5" /> Bonus Refill
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. ⭐ STUDENT LEVEL & XP PILL */}
            <div className="relative">
              <button
                onClick={() => setShowXpTooltip((p) => !p)}
                onMouseEnter={() => setShowXpTooltip(true)}
                onMouseLeave={() => setShowXpTooltip(false)}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-2xl bg-[#E8DEFF] border border-[#D5C4FA] text-[#2D1B4E] text-xs font-extrabold cursor-pointer transition-all hover:bg-[#D5C4FA] shadow-xs"
              >
                <span>{levelInfo.rankEmoji}</span>
                <span>Lvl {levelInfo.level}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">• {levelInfo.rankTitle}</span>
              </button>

              {/* XP Popover Tooltip */}
              {showXpTooltip && (
                <div className="absolute right-0 top-full mt-2 w-64 p-3.5 rounded-2xl bg-white border border-[#EBE5DB] shadow-xl z-50 animate-fade-in text-left text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-[#18181B] flex items-center gap-1">
                      <span>{levelInfo.rankEmoji}</span> Level {levelInfo.level} Rank
                    </span>
                    <span className="pill-chip chip-lavender text-[9px] font-extrabold py-0.5 px-1.5">
                      {levelInfo.rankTitle}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#71717A] mb-2 font-medium">
                    Total Lifetime XP: <strong className="text-[#18181B]">{xp} XP</strong>
                  </div>
                  <div className="w-full bg-[#EBE5DB] h-2 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="bg-[#7C3AED] h-full rounded-full transition-all"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#71717A] font-bold">
                    <span>{levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP</span>
                    <span className="text-[#7C3AED]">{levelInfo.progressPercent}% to Lvl {levelInfo.level + 1}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. 🔥 DAILY STREAK PILL */}
            <div className="flex items-center gap-1 py-1.5 px-2.5 sm:px-3 rounded-2xl bg-[#FCD5CE] border border-[#F9BFB4] text-[#702114] text-xs font-extrabold shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-bounce" />
              <span>{streak}</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">Streak</span>
            </div>

            {/* 4. 🏅 BADGES SHORTCUT PILL */}
            <Link
              href="/student/badges"
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-2xl border text-xs font-extrabold cursor-pointer transition-all shadow-xs ${
                pathname === "/student/badges"
                  ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm"
                  : "bg-white hover:bg-[#FAF8F5] border-[#EBE5DB] text-[#18181B] hover:border-[#7C3AED]"
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${pathname === "/student/badges" ? "text-white" : "text-[#7C3AED]"}`} />
              <span className="hidden sm:inline">Badges</span>
              <span className="pill-chip chip-lavender text-[10px] font-extrabold py-0.2 px-1.5 ml-0.5">
                {unlockedCount}/{totalBadges}
              </span>
            </Link>

          </div>
        </div>
      </header>

      {/* ── REAL-TIME BADGE UNLOCKED CELEBRATION MODAL ── */}
      {celebrationBadge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[36px] p-6 sm:p-8 text-center shadow-2xl border-2 border-[#D5C4FA] relative animate-scale-up">
            
            {/* Close Button */}
            <button
              onClick={dismissCelebration}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#EBE5DB] flex items-center justify-center text-[#71717A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Trophy Ring */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#E8DEFF] to-[#FEF0C3] border-4 border-white shadow-xl mx-auto mb-4 flex items-center justify-center text-4xl animate-bounce">
              {celebrationBadge.icon}
            </div>

            <div className="pill-chip chip-lavender text-[11px] font-black py-1 px-3 mb-2 mx-auto inline-block">
              🎉 NEW BADGE UNLOCKED!
            </div>

            <h2 className="text-xl font-black text-[#18181B] mb-1">
              {celebrationBadge.title}
            </h2>
            <p className="text-xs text-[#71717A] mb-4">
              {celebrationBadge.description}
            </p>

            {/* Lore Card */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE5DB] text-xs text-[#2D1B4E] font-medium leading-relaxed mb-5 italic">
              "{celebrationBadge.unlockedLore}"
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#FEF0C3] border border-[#FDE089] text-left">
                <div className="text-[10px] font-bold text-[#713F12] opacity-80 uppercase">XP Awarded</div>
                <div className="text-lg font-black text-[#713F12]">+{celebrationBadge.xpReward} XP</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#D2F1E6] border border-[#B2E5D3] text-left">
                <div className="text-[10px] font-bold text-[#0D3E30] opacity-80 uppercase">AI Credit Bonus</div>
                <div className="text-lg font-black text-[#0D3E30]">+{celebrationBadge.creditBonus} Credits</div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <Link
                href="/student/badges"
                onClick={dismissCelebration}
                className="btn-pill-dark text-xs py-2.5 px-6 cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <span>View All Badges</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
