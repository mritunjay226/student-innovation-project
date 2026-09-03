"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGamification } from "@/lib/gamificationContext";
import { ALL_BADGES, BadgeCategory, BadgeDefinition, BadgeTier, calculateStudentLevel } from "@/lib/badgesData";
import { soundEffects } from "@/lib/soundEffects";
import {
  Award,
  Sparkles,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  ChevronRight,
  Filter,
  X,
  Share2,
} from "lucide-react";

export default function BadgesPage() {
  const {
    xp,
    streak,
    unlockedBadgeIds,
    badgeProgress,
  } = useGamification();

  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory>("all");
  const [selectedTier, setSelectedTier] = useState<BadgeTier | "all">("all");
  const [activeModalBadge, setActiveModalBadge] = useState<BadgeDefinition | null>(null);

  const levelInfo = calculateStudentLevel(xp);
  const totalBadges = ALL_BADGES.length;
  const unlockedCount = unlockedBadgeIds.length;
  const completionPercentage = Math.round((unlockedCount / totalBadges) * 100);

  // Total XP earned from unlocked badges
  const totalBadgeXpEarned = ALL_BADGES.filter((b) =>
    unlockedBadgeIds.includes(b.id)
  ).reduce((sum, b) => sum + b.xpReward, 0);

  // Find next closest locked badge to unlock
  const nextBadgeToUnlock = ALL_BADGES.find((b) => {
    if (unlockedBadgeIds.includes(b.id)) return false;
    const prog = badgeProgress[b.id] || 0;
    return prog > 0;
  }) || ALL_BADGES.find((b) => !unlockedBadgeIds.includes(b.id));

  // Filter badges
  const filteredBadges = ALL_BADGES.filter((badge) => {
    const matchesCat = selectedCategory === "all" || badge.category === selectedCategory;
    const matchesTier = selectedTier === "all" || badge.tier === selectedTier;
    return matchesCat && matchesTier;
  });

  const handleBadgeClick = (badge: BadgeDefinition) => {
    soundEffects.playClick();
    setActiveModalBadge(badge);
  };

  const getTierBadge = (tier: BadgeTier) => {
    switch (tier) {
      case "diamond":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "gold":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "silver":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "bronze":
      default:
        return "bg-orange-50 text-orange-800 border-orange-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-[#1C1E23] font-sans antialiased">
      
      {/* ── 1. HERO SHOWCASE & GAMIFICATION DASHBOARD ── */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E6EAF2] shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FE] text-[#FF642F] text-xs font-bold">
                🏆 Student Achievement Hub
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E2E6F0] text-xs font-bold text-[#181A20]">
                {levelInfo.rankEmoji} Level {levelInfo.level} Scholar
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#181A20] tracking-tight m-0">
              Mastery Badges & Rewards
            </h1>
            <p className="text-xs sm:text-sm text-[#7E8494] max-w-xl font-medium leading-relaxed m-0">
              Earn high-yield achievements across Feynman Teach-Backs, AI Flashcard studies, and Socratic Knowledge Radars.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E6EAF2] text-center">
              <div className="text-xl sm:text-2xl font-black text-[#FF642F]">{unlockedCount} / {totalBadges}</div>
              <div className="text-[10px] font-bold text-[#7E8494] uppercase tracking-wider mt-0.5">Badges Won</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFE4D6] to-[#FFCBBF] border border-[#FFD5CC] text-center">
              <div className="text-xl sm:text-2xl font-black text-[#2D1208]">+{totalBadgeXpEarned}</div>
              <div className="text-[10px] font-bold text-[#5A2C18] uppercase tracking-wider mt-0.5">Badge XP</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#C4F6EE] to-[#A8E2F9] border border-[#BDE8F2] text-center">
              <div className="text-xl sm:text-2xl font-black text-[#0B2A24]">{completionPercentage}%</div>
              <div className="text-[10px] font-bold text-[#18483F] uppercase tracking-wider mt-0.5">Completion</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E2E6F0] text-center shadow-2xs">
              <div className="text-xl sm:text-2xl font-black text-[#FF6B6B]">{streak} 🔥</div>
              <div className="text-[10px] font-bold text-[#7E8494] uppercase tracking-wider mt-0.5">Active Streak</div>
            </div>
          </div>
        </div>

        {/* Next Nearest Badge Spotlight */}
        {nextBadgeToUnlock && (
          <div className="mt-6 pt-5 border-t border-[#F0F3F8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F8FAFD] p-4 rounded-2xl border border-[#E6EAF2]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E6F0] flex items-center justify-center text-2xl shrink-0 shadow-xs">
                {nextBadgeToUnlock.icon}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF642F]">
                  Target Next Achievement
                </div>
                <div className="text-sm font-black text-[#181A20]">
                  {nextBadgeToUnlock.title}
                </div>
                <p className="text-xs text-[#7E8494] font-medium m-0">
                  {nextBadgeToUnlock.requirementDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <div className="text-[10px] font-bold text-[#7E8494]">
                  Progress: {badgeProgress[nextBadgeToUnlock.id] || 0} / {nextBadgeToUnlock.maxProgress}
                </div>
                <div className="w-28 bg-[#E5E9F2] h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-[#FF642F] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (((badgeProgress[nextBadgeToUnlock.id] || 0) /
                          nextBadgeToUnlock.maxProgress) *
                          100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {nextBadgeToUnlock.category === "flashcards" ? (
                <Link
                  href="/student/flashcards"
                  className="bg-[#FF642F] hover:bg-[#2554D4] text-white text-xs font-bold py-2 px-4 rounded-full shadow-xs shadow-[#FF642F]/25 shrink-0"
                >
                  Study Flashcards
                </Link>
              ) : nextBadgeToUnlock.category === "teach_back" ? (
                <Link
                  href="/student/teach-back"
                  className="bg-[#FF642F] hover:bg-[#2554D4] text-white text-xs font-bold py-2 px-4 rounded-full shadow-xs shadow-[#FF642F]/25 shrink-0"
                >
                  Teach Toby
                </Link>
              ) : (
                <Link
                  href="/student/progress"
                  className="bg-[#FF642F] hover:bg-[#2554D4] text-white text-xs font-bold py-2 px-4 rounded-full shadow-xs shadow-[#FF642F]/25 shrink-0"
                >
                  View Radar
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. CATEGORY & TIER FILTERS ── */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "🌟 All Badges", count: totalBadges },
            { id: "teach_back", label: "🧠 Feynman Teach-Back", count: 4 },
            { id: "flashcards", label: "⚡ Flashcards & OCR", count: 4 },
            { id: "diagnostic", label: "🎯 Diagnostics & Graph", count: 3 },
            { id: "streaks", label: "🔥 Streaks & Momentum", count: 3 },
            { id: "mastery", label: "🏆 Honors & Mastery", count: 4 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playClick();
                setSelectedCategory(tab.id as BadgeCategory);
              }}
              className={`py-2 px-4 rounded-full text-xs font-bold cursor-pointer transition-all shrink-0 ${
                selectedCategory === tab.id
                  ? "bg-[#FF642F] text-white shadow-sm shadow-[#FF642F]/25"
                  : "bg-white hover:bg-[#F4F6FB] border border-[#E2E6F0] text-[#555C6E]"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tier Sub-Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#7E8494] flex items-center gap-1">
            <Filter className="w-3 h-3" /> Tier:
          </span>
          {[
            { id: "all", label: "All Tiers" },
            { id: "bronze", label: "🥉 Bronze" },
            { id: "silver", label: "🥈 Silver" },
            { id: "gold", label: "🥇 Gold" },
            { id: "diamond", label: "💎 Diamond" },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => {
                soundEffects.playClick();
                setSelectedTier(tier.id as any);
              }}
              className={`text-[11px] font-bold py-1 px-3 rounded-full cursor-pointer transition-all ${
                selectedTier === tier.id
                  ? "bg-[#181A20] text-white"
                  : "text-[#7E8494] hover:text-[#181A20] bg-white border border-[#E2E6F0]"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. BADGES GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);
          const currentProg = badgeProgress[badge.id] || 0;
          const progPercent = Math.min(100, Math.round((currentProg / badge.maxProgress) * 100));

          return (
            <div
              key={badge.id}
              onClick={() => handleBadgeClick(badge)}
              className={`rounded-[28px] p-5.5 border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden bg-white ${
                isUnlocked
                  ? "border-[#E2E6F0] hover:border-[#FF642F] shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  : "border-[#E6EAF2] opacity-80 hover:opacity-100"
              }`}
            >
              <div>
                {/* Header Strip: Medallion + Tier Badge */}
                <div className="flex items-start justify-between mb-3.5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-2xs transition-transform group-hover:scale-105 border ${
                      isUnlocked
                        ? "bg-[#F8FAFD] border-[#E2E6F0]"
                        : "bg-slate-100 border-slate-200 grayscale opacity-50"
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full border ${getTierBadge(
                        badge.tier
                      )}`}
                    >
                      {badge.tier}
                    </span>
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 py-0.5 px-2 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 py-0.5 px-2 rounded-full flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge Title & Description */}
                <h3 className="font-extrabold text-base text-[#181A20] leading-snug mb-1 group-hover:text-[#FF642F] transition-colors">
                  {badge.title}
                </h3>
                <p className="text-xs text-[#7E8494] font-medium line-clamp-2 leading-relaxed mb-3">
                  {badge.description}
                </p>
              </div>

              {/* Progress Bar & Reward Footer */}
              <div className="pt-3 border-t border-[#F2F4F8] mt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#7E8494] mb-1.5">
                  <span>{badge.requirementDescription}</span>
                  <span>{currentProg} / {badge.maxProgress}</span>
                </div>
                <div className="w-full bg-[#E5E9F2] h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked ? "bg-emerald-500" : "bg-[#FF642F]"
                    }`}
                    style={{ width: `${isUnlocked ? 100 : progPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-[#181A20]">
                  <span className="text-amber-600 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-amber-500" /> +{badge.xpReward} XP
                  </span>
                  <span className="text-xs font-bold text-[#FF642F] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4. BADGE DETAIL MODAL ── */}
      {activeModalBadge && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-7 max-w-md w-full shadow-2xl border border-[#E2E6F0] relative animate-in zoom-in-95 text-center">
            <button
              onClick={() => setActiveModalBadge(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-20 h-20 rounded-2xl bg-[#F8FAFD] border-2 border-[#E2E6F0] flex items-center justify-center text-4xl shadow-sm mx-auto mb-4">
              {activeModalBadge.icon}
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full border ${getTierBadge(activeModalBadge.tier)}`}>
                {activeModalBadge.tier} Tier
              </span>
              {unlockedBadgeIds.includes(activeModalBadge.id) && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 py-0.5 px-2 rounded-full">
                  ✓ Unlocked
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-[#181A20] mb-1">
              {activeModalBadge.title}
            </h3>
            <p className="text-xs text-[#7E8494] font-medium mb-4">
              {activeModalBadge.description}
            </p>

            <div className="bg-[#F8FAFD] rounded-2xl p-4 border border-[#E6EAF2] text-xs text-[#2A3142] italic mb-5">
              "{activeModalBadge.unlockedLore}"
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFE4D6] to-[#FFC5B4] border border-[#FFD2C4] text-left">
                <div className="text-[10px] font-bold text-[#5A2C18] uppercase">XP Reward</div>
                <div className="text-lg font-black text-[#2A1208]">+{activeModalBadge.xpReward} XP</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#C4F6EE] to-[#A4E8DF] border border-[#BCEEE6] text-left">
                <div className="text-[10px] font-bold text-[#103D36] uppercase">Credit Bonus</div>
                <div className="text-lg font-black text-[#082420]">+{activeModalBadge.creditBonus} Credits</div>
              </div>
            </div>

            <button
              onClick={() => setActiveModalBadge(null)}
              className="w-full bg-[#FF642F] hover:bg-[#2554D4] text-white text-xs font-bold py-3 rounded-full shadow-sm shadow-[#FF642F]/30 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
