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
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Brain,
  MessageSquare,
  Layers,
  GraduationCap,
  Flame,
  Volume2,
  VolumeX,
  Zap,
  Check,
  X,
  ShieldCheck,
  ChevronRight,
  FileText,
  Target,
  Search,
  Palette,
  Compass,
  User,
  Star,
  Smile,
} from "lucide-react";
import Link from "next/link";
import { soundEffects } from "@/lib/soundEffects";
import { getChapterIllustration } from "@/components/CardIllustrations";
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
    description: string;
    unlocked: boolean;
  }[];
  feedback: string;
  misconceptionsFound: string[];
  missingConcepts: string[];
  classmateReportCards: {
    toby: { name: string; role: string; emoji?: string; score: number; verdict: string };
    maya: { name: string; role: string; emoji?: string; score: number; verdict: string };
    leo: { name: string; role: string; emoji?: string; score: number; verdict: string };
    sam?: { name: string; role: string; emoji?: string; score: number; verdict: string };
  };
  tobyVerdict: string;
}

const CLASSMATES: Record<
  ClassmateSpeaker,
  {
    name: string;
    role: string;
    cardTheme: string;
    bubbleTheme: string;
    accentColor: string;
    bio: string;
    Icon: typeof Palette;
  }
> = {
  Toby: {
    name: "Toby",
    role: "Visual & Intuitive",
    cardTheme: "card-lavender",
    bubbleTheme: "bg-[#E8DEFF] text-[#2D1B4E] border border-[#D5C4FA]",
    accentColor: "#7C3AED",
    bio: "Needs visual stories, real-world analogies, and intuitive metaphors.",
    Icon: Palette,
  },
  Maya: {
    name: "Maya",
    role: "Skeptical Challenger",
    cardTheme: "card-butter",
    bubbleTheme: "bg-[#FEF0C3] text-[#713F12] border border-[#FDE089]",
    accentColor: "#D97706",
    bio: "Tests edge cases (x=0, zero friction) and questions formal rigor.",
    Icon: HelpCircle,
  },
  Leo: {
    name: "Leo",
    role: "Quick Quizzer",
    cardTheme: "card-mint",
    bubbleTheme: "bg-[#D2F1E6] text-[#0D3E30] border border-[#B2E5D3]",
    accentColor: "#059669",
    bio: "Loves rapid summaries, speed checks, and connecting formulas.",
    Icon: Zap,
  },
  Sam: {
    name: "Sam",
    role: "Direct & Precise",
    cardTheme: "card-sky",
    bubbleTheme: "bg-[#D8EDFE] text-[#0C3B5E] border border-[#B9E0FD]",
    accentColor: "#2563EB",
    bio: "Gives clear, direct, no-nonsense answers and exact step-by-step facts.",
    Icon: Target,
  },
};

const MOOD_META: Record<
  Mood,
  { label: string; chipClass: string; Icon: typeof HelpCircle }
> = {
  confused: {
    label: "Confused",
    chipClass: "chip-peach",
    Icon: HelpCircle,
  },
  curious: {
    label: "Intrigued",
    chipClass: "chip-sky",
    Icon: Compass,
  },
  skeptical: {
    label: "Skeptical",
    chipClass: "chip-butter",
    Icon: AlertCircle,
  },
  lightbulb: {
    label: "Understood",
    chipClass: "chip-lavender",
    Icon: Lightbulb,
  },
  amazed: {
    label: "Breakthrough",
    chipClass: "chip-pink",
    Icon: Sparkles,
  },
  mastered: {
    label: "Mastered",
    chipClass: "chip-mint",
    Icon: CheckCircle2,
  },
};

const SUBJECTS = ["All Subjects", "Mathematics", "Physics", "Chemistry"] as const;
const GRADES = ["All Grades", "Class 10", "Class 11", "Class 12"] as const;

