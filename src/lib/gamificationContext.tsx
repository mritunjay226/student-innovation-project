"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ALL_BADGES, BadgeDefinition, calculateStudentLevel } from "@/lib/badgesData";
import { soundEffects } from "@/lib/soundEffects";

interface GamificationState {
  xp: number;
  credits: number;
  maxCredits: number;
  streak: number;
  unlockedBadgeIds: string[];
  badgeProgress: Record<string, number>;
  addXp: (amount: number, reason?: string) => void;
  spendCredits: (amount: number) => boolean;
  refillCredits: () => void;
  updateBadgeProgress: (badgeId: string, deltaOrSet: number, isSet?: boolean) => void;
  celebrationBadge: BadgeDefinition | null;
  dismissCelebration: () => void;
}

const GamificationContext = createContext<GamificationState | null>(null);

const STORAGE_KEY = "learnai_gamification_state_v1";

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [xp, setXp] = useState<number>(680); // Default active student demo XP
  const [credits, setCredits] = useState<number>(85); // Daily credits
  const [maxCredits, setMaxCredits] = useState<number>(100);
  const [streak, setStreak] = useState<number>(5);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>([
    "socratic_spark",
    "first_deck_created",
    "radar_explorer",
    "flame_starter",
    "polymath_scholar",
  ]);
  const [badgeProgress, setBadgeProgress] = useState<Record<string, number>>({
    socratic_spark: 1,
    analogy_architect: 2,
    misconception_slayer: 2,
    feynman_grandmaster: 1,
    first_deck_created: 1,
    mcq_marksman: 7,
    spaced_repetition_disciple: 6,
    speed_recalled_100: 42,
    radar_explorer: 1,
    prerequisite_pioneer: 0,
    zero_retention_risk: 0,
    flame_starter: 3,
    unstoppable_momentum: 5,
    iron_discipline: 5,
    polymath_scholar: 3,
    exam_target_mastered: 0,
    century_xp_club: 680,
    apex_learner: 5,
  });

  const [celebrationBadge, setCelebrationBadge] = useState<BadgeDefinition | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.xp === "number") setXp(parsed.xp);
        if (typeof parsed.credits === "number") setCredits(parsed.credits);
        if (typeof parsed.streak === "number") setStreak(parsed.streak);
        if (Array.isArray(parsed.unlockedBadgeIds)) setUnlockedBadgeIds(parsed.unlockedBadgeIds);
        if (parsed.badgeProgress) setBadgeProgress(parsed.badgeProgress);
      }
    } catch (e) {
      console.warn("Could not load gamification state from localStorage", e);
    }
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          xp,
          credits,
          streak,
          unlockedBadgeIds,
          badgeProgress,
        })
      );
    } catch (e) {
      console.warn("Could not persist gamification state", e);
    }
  }, [xp, credits, streak, unlockedBadgeIds, badgeProgress]);

  const addXp = (amount: number, reason?: string) => {
    setXp((prev) => {
      const newXp = prev + amount;
      // Check XP milestone badges
      if (newXp >= 1000 && !unlockedBadgeIds.includes("century_xp_club")) {
        unlockBadgeDirect("century_xp_club");
      }
      return newXp;
    });
  };

  const spendCredits = (amount: number): boolean => {
    if (credits < amount) return false;
    setCredits((prev) => Math.max(0, prev - amount));
    return true;
  };

  const refillCredits = () => {
    setCredits(maxCredits);
  };

  const unlockBadgeDirect = (badgeId: string) => {
    const badgeDef = ALL_BADGES.find((b) => b.id === badgeId);
    if (!badgeDef) return;

    setUnlockedBadgeIds((prev) => {
      if (prev.includes(badgeId)) return prev;
      soundEffects.playCelebration();
      setCelebrationBadge(badgeDef);
      // Award badge XP and Credit bonuses
      setXp((x) => x + badgeDef.xpReward);
      setCredits((c) => Math.min(maxCredits + 20, c + badgeDef.creditBonus));
      return [...prev, badgeId];
    });
  };

  const updateBadgeProgress = (badgeId: string, deltaOrSet: number, isSet: boolean = false) => {
    const badgeDef = ALL_BADGES.find((b) => b.id === badgeId);
    if (!badgeDef) return;

    setBadgeProgress((prev) => {
      const current = prev[badgeId] || 0;
      const updated = isSet ? deltaOrSet : current + deltaOrSet;
      const nextProgress = { ...prev, [badgeId]: updated };

      if (updated >= badgeDef.maxProgress && !unlockedBadgeIds.includes(badgeId)) {
        unlockBadgeDirect(badgeId);
      }

      return nextProgress;
    });
  };

  const dismissCelebration = () => {
    setCelebrationBadge(null);
  };

  return (
    <GamificationContext.Provider
      value={{
        xp,
        credits,
        maxCredits,
        streak,
        unlockedBadgeIds,
        badgeProgress,
        addXp,
        spendCredits,
        refillCredits,
        updateBadgeProgress,
        celebrationBadge,
        dismissCelebration,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    // Fallback default if rendered outside provider
    const defaultLvl = calculateStudentLevel(680);
    return {
      xp: 680,
      credits: 85,
      maxCredits: 100,
      streak: 5,
      unlockedBadgeIds: ["socratic_spark", "first_deck_created", "radar_explorer", "flame_starter", "polymath_scholar"],
      badgeProgress: {},
      addXp: () => {},
      spendCredits: () => true,
      refillCredits: () => {},
      updateBadgeProgress: () => {},
      celebrationBadge: null,
      dismissCelebration: () => {},
    };
  }
  return context;
}
