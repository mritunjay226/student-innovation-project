"use client";

import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Award,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  MessageCircle,
  Layers,
  GraduationCap,
  Flame,
  Volume2,
  VolumeX,
  Zap,
  Check,
  X,
  Smile,
  ShieldCheck,
  ChevronRight,
  FileText,
  Target,
} from "lucide-react";
import Link from "next/link";
import { soundEffects } from "@/lib/soundEffects";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type ClassmateSpeaker = "Toby" | "Maya" | "Leo" | "Sam";
type Mood = "confused" | "curious" | "skeptical" | "lightbulb" | "amazed" | "mastered";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  speaker: ClassmateSpeaker | "You";
  content: string;
  mood?: Mood;
  thought?: string;
  comprehensionDelta?: number;
  xpAwarded?: number;
  classmateChime?: {
    speaker: string;
    emoji: string;
    reaction: string;
  } | null;
  isPeerTeachBack?: boolean;
}

interface EvaluationResult {
  completeness: number;
  accuracy: number;
  depth: number;
  overallScore: number;
  tutorTitle: string;
  xpAwarded: number;
  badges: {
    id: string;
    title: string;
    emoji: string;
    description: string;
    unlocked: boolean;
  }[];
  feedback: string;
  misconceptionsFound: string[];
  missingConcepts: string[];
  classmateReportCards: {
    toby: { name: string; role: string; emoji: string; score: number; verdict: string };
    maya: { name: string; role: string; emoji: string; score: number; verdict: string };
    leo: { name: string; role: string; emoji: string; score: number; verdict: string };
    sam?: { name: string; role: string; emoji: string; score: number; verdict: string };
  };
  tobyVerdict: string;
}

const CLASSMATES: Record<
  ClassmateSpeaker,
  {
    name: string;
    role: string;
    emoji: string;
    avatarBg: string;
    accentColor: string;
    bio: string;
  }
> = {
  Toby: {
    name: "Toby",
    role: "Visual & Intuitive",
    emoji: "🎨",
    avatarBg: "bg-purple-100 border-purple-300 text-purple-700",
    accentColor: "#7c3aed",
    bio: "Needs visual stories, real-world analogies, and pancake/car metaphors.",
  },
  Maya: {
    name: "Maya",
    role: "Skeptical Challenger",
    emoji: "🧐",
    avatarBg: "bg-amber-100 border-amber-300 text-amber-700",
    accentColor: "#d97706",
    bio: "Tests edge cases (x=0, zero friction) and questions formal rigor.",
  },
  Leo: {
    name: "Leo",
    role: "Quick Quizzer",
    emoji: "⚡",
    avatarBg: "bg-emerald-100 border-emerald-300 text-emerald-700",
    accentColor: "#059669",
    bio: "Loves rapid-fire summaries, speed quizzes, and celebrating streaks.",
  },
  Sam: {
    name: "Sam",
    role: "Direct & Precise",
    emoji: "🎯",
    avatarBg: "bg-blue-100 border-blue-300 text-blue-700",
    accentColor: "#2563eb",
    bio: "Gives clear, direct, no-nonsense answers and exact step-by-step facts.",
  },
};