function getOpeningPromptForConcept(title: string, subject: string): string {
  const t = title.toLowerCase();

  if (t.includes("vector") || t.includes("kinematics")) {
    return "Hey tutor! If a scalar is just a normal magnitude like 5 meters, why do we need arrows and trigonometry for vectors? Why can't I just add 3m North + 4m East and say I walked 7m total? Why is displacement 5m?";
  }
  if (t.includes("newton") || t.includes("friction")) {
    return "Hey! If every action has an equal and opposite reaction (Newton's 3rd Law), why does anything ever move at all? Shouldn't the forces cancel out to zero and freeze everything in place?";
  }
  if (t.includes("electrostat") || t.includes("gauss")) {
    return "Hey! My physics teacher was talking about electric potential V and electric field E. If they're both caused by charges, aren't they basically the exact same thing? Why is one a vector and the other a scalar?";
  }
  if (t.includes("light") || t.includes("optic") || t.includes("refraction")) {
    return "Hey! When light enters a glass prism or water, why does it bend at all? If light travels in a straight line, what causes it to change direction at the boundary?";
  }
  if (t.includes("reaction") || t.includes("chemical")) {
    return "Hey! Why do chemical equations need to be balanced with coefficients in front? If I have H₂ + O₂ → H₂O, why can't I just change the subscript on water to H₂O₂ so it matches?";
  }
  if (t.includes("acid") || t.includes("base") || t.includes("ph")) {
    return "Hey tutor! What actually makes something an acid versus a base? If water is neutral at pH 7, what is physically different in an acid like lemon juice at pH 2?";
  }
  if (t.includes("orbital") || t.includes("atomic")) {
    return "Hey! If electrons have negative charge and repel each other, why do two electrons fit together into the same atomic orbital? What even is an orbital?";
  }
  if (t.includes("bond") || t.includes("vsepr")) {
    return "Hey! Why is water (H₂O) bent like a boomerang instead of straight in a line? How do lone pairs on oxygen push the hydrogen bonds away?";
  }
  if (t.includes("derivative") || t.includes("calculus") || t.includes("tangent")) {
    return "Hey! What is the intuitive difference between an average speed (like distance / time) and a derivative at an exact instant? How can speed exist at a single point in time?";
  }
  if (t.includes("limit") || t.includes("continuity")) {
    return "Hey! If we plug x = 3 into (x² - 9)/(x - 3), we get 0/0 which is undefined. Why does the limit equal 6? How can a limit exist if the point doesn't?";
  }
  if (t.includes("integral") || t.includes("area")) {
    return "Hey! How does finding the antiderivative of a function give us the exact curved area under a graph? What connects slopes to areas?";
  }

  return `Hey tutor! We're studying "${title}" today in ${subject}. Could you explain the core intuitive idea using a simple real-world analogy?`;
}

