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
  MessageSquare,
  ClipboardCheck,
  Sparkles,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
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
          <div className="w-8 h-8 rounded-full mx-auto mb-3 animate-spin border-2 border-[#FF642F] border-t-transparent" />
          <p className="text-xs font-bold text-[#8C93A4]">Loading curriculum chapters…</p>
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

  const subjectMeta: Record<string, { color: string; badgeBg: string }> = {
    Mathematics: { color: "#FF642F", badgeBg: "bg-blue-50 text-[#FF642F]" },
    Physics: { color: "#0284C7", badgeBg: "bg-sky-50 text-[#0284C7]" },
    Chemistry: { color: "#059669", badgeBg: "bg-emerald-50 text-[#059669]" },
  };

  return (
    <div className="max-w-6xl mx-auto pb-14 text-[#1C1E23] font-sans antialiased">
      {/* ── Top Header Bar ── */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-[#E6EAF2] mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FE] text-[#FF642F] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{filteredConcepts.length} Topics Across 3 Subjects</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#181A20] tracking-tight m-0">
              Curriculum Chapters
            </h1>
            <p className="text-xs sm:text-sm text-[#7E8494] font-medium mt-1 mb-0">
              Browse all chapters, track concept mastery, and launch Socratic study sessions.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8C93A4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search chapters by topic…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F4F6FB] hover:bg-[#EAEFF8] focus:bg-white text-xs font-bold text-[#181A20] placeholder-[#8C93A4] pl-9 pr-4 py-2.5 rounded-full outline-none transition-all border border-[#E2E6F0] focus:border-[#FF642F]"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-5 border-t border-[#F2F4F8]">
          {/* Subjects Pills */}
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  selectedSubject === s
                    ? "bg-[#FF642F] text-white shadow-sm shadow-[#FF642F]/25"
                    : "bg-[#F4F6FB] text-[#555C6E] hover:text-[#181A20] border border-[#E2E6F0]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Grade Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  selectedGrade === g
                    ? "bg-[#181A20] text-white"
                    : "bg-[#F4F6FB] text-[#7E8494] hover:text-[#181A20] border border-[#E2E6F0]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chapters Grouped by Subject ── */}
      {Object.entries(subjectGroups).map(([subject, concepts]) => {
        const meta = subjectMeta[subject] || { color: "#FF642F", badgeBg: "bg-blue-50 text-[#FF642F]" };
        const masteredCount = concepts.filter((c) => (c.mastery?.score || 0) >= 75).length;
        const avgScore = concepts.length > 0
          ? Math.round(concepts.reduce((s, c) => s + (c.mastery?.score || 0), 0) / concepts.length)
          : 0;

        return (
          <div key={subject} className="mb-8">
            {/* Subject Header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: meta.color }}
                />
                <h2 className="text-base sm:text-lg font-black text-[#181A20] tracking-tight m-0">
                  {subject}
                </h2>
                <span className="text-[11px] font-bold text-[#7E8494] bg-white border border-[#E2E6F0] px-2.5 py-0.5 rounded-full">
                  {concepts.length} Chapters
                </span>
              </div>

              {/* Subject Progress Pill */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#7E8494]">
                  {masteredCount}/{concepts.length} mastered
                </span>
                <div className="w-24 h-2 bg-[#E5E9F2] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${avgScore}%`,
                      background: meta.color,
                    }}
                  />
                </div>
                <span className="text-xs font-black text-[#181A20]">
                  {avgScore}%
                </span>
              </div>
            </div>

            {/* Chapter Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {concepts.map((concept, idx) => {
                const score = concept.mastery?.score || 0;
                const isBlocked = dontStudyYet.has(concept._id);
                const isMastered = score >= 75;
                const attempts = concept.mastery?.attemptCount || 0;

                return (
                  <div
                    key={concept._id}
                    className="bg-white rounded-[26px] p-5 shadow-xs border border-[#E6EAF2] flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01] hover:shadow-md transition-all"
                  >
                    {/* Illustration watermark */}
                    <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:opacity-30 transition-all pointer-events-none">
                      {getChapterIllustration(concept.subject, idx, "w-28 h-28")}
                    </div>

                    {isBlocked && (
                      <div className="absolute top-4 right-4 z-20 w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="relative z-10">
                      {/* Grade & Mastery status */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-bold text-[#7E8494] bg-[#F4F6FB] border border-[#E2E6F0] py-0.5 px-2.5 rounded-full">
                          {concept.grade}
                        </span>
                        {isMastered ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 py-0.5 px-2.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Mastered
                          </span>
                        ) : score > 0 ? (
                          <span className="text-xs font-black text-[#FF642F] bg-blue-50 px-2 py-0.5 rounded-full">
                            {score}%
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#8C93A4] bg-slate-50 px-2 py-0.5 rounded-full">
                            Not started
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-sm text-[#181A20] leading-snug mb-1.5 group-hover:text-[#FF642F] transition-colors">
                        {concept.title}
                      </h3>

                      {/* Progress bar */}
                      {score > 0 && (
                        <div className="h-1.5 bg-[#E5E9F2] rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${score}%`,
                              background: meta.color,
                            }}
                          />
                        </div>
                      )}

                      <p className="text-xs text-[#7E8494] font-medium line-clamp-2 leading-relaxed">
                        {concept.description}
                      </p>
                    </div>

                    {/* Footer Controls */}
                    <div className="flex items-center justify-between pt-3.5 border-t border-[#F2F4F8] mt-4 relative z-10">
                      <span className="text-[11px] font-bold text-[#8C93A4]">
                        {attempts > 0 ? `${attempts} attempts` : `Difficulty: Level ${concept.difficulty}`}
                      </span>

                      {!isBlocked ? (
                        <div className="flex items-center gap-2">
                          <Link
                            href="/student/assessment"
                            className="w-7 h-7 rounded-full bg-[#F4F6FB] hover:bg-[#EAEFF8] flex items-center justify-center text-[#181A20] border border-[#E2E6F0] transition-colors"
                            title="Diagnostic Quiz"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href="/student/teach-back"
                            className="bg-[#FF642F] hover:bg-[#2554D4] text-white text-[11px] font-bold py-1.5 px-3.5 rounded-full shadow-xs shadow-[#FF642F]/25 flex items-center gap-1 transition-all"
                          >
                            <span>Study</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
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
        <div className="bg-white rounded-[28px] p-12 text-center border border-[#E6EAF2]">
          <BookOpen className="w-8 h-8 text-[#8C93A4] mx-auto mb-3" />
          <p className="text-sm font-bold text-[#181A20]">No chapters match your search.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSubject("All");
              setSelectedGrade("All Grades");
            }}
            className="mt-3 text-xs font-bold text-[#FF642F] hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
