"use client";

import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Target,
} from "lucide-react";
import Link from "next/link";
import { getChapterIllustration } from "@/components/CardIllustrations";

const SUBJECTS = ["All Subjects", "Mathematics", "Physics", "Chemistry"] as const;
const GRADES = ["All Grades", "Class 10", "Class 11", "Class 12"] as const;

type Question = {
  _id: Id<"assessmentItems">;
  question: string;
  type: "mcq" | "true_false" | "short_answer";
  options?: string[];
  correctAnswer: string;
  difficulty: number;
  explanation?: string;
  conceptId: Id<"concepts">;
};

export default function AssessmentPage() {
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const conceptIdParam = searchParams.get("concept");

  const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects");
  const [selectedGrade, setSelectedGrade] = useState<string>("All Grades");

  const concepts = useQuery(api.concepts.getAll, {
    subject: selectedSubject !== "All Subjects" ? selectedSubject : undefined,
    grade: selectedGrade !== "All Grades" ? selectedGrade : undefined,
  });

  const [selectedConcept, setSelectedConcept] = useState<Id<"concepts"> | null>(null);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [studentReasoning, setStudentReasoning] = useState("");
  const [isAnalyzingReasoning, setIsAnalyzingReasoning] = useState(false);
  const [thoughtAnalysis, setThoughtAnalysis] = useState<{
    feedback: string;
    thinkingQuality: string;
    keyInsight?: string;
    tobyComment?: string;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    correctAnswer: string;
    explanation?: string;
  } | null>(null);
  const [scores, setScores] = useState<{ correct: boolean; confidence: number }[]>([]);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const questions = useQuery(
    api.assessments.getAdaptiveQuestions,
    selectedConcept && userId
      ? { studentId: userId, conceptId: selectedConcept, count: 5 }
      : "skip"
  ) as Question[] | undefined;

  const submitAttempt = useMutation(api.assessments.submitAttempt);
  const updateMastery = useMutation(api.mastery.updateAfterAttempt);

  useEffect(() => {
    if (conceptIdParam) {
      setSelectedConcept(conceptIdParam as Id<"concepts">);
      setStarted(true);
    }
  }, [conceptIdParam]);

  useEffect(() => {
    if (started && !submitted) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, submitted, currentIndex]);

  const currentQuestion = questions?.[currentIndex];
  const isComplete = questions && currentIndex >= questions.length;

  const handleSubmit = useCallback(async () => {
    if (!selectedAnswer || !currentQuestion || !userId) return;

    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect =
      selectedAnswer.toLowerCase().trim() ===
      currentQuestion.correctAnswer.toLowerCase().trim();

    // Call AI Thought Process Analyzer if reasoning was provided
    let aiFeedbackText: string | undefined = undefined;
    if (studentReasoning && studentReasoning.trim().length > 0) {
      setIsAnalyzingReasoning(true);
      try {
        const aiRes = await fetch("/api/ai/analyze-reasoning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contextType: "quiz",
            topic: selectedSubject,
            question: currentQuestion.question,
            studentAnswer: selectedAnswer,
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect,
            studentReasoning: studentReasoning.trim(),
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          setThoughtAnalysis(aiData);
          aiFeedbackText = aiData.feedback;
        }
      } catch (err) {
        console.warn("Reasoning analysis fallback:", err);
      } finally {
        setIsAnalyzingReasoning(false);
      }
    }

    try {
      const res = await submitAttempt({
        studentId: userId,
        questionId: currentQuestion._id,
        answer: selectedAnswer,
        timeTaken: timer,
        confidence,
        reasoning: studentReasoning.trim() || undefined,
        aiReasoningFeedback: aiFeedbackText,
      });

      setResult(res);
      setScores((prev) => [...prev, { correct: res.correct, confidence }]);

      await updateMastery({
        studentId: userId,
        conceptId: currentQuestion.conceptId,
        correct: res.correct,
        confidence,
      });
    } catch (e) {
      console.error("Submit attempt failed:", e);
    }
  }, [selectedAnswer, currentQuestion, userId, timer, confidence, studentReasoning, selectedSubject, submitAttempt, updateMastery]);

  const handleNext = () => {
    setSelectedAnswer(null);
    setStudentReasoning("");
    setThoughtAnalysis(null);
    setSubmitted(false);
    setResult(null);
    setTimer(0);
    setCurrentIndex((i) => i + 1);
  };

  const handleRestart = () => {
    setStarted(false);
    setSelectedConcept(null);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setStudentReasoning("");
    setThoughtAnalysis(null);
    setSubmitted(false);
    setResult(null);
    setScores([]);
    setTimer(0);
  };

  // ── TOPIC SELECTION VIEW ──
  if (!started || !selectedConcept) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-16 text-[#1C1E23] font-sans antialiased">
        {/* Header Bar */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-[#E6EAF2]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE4D6] text-[#FF642F] text-xs font-bold mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Practice & Self-Check • Test Your Skills</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight m-0">
            Chapter Practice Quizzes
          </h1>
          <p className="text-xs sm:text-sm text-[#7E8494] font-medium mt-1 mb-0">
            Pick any chapter to test yourself, see what you have mastered, and find out what to review next.
          </p>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  selectedSubject === sub
                    ? "bg-[#FF642F] text-white shadow-sm shadow-[#FF642F]/25"
                    : "bg-white text-[#555C6E] hover:text-[#181A20] border border-[#E2E6F0]"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {GRADES.map((grd) => (
              <button
                key={grd}
                onClick={() => setSelectedGrade(grd)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  selectedGrade === grd
                    ? "bg-[#181A20] text-white"
                    : "bg-white text-[#7E8494] hover:text-[#181A20] border border-[#E2E6F0]"
                }`}
              >
                {grd}
              </button>
            ))}
          </div>
        </div>

        {/* Concept Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {concepts?.map((concept, idx) => (
            <button
              key={concept._id}
              onClick={() => {
                setSelectedConcept(concept._id);
                setStarted(true);
              }}
              className="bg-white p-5 text-left cursor-pointer transition-all hover:shadow-md hover:border-[#FF642F] group rounded-[26px] border border-[#E6EAF2] relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:opacity-30 transition-all pointer-events-none">
                {getChapterIllustration(concept.subject, idx, "w-32 h-32")}
              </div>

              <div className="relative z-10 w-full">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-[#7E8494] bg-[#F4F6FB] border border-[#E2E6F0] py-0.5 px-2.5 rounded-full">
                        {concept.subject} • {concept.grade}
                      </span>
                      <span className="text-[10px] font-bold text-[#FF642F] bg-blue-50 px-2 py-0.5 rounded-full">
                        Level {concept.difficulty}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-[#18181B] group-hover:text-[#FF642F] transition-colors m-0">
                      {concept.title}
                    </h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#FF642F] text-white flex items-center justify-center group-hover:scale-105 transition-all shadow-xs shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xs text-[#7E8494] font-medium leading-relaxed m-0 max-w-[85%] line-clamp-2 mt-2">
                  {concept.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── RESULTS VIEW ──
  if (isComplete) {
    const correct = scores.filter((s) => s.correct).length;
    const total = scores.length;
    const percentage = Math.round((correct / total) * 100);

    return (
      <div className="max-w-2xl mx-auto pb-16 text-[#1C1E23] font-sans antialiased">
        <div className="bg-white p-8 md:p-10 text-center rounded-[32px] border border-[#E6EAF2] shadow-xs">
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl shadow-md border-4 border-white ${
              percentage >= 70
                ? "bg-gradient-to-br from-[#C4F6EE] to-[#A8E2F9]"
                : percentage >= 40
                ? "bg-gradient-to-br from-[#FFE4D6] to-[#FFBFA8]"
                : "bg-rose-100"
            }`}
          >
            {percentage >= 70 ? "🎉" : percentage >= 40 ? "💡" : "🔍"}
          </div>

          <span className="inline-block bg-blue-50 text-[#FF642F] text-[11px] font-bold px-3 py-1 rounded-full mb-3">
            Diagnostic Complete
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] mb-2">
            {correct} of {total} Correct ({percentage}%)
          </h2>
          <p className="text-xs sm:text-sm text-[#7E8494] max-w-md mx-auto mb-8 leading-relaxed font-medium">
            {percentage >= 70
              ? "Strong grasp! You have verified your prerequisite foundation for this topic."
              : percentage >= 40
              ? "Moderate understanding with some knowledge gaps. Try a teach-back session with Toby to cement the intuition."
              : "Significant prerequisite gap detected. We recommend reviewing previous dependency concepts before continuing."}
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleRestart}
              className="bg-[#F4F6FB] hover:bg-[#EAEFF8] text-[#181A20] text-xs font-bold py-2.5 px-5 rounded-full border border-[#E2E6F0] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Pick Another Topic</span>
            </button>
            <Link
              href="/student/teach-back"
              className="bg-[#FF642F] hover:bg-[#2554D4] text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-sm shadow-[#FF642F]/30 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Teach Toby 1-on-1</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full mx-auto mb-3 animate-spin border-2 border-[#FF642F] border-t-transparent" />
          <p className="text-xs font-bold text-[#8C93A4]">Loading adaptive question set…</p>
        </div>
      </div>
    );
  }

  // ── ACTIVE QUESTION SCREEN ──
  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-16 text-[#1C1E23] font-sans antialiased">
      {/* Top progress tracker */}
      <div className="bg-white rounded-2xl p-4 border border-[#E6EAF2] flex items-center justify-between">
        <span className="text-xs font-bold text-[#181A20]">
          Question {currentIndex + 1} of {questions?.length || 0}
        </span>
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-[#E5E9F2] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FF642F] transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / (questions?.length || 1)) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-[#FF642F] bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timer}s
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white p-7 sm:p-8 rounded-[28px] border border-[#E6EAF2] shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 py-0.5 px-2.5 rounded-full">
            {"⭐".repeat(currentQuestion.difficulty)} Level {currentQuestion.difficulty}
          </span>
          <span className="text-[10px] font-bold text-[#FF642F] bg-blue-50 py-0.5 px-2.5 rounded-full">
            {currentQuestion.type === "mcq" ? "Multiple Choice" : "True / False"}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-[#18181B] mb-6 leading-relaxed">
          {currentQuestion.question}
        </h2>

        {/* MCQ Options */}
        {currentQuestion.type === "mcq" && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, i) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = submitted && option === result?.correctAnswer;
              const isWrong = submitted && isSelected && !result?.correct;

              let border = "#E2E6F0";
              let bg = "#F8FAFD";

              if (isSelected && !submitted) {
                border = "#FF642F";
                bg = "#EBF3FE";
              }
              if (isCorrect) {
                border = "#10b981";
                bg = "#ecfdf5";
              }
              if (isWrong) {
                border = "#e11d48";
                bg = "#fff1f2";
              }

              return (
                <button
                  key={i}
                  onClick={() => !submitted && setSelectedAnswer(option)}
                  disabled={submitted}
                  className="w-full text-left p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-150 cursor-pointer shadow-2xs hover:border-[#FF642F]"
                  style={{ background: bg, border: `1.5px solid ${border}` }}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isSelected ? "bg-[#FF642F] text-white" : "bg-white border border-[#E2E6F0] text-[#7E8494]"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-xs sm:text-sm font-bold flex-1 text-[#181A20]">
                    {option}
                  </span>
                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {isWrong && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Metacognitive Reasoning Input: "What led you to this answer?" */}
        {!submitted && (
          <div className="mt-6 pt-5 border-t border-[#F0F3F8]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#181A20] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF642F]" />
                <span>What was your thinking? (Optional)</span>
              </label>
              <span className="text-[10px] text-[#7E8494] font-medium">
                Helps AI diagnose why you got it right or wrong
              </span>
            </div>

            {/* Quick Thought Starter Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {[
                "💡 Applied core formula",
                "🔍 Eliminated other options",
                "⚖️ Used physical intuition",
                "🎲 Educated guess",
                "❓ Confused between two options",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    const cleanChip = chip.replace(/^[^\s]+\s*/, "");
                    setStudentReasoning((prev) =>
                      prev ? `${prev}. ${cleanChip}` : `I ${cleanChip.toLowerCase()}`
                    );
                  }}
                  className="text-[10px] font-bold bg-[#F4F6FB] hover:bg-[#EAEFF8] text-[#555C6E] hover:text-[#181A20] px-2.5 py-1 rounded-full border border-[#E2E6F0] transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={studentReasoning}
              onChange={(e) => setStudentReasoning(e.target.value)}
              placeholder="What led you to pick this option? (e.g., 'I multiplied by 2 because the velocity doubled...')"
              className="w-full bg-[#F8FAFD] focus:bg-white text-xs text-[#181A20] placeholder-[#8C93A4] p-3 rounded-2xl border border-[#E2E6F0] focus:border-[#FF642F] outline-none transition-all resize-none"
            />
          </div>
        )}

        {/* Confidence Rating Slider */}
        {!submitted && (
          <div className="mt-4 pt-4 border-t border-[#F0F3F8]">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-[#7E8494]">Self-Rated Confidence</span>
              <span className="font-extrabold text-[#FF642F]">{confidence} / 5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-[#FF642F] h-2 bg-[#E5E9F2] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#8C93A4] font-semibold mt-1">
              <span>Guessing</span>
              <span>Certain</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Explanation & Metacognitive Thought Breakdown ── */}
      {submitted && result && (
        <div className="space-y-4">
          {/* Official Correctness Banner */}
          <div
            className={`p-5 rounded-[24px] border ${
              result.correct
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-rose-50 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {result.correct ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span className="font-bold text-xs">
                {result.correct ? "Correct answer!" : "Incorrect"}
              </span>
            </div>
            {result.explanation && (
              <p className="text-xs font-medium leading-relaxed m-0 opacity-90">
                {result.explanation}
              </p>
            )}
          </div>

          {/* AI Metacognitive Thought Breakdown Card */}
          {studentReasoning && (
            <div className="bg-white p-5 rounded-[24px] border border-[#E6EAF2] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#FFE4D6] text-[#FF642F] flex items-center justify-center text-xs font-bold">
                    🧠
                  </div>
                  <span className="text-xs font-black text-[#181A20]">
                    Your Thought Process Breakdown
                  </span>
                </div>
                {thoughtAnalysis?.thinkingQuality && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF3FE] text-[#FF642F] border border-[#D1E2FB]">
                    {thoughtAnalysis.thinkingQuality}
                  </span>
                )}
              </div>

              {/* What you said you were thinking */}
              <div className="bg-[#F8FAFD] p-3 rounded-xl border border-[#EAEFF8] text-xs text-[#555C6E]">
                <span className="font-bold text-[#181A20]">What you were thinking: </span>
                &ldquo;{studentReasoning}&rdquo;
              </div>

              {/* AI Diagnostic Feedback */}
              {isAnalyzingReasoning ? (
                <div className="flex items-center gap-2 text-xs text-[#8C93A4] py-1">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#FF642F] border-t-transparent animate-spin" />
                  <span>Analyzing what led to your answer…</span>
                </div>
              ) : thoughtAnalysis?.feedback ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#18181B] leading-relaxed m-0">
                    {thoughtAnalysis.feedback}
                  </p>
                  {thoughtAnalysis.keyInsight && (
                    <div className="text-[11px] font-semibold text-[#0284C7] bg-sky-50 p-2.5 rounded-xl border border-sky-100 flex items-start gap-1.5">
                      <span>💡</span>
                      <span>{thoughtAnalysis.keyInsight}</span>
                    </div>
                  )}
                  {thoughtAnalysis.tobyComment && (
                    <div className="text-[11px] font-semibold text-[#5A2C18] bg-[#FFE4D6]/60 p-2.5 rounded-xl border border-[#FFBFA8]/50 flex items-start gap-1.5">
                      <span>🤖 Toby says:</span>
                      <span>&ldquo;{thoughtAnalysis.tobyComment}&rdquo;</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Action CTA Button */}
      <div className="flex justify-end gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="bg-[#FF642F] hover:bg-[#2554D4] disabled:opacity-40 text-white text-xs font-bold py-3 px-6 rounded-full shadow-sm shadow-[#FF642F]/30 cursor-pointer transition-all"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="bg-[#FF642F] hover:bg-[#2554D4] text-white text-xs font-bold py-3 px-6 rounded-full shadow-sm shadow-[#FF642F]/30 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <span>{currentIndex + 1 < (questions?.length || 0) ? "Next Question" : "See Final Results"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
