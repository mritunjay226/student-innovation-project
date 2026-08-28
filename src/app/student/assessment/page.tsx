"use client";

import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Award,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Target,
  Layers,
  GraduationCap,
  BookOpen,
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

  const [selectedConcept, setSelectedConcept] =
    useState<Id<"concepts"> | null>(null);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    correctAnswer: string;
    explanation?: string;
  } | null>(null);
  const [scores, setScores] = useState<
    { correct: boolean; confidence: number }[]
  >([]);
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

    try {
      const res = await submitAttempt({
        studentId: userId,
        questionId: currentQuestion._id,
        answer: selectedAnswer,
        timeTaken: timer,
        confidence,
      });

      setResult(res);
      setScores((prev) => [...prev, { correct: res.correct, confidence }]);

      await updateMastery({
        studentId: userId,
        conceptId: currentQuestion.conceptId,
        correct: res.correct,
        confidence,
      });
    } catch (err) {
      console.error("Submit error:", err);
    }
  }, [
    selectedAnswer,
    currentQuestion,
    userId,
    timer,
    confidence,
    submitAttempt,
    updateMastery,
  ]);

  const handleNext = () => {
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setConfidence(3);
    setSubmitted(false);
    setResult(null);
    setTimer(0);
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setConfidence(3);
    setSubmitted(false);
    setResult(null);
    setScores([]);
    setTimer(0);
  };

  // ── CONCEPT SELECTION ──
  if (!started) {
    return (
      <div className="max-w-5xl mx-auto pb-8">
        <div className="mb-6 animate-fade-in-up">
          <div className="pill-chip chip-butter mb-2 text-xs font-bold py-1 px-3">
            <Target className="w-3.5 h-3.5" />
            <span>Multi-Subject Adaptive Diagnostic Quizzes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#18181B] mb-1">
            Diagnostic Assessments
          </h1>
          <p className="text-sm text-[#71717A] font-medium">
            Select a concept in Mathematics, Physics, or Chemistry to run an adaptive check
          </p>
        </div>

        {/* Filters */}
        <div className="card-pastel card-white p-3.5 rounded-2xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fade-in-up delay-1 border border-[#EBE5DB]">
          {/* Subject Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[#71717A] mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Subject:
            </span>
            {SUBJECTS.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`pill-chip text-xs py-1 px-3 font-semibold ${
                  selectedSubject === subj ? "chip-dark font-bold" : "chip-white"
                }`}
              >
                <BookOpen className="w-3 h-3" /> {subj}
              </button>
            ))}
          </div>

          {/* Standard Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[#71717A] mr-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Standard:
            </span>
            {GRADES.map((grd) => (
              <button
                key={grd}
                onClick={() => setSelectedGrade(grd)}
                className={`pill-chip text-xs py-1 px-2.5 font-semibold ${
                  selectedGrade === grd ? "chip-butter font-bold" : "chip-white"
                }`}
              >
                {grd}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up delay-2">
          {concepts?.map((concept, idx) => (
            <button
              key={concept._id}
              onClick={() => {
                setSelectedConcept(concept._id);
                setStarted(true);
              }}
              className="card-pastel card-white p-5 text-left cursor-pointer transition-all hover:shadow-md hover:border-[#18181B] group rounded-2xl border border-[#EBE5DB] relative overflow-hidden"
            >
              {/* Background 2D Illustration Art */}
              <div className="absolute -right-2 -bottom-2 opacity-25 group-hover:opacity-50 transition-all duration-300 pointer-events-none">
                {getChapterIllustration(concept.subject, idx, "w-32 h-32")}
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="pill-chip chip-lavender text-[10px] font-bold py-0.5 px-2">
                        <BookOpen className="w-2.5 h-2.5" /> {concept.subject} • {concept.grade}
                      </span>
                      <span className="text-[10px] font-bold text-[#71717A]">
                        Level {concept.difficulty}
                      </span>
                    </div>
                    <h3 className="font-black text-base text-[#18181B] group-hover:underline">
                      {concept.title}
                    </h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#121216] text-white flex items-center justify-center group-hover:scale-105 transition-all shadow-xs shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xs text-[#71717A] font-medium leading-relaxed m-0 max-w-[85%]">
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
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <div className="glass-card p-8 md:p-10 text-center rounded-3xl">
          <div
            className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-md"
            style={{
              background:
                percentage >= 70
                  ? "#ecfdf5"
                  : percentage >= 40
                    ? "#fffbeb"
                    : "#fff1f2",
              border: `2px solid ${
                percentage >= 70
                  ? "#a7f3d0"
                  : percentage >= 40
                    ? "#fde68a"
                    : "#fecdd3"
              }`,
            }}
          >
            {percentage >= 70 ? "🎉" : percentage >= 40 ? "💡" : "🔍"}
          </div>

          <span className="badge badge-purple mb-3">Diagnostic Complete</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-1">
            {correct} of {total} Correct ({percentage}%)
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed font-medium">
            {percentage >= 70
              ? "Strong grasp! You have verified your prerequisite foundation for this topic."
              : percentage >= 40
                ? "Moderate understanding with some knowledge gaps. Try a teach-back session with Toby to cement the intuition."
                : "Significant prerequisite gap detected. We recommend reviewing previous dependency concepts before continuing."}
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={handleRestart} className="btn-pill-secondary">
              <RotateCcw className="w-4 h-4" /> Pick Another Topic
            </button>
            <Link href="/student/teach-back" className="btn-pill-primary">
              <Sparkles className="w-4 h-4" /> Teach Toby 1-on-1
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-2xl mx-auto mb-3 animate-spin border-3 border-purple-600 border-t-transparent" />
          <p className="text-sm text-slate-500 font-bold">Loading adaptive question set...</p>
        </div>
      </div>
    );
  }

  // ── ACTIVE QUESTION SCREEN ──
  return (
    <div className="max-w-3xl mx-auto">
      {/* Top progress tracker */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-extrabold text-slate-700">
            Question {currentIndex + 1} of {questions?.length || 0}
          </span>
          <span className="font-mono flex items-center gap-1 font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
            <Clock className="w-3.5 h-3.5" />
            {timer}s
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${((currentIndex + 1) / (questions?.length || 1)) * 100}%`,
              background: "var(--accent-gradient)",
            }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-card p-8 rounded-3xl mb-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge badge-purple">
            {"⭐".repeat(currentQuestion.difficulty)} Difficulty {currentQuestion.difficulty}
          </span>
          <span className="badge badge-info">
            {currentQuestion.type === "mcq" ? "Multiple Choice" : "True / False"}
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mb-6 leading-snug">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        {currentQuestion.type === "mcq" && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, i) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = submitted && option === result?.correctAnswer;
              const isWrong = submitted && isSelected && !result?.correct;

              let border = "#e2e8f0";
              let bg = "#f8fafc";
              let textColor = "text-slate-900";

              if (isSelected && !submitted) {
                border = "#7c3aed";
                bg = "#f3f0ff";
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
                  className="w-full text-left p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-150 cursor-pointer shadow-sm hover:border-purple-300"
                  style={{ background: bg, border: `1.5px solid ${border}` }}
                >
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                    style={{
                      background: isSelected ? "#7c3aed" : "#ffffff",
                      color: isSelected ? "#ffffff" : "#64748b",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={`text-sm font-bold flex-1 ${textColor}`}>
                    {option}
                  </span>
                  {isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {isWrong && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* True / False */}
        {currentQuestion.type === "true_false" && (
          <div className="flex gap-4">
            {["true", "false"].map((val) => {
              const isSelected = selectedAnswer === val;
              const isCorrect = submitted && val === result?.correctAnswer;
              const isWrong = submitted && isSelected && !result?.correct;

              let border = "#e2e8f0";
              let bg = "#f8fafc";

              if (isSelected && !submitted) {
                border = "#7c3aed";
                bg = "#f3f0ff";
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
                  key={val}
                  onClick={() => !submitted && setSelectedAnswer(val)}
                  disabled={submitted}
                  className="flex-1 p-5 rounded-2xl text-center font-extrabold text-base transition-all cursor-pointer text-slate-900 shadow-sm"
                  style={{ background: bg, border: `1.5px solid ${border}` }}
                >
                  {val === "true" ? "✓ True" : "✗ False"}
                </button>
              );
            })}
          </div>
        )}

        {/* Confidence rating slider */}
        {!submitted && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-slate-700">Self-Rated Confidence</span>
              <span className="font-extrabold text-purple-600">{confidence} / 5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-1">
              <span>Guessing</span>
              <span>Certain</span>
            </div>
          </div>
        )}
      </div>

      {/* Explanation Banner */}
      {submitted && result && (
        <div
          className="p-5 rounded-3xl mb-6 animate-fade-in-up"
          style={{
            background: result.correct ? "#ecfdf5" : "#fff1f2",
            border: `1.5px solid ${result.correct ? "#a7f3d0" : "#fecdd3"}`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            {result.correct ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            )}
            <span className="font-extrabold text-sm" style={{ color: result.correct ? "#059669" : "#e11d48" }}>
              {result.correct ? "Correct reasoning!" : "Incorrect"}
            </span>
          </div>
          {result.explanation && (
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {result.explanation}
            </p>
          )}
        </div>
      )}

      {/* Action CTA */}
      <div className="flex justify-end gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="btn-pill-primary"
            style={{ opacity: selectedAnswer ? 1 : 0.5 }}
          >
            Submit Answer
          </button>
        ) : (
          <button onClick={handleNext} className="btn-pill-primary">
            {currentIndex + 1 < (questions?.length || 0) ? "Next Question" : "See Final Results"}{" "}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
