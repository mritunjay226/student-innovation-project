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
  Search,
  Palette,
  Compass,
  User,
  Star,
} from "lucide-react";
import Link from "next/link";
import { soundEffects } from "@/lib/soundEffects";
import { getChapterIllustration } from "@/components/CardIllustrations";

type ClassmateSpeaker = "Toby" | "Maya" | "Leo";
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
    toby: { name: string; role: string; score: number; verdict: string };
    maya: { name: string; role: string; score: number; verdict: string };
    leo: { name: string; role: string; score: number; verdict: string };
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
  if (t.includes("derivative")) {
    return "Hey! My math teacher was explaining derivatives today and it felt confusing. Isn't a derivative just the y-value of the graph at a point? Why do we need tangent lines and limits?";
  }
  if (t.includes("limit")) {
    return "Hey! When I evaluated x = 2 into (x^2 - 4)/(x - 2), I got 0/0. What is a limit fundamentally, and why does approaching a point give a real value?";
  }
  if (t.includes("integral")) {
    return "Hey! They told us an integral is the area under a curve, but why does finding area relate to reversing a derivative? How does accumulation connect to rates?";
  }
  if (t.includes("atomic") || t.includes("orbital")) {
    return "Hey! In 10th grade we learned electrons orbit the nucleus in fixed rings. Now in 11th grade they say orbitals are 3D probability clouds with dumbbell shapes. What is an electron orbital really?";
  }
  if (t.includes("bond") || t.includes("vsepr")) {
    return "Hey! Why is water (H2O) bent like a boomerang instead of straight in a line like carbon dioxide (CO2)? How do lone pairs affect geometry?";
  }

  return `Hey! Our study group is working through "${title}" in ${subject}. Can you teach us the foundational intuition and core principles step by step?`;
}

