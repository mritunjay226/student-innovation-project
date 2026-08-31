/**
 * Comprehensive Student Badges & Gamification Definitions
 * Includes badge tiers, requirements, XP rewards, and pedagogical categories.
 */

export type BadgeCategory = "all" | "teach_back" | "flashcards" | "diagnostic" | "streaks" | "mastery";
export type BadgeTier = "bronze" | "silver" | "gold" | "diamond";

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  category: "teach_back" | "flashcards" | "diagnostic" | "streaks" | "mastery";
  tier: BadgeTier;
  icon: string; // Emoji or SVG token
  accentColor: string; // Tailwind border/bg accent
  xpReward: number;
  creditBonus: number;
  maxProgress: number;
  requirementDescription: string;
  unlockedLore: string;
}

export const ALL_BADGES: BadgeDefinition[] = [
  // ── TEACH-BACK & SOCRATIC TUTORING (4) ──
  {
    id: "socratic_spark",
    title: "Socratic Spark",
    description: "Score 80%+ on any Feynman Teach-Back session with Toby",
    category: "teach_back",
    tier: "bronze",
    icon: "💡",
    accentColor: "border-amber-300 bg-amber-50 text-amber-900",
    xpReward: 100,
    creditBonus: 10,
    maxProgress: 1,
    requirementDescription: "Score ≥ 80% on a teach-back dialogue",
    unlockedLore: "You guided Toby through his confusion using intuitive physical models.",
  },
  {
    id: "analogy_architect",
    title: "Analogy Architect",
    description: "Use 3 distinct real-world analogies across teach-back sessions",
    category: "teach_back",
    tier: "silver",
    icon: "🧩",
    accentColor: "border-purple-300 bg-purple-50 text-purple-900",
    xpReward: 200,
    creditBonus: 15,
    maxProgress: 3,
    requirementDescription: "Explain 3 concepts using real-world intuition",
    unlockedLore: "As Feynman said, if you can't explain it with simple analogies, you don't own the concept.",
  },
  {
    id: "misconception_slayer",
    title: "Misconception Slayer",
    description: "Identify and resolve 3 cognitive micro-misconceptions",
    category: "teach_back",
    tier: "gold",
    icon: "🛡️",
    accentColor: "border-emerald-300 bg-emerald-50 text-emerald-900",
    xpReward: 350,
    creditBonus: 25,
    maxProgress: 3,
    requirementDescription: "Resolve 3 flagged misconception bugs",
    unlockedLore: "You pinpointed the root cause of an error rather than memorizing buzzwords.",
  },
  {
    id: "feynman_grandmaster",
    title: "Feynman Grandmaster",
    description: "Achieve 95%+ Feynman Teach-Back score across Mathematics, Physics & Chemistry",
    category: "teach_back",
    tier: "diamond",
    icon: "👑",
    accentColor: "border-indigo-300 bg-indigo-50 text-indigo-950",
    xpReward: 600,
    creditBonus: 50,
    maxProgress: 3,
    requirementDescription: "Attain 95%+ score across 3 distinct STEM disciplines",
    unlockedLore: "A true master tutor. The classroom pod now considers you an honorary peer professor!",
  },

  // ── FLASHCARDS & RECALL (4) ──
  {
    id: "first_deck_created",
    title: "Curriculum Ingestor",
    description: "Generate an AI study deck from an uploaded PDF or textbook notes",
    category: "flashcards",
    tier: "bronze",
    icon: "📄",
    accentColor: "border-blue-300 bg-blue-50 text-blue-900",
    xpReward: 100,
    creditBonus: 10,
    maxProgress: 1,
    requirementDescription: "Ingest 1 PDF document into flashcards",
    unlockedLore: "You turned raw academic syllabus slides into bite-sized high-yield cards.",
  },
  {
    id: "mcq_marksman",
    title: "MCQ Marksman",
    description: "Answer 10 Multiple Choice Flashcards correctly on the first flip",
    category: "flashcards",
    tier: "silver",
    icon: "🎯",
    accentColor: "border-teal-300 bg-teal-50 text-teal-900",
    xpReward: 200,
    creditBonus: 15,
    maxProgress: 10,
    requirementDescription: "Get 10 MCQ flashcard options right",
    unlockedLore: "You dissected tricky exam distractors with laser precision.",
  },
  {
    id: "spaced_repetition_disciple",
    title: "Spaced Repetition Disciple",
    description: "Advance 10 flashcards to Leitner Mastery Level 5",
    category: "flashcards",
    tier: "gold",
    icon: "🧠",
    accentColor: "border-violet-300 bg-violet-50 text-violet-900",
    xpReward: 350,
    creditBonus: 25,
    maxProgress: 10,
    requirementDescription: "Reach Level 5 Mastery on 10 cards",
    unlockedLore: "By reviewing right at the point of forgetting, you flattened your Ebbinghaus Curve.",
  },
  {
    id: "speed_recalled_100",
    title: "Centurion Scholar",
    description: "Complete 100 total flashcard recall reviews",
    category: "flashcards",
    tier: "diamond",
    icon: "⚡",
    accentColor: "border-cyan-300 bg-cyan-50 text-cyan-950",
    xpReward: 500,
    creditBonus: 40,
    maxProgress: 100,
    requirementDescription: "Review 100 flashcards across all decks",
    unlockedLore: "100 cards mastered. Your long-term neural recall is rock solid.",
  },

  // ── DIAGNOSTIC GRAPH & PREREQUISITES (3) ──
  {
    id: "radar_explorer",
    title: "Radar Explorer",
    description: "Inspect your concept mastery radar and prerequisite dependencies",
    category: "diagnostic",
    tier: "bronze",
    icon: "🕸️",
    accentColor: "border-emerald-300 bg-emerald-50 text-emerald-900",
    xpReward: 100,
    creditBonus: 10,
    maxProgress: 1,
    requirementDescription: "View knowledge radar on progress page",
    unlockedLore: "Knowledge is a directed acyclic graph, not a linear textbook.",
  },
  {
    id: "prerequisite_pioneer",
    title: "Prerequisite Pioneer",
    description: "Repair an upstream prerequisite flaw to unlock an advanced node",
    category: "diagnostic",
    tier: "silver",
    icon: "🧬",
    accentColor: "border-indigo-300 bg-indigo-50 text-indigo-900",
    xpReward: 250,
    creditBonus: 20,
    maxProgress: 1,
    requirementDescription: "Resolve an upstream bottleneck on the graph",
    unlockedLore: "You repaired the foundation before building higher levels.",
  },
  {
    id: "zero_retention_risk",
    title: "Zero Blindspots",
    description: "Maintain 0 high-risk retention alerts across all enrolled subjects",
    category: "diagnostic",
    tier: "gold",
    icon: "💎",
    accentColor: "border-rose-300 bg-rose-50 text-rose-900",
    xpReward: 400,
    creditBonus: 30,
    maxProgress: 1,
    requirementDescription: "Clear all high retention risk warnings",
    unlockedLore: "Zero fading concepts. All curriculum knowledge is currently in active memory.",
  },

  // ── STREAKS & DEDICATION (3) ──
  {
    id: "flame_starter",
    title: "Flame Starter",
    description: "Maintain an uninterrupted 3-day learning streak",
    category: "streaks",
    tier: "bronze",
    icon: "🔥",
    accentColor: "border-orange-300 bg-orange-50 text-orange-900",
    xpReward: 150,
    creditBonus: 10,
    maxProgress: 3,
    requirementDescription: "Study for 3 consecutive days",
    unlockedLore: "Consistency beats intensity every single time.",
  },
  {
    id: "unstoppable_momentum",
    title: "Unstoppable Momentum",
    description: "Reach a 7-day study streak with daily concept mastery",
    category: "streaks",
    tier: "silver",
    icon: "🚀",
    accentColor: "border-purple-300 bg-purple-50 text-purple-900",
    xpReward: 300,
    creditBonus: 20,
    maxProgress: 7,
    requirementDescription: "Maintain a 7-day study streak",
    unlockedLore: "One full week of continuous cognitive mastery. You are in deep flow.",
  },
  {
    id: "iron_discipline",
    title: "Iron Discipline",
    description: "Achieve a 14-day study streak and earn 500+ XP in one week",
    category: "streaks",
    tier: "diamond",
    icon: "🏆",
    accentColor: "border-yellow-400 bg-amber-50 text-amber-950",
    xpReward: 700,
    creditBonus: 60,
    maxProgress: 14,
    requirementDescription: "Maintain a 14-day streak",
    unlockedLore: "Two weeks of relentless discipline. You are among the top 1% of dedicated scholars.",
  },

  // ── MASTERY & HONORS (4) ──
  {
    id: "polymath_scholar",
    title: "Polymath Scholar",
    description: "Study concepts across Mathematics, Physics, and Chemistry",
    category: "mastery",
    tier: "silver",
    icon: "🔬",
    accentColor: "border-cyan-300 bg-cyan-50 text-cyan-900",
    xpReward: 200,
    creditBonus: 15,
    maxProgress: 3,
    requirementDescription: "Review cards or quizzes in 3 STEM subjects",
    unlockedLore: "You bridge the gap between abstract calculus, physical forces, and atomic reactions.",
  },
  {
    id: "exam_target_mastered",
    title: "Exam Readiness Champion",
    description: "Set an Exam Target Date and achieve an 85%+ exam readiness projection",
    category: "mastery",
    tier: "gold",
    icon: "🎓",
    accentColor: "border-emerald-300 bg-emerald-50 text-emerald-900",
    xpReward: 400,
    creditBonus: 30,
    maxProgress: 1,
    requirementDescription: "Reach 85% readiness on a scheduled target exam",
    unlockedLore: "Calculated mastery compressed to your target exam timeline.",
  },
  {
    id: "century_xp_club",
    title: "1,000 XP Milestone",
    description: "Earn over 1,000 cumulative XP across all learning modes",
    category: "mastery",
    tier: "gold",
    icon: "⭐",
    accentColor: "border-amber-300 bg-amber-50 text-amber-900",
    xpReward: 350,
    creditBonus: 25,
    maxProgress: 1000,
    requirementDescription: "Reach 1,000 Total XP",
    unlockedLore: "You broke the quadruple-digit XP barrier. Keep climbing the ranks!",
  },
  {
    id: "apex_learner",
    title: "Apex Polymath",
    description: "Reach Level 5 Student Rank and unlock at least 10 total badges",
    category: "mastery",
    tier: "diamond",
    icon: "🌟",
    accentColor: "border-purple-400 bg-purple-50 text-purple-950",
    xpReward: 800,
    creditBonus: 75,
    maxProgress: 10,
    requirementDescription: "Reach Level 5 and collect 10 badges",
    unlockedLore: "The pinnacle of adaptive learning excellence. You are a true Feynman Polymath.",
  },
];

