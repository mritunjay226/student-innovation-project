"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Search,
  User,
  RefreshCw,
  Timer,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Star,
  Users,
  Check,
  Trophy,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  X,
  Sparkles,
  ExternalLink,
  Video,
  Layers,
  BookOpen,
  MessageSquare,
  Target,
  Flame,
  Zap,
} from "lucide-react";

interface StudyTask {
  id: string;
  tag: string;
  tagColor: string;
  timeEstimate: string;
  title: string;
  subject: string;
  actionText: string;
  link: string;
  description: string;
}

interface SkillArea {
  id: string;
  name: string;
  subject: string;
  progress: number;
  trend: "up" | "down";
  link: string;
}

const TODAY_STUDY_PLAN: StudyTask[] = [
  {
    id: "task-1",
    tag: "AI Teach-Back",
    tagColor: "bg-[#FFE4D6] text-[#FF642F] border-[#FFBFA8]",
    timeEstimate: "15 mins",
    title: "Teach Toby: Snell's Law & Refraction",
    subject: "Physics",
    actionText: "Teach Toby",
    link: "/student/teach-back",
    description: "Explain why light bends when passing through water. Toby is confused about the refractive index.",
  },
  {
    id: "task-2",
    tag: "Flashcards Due",
    tagColor: "bg-[#C4F6EE] text-[#0D3E30] border-[#99E6D8]",
    timeEstimate: "10 mins",
    title: "Review: Derivatives & Chain Rule",
    subject: "Mathematics",
    actionText: "Review 15 Cards",
    link: "/student/flashcards",
    description: "15 flashcards are due for spaced repetition today to keep your retention above 90%.",
  },
  {
    id: "task-3",
    tag: "Practice Quiz",
    tagColor: "bg-[#EBF3FE] text-[#2F65F6] border-[#D1E2FB]",
    timeEstimate: "12 mins",
    title: "Self-Check: Chemical Equilibrium",
    subject: "Chemistry",
    actionText: "Take 5 Questions",
    link: "/student/assessment",
    description: "5 adaptive questions on Le Chatelier's principle and equilibrium constants.",
  },
  {
    id: "task-4",
    tag: "Next Chapter",
    tagColor: "bg-[#FEF0C3] text-[#713F12] border-[#FDE68A]",
    timeEstimate: "20 mins",
    title: "Explore: Electrostatics & Gauss's Law",
    subject: "Physics",
    actionText: "Open Chapter",
    link: "/student/chapters",
    description: "Class 12 Physics: Electric field lines, flux, and Gauss's law applications.",
  },
];

const TOPIC_MASTERY: SkillArea[] = [
  { id: "s-1", name: "Calculus & Limits", subject: "Math", progress: 88, trend: "up", link: "/student/chapters" },
  { id: "s-2", name: "Wave Optics", subject: "Physics", progress: 76, trend: "up", link: "/student/chapters" },
  { id: "s-3", name: "Chemical Equilibrium", subject: "Chemistry", progress: 58, trend: "down", link: "/student/chapters" },
  { id: "s-4", name: "Kinematics & Vectors", subject: "Physics", progress: 92, trend: "up", link: "/student/chapters" },
  { id: "s-5", name: "Thermodynamics", subject: "Physics", progress: 74, trend: "up", link: "/student/chapters" },
];

const MONTHS = ["Aug", "Sep", "Oct", "Nov"];