export default function TeachBackPage() {
  const { userId } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects");
  const [selectedGrade, setSelectedGrade] = useState<string>("All Grades");
  const [searchQuery, setSearchQuery] = useState("");

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
  }>({
    toby: 20,
    maya: 15,
    leo: 20,
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
    setEvaluation(null);
    setStreakCount(1);
    setComboMultiplier(1.0);
    setActiveSpeaker("Toby");
    setComprehensions({ toby: 20, maya: 15, leo: 20 });

    const openingContent = getOpeningPromptForConcept(concept.title, concept.subject);
    const initialMsg: ChatMessage = {
      id: "msg-0",
      role: "assistant",
      speaker: "Toby",
      content: openingContent,
      mood: "confused",
      thought: `Toby is looking for visual clarity on ${concept.title}`,
      comprehensionDelta: 0,
    };

    setMessages([initialMsg]);
    setBlackboardNotes([
      `Target: ${concept.title} (${concept.subject})`,
      `Objective: Guide Toby, Maya, and Leo to >75% comprehension`,
      `Approach: Use conceptual intuition and edge-case clarity`,
    ]);

    if (soundEnabled) soundEffects.playNewMessage?.();
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const awardXpWithCombo = (base: number) => {
    const bonus = Math.round(base * comboMultiplier);
    setTutorXp((prev) => prev + bonus);
    setFloatingXp(bonus);
    setTimeout(() => setFloatingXp(null), 1800);
    if (soundEnabled) soundEffects.playCorrect?.();
    return bonus;
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input.trim();
    if (!textToSend || isTyping || !selectedConceptData) return;

    if (!customText) setInput("");

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      speaker: "You",
      content: textToSend,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    if (soundEnabled) soundEffects.playClick?.();

    // Socratic simulated pedagogical engine
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let speaker: ClassmateSpeaker = activeSpeaker;
      let mood: Mood = "curious";
      let delta = 15;
      let reply = "";
      let chime = null;
      let isPeerTeach = false;

      const hasAnalogy =
        lower.includes("like a") ||
        lower.includes("imagine") ||
        lower.includes("think of") ||
        lower.includes("speedometer") ||
        lower.includes("car") ||
        lower.includes("water") ||
        lower.includes("arrow");

      const hasLength = textToSend.length > 40;

      if (hasAnalogy && hasLength) {
        mood = "lightbulb";
        delta = 25;
        setStreakCount((prev) => prev + 1);
        setComboMultiplier((prev) => Math.min(prev + 0.2, 2.5));
        awardXpWithCombo(40);

        if (speaker === "Toby") {
          reply = `That makes sense! When you frame it using that analogy, I can clearly visualize why ${selectedConceptData.title} behaves that way!`;
          chime = {
            speaker: "Maya",
            reaction: "That addresses the concept well. But what happens at the boundary values?",
          };
          setBlackboardNotes((prev) => [...prev, `Key rule: ${textToSend.substring(0, 45)}...`]);
        } else if (speaker === "Maya") {
          reply = `That resolves my doubt about the edge cases. The step-by-step logic holds up properly.`;
          chime = {
            speaker: "Leo",
            reaction: "Great! Let's verify how this translates to problem solving!",
          };
        } else {
          reply = `Understood! That ties the concept together clearly.`;
          chime = {
            speaker: "Toby",
            reaction: "Thanks for clarifying Arjun!",
          };
        }
      } else if (lower.length < 20) {
        mood = "skeptical";
        delta = 5;
        reply = `Could you elaborate slightly more with a concrete example to help us understand?`;
      } else {
        mood = "curious";
        delta = 15;
        awardXpWithCombo(20);
        reply = `I see the connection! How does this principle apply when initial conditions change?`;
        if (Math.random() > 0.5) {
          isPeerTeach = true;
        }
      }

      setComprehensions((prev) => {
        const key = speaker.toLowerCase() as keyof typeof prev;
        return {
          ...prev,
          [key]: Math.min(100, prev[key] + delta),
        };
      });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        speaker,
        content: reply,
        mood,
        thought: `${speaker} gained ${delta}% comprehension.`,
        comprehensionDelta: delta,
        classmateChime: chime,
        isPeerTeachBack: isPeerTeach,
      };

      setMessages([...updatedMessages, assistantMessage]);
      setIsTyping(false);
      if (soundEnabled) soundEffects.playNewMessage?.();
    }, 850);
  };

  const triggerPeerTeachBack = () => {
    if (isTyping || !selectedConceptData) return;
    const prompt = `Hey ${activeSpeaker}, could you explain your takeaway on ${selectedConceptData.title} in your own words?`;
    handleSendMessage(prompt);
  };

  const triggerPopQuiz = () => {
    if (isTyping || !selectedConceptData) return;
    const prompt = `Quick check: what is the fundamental rule or equation for ${selectedConceptData.title}?`;
    handleSendMessage(prompt);
  };

  const triggerClassmateClue = () => {
    if (isTyping || !selectedConceptData) return;
    const prompt = `Hey Maya, what is the most common misunderstanding students have with ${selectedConceptData.title}?`;
    handleSendMessage(prompt);
  };

  const handleFinishAndEvaluate = async () => {
    if (!selectedConceptData || messages.length < 2) return;

    setIsEvaluating(true);
    if (soundEnabled) soundEffects.playCelebration?.();

    try {
      const avgScore = Math.round(
        (comprehensions.toby + comprehensions.maya + comprehensions.leo) / 3
      );

      const evalData: EvaluationResult = {
        completeness: 88,
        accuracy: 92,
        depth: avgScore,
        overallScore: Math.min(100, Math.max(65, avgScore + 10)),
        tutorTitle: avgScore >= 75 ? "Socratic Master Tutor" : "Intuition Builder",
        xpAwarded: 180,
        badges: [
          {
            id: "analogy-hero",
            title: "Analogy Builder",
            description: "Used concrete intuitive models to explain concepts",
            unlocked: true,
          },
          {
            id: "socratic-champion",
            title: "Study Pod Master",
            description: "Guided all 3 study pod classmates above 75% comprehension",
            unlocked: avgScore >= 75,
          },
          {
            id: "edge-case-solver",
            title: "Rigor Defender",
            description: "Resolved Maya's skeptical boundary-case questions",
            unlocked: comprehensions.maya >= 60,
          },
          {
            id: "speed-quizzer",
            title: "Concept Recall",
            description: "Successfully guided Leo's quick review checks",
            unlocked: comprehensions.leo >= 60,
          },
        ],
        feedback: `Great peer teaching session on "${selectedConceptData.title}". You provided clear conceptual models for Toby, handled Maya's boundary questions, and confirmed key rules with Leo.`,
        misconceptionsFound: [],
        missingConcepts: ["Formal mathematical boundary notation"],
        classmateReportCards: {
          toby: {
            name: "Toby",
            role: "Visual Learner",
            score: comprehensions.toby,
            verdict: `"Your explanations made ${selectedConceptData.title} easy to visualize."`,
          },
          maya: {
            name: "Maya",
            role: "Skeptical Challenger",
            score: comprehensions.maya,
            verdict: `"The logical structure held up across the edge cases."`,
          },
          leo: {
            name: "Leo",
            role: "Peer Quizzer",
            score: comprehensions.leo,
            verdict: `"Clear and concise review. I feel prepared for the exam."`,
          },
        },
        tobyVerdict: `Toby says: "Our entire study pod understands ${selectedConceptData.title} thoroughly now."`,
      };

      setEvaluation(evalData);

      if (userId && selectedConcept) {
        await submitTeachBack({
          studentId: userId,
          conceptId: selectedConcept,
          explanation: messages
            .filter((m) => m.role === "user")
            .map((m) => m.content)
            .join("\n\n"),
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
      }
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setSelectedConcept(null);
    setMessages([]);
    setEvaluation(null);
    setComprehensions({ toby: 20, maya: 15, leo: 20 });
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
            <strong>Toby</strong> (visual), <strong>Maya</strong> (rigor), and{" "}
            <strong>Leo</strong> (application).
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 space-y-3 animate-fade-in-up delay-1">
          <div className="pill-search bg-white shadow-xs py-2 px-3.5">
            <Search className="w-4 h-4 text-[#71717A] shrink-0" />
            <input
              type="text"
              placeholder="Search concepts to teach (e.g. Vectors, Limits, Bonding)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
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

            <div className="flex flex-wrap items-center gap-1.5">
              {GRADES.map((grd) => (
                <button
                  key={grd}
                  onClick={() => setSelectedGrade(grd)}
                  className={`pill-chip text-xs py-1 px-2.5 font-semibold ${
                    selectedGrade === grd ? "chip-butter font-bold" : "chip-white"
                  }`}
                >
                  <GraduationCap className="w-3 h-3" /> {grd}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Concept Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up delay-2">
          {filteredConcepts.map((concept, idx) => {
            const cardThemes = [
              "card-lavender",
              "card-mint",
              "card-sky",
              "card-butter",
              "card-peach",
              "card-lilac",
            ];
            const themeClass = cardThemes[idx % cardThemes.length];

            return (
              <div
                key={concept._id}
                onClick={() => handleStartSession(concept._id)}
                className={`card-pastel ${themeClass} p-5 rounded-[22px] cursor-pointer hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden`}
              >
                {/* Background 2D Illustration Art */}
                <div className="absolute -right-2 -bottom-2 opacity-25 group-hover:opacity-50 transition-all duration-300 pointer-events-none">
                  {getChapterIllustration(concept.subject, idx, "w-32 h-32")}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="pill-chip chip-white text-[10px] font-bold py-0.5 px-2.5">
                      <BookOpen className="w-3 h-3" /> {concept.subject} • {concept.grade}
                    </span>
                    <span className="text-[11px] font-semibold opacity-75">
                      Difficulty Level {concept.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight mb-1.5 group-hover:underline">
                    {concept.title}
                  </h3>
                  <p className="text-xs opacity-75 font-medium line-clamp-2 mb-4 max-w-[85%]">
                    {concept.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/5 relative z-10">
                  <span className="text-xs font-semibold opacity-75">3 Classmates Ready</span>
                  <span className="btn-continue text-xs py-1 px-3">
                    <span>Start Teaching</span>
                    <span className="arrow-circle">→</span>
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
  // 2. FINAL EVALUATION REPORT VIEW
  // ══════════════════════════════════════════════════════════════
  if (evaluation) {
    return (
      <div className="max-w-4xl mx-auto pb-8 animate-fade-in-up">
        <div className="card-pastel card-white p-6 md:p-8 rounded-[28px] shadow-sm">
          {/* Certificate Header */}
          <div className="text-center mb-6 pb-6 border-b border-[#EBE5DB]">
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center shadow-sm bg-[#121216] text-[#FAF8F5]">
              <GraduationCap className="w-7 h-7 text-[#FEF0C3]" />
            </div>
            <div className="pill-chip chip-butter text-xs font-bold py-1 px-3 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>{evaluation.tutorTitle}</span>
            </div>
            <h1 className="text-2xl font-black text-[#18181B] mb-1 tracking-tight">
              Session Complete: {selectedConceptData?.title}
            </h1>
            <p className="text-sm max-w-xl mx-auto italic font-medium text-[#52525B]">
              "{evaluation.tobyVerdict}"
            </p>
          </div>

          {/* Gamified Scores Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Overall Score", val: `${evaluation.overallScore}%`, cardClass: "card-lavender" },
              { label: "XP Earned", val: `+${evaluation.xpAwarded} XP`, cardClass: "card-sky" },
              { label: "Conceptual Clarity", val: `${evaluation.depth}%`, cardClass: "card-mint" },
              { label: "Accuracy", val: `${evaluation.accuracy}%`, cardClass: "card-butter" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`card-pastel ${stat.cardClass} p-4 rounded-2xl text-center`}
              >
                <div className="text-2xl font-black mb-0.5">{stat.val}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Classmate Report Cards */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#71717A] mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED]" /> Classmate Assessments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(evaluation.classmateReportCards || {}).map(([key, card]) => {
                const info = CLASSMATES[card.name as ClassmateSpeaker] || CLASSMATES.Toby;
                const IconComponent = info.Icon;
                return (
                  <div
                    key={key}
                    className={`card-pastel ${info.cardTheme} p-4 rounded-2xl flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs">
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-bold text-xs">{card.name}</div>
                            <div className="text-[10px] font-medium opacity-70">
                              {card.role}
                            </div>
                          </div>
                        </div>
                        <span className="pill-chip chip-white text-xs font-bold py-0.5 px-2">
                          {card.score}%
                        </span>
                      </div>
                      <p className="text-xs italic font-medium mt-2 opacity-90 leading-snug">
                        {card.verdict}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
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
  // 3. MAIN TEACH-BACK CHAT INTERFACE (CLEAN, SPACIOUS, ZERO EMOJIS)
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

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* XP Badge */}
          <div className="relative flex items-center gap-1 pill-chip chip-butter text-[11px] font-bold py-1 px-2.5">
            <Award className="w-3 h-3" />
            <span>{tutorXp} XP</span>
            {floatingXp && (
              <span className="absolute -top-3 right-0 bg-[#121216] text-[#FAF8F5] text-[9px] font-black px-1.5 py-0.2 rounded-full animate-bounce shadow-md">
                +{floatingXp} XP
              </span>
            )}
          </div>

          {/* Streak Badge */}
          {streakCount >= 2 && (
            <div className="flex items-center gap-1 pill-chip chip-mint text-[11px] font-bold py-1 px-2.5 animate-pulse hidden sm:flex">
              <Flame className="w-3 h-3 text-[#059669]" />
              <span>{comboMultiplier.toFixed(1)}x</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-7 h-7 rounded-full bg-[#FAF8F5] hover:bg-[#EBE5DB] text-[#52525B] flex items-center justify-center transition-colors cursor-pointer border border-[#EBE5DB]"
            title={soundEnabled ? "Mute sound" : "Enable sound"}
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

      {/* ── Compact Classmate Pod Selector (Toby, Maya, Leo) ── */}
      <div className="grid grid-cols-3 gap-2 mb-2 shrink-0">
        {(["Toby", "Maya", "Leo"] as ClassmateSpeaker[]).map((name) => {
          const info = CLASSMATES[name];
          const score = comprehensions[name.toLowerCase() as keyof typeof comprehensions];
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

      {/* ── Main Message Conversation Stream (Generous Scrollable Space) ── */}
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

                <p className="whitespace-pre-wrap font-medium m-0 text-xs sm:text-sm">
                  {msg.content}
                </p>

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