/**
 * Calculates current level, rank title, and progress from total XP.
 */
export function calculateStudentLevel(totalXp: number): {
  level: number;
  rankTitle: string;
  rankEmoji: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  // Thresholds: Lvl 1: 0-150, Lvl 2: 150-450, Lvl 3: 450-900, Lvl 4: 900-1500, Lvl 5: 1500-2400, Lvl 6: 2400-3600
  const LEVEL_THRESHOLDS = [0, 150, 450, 900, 1500, 2400, 3600, 5000, 7000, 10000];
  const RANKS = [
    { title: "Curious Explorer", emoji: "🌱" },
    { title: "Apprentice Thinker", emoji: "💡" },
    { title: "Analogy Builder", emoji: "🧩" },
    { title: "Socratic Inquirer", emoji: "🔍" },
    { title: "Feynman Scholar", emoji: "🎓" },
    { title: "Master Polymath", emoji: "👑" },
    { title: "Grandmaster Polymath", emoji: "🏆" },
  ];

  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const baseThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || baseThreshold + 1000;
  const currentLevelXp = Math.max(0, totalXp - baseThreshold);
  const requiredXp = nextThreshold - baseThreshold;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / requiredXp) * 100));

  const rankInfo = RANKS[Math.min(level - 1, RANKS.length - 1)];

  return {
    level,
    rankTitle: rankInfo.title,
    rankEmoji: rankInfo.emoji,
    currentLevelXp,
    nextLevelXp: requiredXp,
    progressPercent,
  };
}