export default function StudentDashboard() {
  const router = useRouter();
  const { userName, userAvatar, userEmail, userId } = useAuth();

  // Queries for real data
  const concepts = useQuery(api.concepts.getAll, {});
  const flashcardDecks = useQuery(api.flashcards.getDecks, userId ? { studentId: userId } : {});

  // Interactive States
  const [selectedMonth, setSelectedMonth] = useState("Sep");
  const [selectedRange, setSelectedRange] = useState("Last month");
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTaskModal, setActiveTaskModal] = useState<StudyTask | null>(null);
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Trigger brief refresh animation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  // Month-dependent chart wave data points (Practice Minutes vs Quiz Accuracy)
  const chartPointsByMonth: Record<
    string,
    {
      practiceMinutesPath: string;
      quizScorePath: string;
      tooltipWeek: string;
      tooltipState: string;
      tooltipX: number;
      tooltipY: number;
      avgScore: number;
      totalMins: number;
    }
  > = {
    Aug: {
      practiceMinutesPath: "M 0 110 C 60 80, 110 140, 180 85 C 250 30, 310 95, 370 110 C 430 125, 490 60, 560 75 C 620 90, 680 130, 720 120",
      quizScorePath: "M 0 135 C 70 145, 120 90, 190 120 C 260 150, 320 60, 390 40 C 460 20, 510 100, 570 130 C 630 160, 680 140, 720 145",
      tooltipWeek: "Week 3",
      tooltipState: "82% Quiz Score",
      tooltipX: 390,
      tooltipY: 40,
      avgScore: 82,
      totalMins: 320,
    },
    Sep: {
      practiceMinutesPath: "M 0 125 C 50 125, 80 110, 110 112 C 160 115, 190 70, 240 70 C 280 70, 310 120, 350 140 C 400 165, 440 160, 480 120 C 530 70, 600 70, 660 140",
      quizScorePath: "M 0 150 C 40 150, 100 150, 150 130 C 200 110, 240 150, 290 110 C 330 80, 370 50, 415 50 C 460 50, 510 110, 550 135 C 600 165, 640 160, 660 150",
      tooltipWeek: "Week 8",
      tooltipState: "88% Quiz Score",
      tooltipX: 415,
      tooltipY: 50,
      avgScore: 88,
      totalMins: 480,
    },
    Oct: {
      practiceMinutesPath: "M 0 140 C 50 90, 120 60, 190 80 C 260 100, 320 150, 380 130 C 440 110, 500 50, 560 60 C 620 70, 670 110, 720 130",
      quizScorePath: "M 0 110 C 60 120, 130 160, 190 140 C 250 120, 320 50, 390 60 C 460 70, 520 140, 580 120 C 640 100, 680 80, 720 100",
      tooltipWeek: "Week 6",
      tooltipState: "94% Peak Mastery",
      tooltipX: 560,
      tooltipY: 60,
      avgScore: 91,
      totalMins: 520,
    },
    Nov: {
      practiceMinutesPath: "M 0 100 C 60 130, 120 70, 180 60 C 240 50, 310 120, 380 110 C 450 100, 510 150, 570 140 C 630 130, 680 70, 720 80",
      quizScorePath: "M 0 140 C 50 110, 110 130, 170 110 C 230 90, 290 60, 360 70 C 430 80, 500 130, 560 110 C 620 90, 670 130, 720 140",
      tooltipWeek: "Week 11",
      tooltipState: "95% Exam Ready",
      tooltipX: 180,
      tooltipY: 60,
      avgScore: 93,
      totalMins: 610,
    },
  };

  const currentChart = chartPointsByMonth[selectedMonth] || chartPointsByMonth["Sep"];

  return (
    <div className="w-full max-w-[1360px] mx-auto pb-10 text-[#1C1E23] font-sans antialiased">
      {/* ── Main Canvas Shell (Clean Off-White Card Container) ── */}
      <div className="bg-[#EEF1F7] rounded-[36px] p-4 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-[#E2E6F0] relative overflow-hidden">
        
        {/* ── Top Header Navigation Bar ── */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7 px-2">
          {/* Left: Brand / Avatar Emblem & Welcome Text */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FF642F] flex items-center justify-center text-white shadow-md shadow-[#FF642F]/25 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="10" y="2" width="4" height="4" rx="1" transform="rotate(45 12 4)" fill="white" />
                <rect x="4" y="8" width="4" height="4" rx="1" transform="rotate(45 6 10)" fill="white" />
                <rect x="16" y="8" width="4" height="4" rx="1" transform="rotate(45 18 10)" fill="white" />
                <rect x="10" y="14" width="4" height="4" rx="1" transform="rotate(45 12 16)" fill="white" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#181A20] leading-snug">
                Welcome, {userName || "Kristin"}
              </h1>
              <p className="text-xs text-[#7E8494] font-medium">
                Your personal study overview • Class 12 STEM Scholar
              </p>
            </div>
          </div>

          {/* Right: Quick Search Box */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#8C93A4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chapters or topics..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push("/student/chapters");
                }}
                className="w-full bg-[#E4E8F2] hover:bg-[#DDE2EE] focus:bg-white text-xs font-semibold text-[#181A20] placeholder-[#8C93A4] pl-9 pr-4 py-2.5 rounded-full outline-none transition-all duration-200 border border-transparent focus:border-[#FF642F] focus:shadow-xs"
              />
            </div>
            <Link
              href="/student/progress"
              aria-label="User Profile"
              className="w-9 h-9 rounded-full bg-white border border-[#DCE2EE] shadow-2xs flex items-center justify-center text-[#555C6E] hover:text-[#FF642F] hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* ── Two-Column Main Layout Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* ═══════════════════════════════════════════════════════ */}
          {/* ── LEFT COLUMN: Profile + Key Metrics + Activity Chart ── */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            
            {/* ── Top Row: Profile Card & Key Metrics ── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* ── Card 1: Profile Card (5 cols) ── */}
              <div className="md:col-span-5 bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-[#E6EAF2] flex flex-col justify-between items-center text-center relative">
                
                {/* Top Header */}
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#1C1E23]">Student Profile</span>
                  <button
                    onClick={handleRefresh}
                    aria-label="Refresh Profile"
                    className="text-[#8C93A4] hover:text-[#181A20] transition-colors cursor-pointer p-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#FF642F]" : ""}`} />
                  </button>
                </div>

                {/* Circular Avatar with Progress Arc & Star Badge */}
                <div className="relative my-2">
                  {/* Progress Ring SVG Arc (78% Curriculum Progress) */}
                  <svg className="w-[84px] h-[84px] -rotate-90" viewBox="0 0 84 84">
                    <circle
                      cx="42"
                      cy="42"
                      r="38"
                      fill="none"
                      stroke="#F4F5F8"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="42"
                      cy="42"
                      r="38"
                      fill="none"
                      stroke="#FF642F"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray="185 240"
                    />
                  </svg>

                  {/* Photo Avatar */}
                  <div className="absolute inset-[6px] rounded-full overflow-hidden border-2 border-white shadow-xs bg-[#FF642F]">
                    {userAvatar && (userAvatar.startsWith("http") || userAvatar.startsWith("/")) ? (
                      <img
                        src={userAvatar}
                        alt={userName || "Kristin Watson"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-black text-lg bg-[#FF642F]">
                        {userName ? userName.split(" ").map((n) => n[0]).join("").slice(0, 2) : "KW"}
                      </div>
                    )}
                  </div>

                  {/* Star Badge at 5 o'clock */}
                  <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#181A20] text-white flex items-center justify-center shadow-md border-2 border-white">
                    <Star className="w-2.5 h-2.5 fill-white text-white" />
                  </div>
                </div>

                {/* Name & Title */}
                <div className="mb-4">
                  <h2 className="text-base font-bold text-[#181A20] tracking-tight m-0">
                    {userName || "Kristin Watson"}
                  </h2>
                  <p className="text-xs text-[#8C93A4] font-medium m-0 mt-0.5">
                    Class 12 STEM Scholar
                  </p>
                </div>

                {/* Real Labeled Student Stats */}
                <div className="grid grid-cols-3 gap-2 w-full pt-1">
                  <div className="bg-[#FAFBFD] border border-[#E9ECF2] p-2 rounded-2xl text-center">
                    <div className="text-xs font-black text-[#181A20] flex items-center justify-center gap-1">
                      <span>🔥</span>
                      <span>14</span>
                    </div>
                    <div className="text-[9px] font-bold text-[#7E8494] mt-0.5">Day Streak</div>
                  </div>
                  <div className="bg-[#FAFBFD] border border-[#E9ECF2] p-2 rounded-2xl text-center">
                    <div className="text-xs font-black text-[#181A20] flex items-center justify-center gap-1">
                      <span>⚡</span>
                      <span>124</span>
                    </div>
                    <div className="text-[9px] font-bold text-[#7E8494] mt-0.5">Cards Due</div>
                  </div>
                  <div className="bg-[#FAFBFD] border border-[#E9ECF2] p-2 rounded-2xl text-center">
                    <div className="text-xs font-black text-[#181A20] flex items-center justify-center gap-1">
                      <span>🏆</span>
                      <span>8</span>
                    </div>
                    <div className="text-[9px] font-bold text-[#7E8494] mt-0.5">Badges</div>
                  </div>
                </div>
              </div>

              {/* ── Cards 2 & 3: Direct Feature Shortcuts (7 cols) ── */}
              <div className="md:col-span-7 flex flex-col gap-3.5">
                
                <div className="grid grid-cols-2 gap-3.5 flex-1">
                  
                  {/* Card 2: Quiz Accuracy (Sunset Peach / Coral Glow Mesh) */}
                  <Link
                    href="/student/assessment"
                    className="bg-gradient-to-br from-[#FFE4D6] via-[#FFBFA8] to-[#FFA199] rounded-[28px] p-5 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#2A1810] leading-tight">
                        Chapter<br />Quizzes
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-[#2A1810] border border-white/40 shadow-xs shrink-0 group-hover:bg-white transition-colors">
                        <Target className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="text-3xl sm:text-4xl font-black text-[#1C1E23] tracking-tight leading-none">
                        88%
                      </div>
                      <div className="text-[11px] sm:text-xs font-bold text-[#4A2E22] mt-1.5 opacity-90 flex items-center justify-between">
                        <span>18 Quizzes Passed</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>

                  {/* Card 3: Teach-Back Mastery (Sky Cyan / Lavender Glow Mesh) */}
                  <Link
                    href="/student/teach-back"
                    className="bg-gradient-to-br from-[#C4F6EE] via-[#A8E2F9] to-[#99B6F9] rounded-[28px] p-5 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#0F2232] leading-tight">
                        Teach-Back<br />Studio
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-[#0F2232] border border-white/40 shadow-xs shrink-0 group-hover:bg-white transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="text-3xl sm:text-4xl font-black text-[#1C1E23] tracking-tight leading-none">
                        94%
                      </div>
                      <div className="text-[11px] sm:text-xs font-bold text-[#1F3D52] mt-1.5 opacity-90 flex items-center justify-between">
                        <span>Toby & Maya Pod</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>

                </div>

                {/* ── Card 4: Curriculum Tracks Active Bar ── */}
                <Link
                  href="/student/chapters"
                  className="bg-[#E4E8F2]/90 hover:bg-[#DDE2EE] backdrop-blur-sm rounded-[22px] px-5 py-3.5 flex items-center justify-between border border-[#DCE2EE]/80 transition-colors group cursor-pointer"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#181A20] leading-none mb-1 group-hover:text-[#FF642F] transition-colors">
                      Active Subjects & Chapters
                    </h4>
                    <p className="text-[11px] text-[#7E8494] font-medium leading-none m-0">
                      Mathematics, Physics & Chemistry • 38 Chapters
                    </p>
                  </div>

                  {/* Connected STEM Subject Icons */}
                  <div className="flex items-center -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#FF642F] text-white flex items-center justify-center text-[10px] font-bold shadow-xs border border-white shrink-0" title="Mathematics">
                      📐
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[10px] font-bold shadow-xs border border-white shrink-0" title="Physics">
                      ⚛️
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center text-[10px] font-bold shadow-xs border border-white shrink-0" title="Chemistry">
                      🧪
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white text-[#7E8494] flex items-center justify-center text-[10px] font-black shadow-xs border border-[#DCE2EE]">
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>

              </div>

            </div>

            {/* ── Card 5: Weekly Study Activity & Score Trends Chart ── */}
            <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-xs border border-[#E6EAF2] flex flex-col justify-between">
              
              {/* Header: Title & Range Selector */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#181A20] leading-none mb-1">
                    Study Activity & Retention
                  </h3>
                  <p className="text-xs text-[#8C93A4] font-medium leading-none m-0">
                    Daily practice time vs quiz accuracy trend
                  </p>
                </div>

                {/* Range Dropdown Pill */}
                <div className="relative">
                  <button
                    onClick={() => setShowRangeDropdown(!showRangeDropdown)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#181A20] bg-[#F4F6FB] hover:bg-[#EAEFF8] px-3.5 py-1.5 rounded-full border border-[#E2E6F0] transition-colors cursor-pointer"
                  >
                    <span>Range: {selectedRange}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#7E8494]" />
                  </button>

                  {showRangeDropdown && (
                    <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-2xl shadow-lg border border-[#E2E6F0] py-1 z-20 text-xs font-semibold">
                      {["Last 7 days", "Last month", "This term", "All time"].map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            setSelectedRange(r);
                            setShowRangeDropdown(false);
                          }}
                          className={`w-full text-left px-3.5 py-1.5 hover:bg-slate-50 transition-colors ${
                            selectedRange === r ? "text-[#FF642F] font-bold" : "text-[#555C6E]"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Body */}
              <div className="flex items-center gap-4 my-2">
                
                {/* Left Month Selector */}
                <div className="flex flex-col items-center gap-2 shrink-0 py-2">
                  <button
                    aria-label="Previous month"
                    onClick={() => {
                      const idx = MONTHS.indexOf(selectedMonth);
                      if (idx > 0) setSelectedMonth(MONTHS[idx - 1]);
                    }}
                    className="text-[#8C93A4] hover:text-[#181A20] p-0.5 cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  {MONTHS.map((m) => {
                    const isSelected = selectedMonth === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setSelectedMonth(m)}
                        className={`text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FF642F] text-white px-3 py-1 rounded-full shadow-sm shadow-[#FF642F]/30 scale-105"
                            : "text-[#8C93A4] hover:text-[#181A20] px-2 py-0.5"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}

                  <button
                    aria-label="Next month"
                    onClick={() => {
                      const idx = MONTHS.indexOf(selectedMonth);
                      if (idx < MONTHS.length - 1) setSelectedMonth(MONTHS[idx + 1]);
                    }}
                    className="text-[#8C93A4] hover:text-[#181A20] p-0.5 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* SVG Curve Wave Chart */}
                <div className="flex-1 h-[210px] sm:h-[230px] relative w-full overflow-hidden">
                  <svg
                    viewBox="0 0 720 200"
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                  >
                    <defs>
                      <pattern id="dotGrid" width="14" height="14" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.1" fill="#E4E8F2" />
                      </pattern>
                    </defs>

                    <rect width="100%" height="100%" fill="url(#dotGrid)" />

                    {/* Coral / Orange Line: Practice Minutes */}
                    <path
                      d={currentChart.practiceMinutesPath}
                      fill="none"
                      stroke="#FF642F"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />

                    {/* Sky / Purple Line: Quiz Score % */}
                    <path
                      d={currentChart.quizScorePath}
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />

                    {/* Active Wave Dot */}
                    <circle
                      cx={currentChart.tooltipX}
                      cy={currentChart.tooltipY}
                      r="5.5"
                      fill="#0284C7"
                      stroke="#FFFFFF"
                      strokeWidth="3"
                      className="transition-all duration-700 ease-out shadow-md"
                    />
                  </svg>

                  {/* Tooltip Pill */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-[115%] transition-all duration-700 ease-out pointer-events-none"
                    style={{
                      left: `${(currentChart.tooltipX / 720) * 100}%`,
                      top: `${(currentChart.tooltipY / 200) * 100}%`,
                    }}
                  >
                    <div className="bg-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] border border-[#E6EAF2] rounded-2xl px-3.5 py-1.5 text-center whitespace-nowrap">
                      <div className="text-[11px] font-bold text-[#181A20] leading-none">
                        {currentChart.tooltipWeek}
                      </div>
                      <div className="text-[9px] text-[#0284C7] font-bold leading-none mt-1">
                        {currentChart.tooltipState}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Legend & Big Stat */}
              <div className="flex items-end justify-between pt-3 border-t border-[#F2F4F8] mt-2">
                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#555C6E]">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-[4px] bg-[#FF642F]" />
                    <span>Practice Time (mins)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-[4px] bg-[#0284C7]" />
                    <span>Quiz Score (%)</span>
                  </div>
                </div>

                {/* Stat */}
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-black text-[#181A20] tracking-tight leading-none">
                    {currentChart.avgScore}%
                  </div>
                  <div className="text-[11px] text-[#8C93A4] font-bold mt-1">
                    Avg. Mastery
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* ── RIGHT COLUMN: Today's Study Plan & Topic Mastery ── */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            
            <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-xs border border-[#E6EAF2] flex flex-col justify-between h-full gap-6">
              
              {/* ── Section 1: Today's Study Plan ── */}
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#181A20] m-0">
                      Today's Study Plan
                    </h3>
                    <p className="text-[11px] text-[#7E8494] font-medium m-0 mt-0.5">
                      Recommended next steps for you
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAllTasks(true)}
                    aria-label="View study plan"
                    className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#555C6E] transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>

                {/* Task List */}
                <div className="divide-y divide-[#F2F4F8]">
                  {TODAY_STUDY_PLAN.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveTaskModal(item)}
                      className="py-3 first:pt-1 flex items-center justify-between gap-3 group cursor-pointer hover:bg-[#FAFBFD] rounded-xl px-1.5 -mx-1.5 transition-colors"
                    >
                      {/* Left: Tag & Est Time */}
                      <div className="min-w-[85px] shrink-0">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.tagColor}`}>
                          {item.tag}
                        </span>
                        <div className="text-[11px] font-semibold text-[#8C93A4] mt-1">
                          {item.timeEstimate}
                        </div>
                      </div>

                      {/* Middle: Title & Subject */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="text-xs font-bold text-[#181A20] truncate group-hover:text-[#FF642F] transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#7E8494] font-medium mt-0.5">
                          {item.subject}
                        </div>
                      </div>

                      {/* Right: Arrow Up Right */}
                      <div className="text-[#8C93A4] group-hover:text-[#FF642F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0">
                        <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* View all button */}
                <button
                  onClick={() => setShowAllTasks(true)}
                  className="w-full text-center text-xs font-bold text-[#7E8494] hover:text-[#181A20] transition-colors pt-3 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>See all study activities</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ── Section 2: Topic Mastery & Weak Spots ── */}
              <div className="border-t border-[#F2F4F8] pt-5">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-base font-bold text-[#181A20] leading-none mb-1">
                    Topic Mastery
                  </h3>
                  <p className="text-xs text-[#8C93A4] font-medium leading-none m-0">
                    Your strongest & weakest topics
                  </p>
                </div>

                {/* Topic Progress Bars */}
                <div className="space-y-3.5">
                  {TOPIC_MASTERY.map((skill) => (
                    <Link
                      key={skill.id}
                      href={skill.link}
                      className="flex items-center justify-between gap-3 text-xs group cursor-pointer hover:bg-[#FAFBFD] p-1 rounded-lg transition-colors"
                    >
                      {/* Topic Name */}
                      <span className="font-bold text-[#181A20] w-32 shrink-0 truncate group-hover:text-[#FF642F] transition-colors">
                        {skill.name}
                      </span>

                      {/* Progress Bar */}
                      <div className="flex-1 h-2 rounded-full bg-[#E5E9F2] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            skill.progress >= 80
                              ? "bg-[#059669]"
                              : skill.progress >= 60
                              ? "bg-[#FF642F]"
                              : "bg-[#E11D48]"
                          }`}
                          style={{ width: `${skill.progress}%` }}
                        />
                      </div>

                      {/* Percentage */}
                      <span className="text-xs font-bold text-[#7E8494] w-8 text-right shrink-0">
                        {skill.progress}%
                      </span>

                      {/* Trend Arrow */}
                      <div className="shrink-0">
                        {skill.trend === "up" ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center">
                            <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                            <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ── Interactive Modal: Study Task Detail / Start ── */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${activeTaskModal.tagColor}`}>
                {activeTaskModal.tag}
              </span>
              <button
                onClick={() => setActiveTaskModal(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {activeTaskModal.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              {activeTaskModal.subject} • Est. {activeTaskModal.timeEstimate}
            </p>

            <div className="bg-[#F8FAFD] rounded-2xl p-4 border border-[#E6EAF2] mb-5">
              <div className="text-xs font-bold text-slate-700 mb-1">Task Overview</div>
              <p className="text-xs text-slate-500 m-0">
                {activeTaskModal.description}
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href={activeTaskModal.link}
                onClick={() => setActiveTaskModal(null)}
                className="flex-1 bg-[#FF642F] hover:bg-[#E85520] text-white font-bold text-xs py-3 rounded-full text-center transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-[#FF642F]/30"
              >
                <span>{activeTaskModal.actionText}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setActiveTaskModal(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-full transition-colors cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Interactive Modal: Full Study Plan Schedule ── */}
      {showAllTasks && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">All Study Activities</h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">Quick access to all learning features</p>
              </div>
              <button
                onClick={() => setShowAllTasks(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 mb-5 max-h-[360px] overflow-y-auto pr-1">
              {TODAY_STUDY_PLAN.map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E6EAF2] flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{item.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.subject} • {item.timeEstimate}</div>
                  </div>
                  <Link
                    href={item.link}
                    onClick={() => setShowAllTasks(false)}
                    className="text-xs font-bold bg-[#FF642F] text-white px-3 py-1.5 rounded-full hover:bg-[#E85520] transition-colors shrink-0"
                  >
                    Start →
                  </Link>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAllTasks(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-full transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
