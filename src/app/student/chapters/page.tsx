"use client";

import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import {
  Search,
  BookOpen,
  GraduationCap,
  Lock,
  TrendingUp,
  MessageSquare,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { getChapterIllustration } from "@/components/CardIllustrations";

const SUBJECTS = ["All", "Mathematics", "Physics", "Chemistry"] as const;
const GRADES = ["All Grades", "Class 10", "Class 11", "Class 12"] as const;

export default function ChaptersPage() {
  const { userId } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedGrade, setSelectedGrade] = useState<string>("All Grades");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const conceptData = useQuery(
    api.concepts.getWithMastery,
    userId
      ? {
          studentId: userId,
          subject: selectedSubject !== "All" ? selectedSubject : undefined,
          grade: selectedGrade !== "All Grades" ? selectedGrade : undefined,
        }
      : "skip"
  );

  if (!conceptData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full mx-auto mb-3 animate-spin border-2 border-[#18181B] border-t-transparent" />
          <p className="text-xs font-semibold text-[#71717A]">Loading chapters…</p>
        </div>
      </div>
    );
  }

  const filteredConcepts = conceptData.concepts.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Prerequisite bottlenecks
  const dontStudyYet = new Set(
    filteredConcepts
      .filter((c) => {
        if (!c.mastery || c.mastery.score >= 60) return false;
        return conceptData.edges
          .filter((e) => e.toConceptId === c._id)
          .some((edge) => {
            const prereq = conceptData.concepts.find((p) => p._id === edge.fromConceptId);
            return prereq?.mastery && prereq.mastery.score < 50;
          });
      })
      .map((c) => c._id)
  );

  // Grouping by subject
  const subjectGroups: Record<string, typeof filteredConcepts> = {};
  for (const c of filteredConcepts) {
    if (!subjectGroups[c.subject]) subjectGroups[c.subject] = [];
    subjectGroups[c.subject].push(c);
  }

  const subjectMeta: Record<string, { color: string; card: string }> = {
    Mathematics: { color: "#7C3AED", card: "card-lavender" },
    Physics: { color: "#0284C7", card: "card-sky" },
    Chemistry: { color: "#059669", card: "card-mint" },
  };

  const cardThemes = ["card-lavender", "card-mint", "card-sky", "card-butter", "card-peach", "card-lilac"];

  return (
    <div className="max-w-6xl mx-auto pb-14 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <div className="pill-chip chip-butter text-xs font-bold py-1 px-3 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{filteredConcepts.length} Topics Across 3 Subjects</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight mb-1">
          Curriculum Chapters
        </h1>
        <p className="text-sm text-[#71717A] font-medium">
          Browse all chapters, track mastery, and launch study sessions.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-7 space-y-3">
        <div className="pill-search bg-white shadow-xs py-2 px-3.5 border border-[#EBE5DB]">
          <Search className="w-4 h-4 text-[#71717A] shrink-0" />
          <input
            type="text"
            placeholder="Search chapters by name or topic…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs sm:text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-[#71717A] hover:text-[#18181B] px-2 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Subject */}
          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`pill-chip text-xs py-1 px-3 font-semibold ${
                  selectedSubject === s ? "chip-dark" : "chip-white"
                }`}
              >
                <BookOpen className="w-3 h-3" /> {s}
              </button>
            ))}
          </div>
          {/* Grade */}
          <div className="flex flex-wrap gap-1.5">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`pill-chip text-xs py-1 px-2.5 font-semibold ${
                  selectedGrade === g ? "chip-butter" : "chip-white"
                }`}
              >
                <GraduationCap className="w-3 h-3" /> {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chapters grouped by subject */}
      {Object.entries(subjectGroups).map(([subject, concepts]) => {
        const meta = subjectMeta[subject] || { color: "#121216", card: "card-white" };
        const masteredCount = concepts.filter((c) => (c.mastery?.score || 0) >= 75).length;
        const avgScore = concepts.length > 0
          ? Math.round(concepts.reduce((s, c) => s + (c.mastery?.score || 0), 0) / concepts.length)
          : 0;

        return (
          <div key={subject} className="mb-10">
            {/* Subject Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: meta.color }}
                />
                <h2 className="text-lg font-black text-[#18181B] tracking-tight">
                  {subject}
                </h2>
                <span className="pill-chip chip-white text-[10px] font-bold py-0.5 px-2">
                  {concepts.length} Chapters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#71717A]">
                  {masteredCount}/{concepts.length} mastered
                </span>
                {/* Mini subject progress bar */}
                <div className="w-20 h-1.5 bg-[#EBE5DB] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${avgScore}%`,
                      background: meta.color,
                    }}
                  />
                </div>
                <span className="text-xs font-bold" style={{ color: meta.color }}>
                  {avgScore}%
                </span>
              </div>
            </div>

            {/* Chapter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {concepts.map((concept, idx) => {
                const score = concept.mastery?.score || 0;
                const isBlocked = dontStudyYet.has(concept._id);
                const isMastered = score >= 75;
                const attempts = concept.mastery?.attemptCount || 0;
                const themeClass = isBlocked
                  ? "card-white opacity-80"
                  : cardThemes[idx % cardThemes.length];

                return (
                  <div
                    key={concept._id}
                    className={`card-pastel ${themeClass} p-5 rounded-[24px] flex flex-col justify-between relative overflow-hidden group shadow-xs`}
                  >
                    {/* Illustration */}
                    <div className="absolute -right-2 -bottom-2 opacity-25 group-hover:opacity-55 transition-all duration-300 pointer-events-none">
                      {getChapterIllustration(concept.subject, idx, "w-28 h-28")}
                    </div>

                    {isBlocked && (
                      <div className="absolute top-3 right-3 z-20">
                        <Lock className="w-4 h-4 text-[#8A3B2E]" />
                      </div>
                    )}

                    <div className="relative z-10">
                      {/* Grade + mastery badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="pill-chip chip-white text-[10px] font-bold py-0.5 px-2">
                          {concept.grade}
                        </span>
                        {isMastered ? (
                          <span className="pill-chip chip-mint text-[10px] font-bold py-0.5 px-2">
                            ✓ Mastered
                          </span>
                        ) : score > 0 ? (
                          <span className="text-xs font-bold opacity-75">{score}%</span>
                        ) : (
                          <span className="text-[10px] font-semibold opacity-50">Not started</span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-black text-sm text-[#18181B] leading-snug mb-1 group-hover:underline">
                        {concept.title}
                      </h3>

                      {/* Progress bar */}
                      {score > 0 && (
                        <div className="h-1.5 bg-black/10 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${score}%`,
                              background: meta.color,
                            }}
                          />
                        </div>
                      )}

                      <p className="text-[11px] opacity-70 font-medium line-clamp-2 max-w-[85%]">
                        {concept.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-black/5 mt-3 relative z-10">
                      <span className="text-[10px] font-semibold opacity-60">
                        {attempts > 0 ? `${attempts} attempt${attempts > 1 ? "s" : ""}` : "Level " + concept.difficulty}
                      </span>
                      {!isBlocked && (
                        <div className="flex items-center gap-1.5">
                          <Link
                            href="/student/assessment"
                            className="w-6 h-6 rounded-full bg-white/80 hover:bg-white flex items-center justify-center border border-black/5 transition-all"
                            title="Quiz"
                          >
                            <ClipboardCheck className="w-3 h-3 text-[#18181B]" />
                          </Link>
                          <Link
                            href="/student/teach-back"
                            className="btn-continue text-[10px] py-1 px-2.5"
                          >
                            <span>Study</span>
                            <span className="arrow-circle">→</span>
                          </Link>
                        </div>
                      )}
                      {isBlocked && (
                        <span className="text-[10px] font-bold text-[#8A3B2E]">
                          Prereq required
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {filteredConcepts.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-8 h-8 text-[#D4D0C8] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#71717A]">No chapters match your search.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSubject("All");
              setSelectedGrade("All Grades");
            }}
            className="mt-3 text-xs font-bold text-[#8B5CF6] hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
