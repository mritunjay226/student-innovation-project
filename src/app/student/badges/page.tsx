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
  TrendingUp,
  Filter,
  Layers,
  MessageSquare,
  BookOpen,
  X,
  Share2,
} from "lucide-react";

export default function BadgesPage() {
  const {
    xp,
    credits,
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

  const getTierColor = (tier: BadgeTier) => {
    switch (tier) {
      case "diamond":
        return "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400";
      case "gold":
        return "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 border-amber-300";
      case "silver":
        return "bg-gradient-to-r from-slate-200 to-slate-400 text-slate-800 border-slate-300";
      case "bronze":
      default:
        return "bg-gradient-to-r from-amber-700 to-amber-900 text-amber-100 border-amber-600";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* ════════════════════════════════════════════════════════════════════
          1. HERO SHOWCASE & GAMIFICATION DASHBOARD
      ════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-[36px] p-6 sm:p-8 bg-gradient-to-br from-[#FAF8F5] via-white to-[#E8DEFF]/40 border-2 border-[#EBE5DB] shadow-sm relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="pill-chip chip-lavender text-xs font-black py-1 px-3">
                🏆 Student Achievement Hub
              </span>
              <span className="pill-chip chip-butter text-xs font-extrabold py-1 px-3">
                {levelInfo.rankEmoji} Level {levelInfo.level} Scholar
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#18181B] tracking-tight">
              Mastery Badges & Rewards
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] max-w-xl font-medium leading-relaxed">
              Earn high-yield pedagogical achievements across Feynman Teach-Backs, AI Flashcard ingests, Spaced Repetition mastery, and Prerequisite Knowledge Radars.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="p-3.5 rounded-2xl bg-white border border-[#EBE5DB] shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-[#7C3AED]">{unlockedCount} / {totalBadges}</div>
              <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Badges Won</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FEF0C3] border border-[#FDE089] text-center">
              <div className="text-xl sm:text-2xl font-black text-[#713F12]">+{totalBadgeXpEarned}</div>
              <div className="text-[10px] font-bold text-[#713F12] uppercase tracking-wider">Badge XP</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#D2F1E6] border border-[#B2E5D3] text-center">
              <div className="text-xl sm:text-2xl font-black text-[#0D3E30]">{completionPercentage}%</div>
              <div className="text-[10px] font-bold text-[#0D3E30] uppercase tracking-wider">Completion</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FCD5CE] border border-[#F9BFB4] text-center">
              <div className="text-xl sm:text-2xl font-black text-[#702114]">{streak} 🔥</div>
              <div className="text-[10px] font-bold text-[#702114] uppercase tracking-wider">Active Streak</div>
            </div>
          </div>
        </div>

        {/* Next Nearest Badge Spotlight */}
        {nextBadgeToUnlock && (
          <div className="mt-6 pt-5 border-t border-[#F4F0EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-[#EBE5DB]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E8DEFF] border border-[#D5C4FA] flex items-center justify-center text-2xl shrink-0 shadow-xs">
                {nextBadgeToUnlock.icon}
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C3AED]">
                  Target Next Achievement
                </div>
                <div className="text-sm font-black text-[#18181B]">
                  {nextBadgeToUnlock.title}
                </div>
                <p className="text-xs text-[#71717A] font-medium">
                  {nextBadgeToUnlock.requirementDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <div className="text-[10px] font-extrabold text-[#71717A]">
                  Progress: {badgeProgress[nextBadgeToUnlock.id] || 0} / {nextBadgeToUnlock.maxProgress}
                </div>
                <div className="w-28 bg-[#EBE5DB] h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-[#7C3AED] h-full rounded-full transition-all"
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
                  className="btn-pill-dark text-xs py-2 px-4 cursor-pointer shrink-0"
                >
                  Study Flashcards
                </Link>
              ) : nextBadgeToUnlock.category === "teach_back" ? (
                <Link
                  href="/student/teach-back"
                  className="btn-pill-dark text-xs py-2 px-4 cursor-pointer shrink-0"
                >
                  Teach Toby
                </Link>
              ) : (
                <Link
                  href="/student/progress"
                  className="btn-pill-dark text-xs py-2 px-4 cursor-pointer shrink-0"
                >
                  View Radar
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          2. CATEGORY & TIER FILTERS
      ════════════════════════════════════════════════════════════════════ */}
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
              className={`pill-chip py-2 px-4 text-xs font-black cursor-pointer transition-all shrink-0 ${
                selectedCategory === tab.id
                  ? "bg-[#18181B] text-white shadow-sm"
                  : "bg-white hover:bg-[#FAF8F5] border border-[#EBE5DB] text-[#52525B]"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tier Sub-Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#71717A] flex items-center gap-1">
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
              className={`text-[11px] font-extrabold py-1 px-2.5 rounded-xl cursor-pointer transition-all ${
                selectedTier === tier.id
                  ? "bg-[#E8DEFF] text-[#2D1B4E] border border-[#7C3AED]"
                  : "text-[#71717A] hover:text-[#18181B] bg-[#FAF8F5]"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          3. BADGES 3D INTERACTIVE GRID
      ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);
          const currentProg = badgeProgress[badge.id] || 0;
          const progPercent = Math.min(100, Math.round((currentProg / badge.maxProgress) * 100));

          return (
            <div
              key={badge.id}
              onClick={() => handleBadgeClick(badge)}
              className={`rounded-[28px] p-5 border-2 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                isUnlocked
                  ? "bg-white hover:border-[#7C3AED] shadow-sm hover:shadow-md hover:-translate-y-1"
                  : "bg-white/60 border-[#EBE5DB] opacity-85 hover:opacity-100 hover:border-[#CBC2B4]"
              } ${badge.accentColor}`}
            >
              <div>
                {/* Header Strip: Medallion + Tier Badge */}
                <div className="flex items-start justify-between mb-3.5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110 border ${
                      isUnlocked
                        ? "bg-gradient-to-tr from-white to-[#FAF8F5] border-[#EBE5DB]"
                        : "bg-slate-100 border-slate-200 grayscale opacity-60"
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full border shadow-2xs ${getTierColor(
                        badge.tier
                      )}`}
                    >
                      {badge.tier}
                    </span>
                    {isUnlocked ? (
                      <span className="text-[10px] font-extrabold text-[#059669] flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#71717A] flex items-center gap-0.5 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge Title & Description */}
                <h3 className="text-base font-black text-[#18181B] mb-1 group-hover:text-[#7C3AED] transition-colors">
                  {badge.title}
                </h3>
                <p className="text-xs text-[#52525B] font-medium leading-relaxed mb-4">
                  {badge.description}
                </p>
              </div>

              {/* Bottom Progress & Reward Bar */}
              <div className="pt-3.5 border-t border-[#F4F0EB] space-y-2">
                {!isUnlocked && (
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#71717A] mb-1">
                      <span>{badge.requirementDescription}</span>
                      <span>{currentProg} / {badge.maxProgress}</span>
                    </div>
                    <div className="w-full bg-[#EBE5DB] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#7C3AED] h-full rounded-full transition-all"
                        style={{ width: `${progPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[#713F12] flex items-center gap-1 bg-[#FEF0C3] px-2 py-0.5 rounded-lg border border-[#FDE089]">
                    <Sparkles className="w-3 h-3 text-amber-600" /> +{badge.xpReward} XP
                  </span>
                  <span className="text-[#0D3E30] flex items-center gap-1 bg-[#D2F1E6] px-2 py-0.5 rounded-lg border border-[#B2E5D3]">
                    <Zap className="w-3 h-3 text-emerald-600" /> +{badge.creditBonus} Credits
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          4. INTERACTIVE BADGE DETAIL & LORE MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {activeModalBadge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[36px] p-6 sm:p-8 text-center shadow-2xl border-2 border-[#D5C4FA] relative animate-scale-up">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveModalBadge(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF8F5] hover:bg-[#EBE5DB] flex items-center justify-center text-[#71717A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Medallion */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#FAF8F5] to-[#E8DEFF] border-2 border-[#D5C4FA] shadow-lg mx-auto mb-4 flex items-center justify-center text-5xl">
              {activeModalBadge.icon}
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`text-[10px] font-black uppercase tracking-wider py-0.5 px-3 rounded-full border ${getTierColor(activeModalBadge.tier)}`}>
                {activeModalBadge.tier} Tier
              </span>
              {unlockedBadgeIds.includes(activeModalBadge.id) ? (
                <span className="pill-chip chip-mint text-[10px] font-black py-0.5 px-2.5">
                  ✓ Unlocked
                </span>
              ) : (
                <span className="pill-chip chip-peach text-[10px] font-black py-0.5 px-2.5">
                  🔒 In Progress
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-[#18181B] mb-1">
              {activeModalBadge.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#71717A] mb-4">
              {activeModalBadge.description}
            </p>

            {/* Lore Card */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE5DB] text-xs text-[#2D1B4E] font-medium leading-relaxed mb-6 italic text-left">
              "{activeModalBadge.unlockedLore}"
            </div>

            {/* Reward Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              <div className="p-3.5 rounded-2xl bg-[#FEF0C3] border border-[#FDE089]">
                <div className="text-[10px] font-bold text-[#713F12] opacity-80 uppercase">Experience Reward</div>
                <div className="text-xl font-black text-[#713F12]">+{activeModalBadge.xpReward} XP</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#D2F1E6] border border-[#B2E5D3]">
                <div className="text-[10px] font-bold text-[#0D3E30] opacity-80 uppercase">AI Token Allowance</div>
                <div className="text-xl font-black text-[#0D3E30]">+{activeModalBadge.creditBonus} Credits</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveModalBadge(null);
                }}
                className="btn-pill-white text-xs py-2.5 px-5 cursor-pointer"
              >
                Close
              </button>

              {activeModalBadge.category === "flashcards" ? (
                <Link
                  href="/student/flashcards"
                  onClick={() => setActiveModalBadge(null)}
                  className="btn-pill-dark text-xs py-2.5 px-6 cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Go to Flashcards</span>
                </Link>
              ) : activeModalBadge.category === "teach_back" ? (
                <Link
                  href="/student/teach-back"
                  onClick={() => setActiveModalBadge(null)}
                  className="btn-pill-dark text-xs py-2.5 px-6 cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Teach Socratic Pod</span>
                </Link>
              ) : (
                <Link
                  href="/student/progress"
                  onClick={() => setActiveModalBadge(null)}
                  className="btn-pill-dark text-xs py-2.5 px-6 cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>View Knowledge Radar</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
