"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useGamification } from "@/lib/gamificationContext";
import { calculateStudentLevel, ALL_BADGES } from "@/lib/badgesData";
import {
  Zap,
  Flame,
  Award,
  X,
  ChevronRight,
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
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#EEF1F7]/80 border-b border-[#E2E6F0] px-4 sm:px-8 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Breadcrumbs / Page Identity */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-[#181A20] truncate hidden md:inline">
              Welcome back, <span className="text-[#2F65F6]">{userName || "Kristin"}</span> 👋
            </span>
            <span className="text-[10px] font-bold text-[#7E8494] bg-white shadow-2xs border border-[#E2E6F0] py-0.5 px-2 rounded-full hidden lg:inline">
              Class 12 STEM
            </span>
          </div>

          {/* Right: Gamification Badges & Status Pills */}
          <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
            
            {/* 1. ⚡ AI CREDITS PILL */}
            <div className="relative">
              <button
                onClick={() => setShowCreditsTooltip((p) => !p)}
                onMouseEnter={() => setShowCreditsTooltip(true)}
                onMouseLeave={() => setShowCreditsTooltip(false)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full border text-xs font-bold cursor-pointer transition-all shadow-2xs ${
                  credits > 30
                    ? "bg-white border-[#E2E6F0] text-[#181A20] hover:border-amber-400"
                    : "bg-[#FFF0E6] border-[#FFC599] text-[#FF7A00] animate-pulse"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{credits}</span>
                <span className="text-[10px] text-[#8C93A4] font-medium">/{maxCredits}</span>
              </button>

              {/* Credits Popover Tooltip */}
              {showCreditsTooltip && (
                <div className="absolute right-0 top-full mt-2 w-64 p-4 rounded-[20px] bg-white border border-[#E2E6F0] shadow-xl z-50 animate-in fade-in zoom-in-95 text-left text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#181A20] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> AI Credits
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Refills Daily</span>
                  </div>
                  <p className="text-[11px] text-[#7E8494] leading-relaxed mb-3">
                    Used for Gemini Multimodal OCR PDF ingestion & Socratic teach-back evaluations.
                  </p>
                  <div className="w-full bg-[#E5E9F2] h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(credits / maxCredits) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#7E8494] font-bold">
                    <span>{credits} remaining today</span>
                    <button
                      onClick={refillCredits}
                      className="text-[#2F65F6] hover:underline cursor-pointer flex items-center gap-1"
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
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white border border-[#E2E6F0] text-[#181A20] text-xs font-bold cursor-pointer transition-all hover:border-[#2F65F6] shadow-2xs"
              >
                <span>{levelInfo.rankEmoji}</span>
                <span>Lvl {levelInfo.level}</span>
                <span className="text-[10px] text-[#8C93A4] font-medium hidden sm:inline">• {levelInfo.rankTitle}</span>
              </button>

              {/* XP Popover Tooltip */}
              {showXpTooltip && (
                <div className="absolute right-0 top-full mt-2 w-64 p-4 rounded-[20px] bg-white border border-[#E2E6F0] shadow-xl z-50 animate-in fade-in zoom-in-95 text-left text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#181A20] flex items-center gap-1.5">
                      <span>{levelInfo.rankEmoji}</span> Level {levelInfo.level} Rank
                    </span>
                    <span className="bg-blue-50 text-[#2F65F6] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {levelInfo.rankTitle}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#7E8494] mb-2 font-medium">
                    Total Lifetime XP: <strong className="text-[#181A20]">{xp} XP</strong>
                  </div>
                  <div className="w-full bg-[#E5E9F2] h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-[#2F65F6] h-full rounded-full transition-all duration-500"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#7E8494] font-bold">
                    <span>{levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP</span>
                    <span className="text-[#2F65F6]">{levelInfo.progressPercent}% to Lvl {levelInfo.level + 1}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. 🔥 DAILY STREAK PILL */}
            <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white border border-[#E2E6F0] text-[#181A20] text-xs font-bold shadow-2xs">
              <Flame className="w-3.5 h-3.5 fill-[#FF6B6B] text-[#FF6B6B]" />
              <span>{streak}</span>
              <span className="text-[10px] text-[#8C93A4] font-medium hidden sm:inline">Streak</span>
            </div>

            {/* 4. 🏅 BADGES SHORTCUT PILL */}
            <Link
              href="/student/badges"
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full border text-xs font-bold cursor-pointer transition-all shadow-2xs ${
                pathname === "/student/badges"
                  ? "bg-[#2F65F6] text-white border-[#2F65F6] shadow-sm shadow-[#2F65F6]/25"
                  : "bg-white hover:border-[#2F65F6] border-[#E2E6F0] text-[#181A20]"
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${pathname === "/student/badges" ? "text-white" : "text-[#2F65F6]"}`} />
              <span className="hidden sm:inline">Badges</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                pathname === "/student/badges" ? "bg-white/20 text-white" : "bg-[#EBF3FE] text-[#2F65F6]"
              }`}>
                {unlockedCount}/{totalBadges}
              </span>
            </Link>

          </div>
        </div>
      </header>

      {/* ── REAL-TIME BADGE UNLOCKED CELEBRATION MODAL ── */}
      {celebrationBadge && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[32px] p-7 text-center shadow-2xl border border-[#E2E6F0] relative animate-in zoom-in-95">
            
            {/* Close Button */}
            <button
              onClick={dismissCelebration}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Trophy Ring */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FFE4D6] to-[#C4F6EE] border-4 border-white shadow-lg mx-auto mb-4 flex items-center justify-center text-4xl animate-bounce">
              {celebrationBadge.icon}
            </div>

            <div className="bg-blue-50 text-[#2F65F6] text-[11px] font-bold py-1 px-3 mb-2 mx-auto inline-block rounded-full">
              🎉 NEW BADGE UNLOCKED!
            </div>

            <h2 className="text-xl font-black text-[#181A20] mb-1">
              {celebrationBadge.title}
            </h2>
            <p className="text-xs text-[#7E8494] mb-4">
              {celebrationBadge.description}
            </p>

            {/* Lore Card */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E2E6F0] text-xs text-[#2A3142] font-medium leading-relaxed mb-5 italic">
              "{celebrationBadge.unlockedLore}"
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFE4D6] to-[#FFC5B4] border border-[#FFD2C4] text-left">
                <div className="text-[10px] font-bold text-[#5A2C18] uppercase">XP Awarded</div>
                <div className="text-lg font-black text-[#2A1208]">+{celebrationBadge.xpReward} XP</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#C4F6EE] to-[#A4E8DF] border border-[#BCEEE6] text-left">
                <div className="text-[10px] font-bold text-[#103D36] uppercase">AI Credit Bonus</div>
                <div className="text-lg font-black text-[#082420]">+{celebrationBadge.creditBonus} Credits</div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <Link
                href="/student/badges"
                onClick={dismissCelebration}
                className="bg-[#2F65F6] hover:bg-[#2554D4] text-white text-xs font-bold py-3 px-6 rounded-full shadow-sm shadow-[#2F65F6]/30 flex items-center gap-1.5"
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