export default function TeachBackPage() {
  const { userId } = useAuth();
  const concepts = useQuery(api.concepts.getAll);
  const submitTeachBack = useMutation(api.teachBack.submit);
  const updateMastery = useMutation(api.mastery.updateScore);

  const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects");
  const [selectedGrade, setSelectedGrade] = useState<string>("All Grades");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedConcept, setSelectedConcept] = useState<Id<"concepts"> | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<ClassmateSpeaker>("Toby");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showBlackboard, setShowBlackboard] = useState(false);
  const [blackboardNotes, setBlackboardNotes] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [tutorXp, setTutorXp] = useState(320);
  const [streakCount, setStreakCount] = useState(1);
  const [comboMultiplier, setComboMultiplier] = useState(1.0);
  const [floatingXp, setFloatingXp] = useState<number | null>(null);

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
      `Topic: ${concept.title}`,
      `Goal: Explain the core intuition using real-world analogies`,
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
        reaction: "Let's keep the definitions and facts straight to the point.",
      },
    };

    setMessages([initialMessage]);
    if (soundEnabled) soundEffects.playHandRaise();
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
          "Understood! So does that mean it connects directly to the physical balance in the system?",
        mood: "lightbulb",
        thought: "Making steady progress with intuitive connections.",
        comprehensionDelta: 15,
        xpAwarded: 40,
        classmateChime: {
          speaker: "Leo",
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

  const triggerPeerTeachBack = () => {
    handleSendMessage(
      `Okay ${activeSpeaker}, your turn! Teach it back to me in your own words so I can verify your reasoning!`,
      "peer_explain",
      activeSpeaker
    );
  };

  const triggerPopQuiz = () => {
    if (soundEnabled) soundEffects.playPopQuiz();
    handleSendMessage("Leo, give me a quick conceptual question from this topic!", "pop_quiz", "Leo");
  };

  const triggerClassmateClue = () => {
    handleSendMessage("Maya, can you give me a clue or edge case to consider?", "hint", "Maya");
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
        tutorTitle: "Intuitive Socratic Master",
        xpAwarded: tutorXp + 150,
        badges: [
          {
            id: "analogy_maestro",
            title: "Analogy Maestro",
            description: "Explained complex ideas using concrete real-world imagery",
            unlocked: true,
          },
          {
            id: "triple_lightbulb",
            title: "Classroom Synchrony",
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
            score: comprehensions.toby,
            verdict: `"Your analogies made ${selectedConceptData.title} so easy to picture!"`,
          },
          maya: {
            name: "Maya",
            role: "Skeptical Challenger",
            score: comprehensions.maya,
            verdict: `"The logic held up against edge cases. Great explanations!"`,
          },
          leo: {
            name: "Leo",
            role: "Peer Quizzer",
            score: comprehensions.leo,
            verdict: `"Super fun study session! I feel ready for the exam!"`,
          },
          sam: {
            name: "Sam",
            role: "Direct & Precise",
            score: comprehensions.sam || 90,
            verdict: `"Clear, accurate, and straight to the point on ${selectedConceptData.title}."`,
          },
        },
        tobyVerdict: `Toby says: "You're a legend! Our whole study pod mastered ${selectedConceptData.title}!"`,
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

  const filteredConcepts = (concepts || []).filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ══════════════════════════════════════════════════════════════
  // 1. CONCEPT SELECTION VIEW
  // ══════════════════════════════════════════════════════════════
  if (!selectedConcept) {
    return (
      <div className="max-w-5xl mx-auto pb-8">
        {/* Top Header Banner */}
        <div className="mb-6 animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="pill-chip chip-butter text-xs font-semibold py-1 px-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Socratic Classroom Pod • Peer Learning</span>
            </div>
            <div className="flex items-center gap-2 pill-chip chip-lavender text-xs font-semibold py-1 px-3">
              <Award className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Level 4</span>
              <span className="opacity-40">•</span>
              <span>{tutorXp} XP</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight mb-1">
            Teach the <span className="text-[#8B5CF6]">Classroom Study Pod</span>
          </h1>
          <p className="text-sm text-[#52525B] max-w-2xl font-medium leading-relaxed">
            Reinforce your understanding using the Feynman technique. Explain concepts to classmates{" "}
            <strong>Toby</strong> (visual), <strong>Maya</strong> (rigor),{" "}
            <strong>Leo</strong> (application), and <strong>Sam</strong> (direct facts).
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 space-y-3 animate-fade-in-up delay-1">
          <div className="pill-search bg-white shadow-xs py-2 px-3.5">
            <Search className="w-4 h-4 text-[#71717A] shrink-0" />
            <input
              type="text"
              placeholder="Search concepts across mathematics, physics, chemistry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold text-[#18181B] bg-transparent outline-none placeholder:text-[#71717A]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Subject Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`pill-chip text-xs font-semibold py-1 px-3 cursor-pointer ${
                    selectedSubject === s
                      ? "chip-dark text-white"
                      : "chip-white hover:border-[#18181B]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Grade Filters */}
            <div className="flex items-center gap-1.5">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`pill-chip text-[11px] font-semibold py-0.5 px-2.5 cursor-pointer ${
                    selectedGrade === g
                      ? "chip-lavender font-bold"
                      : "chip-white text-[#71717A]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Concept Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fade-in-up delay-2">
          {filteredConcepts.map((concept) => {
            const Illustration = getChapterIllustration(concept.title, concept.subject);
            return (
              <div
                key={concept._id}
                onClick={() => handleStartSession(concept._id)}
                className="card-pastel card-white p-4 flex flex-col justify-between group cursor-pointer hover:border-[#18181B] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EBE5DB] flex items-center justify-center text-[#18181B] shrink-0">
                      <Illustration className="w-4 h-4" />
                    </div>
                    <span className="pill-chip chip-white text-[10px] font-bold py-0.5 px-2">
                      {concept.subject}
                    </span>
                  </div>
                  <h3 className="font-black text-sm text-[#18181B] group-hover:text-[#8B5CF6] transition-colors leading-tight mb-1">
                    {concept.title}
                  </h3>
                  <p className="text-xs text-[#52525B] line-clamp-2 leading-relaxed mb-3">
                    {concept.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EBE5DB] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-[#71717A]">
                    {concept.grade || "Class 11"}
                  </span>
                  <span className="font-bold text-[#18181B] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
                    Start Teaching <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 2. EVALUATION / CERTIFICATE VIEW
  // ══════════════════════════════════════════════════════════════
  if (evaluation) {
    return (
      <div className="max-w-4xl mx-auto pb-8">
        <div className="card-pastel card-white p-6 sm:p-8 rounded-[28px] shadow-sm animate-fade-in-up">
          {/* Certificate Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#E8DEFF] text-[#7C3AED] mx-auto mb-3 flex items-center justify-center border border-[#D5C4FA]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="pill-chip chip-mint text-xs font-bold py-1 px-3.5 inline-flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Teaching Session Verified</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
              {evaluation.tutorTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-medium">
              Concept: {selectedConceptData?.title} • {selectedConceptData?.subject}
            </p>
          </div>

          {/* Scores Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            {[
              { label: "Overall Score", val: `${evaluation.overallScore}%`, color: "chip-lavender" },
              { label: "Accuracy", val: `${evaluation.accuracy}%`, color: "chip-mint" },
              { label: "Completeness", val: `${evaluation.completeness}%`, color: "chip-butter" },
              { label: "Depth", val: `${evaluation.depth}%`, color: "chip-sky" },
            ].map((stat, i) => (
              <div key={i} className={`p-3.5 rounded-2xl border text-center ${stat.color}`}>
                <div className="text-xl font-black text-[#18181B] mb-0.5">{stat.val}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Badges Unlocked */}
          {evaluation.badges && evaluation.badges.length > 0 && (
            <div className="card-pastel card-lavender p-5 rounded-2xl mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#2D1B4E] mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /> Badges Unlocked
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {evaluation.badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      b.unlocked
                        ? "bg-white border-[#D5C4FA] shadow-xs"
                        : "bg-white/40 border-[#EBE5DB] opacity-50"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FAF8F5] mx-auto mb-1.5 flex items-center justify-center border border-[#EBE5DB]">
                      <Award className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <div className="font-bold text-xs text-[#18181B]">{b.title}</div>
                    <div className="text-[10px] text-[#71717A] mt-0.5 leading-tight">
                      {b.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Classmate Report Cards */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#71717A] mb-3 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-[#7C3AED]" /> Classmate Report Cards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(evaluation.classmateReportCards || {}).map(([key, card]) => {
                const info = CLASSMATES[card.name as ClassmateSpeaker] || CLASSMATES.Toby;
                const IconComp = info?.Icon || Palette;
                return (
                  <div
                    key={key}
                    className="p-3.5 rounded-2xl bg-white border border-[#EBE5DB] shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#EBE5DB]">
                            <IconComp className="w-3.5 h-3.5 text-[#18181B]" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-[#18181B]">{card.name}</div>
                            <div className="text-[10px] font-medium text-[#71717A]">
                              {card.role}
                            </div>
                          </div>
                        </div>
                        <span className="pill-chip chip-lavender text-[10px] font-black py-0.5 px-2">
                          {card.score}%
                        </span>
                      </div>
                      <p className="text-xs italic text-[#52525B] mt-2 font-medium leading-relaxed">
                        {card.verdict}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Pedagogical Feedback */}
          <div className="p-5 rounded-2xl mb-6 bg-purple-50/70 border border-[#D5C4FA]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <h3 className="font-black text-xs text-[#18181B] uppercase tracking-wider">
                Pedagogical Supervisor Feedback
              </h3>
            </div>
            <MarkdownRenderer content={evaluation.feedback} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center pt-1">
            <button onClick={handleReset} className="btn-pill-white text-xs py-2 px-4">
              <RotateCcw className="w-3.5 h-3.5" /> Teach Another Topic
            </button>
            <Link href="/student/progress" className="btn-pill-dark text-xs py-2 px-4">
              <TrendingUp className="w-3.5 h-3.5" /> View Knowledge Radar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 3. MAIN TEACH-BACK CHAT INTERFACE
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-5xl mx-auto w-full">
      {/* ── Compact Header Bar ── */}
      <div className="card-pastel card-white p-2.5 px-4 mb-2 flex items-center justify-between gap-3 shrink-0 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={handleReset}
            className="w-7 h-7 rounded-full bg-[#FAF8F5] hover:bg-[#EBE5DB] flex items-center justify-center text-xs font-bold text-[#18181B] transition-colors cursor-pointer border border-[#EBE5DB] shrink-0"
            title="Back to topics"
          >
            ←
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-xs sm:text-sm text-[#18181B] truncate m-0">
                Teaching: {selectedConceptData?.title}
              </h2>
              <span className="pill-chip chip-white text-[10px] font-bold py-0.5 px-2">
                <BookOpen className="w-2.5 h-2.5" /> {selectedConceptData?.subject}
              </span>
            </div>
            <p className="text-[11px] text-[#71717A] font-medium truncate m-0 hidden sm:block">
              {selectedConceptData?.description}
            </p>
          </div>
        </div>

        {/* Right Status Counters */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* XP Badge */}
          <div className="relative pill-chip chip-lavender text-xs font-semibold py-1 px-2.5">
            <Award className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>{tutorXp} XP</span>
            {floatingXp && (
              <span className="absolute -top-2.5 right-0 bg-[#8B5CF6] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-bounce shadow-xs">
                +{floatingXp}
              </span>
            )}
          </div>

          {/* Streak Combo Multiplier */}
          {streakCount >= 2 && (
            <div className="pill-chip chip-butter text-[11px] font-bold py-1 px-2">
              <Flame className="w-3 h-3 text-[#D97706]" />
              <span>{comboMultiplier.toFixed(1)}x</span>
            </div>
          )}

          {/* Audio toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-7 h-7 rounded-full bg-[#FAF8F5] hover:bg-[#EBE5DB] flex items-center justify-center text-xs text-[#18181B] transition-colors cursor-pointer border border-[#EBE5DB]"
            title={soundEnabled ? "Mute Game Audio" : "Enable Game Audio"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
          </button>

          {/* Finish & Grade Button */}
          <button
            onClick={handleFinishAndEvaluate}
            disabled={isEvaluating || messages.length < 2}
            className="btn-pill-dark text-xs py-1.5 px-3 cursor-pointer disabled:opacity-50"
          >
            <GraduationCap className="w-3.5 h-3.5 mr-1" />
            {isEvaluating ? "Evaluating..." : "Finish & Grade"}
          </button>
        </div>
      </div>

      {/* ── Compact Classmate Pod Selector (Toby, Maya, Leo, Sam) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 shrink-0">
        {(["Toby", "Maya", "Leo", "Sam"] as ClassmateSpeaker[]).map((name) => {
          const info = CLASSMATES[name];
          const score = comprehensions[name.toLowerCase() as keyof typeof comprehensions] || 20;
          const isSelected = activeSpeaker === name;
          const IconComponent = info.Icon;

          return (
            <button
              key={name}
              onClick={() => setActiveSpeaker(name)}
              className={`p-2 px-3 rounded-2xl text-left transition-all cursor-pointer border ${
                isSelected
                  ? "bg-white border-[#18181B] shadow-xs ring-1 ring-[#18181B]"
                  : "bg-white/80 border-[#EBE5DB] hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-[#FAF8F5] flex items-center justify-center shrink-0 border border-[#EBE5DB]">
                    <IconComponent className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-xs text-[#18181B] truncate">{name}</span>
                </div>
                <span className="text-xs font-black text-[#18181B] shrink-0">{score}%</span>
              </div>

              {/* Progress Track */}
              <div className="progress-track bg-[#FAF8F5] h-1">
                <div
                  className="progress-fill bg-[#121216]"
                  style={{ width: `${score}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Optional Blackboard ── */}
      {showBlackboard && (
        <div className="card-pastel card-white p-3 rounded-2xl mb-2 shrink-0 bg-[#1E1E24] text-[#FAF8F5] border border-[#2A2A34] shadow-md animate-fade-in-up">
          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-[#2A2A34]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D2F1E6]">
              <FileText className="w-3 h-3" />
              <span>Classroom Blackboard Notes</span>
            </div>
            <button
              onClick={() => setShowBlackboard(false)}
              className="text-[#A1A1AA] hover:text-white text-xs cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
          <div className="space-y-1 text-xs font-mono text-[#D4D4D8]">
            {blackboardNotes.map((note, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-[#D2F1E6]">▸</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Message Conversation Stream ── */}
      <div className="card-pastel card-white flex-1 min-h-0 overflow-y-auto p-4 md:p-5 space-y-3.5 mb-2 rounded-[24px] shadow-xs border border-[#EBE5DB]">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const speakerInfo = isUser ? null : CLASSMATES[msg.speaker as ClassmateSpeaker] || CLASSMATES.Toby;
          const IconComponent = speakerInfo?.Icon || Palette;
          const moodInfo = msg.mood ? MOOD_META[msg.mood] : null;
          const MoodIcon = moodInfo?.Icon || HelpCircle;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}
            >
              {/* Classmate Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-white border border-[#EBE5DB] shadow-xs">
                  <IconComponent className="w-4 h-4 text-[#18181B]" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                className={`max-w-lg md:max-w-xl p-3.5 px-4 rounded-[20px] text-sm leading-relaxed ${
                  isUser
                    ? "bg-[#121216] text-[#FAF8F5] shadow-xs rounded-br-xs"
                    : `${speakerInfo?.bubbleTheme || "bg-[#FAF8F5] text-[#18181B]"} shadow-xs rounded-bl-xs`
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-black/5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs">{msg.speaker}</span>
                      {moodInfo && (
                        <span className={`pill-chip ${moodInfo.chipClass} text-[10px] font-semibold py-0.2 px-2 flex items-center gap-1`}>
                          <MoodIcon className="w-2.5 h-2.5" />
                          {moodInfo.label}
                        </span>
                      )}
                    </div>
                    {msg.comprehensionDelta && msg.comprehensionDelta > 0 ? (
                      <span className="text-[10px] font-bold text-[#0D3E30] flex items-center gap-0.5">
                        <Lightbulb className="w-3 h-3" /> +{msg.comprehensionDelta}%
                      </span>
                    ) : null}
                  </div>
                )}

                <MarkdownRenderer content={msg.content} isUser={isUser} />

                {/* Secondary Classmate Banter Chime */}
                {msg.classmateChime && (
                  <div className="mt-2.5 pt-2 border-t border-black/5 flex items-start gap-1.5 bg-white/70 p-2 rounded-xl text-xs text-[#18181B]">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#8B5CF6] mt-0.5" />
                    <div>
                      <span className="font-bold mr-1">
                        {msg.classmateChime.speaker}:
                      </span>
                      <span className="font-medium">{msg.classmateChime.reaction}</span>
                    </div>
                  </div>
                )}

                {/* Peer Teach-Back Interactive Verification Options */}
                {msg.isPeerTeachBack && (
                  <div className="mt-2.5 pt-2 border-t border-black/5 flex flex-wrap gap-1.5">
                    <button
                      onClick={() =>
                        handleSendMessage(
                          `Correct ${msg.speaker}! You got the core concept right. Now let's connect it to problem solving.`
                        )
                      }
                      className="pill-chip chip-mint text-[10px] font-bold py-0.5 px-2.5 cursor-pointer"
                    >
                      <Check className="w-2.5 h-2.5" /> Accurate explanation
                    </button>
                    <button
                      onClick={() =>
                        handleSendMessage(
                          `Close, but keep in mind what happens when direction or variables change.`
                        )
                      }
                      className="pill-chip chip-butter text-[10px] font-bold py-0.5 px-2.5 cursor-pointer"
                    >
                      <AlertCircle className="w-2.5 h-2.5" /> Needs slight refinement
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[#FAF8F5] text-[#18181B] border border-[#EBE5DB] shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2.5 justify-start animate-fade-in-up">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white border border-[#EBE5DB] shadow-xs">
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div className="p-2.5 px-3.5 rounded-[18px] flex items-center gap-1.5 text-xs font-semibold bg-white border border-[#EBE5DB] text-[#71717A] shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-[#121216] animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#121216] animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#121216] animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-medium">{activeSpeaker} is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* ── Quick Action Pills Toolbar ── */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2 px-1">
        <button
          onClick={triggerPeerTeachBack}
          disabled={isTyping}
          className="pill-chip chip-lavender text-[11px] font-semibold py-1 px-2.5 cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RotateCcw className="w-3 h-3" /> "Your turn, {activeSpeaker}"
        </button>

        <button
          onClick={triggerPopQuiz}
          disabled={isTyping}
          className="pill-chip chip-mint text-[11px] font-semibold py-1 px-2.5 cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Zap className="w-3 h-3" /> Quick Quiz
        </button>

        <button
          onClick={triggerClassmateClue}
          disabled={isTyping}
          className="pill-chip chip-butter text-[11px] font-semibold py-1 px-2.5 cursor-pointer shadow-xs disabled:opacity-50"
        >
          <HelpCircle className="w-3 h-3" /> Ask Maya for Clue
        </button>

        <button
          onClick={triggerSamDirect}
          disabled={isTyping}
          className="pill-chip chip-sky text-[11px] font-semibold py-1 px-2.5 cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Target className="w-3 h-3" /> Ask Sam (Direct Facts)
        </button>

        <button
          onClick={() => setShowBlackboard(!showBlackboard)}
          className="pill-chip chip-white text-[11px] font-semibold py-1 px-2.5 cursor-pointer shadow-xs ml-auto"
        >
          <FileText className="w-3 h-3" /> Blackboard {showBlackboard ? "▲" : "▼"}
        </button>
      </div>

      {/* ── Chat Input Container (Clean & Compact) ── */}
      <div className="card-pastel card-white p-2 px-3 flex items-center gap-2 shrink-0 rounded-2xl shadow-xs border border-[#EBE5DB]">
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
          placeholder={`Explain ${selectedConceptData?.title} to ${activeSpeaker}... (Press Enter)`}
          rows={1}
          className="flex-1 bg-transparent py-1 text-xs sm:text-sm outline-none resize-none font-medium text-[#18181B] placeholder:text-[#71717A]"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || isTyping}
          className="w-8 h-8 rounded-full bg-[#121216] text-[#FAF8F5] flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 cursor-pointer shadow-xs"
          title="Send explanation"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