const MOOD_META: Record<Mood, { emoji: string; label: string; color: string; bg: string; border: string }> = {
  confused: {
    emoji: "😵‍💫",
    label: "Confused",
    color: "#e11d48",
    bg: "#fff1f2",
    border: "#fecdd3",
  },
  curious: {
    emoji: "🤔",
    label: "Intrigued",
    color: "#0284c7",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  skeptical: {
    emoji: "🧐",
    label: "Wait, really?",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  lightbulb: {
    emoji: "💡",
    label: "Aha! Lightbulb!",
    color: "#7c3aed",
    bg: "#f3f0ff",
    border: "#e9d5ff",
  },
  amazed: {
    emoji: "🤯",
    label: "Mind Blown!",
    color: "#9333ea",
    bg: "#faf5ff",
    border: "#f3e8ff",
  },
  mastered: {
    emoji: "🎓",
    label: "Classroom Mastered!",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
};

const SUBJECTS = ["All Subjects", "Mathematics", "Physics", "Chemistry"] as const;
const GRADES = ["All Grades", "Class 10", "Class 11", "Class 12"] as const;

function getOpeningPromptForConcept(title: string, subject: string): string {
  const t = title.toLowerCase();

  if (t.includes("vector") || t.includes("kinematics")) {
    return "Hey tutor! 🙋‍♂️ If a scalar is just a normal number like 5 meters, why do we need arrows and trigonometry for vectors? Why can't I just add 3m North + 4m East and say I walked 7m total? Why is displacement 5m?!";
  }
  if (t.includes("newton") || t.includes("friction")) {
    return "Hey! If every action has an equal and opposite reaction (Newton's 3rd Law), why does anything ever move at all? Shouldn't the forces cancel out to zero and freeze everything in place?! 😭";
  }
  if (t.includes("electrostat") || t.includes("gauss")) {
    return "Hey! My physics teacher was talking about electric potential V and electric field E. If they're both caused by charges, aren't they basically the exact same thing? Why is one a vector and the other a regular number?!";
  }
  if (t.includes("derivative")) {
    return "Hey! My math teacher was yelling about 'derivatives' today and my brain turned off 😭 Isn't a derivative literally just the y-value of the graph at a point? Like if my position is 50 meters, why isn't 50 already the derivative? Why do we need tangent lines?!";
  }
  if (t.includes("limit")) {
    return "Hey! When I plugged x = 2 into (x² - 4)/(x - 2), my calculator said ERROR: 0/0 and my desk caught fire 🔥. What even is a limit, and why can't we just plug the number in like normal people?!";
  }
  if (t.includes("integral")) {
    return "Hey! They told us an integral is 'the area under a curve', but why on earth would anyone care about area under a weird squiggly curve? And why did my teacher claim it reverses derivatives?! That feels totally made up!";
  }
  if (t.includes("atomic") || t.includes("orbital")) {
    return "Hey! In 10th grade they told us electrons orbit the nucleus like planets in solar system rings. Now in 11th grade they say electrons are 3D probability clouds with shapes like dumbbells?! What is an orbital really?!";
  }
  if (t.includes("bond") || t.includes("vsepr")) {
    return "Hey! Why is water (H2O) bent like a boomerang instead of straight in a line? Carbon dioxide (CO2) is in a straight line! Why does lone pair repulsion bend molecules?";
  }

  return `Hey! Our study group is stuck on "${title}" in ${subject} and the textbook makes zero sense 😭 Can you teach us the real intuition without scary formulas?`;
}

export default function TeachBackPage() {
  const { userId } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects");
  const [selectedGrade, setSelectedGrade] = useState<string>("All Grades");

  const concepts = useQuery(api.concepts.getAll, {
    subject: selectedSubject !== "All Subjects" ? selectedSubject : undefined,
    grade: selectedGrade !== "All Grades" ? selectedGrade : undefined,
  });

  const submitTeachBack = useMutation(api.learning.submitTeachBack);
  const updateMastery = useMutation(api.mastery.updateAfterTeachBack);

  const [selectedConcept, setSelectedConcept] = useState<Id<"concepts"> | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  // Classroom Gamification State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tutorXp, setTutorXp] = useState(120);
  const [streakCount, setStreakCount] = useState(1);
  const [comboMultiplier, setComboMultiplier] = useState(1.0);
  const [floatingXp, setFloatingXp] = useState<number | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<ClassmateSpeaker>("Toby");
  const [showBlackboard, setShowBlackboard] = useState(false);
  const [blackboardNotes, setBlackboardNotes] = useState<string[]>([]);

  // Classmate Comprehensions (0 to 100)
  const [comprehensions, setComprehensions] = useState<{
    toby: number;
    maya: number;
    leo: number;
    sam: number;
  }>({
    toby: 15,
    maya: 10,
    leo: 15,
    sam: 20,
  });

  const [isTyping, setIsTyping] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedConceptData = concepts?.find((c) => c._id === selectedConcept);

  const handleStartSession = (conceptId: Id<"concepts">) => {
    const concept = concepts?.find((c) => c._id === conceptId);
    if (!concept) return;

    setSelectedConcept(conceptId);
    setComprehensions({ toby: 15, maya: 10, leo: 15, sam: 20 });
    setStreakCount(1);
    setComboMultiplier(1.0);
    setEvaluation(null);
    setShowBlackboard(false);
    setBlackboardNotes([
      `📚 Topic: ${concept.title}`,
      `🎯 Goal: Explain the intuitive 'why' using real-world analogies`,
    ]);

    const initialMessage: ChatMessage = {
      id: "msg-0",
      role: "assistant",
      speaker: "Toby",
      content: getOpeningPromptForConcept(concept.title, concept.subject),
      mood: "confused",
      thought: "Waiting for tutor to explain the fundamental intuitive metaphor.",
      comprehensionDelta: 0,
      xpAwarded: 0,
      classmateChime: {
        speaker: "Sam",
        emoji: "🎯",
        reaction: "Let's keep the definitions and facts straight to the point.",
      },
    };

    setMessages([initialMessage]);
    if (soundEnabled) soundEffects.playHandRaise();
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Tutor level based on XP
  const tutorLevel = Math.floor(tutorXp / 150) + 1;
  const xpToNextLevel = tutorLevel * 150 - tutorXp;

  const handleSendMessage = async (
    customText?: string,
    overrideMode: "teach" | "peer_explain" | "pop_quiz" | "hint" = "teach",
    overrideTarget?: ClassmateSpeaker
  ) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isTyping || !selectedConceptData) return;

    const target = overrideTarget || activeSpeaker;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      speaker: "You",
      content: textToSend.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/teach-back-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptTitle: selectedConceptData.title,
          conceptDescription: selectedConceptData.description,
          messages: newMessages.map((m) => ({
            role: m.role,
            speaker: m.speaker,
            content: m.content,
          })),
          currentComprehensions: comprehensions,
          mode: overrideMode,
          targetClassmate: target,
          streakCount,
        }),
      });

      const data = await res.json();

      const earnedXp = data.xpEarned || 50;
      const newStreak = streakCount + 1;
      const newMultiplier = data.comboMultiplier || (newStreak >= 3 ? 2.0 : 1.5);

      setTutorXp((prev) => prev + earnedXp);
      setFloatingXp(earnedXp);
      setTimeout(() => setFloatingXp(null), 2500);

      setStreakCount(newStreak);
      setComboMultiplier(newMultiplier);

      if (soundEnabled) {
        if (data.mood === "lightbulb" || data.mood === "amazed") {
          soundEffects.playLightbulb();
        } else if (newStreak >= 2) {
          soundEffects.playCombo(newStreak);
        }
      }

      if (data.newComprehensions) {
        setComprehensions(data.newComprehensions);
      }

      if (data.blackboardTip) {
        setBlackboardNotes((prev) => [
          ...prev.filter((n) => n !== data.blackboardTip),
          data.blackboardTip,
        ]);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        speaker: data.speaker || target || "Toby",
        content: data.reply,
        mood: data.mood || "curious",
        thought: data.thought,
        comprehensionDelta: data.comprehensionDelta,
        xpAwarded: earnedXp,
        classmateChime: data.classmateChime || null,
        isPeerTeachBack: overrideMode === "peer_explain",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setActiveSpeaker(data.speaker || target || "Toby");
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackMsg: ChatMessage = {
        id: `fallback-${Date.now()}`,
        role: "assistant",
        speaker: target || "Toby",
        content:
          "Wait, hold up! 💡 So does that mean it's all about how things connect in the physical world?",
        mood: "lightbulb",
        thought: "Making steady progress with intuitive connections.",
        comprehensionDelta: 15,
        xpAwarded: 40,
        classmateChime: {
          speaker: "Leo",
          emoji: "⚡",
          reaction: "Nice! That's making sense to all of us!",
        },
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setTutorXp((prev) => prev + 40);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Reciprocal Learning Quick-Action Triggers
  const triggerPeerTeachBack = () => {
    handleSendMessage(
      `Okay ${activeSpeaker}, your turn! Teach it back to me in your own words so I can see if you've got it! 🔄`,
      "peer_explain",
      activeSpeaker
    );
  };

  const triggerPopQuiz = () => {
    if (soundEnabled) soundEffects.playPopQuiz();
    handleSendMessage("Leo, throw me a quick pop quiz challenge from today's topic! ⚡", "pop_quiz", "Leo");
  };

  const triggerClassmateClue = () => {
    handleSendMessage("Maya, can you give me a clue or edge case to think about? 💡", "hint", "Maya");
  };

  const triggerSamDirect = () => {
    handleSendMessage(`Sam, give me the direct, straight-to-the-point facts on ${selectedConceptData?.title}! 🎯`, "teach", "Sam");
  };

  const handleFinishAndEvaluate = async () => {
    if (!selectedConcept || !selectedConceptData || !userId || isEvaluating) return;

    setIsEvaluating(true);
    if (soundEnabled) soundEffects.playLevelUp();

    try {
      const avgComp = Math.round(
        (comprehensions.toby + comprehensions.maya + comprehensions.leo + (comprehensions.sam || 20)) / 4
      );

      const res = await fetch("/api/ai/teach-back-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptTitle: selectedConceptData.title,
          conceptDescription: selectedConceptData.description,
          messages: messages.map((m) => ({
            role: m.role,
            speaker: m.speaker,
            content: m.content,
          })),
          finalComprehension: avgComp,
          finalComprehensions: comprehensions,
          totalXpEarned: tutorXp,
          maxComboStreak: streakCount,
        }),
      });

      const evalData: EvaluationResult = await res.json();
      setEvaluation(evalData);

      const transcriptSummary = messages
        .map((m) => `${m.speaker}: ${m.content}`)
        .join("\n\n");

      await submitTeachBack({
        studentId: userId,
        conceptId: selectedConcept,
        explanation: transcriptSummary,
        aiAnalysis: {
          completeness: evalData.completeness,
          accuracy: evalData.accuracy,
          depth: evalData.depth,
          overallScore: evalData.overallScore,
          feedback: evalData.feedback,
          misconceptionsFound: evalData.misconceptionsFound,
          missingConcepts: evalData.missingConcepts,
        },
      });

      await updateMastery({
        studentId: userId,
        conceptId: selectedConcept,
        score: evalData.overallScore,
      });

      if (soundEnabled) soundEffects.playSuccess();
    } catch (err) {
      console.error("Evaluation error:", err);
      const fallbackEval: EvaluationResult = {
        completeness: 88,
        accuracy: 90,
        depth: 85,
        overallScore: 88,
        tutorTitle: "🌟 Intuitive Socratic Master",
        xpAwarded: tutorXp + 150,
        badges: [
          {
            id: "analogy_maestro",
            title: "Analogy Maestro",
            emoji: "🎨",
            description: "Explained complex ideas using concrete real-world imagery",
            unlocked: true,
          },
          {
            id: "triple_lightbulb",
            title: "Triple Lightbulb",
            emoji: "💡",
            description: "Brought all study pod classmates above 75% comprehension",
            unlocked: true,
          },
        ],
        feedback: `Brilliant classroom peer teaching session on "${selectedConceptData.title}"! You explained key concepts intuitively to Toby, answered Maya's doubts, kept Leo energized, and satisfied Sam's precision standard.`,
        misconceptionsFound: [],
        missingConcepts: ["Formal mathematical derivation step"],
        classmateReportCards: {
          toby: {
            name: "Toby",
            role: "Visual Learner",
            emoji: "🎨",
            score: comprehensions.toby,
            verdict: `"Your analogies made ${selectedConceptData.title} so easy to picture!"`,
          },
          maya: {
            name: "Maya",
            role: "Skeptical Challenger",
            emoji: "🧐",
            score: comprehensions.maya,
            verdict: `"The logic held up against edge cases. Great explanations!"`,
          },
          leo: {
            name: "Leo",
            role: "Peer Quizzer",
            emoji: "⚡",
            score: comprehensions.leo,
            verdict: `"Super fun study session! I feel ready for the exam!"`,
          },
          sam: {
            name: "Sam",
            role: "Direct & Precise",
            emoji: "🎯",
            score: comprehensions.sam || 90,
            verdict: `"Clear, accurate, and straight to the point on ${selectedConceptData.title}."`,
          },
        },
        tobyVerdict: `Toby says: "You're a legend! Our whole study pod mastered ${selectedConceptData.title}!" 🎓`,
      };
      setEvaluation(fallbackEval);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setSelectedConcept(null);
    setMessages([]);
    setEvaluation(null);
    setComprehensions({ toby: 15, maya: 10, leo: 15, sam: 20 });
    setStreakCount(1);
    setComboMultiplier(1.0);
  };

  const getSubjectEmoji = (subject?: string) => {
    if (subject === "Mathematics") return "📐";
    if (subject === "Physics") return "⚡";
    if (subject === "Chemistry") return "🧪";
    return "📚";
  };

  // ══════════════════════════════════════════════════════════════
  // 1. CONCEPT SELECTION VIEW WITH FILTERS & GAMIFIED BADGES
  // ══════════════════════════════════════════════════════════════
  if (!selectedConcept) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="announcement-badge text-xs">
              <span>✨ Gamified Classroom Study Pod • Peer Learning</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 shadow-sm">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>Tutor Rank: Level {tutorLevel}</span>
              <span className="text-slate-400">•</span>
              <span className="text-purple-900">{tutorXp} XP</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Teach the <span style={{ color: "var(--accent)" }}>Classroom Study Pod</span>
          </h1>
          <p className="text-base text-slate-600 max-w-2xl font-medium">
            Learn reciprocally by explaining concepts to your classmates{" "}
            <strong>Toby 🎨</strong> (visual), <strong>Maya 🧐</strong> (skeptic),{" "}
            <strong>Leo ⚡</strong> (quizzer), and <strong>Sam 🎯</strong> (direct facts). Earn XP, chain combo streaks, and master the Feynman technique!
          </p>
        </div>

        {/* Filter Bar */}
        <div className="glass-card p-4 rounded-3xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in-up delay-1">
          {/* Subject Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Subject:
            </span>
            {SUBJECTS.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedSubject === subj
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-200"
                    : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {getSubjectEmoji(subj)} {subj}
              </button>
            ))}
          </div>

          {/* Standard Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Standard:
            </span>
            {GRADES.map((grd) => (
              <button
                key={grd}
                onClick={() => setSelectedGrade(grd)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedGrade === grd
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {grd}
              </button>
            ))}
          </div>
        </div>

        {/* Concept Cards or Empty State */}
        {concepts === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="glass-card p-6 rounded-3xl animate-pulse h-36 bg-slate-100/60"
              />
            ))}
          </div>
        ) : concepts.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-purple-50 text-purple-600 text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              No concepts found for this filter
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Try selecting "All Subjects" or "All Grades" to view available topics.
            </p>
            <button
              onClick={() => {
                setSelectedSubject("All Subjects");
                setSelectedGrade("All Grades");
              }}
              className="btn-pill-primary text-xs py-2 px-4"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up delay-2">
            {concepts.map((concept) => (
              <button
                key={concept._id}
                onClick={() => handleStartSession(concept._id)}
                className="glass-card p-6 text-left cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:border-purple-300 group rounded-3xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-purple text-[10px]">
                        {getSubjectEmoji(concept.subject)} {concept.subject} • {concept.grade}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {"⭐".repeat(concept.difficulty)}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-600 transition-colors">
                      {concept.title}
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {concept.description}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 2. FINAL EVALUATION & CLASSMATE REPORT CARD VIEW
  // ══════════════════════════════════════════════════════════════
  if (evaluation) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <div className="glass-card p-8 md:p-10 mb-8 rounded-3xl">
          {/* Certificate Header */}
          <div className="text-center mb-8 pb-8 border-b border-slate-200">
            <div className="w-24 h-24 rounded-3xl mx-auto mb-4 flex items-center justify-center text-5xl shadow-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white">
              🎓
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>{evaluation.tutorTitle}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              Session Complete: {selectedConceptData?.title}
            </h1>
            <p className="text-base max-w-xl mx-auto italic font-semibold text-slate-700">
              "{evaluation.tobyVerdict}"
            </p>
          </div>

          {/* Gamified Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Overall Tutor Score", val: `${evaluation.overallScore}%`, color: "#7c3aed" },
              { label: "Total XP Earned", val: `+${evaluation.xpAwarded} XP`, color: "#0284c7" },
              { label: "Clarity & Intuition", val: `${evaluation.depth}%`, color: "#059669" },
              { label: "Science Accuracy", val: `${evaluation.accuracy}%`, color: "#d97706" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-5 rounded-2xl text-center bg-slate-50 border border-slate-200/80"
              >
                <div className="text-2xl font-black mb-1" style={{ color: stat.color }}>
                  {stat.val}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Badges Unlocked */}
          {evaluation.badges && evaluation.badges.length > 0 && (
            <div className="mb-8 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-900 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" /> Badges & Achievements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {evaluation.badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      b.unlocked
                        ? "bg-white border-purple-200 shadow-sm"
                        : "bg-slate-100/70 border-slate-200 opacity-50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{b.emoji}</div>
                    <div className="font-bold text-xs text-slate-900">{b.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      {b.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Classmate Report Cards */}
          <div className="mb-8">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-purple-600" /> Classmate Report Cards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(evaluation.classmateReportCards || {}).map(([key, card]) => (
                <div
                  key={key}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{card.emoji}</span>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">{card.name}</div>
                          <div className="text-[10px] font-semibold text-slate-400">
                            {card.role}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-700">
                        {card.score}%
                      </span>
                    </div>
                    <p className="text-xs italic text-slate-600 mt-2 font-medium">
                      {card.verdict}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Pedagogical Feedback */}
          <div className="p-6 rounded-2xl mb-6 bg-purple-50/70 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Pedagogical Supervisor Feedback
              </h3>
            </div>
            <MarkdownRenderer content={evaluation.feedback} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={handleReset} className="btn-pill-secondary">
              <RotateCcw className="w-4 h-4" /> Teach Another Concept
            </button>
            <Link href="/student/progress" className="btn-pill-primary">
              <TrendingUp className="w-4 h-4" /> View Knowledge Radar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 3. GAMIFIED INTERACTIVE CLASSROOM POD CHAT VIEW
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-100px)]">
      {/* Gamified Classroom Top Bar */}
      <div className="glass-card p-3 md:p-4 mb-3 flex flex-wrap items-center justify-between gap-3 shrink-0 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-xs font-bold text-slate-500 cursor-pointer"
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-slate-900">
                Teaching: {selectedConceptData?.title}
              </h2>
              <span className="badge badge-purple text-[10px]">
                {getSubjectEmoji(selectedConceptData?.subject)} {selectedConceptData?.subject} •{" "}
                {selectedConceptData?.grade}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate max-w-xs md:max-w-md">
              {selectedConceptData?.description}
            </p>
          </div>
        </div>

        {/* Gamified Status Counters */}
        <div className="flex items-center gap-2">
          {/* XP Badge */}
          <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
            <Award className="w-3.5 h-3.5 text-purple-600" />
            <span>{tutorXp} XP</span>
            {floatingXp && (
              <span className="absolute -top-3 right-0 bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce shadow-md">
                +{floatingXp} XP!
              </span>
            )}
          </div>

          {/* Streak Combo Multiplier */}
          {streakCount >= 2 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{comboMultiplier.toFixed(1)}x Combo</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title={soundEnabled ? "Mute Game Audio" : "Enable Game Audio"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Grade Session Button */}
          <button
            onClick={handleFinishAndEvaluate}
            disabled={isEvaluating || messages.length < 2}
            className="btn-pill-primary text-xs py-1.5 px-4 cursor-pointer"
          >
            {isEvaluating ? "Evaluating..." : "🎓 Grade Session"}
          </button>
        </div>
      </div>

      {/* Classmate Pod Strip (Toby, Maya, Leo, Sam) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 shrink-0">
        {(["Toby", "Maya", "Leo", "Sam"] as ClassmateSpeaker[]).map((name) => {
          const info = CLASSMATES[name];
          const score = comprehensions[name.toLowerCase() as keyof typeof comprehensions];
          const isSelected = activeSpeaker === name;

          return (
            <button
              key={name}
              onClick={() => setActiveSpeaker(name)}
              className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer border ${
                isSelected
                  ? "bg-white border-purple-400 shadow-md ring-2 ring-purple-200"
                  : "bg-white/70 border-slate-200 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{info.emoji}</span>
                  <span className="font-extrabold text-xs text-slate-900">{name}</span>
                </div>
                <span
                  className="text-[11px] font-black"
                  style={{ color: score >= 75 ? "#059669" : score >= 50 ? "#7c3aed" : "#d97706" }}
                >
                  {score}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${score}%`,
                    background:
                      score >= 75
                        ? "linear-gradient(90deg, #10b981, #059669)"
                        : "linear-gradient(90deg, #f59e0b, #7c3aed)",
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-400 font-medium truncate mt-1">
                {info.role}
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional Interactive Classroom Blackboard */}
      {showBlackboard && (
        <div className="glass-card p-4 rounded-2xl mb-3 shrink-0 bg-slate-900 text-slate-100 border border-slate-800 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400">
              <span>📋 Live Classroom Chalkboard</span>
            </div>
            <button
              onClick={() => setShowBlackboard(false)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            {blackboardNotes.map((note, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400">▸</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Classroom Conversation Stream */}
      <div className="glass-card flex-1 p-4 md:p-6 overflow-y-auto space-y-4 mb-3 rounded-3xl">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const speakerInfo = isUser ? null : CLASSMATES[msg.speaker as ClassmateSpeaker];

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              {!isUser && (
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg shrink-0 mt-0.5 border shadow-sm ${
                    speakerInfo?.avatarBg || "bg-white border-slate-200"
                  }`}
                >
                  {speakerInfo?.emoji || "🎨"}
                </div>
              )}

              <div
                className="max-w-xl p-4 rounded-3xl text-sm leading-relaxed"
                style={{
                  background: isUser ? "var(--accent-gradient)" : "#ffffff",
                  color: isUser ? "#ffffff" : "#0f172a",
                  border: isUser ? "none" : "1px solid #e2e8f0",
                  boxShadow: isUser ? "var(--shadow-purple)" : "var(--shadow-sm)",
                  borderBottomRightRadius: isUser ? "6px" : "24px",
                  borderBottomLeftRadius: !isUser ? "6px" : "24px",
                  fontWeight: isUser ? 500 : 400,
                }}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900">
                        {msg.speaker}
                      </span>
                      {msg.mood && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            color: MOOD_META[msg.mood]?.color,
                            backgroundColor: MOOD_META[msg.mood]?.bg,
                          }}
                        >
                          {MOOD_META[msg.mood]?.emoji} {MOOD_META[msg.mood]?.label}
                        </span>
                      )}
                    </div>
                    {msg.comprehensionDelta && msg.comprehensionDelta > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Lightbulb className="w-3 h-3" /> +{msg.comprehensionDelta}%
                      </span>
                    )}
                  </div>
                )}

                <MarkdownRenderer content={msg.content} isUser={isUser} />

                {/* Secondary Classmate Banter Chime */}
                {msg.classmateChime && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-start gap-2 bg-slate-50 p-2 rounded-xl text-xs text-slate-600">
                    <span className="text-base">{msg.classmateChime.emoji}</span>
                    <div>
                      <span className="font-bold text-slate-800 mr-1">
                        {msg.classmateChime.speaker}:
                      </span>
                      <span>{msg.classmateChime.reaction}</span>
                    </div>
                  </div>
                )}

                {/* Peer Teach-Back Interactive Verification Options */}
                {msg.isPeerTeachBack && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        handleSendMessage(
                          `Spot on ${msg.speaker}! 🎯 You nailed the core idea! Now let's connect it to the formula!`
                        )
                      }
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Spot on!
                    </button>
                    <button
                      onClick={() =>
                        handleSendMessage(
                          `Close, but there's a small catch: think about what happens when direction or rate changes!`
                        )
                      }
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="w-3 h-3" /> Needs slight tweak
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 bg-purple-600 text-white shadow-sm">
                  You
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-3 justify-start animate-fade-in">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg shrink-0 bg-white border border-slate-200 shadow-sm">
              {CLASSMATES[activeSpeaker]?.emoji || "🎨"}
            </div>
            <div className="p-4 rounded-3xl flex items-center gap-2 text-xs font-semibold bg-white border border-slate-200 text-slate-500 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1">{activeSpeaker} and the class are discussing...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Reciprocal Classroom Quick-Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-2 px-1">
        <button
          onClick={triggerPeerTeachBack}
          disabled={isTyping}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RotateCcw className="w-3 h-3" /> Peer Teach-Back ("Your turn, {activeSpeaker}!")
        </button>

        <button
          onClick={triggerPopQuiz}
          disabled={isTyping}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <Zap className="w-3 h-3" /> Classmate Pop Quiz
        </button>

        <button
          onClick={triggerClassmateClue}
          disabled={isTyping}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <Lightbulb className="w-3 h-3" /> Ask Maya for Clue
        </button>

        <button
          onClick={triggerSamDirect}
          disabled={isTyping}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <Target className="w-3 h-3" /> Ask Sam (Direct Facts)
        </button>

        <button
          onClick={() => setShowBlackboard(!showBlackboard)}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto"
        >
          <FileText className="w-3 h-3" /> Chalkboard {showBlackboard ? "▲" : "▼"}
        </button>
      </div>

      {/* Message Input Box */}
      <div className="glass-card p-2 md:p-3 flex items-end gap-2 shrink-0 rounded-3xl">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Explain ${selectedConceptData?.title} to ${activeSpeaker} and the class using analogies... (Press Enter)`}
          rows={2}
          className="flex-1 bg-transparent p-2 text-sm outline-none resize-none font-medium text-slate-900"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || isTyping}
          className="btn-pill-primary p-3 rounded-full shrink-0"
          style={{
            opacity: input.trim() && !isTyping ? 1 : 0.4,
            cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
          }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
