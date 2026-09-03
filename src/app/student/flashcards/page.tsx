"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { soundEffects } from "@/lib/soundEffects";
import {
  Upload,
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Volume2,
  VolumeX,
  BookOpen,
  Trash2,
  Search,
  Zap,
  Flame,
  Award,
  Plus,
  Eye,
  Check,
  CircleDot,
  AlignLeft,
  HelpCircle,
  Hash,
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  Timer,
} from "lucide-react";

interface Flashcard {
  _id: Id<"flashcards">;
  deckId: Id<"flashcardDecks">;
  conceptId?: Id<"concepts">;
  front: string;
  back: string;
  keyTakeaway?: string;
  commonPitfall?: string;
  cardType?: "direct_question" | "explanatory" | "one_word" | "mcq";
  options?: string[];
  correctOption?: string;
  difficulty: "easy" | "medium" | "hard";
  tags?: string[];
  classmateHint?: string;
  masteryLevel: number;
  intervalMs?: number;
  nextReviewDate?: number;
  lastReviewed?: number;
  reviewCount: number;
  correctStreak: number;
}

const SUBJECT_THEMES: Record<string, { color: string; card: string; border: string; icon: string }> = {
  Mathematics: { color: "#FF642F", card: "bg-blue-50", border: "#D1E2FB", icon: "📐" },
  Physics: { color: "#0284C7", card: "bg-sky-50", border: "#BAE6FD", icon: "⚛️" },
  Chemistry: { color: "#059669", card: "bg-emerald-50", border: "#A7F3D0", icon: "🧪" },
  "AI & Computer Science": { color: "#7C3AED", card: "bg-purple-50", border: "#DDD6FE", icon: "💻" },
  General: { color: "#D97706", card: "bg-amber-50", border: "#FDE68A", icon: "📚" },
};

const CARD_TYPE_PRESETS = [
  {
    id: "direct_question",
    label: "Direct Question",
    desc: "Crisp Q&A format",
    icon: HelpCircle,
    color: "#FF642F",
  },
  {
    id: "explanatory",
    label: "Explanatory Concept",
    desc: "Deep mechanisms & proofs",
    icon: AlignLeft,
    color: "#0284C7",
  },
  {
    id: "one_word",
    label: "One-Word Recall",
    desc: "Term & definition blanks",
    icon: Hash,
    color: "#D97706",
  },
  {
    id: "mcq",
    label: "MCQ Quiz",
    desc: "4-option interactive cards",
    icon: CircleDot,
    color: "#059669",
  },
  {
    id: "mixed",
    label: "Mixed Variety",
    desc: "Balanced mix of all types",
    icon: Sparkles,
    color: "#E11D48",
  },
] as const;

const SAMPLE_PRESETS = [
  {
    key: "smart_education",
    title: "Smart Education AI Architecture & Mastery",
    subject: "AI & Computer Science",
    fileName: "Smart_Education_AI_Prototype.pdf",
    badge: "Included PDF",
    desc: "Prerequisite graphs, Bayesian knowledge tracing, and Feynman teach-back",
  },
  {
    key: "calculus",
    title: "Calculus: Differentiation, Chain Rule & Limits",
    subject: "Mathematics",
    fileName: "Calculus_Chapter4_Notes.pdf",
    badge: "High Yield",
    desc: "Limit definitions, product rule, chain rule, and implicit derivatives",
  },
  {
    key: "physics_newton",
    title: "Physics: Newton's Laws, Dynamics & Energy",
    subject: "Physics",
    fileName: "Physics_Mechanics_Lecture.pdf",
    badge: "Exam Prep",
    desc: "Free-body diagrams, momentum conservation, and friction dynamics",
  },
];

export default function FlashcardsPage() {
  const { userId, userName } = useAuth();

  // Convex Queries and Mutations
  const decks = useQuery(api.flashcards.getDecks, { studentId: userId || undefined });
  const seedSampleDecks = useMutation(api.flashcards.seedSampleDecks);
  const deleteDeckMutation = useMutation(api.flashcards.deleteDeck);
  const reviewCardMutation = useMutation(api.flashcards.reviewCard);
  const setDeckExamTargetMutation = useMutation(api.flashcards.setDeckExamTarget);
  const generateDeckMutation = useMutation(api.flashcards.createDeckWithCards);

  // Component UI States
  const [mounted, setMounted] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState<Id<"flashcardDecks"> | null>(null);
  const [studyViewMode, setStudyViewMode] = useState<"study" | "browser" | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Active Deck Data Query (when studying or browsing)
  const activeDeckData = useQuery(
    api.flashcards.getDeckWithCards,
    activeDeckId ? { deckId: activeDeckId } : "skip"
  );

  // Study Session States
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedMcqOption, setSelectedMcqOption] = useState<string | null>(null);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionReviewedCount, setSessionReviewedCount] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cardReasoning, setCardReasoning] = useState("");
  const [isAnalyzingThought, setIsAnalyzingThought] = useState(false);
  const [cardThoughtAnalysis, setCardThoughtAnalysis] = useState<{
    feedback: string;
    thinkingQuality: string;
    keyInsight?: string;
    tobyComment?: string;
  } | null>(null);

  // Real-time Closed Loop Sync Feedback
  const [syncToast, setSyncToast] = useState<{ message: string; type: "success" | "warning" } | null>(null);

  // Generator / Upload Modal States
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generationTab, setGenerationTab] = useState<"upload" | "sample" | "text">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSampleKey, setSelectedSampleKey] = useState<string>("smart_education");
  const [rawText, setRawText] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [cardType, setCardType] = useState<"direct_question" | "explanatory" | "one_word" | "mcq" | "mixed">("mixed");
  const [targetExamDays, setTargetExamDays] = useState<number | null>(14);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exam Target Modal
  const [examTargetModalDeck, setExamTargetModalDeck] = useState<{
    id: Id<"flashcardDecks">;
    title: string;
    currentExamDate?: number;
  } | null>(null);
  const [examTargetInputDays, setExamTargetInputDays] = useState<number | "custom">(14);
  const [customExamDateString, setCustomExamDateString] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Seed sample decks automatically if none exist
  useEffect(() => {
    if (decks && decks.length === 0) {
      seedSampleDecks({ studentId: userId || undefined }).catch(console.error);
    }
  }, [decks, seedSampleDecks, userId]);

  const activeCards = activeDeckData?.cards || [];
  const currentCard: Flashcard | undefined = activeCards[currentCardIndex];

  // Flip card handler
  const handleFlip = () => {
    soundEffects.playClick();
    setIsFlipped(!isFlipped);
  };

  // Option selection for MCQ
  const handleSelectOption = (opt: string) => {
    soundEffects.playClick();
    setSelectedMcqOption(opt);
  };

  // Speech synthesizer for audio reading
  const speakCard = useCallback(() => {
    if (!currentCard || typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = isFlipped
      ? `Answer: ${currentCard.back}. Key takeaway: ${currentCard.keyTakeaway || ""}`
      : `Question: ${currentCard.front}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [currentCard, isFlipped, isSpeaking]);

  // Analyze Flashcard Thought Process via AI
  const handleAnalyzeCardThought = async () => {
    if (!currentCard || !cardReasoning.trim()) return;
    setIsAnalyzingThought(true);

    try {
      const response = await fetch("/api/ai/analyze-reasoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextType: "flashcard",
          topic: activeDeckData?.deck.title || "Flashcard Deck",
          question: currentCard.front,
          studentAnswer: selectedMcqOption || "Card recall",
          correctAnswer: currentCard.back,
          isCorrect: isFlipped,
          studentReasoning: cardReasoning.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCardThoughtAnalysis(data);
      }
    } catch (err) {
      console.warn("Card thought analysis fallback:", err);
    } finally {
      setIsAnalyzingThought(false);
    }
  };

  // SM-2 Review Recording
  const handleRateReview = async (quality: "again" | "hard" | "good" | "easy") => {
    if (!currentCard) return;

    let xpGain = 10;

    if (quality === "again") {
      xpGain = 2;
      soundEffects.playClick();
      setSessionStreak(0);
    } else if (quality === "hard") {
      xpGain = 8;
      soundEffects.playCorrect();
      setSessionStreak((s) => s + 1);
    } else if (quality === "good") {
      xpGain = 15;
      soundEffects.playCorrect();
      setSessionStreak((s) => s + 1);
    } else if (quality === "easy") {
      xpGain = 25;
      soundEffects.playLevelUp();
      setSessionStreak((s) => s + 2);
    }

    setSessionXp((x) => x + xpGain);
    setSessionReviewedCount((r) => r + 1);

    try {
      const syncResult = await reviewCardMutation({
        cardId: currentCard._id,
        deckId: currentCard.deckId,
        rating: quality,
        studentId: userId || undefined,
        reasoning: cardReasoning.trim() || undefined,
        thoughtAnalysis: cardThoughtAnalysis?.feedback || undefined,
      });

      if (syncResult && syncResult.syncedConceptTitle) {
        setSyncToast({
          message: `Closed-Loop Sync: Mastery updated for ${syncResult.syncedConceptTitle}!`,
          type: "success",
        });
        setTimeout(() => setSyncToast(null), 3000);
      }
    } catch (err) {
      console.error("Failed to record review:", err);
    }

    if (currentCardIndex + 1 < activeCards.length) {
      setCurrentCardIndex((i) => i + 1);
      setIsFlipped(false);
      setSelectedMcqOption(null);
      setCardReasoning("");
      setCardThoughtAnalysis(null);
    } else {
      setIsSessionComplete(true);
      soundEffects.playLevelUp();
    }
  };

  // Launch Study Mode
  const startStudying = (deckId: Id<"flashcardDecks">) => {
    soundEffects.playClick();
    setActiveDeckId(deckId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSelectedMcqOption(null);
    setSessionReviewedCount(0);
    setSessionStreak(0);
    setSessionXp(0);
    setIsSessionComplete(false);
    setStudyViewMode("study");
  };

  // Open Deck Browser (Card Table)
  const openDeckBrowser = (deckId: Id<"flashcardDecks">) => {
    soundEffects.playClick();
    setActiveDeckId(deckId);
    setStudyViewMode("browser");
  };

  // Delete Deck
  const handleDeleteDeck = async (deckId: Id<"flashcardDecks">, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this deck and all its flashcards?")) {
      await deleteDeckMutation({ deckId });
      soundEffects.playClick();
      if (activeDeckId === deckId) {
        setActiveDeckId(null);
        setStudyViewMode(null);
      }
    }
  };

  // Save Exam Target
  const handleSaveExamTarget = async () => {
    if (!examTargetModalDeck) return;
    soundEffects.playClick();

    let targetTimestamp: number | undefined;
    const now = Date.now();

    if (examTargetInputDays === "custom" && customExamDateString) {
      targetTimestamp = new Date(customExamDateString).getTime();
    } else if (typeof examTargetInputDays === "number") {
      targetTimestamp = now + examTargetInputDays * 24 * 60 * 60 * 1000;
    }

    await setDeckExamTargetMutation({
      deckId: examTargetModalDeck.id,
      targetExamDate: targetTimestamp,
    });

    setExamTargetModalDeck(null);
  };

  // Generate Deck via AI
  const handleGenerateDeck = async () => {
    setIsGenerating(true);
    setGenerationStep(1);

    try {
      let payloadFileContent: string | undefined;
      let payloadFileName: string | undefined;

      if (generationTab === "upload" && selectedFile) {
        payloadFileName = selectedFile.name;
        const reader = new FileReader();
        payloadFileContent = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(selectedFile);
        });
      }

      setGenerationStep(2);

      const response = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: generationTab,
          fileContent: payloadFileContent,
          fileName: payloadFileName,
          sampleKey: selectedSampleKey,
          rawText: rawText,
          cardType: cardType,
          customTitle: customTitle,
          targetExamDays: targetExamDays,
        }),
      });

      if (!response.ok) {
        throw new Error("Flashcard generation failed");
      }

      setGenerationStep(3);
      const result = await response.json();

      let examTimestamp: number | undefined;
      if (targetExamDays && targetExamDays > 0) {
        examTimestamp = Date.now() + targetExamDays * 24 * 60 * 60 * 1000;
      }

      const newDeck = await generateDeckMutation({
        studentId: userId || undefined,
        title: result.title || customTitle || "New Study Deck",
        subject: result.subject || "General",
        description: result.description || "Generated via AI Document Ingestion",
        isSample: false,
        cardType: cardType,
        cards: result.cards || [],
      });

      if (newDeck?.deckId && examTimestamp) {
        await setDeckExamTargetMutation({
          deckId: newDeck.deckId,
          targetExamDate: examTimestamp,
        });
      }

      soundEffects.playLevelUp();
      setIsGeneratorOpen(false);
      setIsGenerating(false);
      setGenerationStep(0);
      setSelectedFile(null);
      setRawText("");
      setCustomTitle("");
      setTargetExamDays(null);

      if (newDeck?.deckId) {
        setActiveDeckId(newDeck.deckId);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setSelectedMcqOption(null);
        setSessionReviewedCount(0);
        setSessionStreak(0);
        setSessionXp(0);
        setIsSessionComplete(false);
        setStudyViewMode("study");
      }
    } catch (err) {
      console.error("Deck generation failed:", err);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  // Filtered Decks List
  const filteredDecks = (decks || []).filter((deck) => {
    const matchSearch =
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deck.subject && deck.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchSubject = filterSubject === "All" || deck.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  const totalCardsCount = (decks || []).reduce((acc, d) => acc + (d.cardCount || 0), 0);
  const totalMasteredCount = (decks || []).reduce((acc, d) => acc + (d.masteredCount || 0), 0);

  const getExamCountdownText = (targetExamDate?: number) => {
    if (!targetExamDate) return null;
    const diff = targetExamDate - Date.now();
    if (diff <= 0) return "Exam today / past";
    const hours = Math.round(diff / (60 * 60 * 1000));
    if (hours < 24) return `Exam in ${hours}h`;
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    return `Exam in ${days}d`;
  };

  // ════════════════════════════════════════════════════════════════════
  // 1. DEDICATED FLASHCARD STUDY ARENA
  // ════════════════════════════════════════════════════════════════════
  if (studyViewMode === "study" && activeDeckData) {
    const theme = SUBJECT_THEMES[activeDeckData.deck.subject || "General"] || SUBJECT_THEMES.General;
    return (
      <div className="max-w-2xl mx-auto pb-12 animate-fade-in text-[#1C1E23] font-sans antialiased">
        {syncToast && (
          <div
            className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 py-2 px-4 rounded-full text-xs font-bold shadow-lg animate-fade-in flex items-center gap-1.5 ${
              syncToast.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-amber-50 text-amber-900 border border-amber-200"
            }`}
          >
            {syncToast.type === "success" ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>{syncToast.message}</span>
          </div>
        )}

        <div className="bg-white w-full rounded-[32px] shadow-sm border border-[#E6EAF2] overflow-hidden flex flex-col">
          {/* Top Header Bar */}
          <div className="p-4 border-b border-[#F0F3F8] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setStudyViewMode(null);
                }}
                className="bg-[#F4F6FB] hover:bg-[#EAEFF8] text-xs py-1.5 px-3.5 rounded-full border border-[#E2E6F0] flex items-center gap-1 font-bold cursor-pointer shrink-0 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Library</span>
              </button>

              <div className="truncate">
                <h2 className="text-sm md:text-base font-extrabold text-[#18181B] truncate m-0 flex items-center gap-1.5">
                  <span>{theme.icon}</span>
                  <span className="truncate">{activeDeckData.deck.title}</span>
                </h2>
                <p className="text-[11px] font-bold text-[#7E8494] m-0">
                  Card {currentCardIndex + 1} of {activeCards.length} • {sessionStreak} 🔥 streak • +{sessionXp} XP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={speakCard}
                className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                  isSpeaking
                    ? "bg-[#FF642F] text-white border-[#FF642F]"
                    : "bg-[#F4F6FB] hover:bg-[#EAEFF8] text-[#7E8494] border-[#E2E6F0]"
                }`}
                title="Read aloud"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setStudyViewMode(null);
                }}
                className="w-8 h-8 rounded-full bg-[#F4F6FB] hover:bg-[#EAEFF8] border border-[#E2E6F0] flex items-center justify-center text-[#7E8494] hover:text-[#18181B] cursor-pointer"
                title="Close Study"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Track */}
          <div className="w-full bg-[#E5E9F2] h-1.5 shrink-0">
            <div
              className="bg-[#FF642F] h-full transition-all duration-300"
              style={{
                width: `${((currentCardIndex + 1) / activeCards.length) * 100}%`,
              }}
            />
          </div>

          {/* Study Area / Interactive Flippable Card */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
            {!isSessionComplete && currentCard ? (
              <>
                <div className="w-full select-none cursor-pointer" onClick={handleFlip}>
                  {!isFlipped ? (
                    <div className="w-full min-h-[300px] rounded-[26px] p-6 bg-[#F8FAFD] border-2 border-[#E2E6F0] shadow-xs flex flex-col justify-between transition-all duration-300 hover:border-[#FF642F]">
                      <div>
                        <div className="flex items-center justify-between mb-3 border-b border-[#EAEFF8] pb-2.5">
                          <span className="text-[10px] font-bold text-[#FF642F] bg-blue-50 py-0.5 px-2.5 rounded-full">
                            {currentCard.cardType === "mcq"
                              ? "🔘 MCQ QUESTION"
                              : currentCard.cardType === "one_word"
                              ? "⚡ FILL IN THE BLANK"
                              : "🎯 DIRECT QUESTION"}
                          </span>
                          <span className="text-[10px] font-bold text-[#7E8494] bg-white border border-[#E2E6F0] py-0.5 px-2 rounded-full capitalize">
                            {currentCard.difficulty}
                          </span>
                        </div>

                        <div className="text-base sm:text-lg font-extrabold text-[#18181B] leading-relaxed my-3 text-left">
                          <MarkdownRenderer content={currentCard.front} />
                        </div>

                        {currentCard.options && currentCard.options.length > 0 && (
                          <div className="space-y-2 mt-3 text-left">
                            {currentCard.options.map((opt, i) => {
                              const isSelected = selectedMcqOption === opt;
                              return (
                                <button
                                  key={i}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectOption(opt);
                                  }}
                                  className={`w-full text-left p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-[#EBF3FE] border-[#FF642F] text-[#1E3A8A]"
                                      : "bg-white border-[#E2E6F0] hover:border-[#FF642F] text-[#181A20]"
                                  }`}
                                >
                                  <span>{opt}</span>
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? "bg-[#FF642F] text-white" : "bg-[#F4F6FB] text-[#7E8494]"}`}>
                                    {String.fromCharCode(65 + i)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#EAEFF8] flex items-center justify-between text-xs text-[#7E8494] font-semibold mt-4">
                        <span>Click card to reveal answer</span>
                        <span className="text-[#FF642F] font-bold">Flip ↺</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full min-h-[300px] rounded-[26px] p-6 bg-white border-2 border-[#FF642F] shadow-md flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3 border-b border-[#F0F3F8] pb-2.5">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 py-0.5 px-2.5 rounded-full border border-emerald-200">
                            ✓ Verified Key Concept
                          </span>
                          <span className="text-xs font-bold text-[#7E8494]">
                            #{currentCardIndex + 1} of {activeCards.length}
                          </span>
                        </div>

                        <div className="text-base sm:text-lg font-bold text-[#18181B] leading-relaxed my-2 text-left">
                          <MarkdownRenderer content={currentCard.back} />
                        </div>

                        {currentCard.keyTakeaway && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900 text-left">
                            <strong>Takeaway:</strong> {currentCard.keyTakeaway}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#F0F3F8] flex items-center justify-between text-xs text-[#7E8494] font-semibold mt-4">
                        <span>Rate your recall to adjust spaced interval:</span>
                        <span className="text-[#FF642F] font-bold">Flip back ↺</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metacognitive Reasoning Input: "What led to your answer or recall?" */}
                <div className="mt-4 bg-[#F8FAFD] p-4 rounded-[22px] border border-[#E6EAF2] text-left">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#181A20] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF642F]" />
                      <span>What was your thinking? (Optional)</span>
                    </label>
                    <span className="text-[10px] text-[#7E8494] font-medium">
                      Diagnose what led to your recollection
                    </span>
                  </div>

                  {/* Quick Thought Starter Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {[
                      "💡 Remembered core rule",
                      "🔍 Derived step-by-step",
                      "🧩 Used mental analogy",
                      "❓ Confused with another topic",
                      "🎲 Lucky guess",
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          const cleanChip = chip.replace(/^[^\s]+\s*/, "");
                          setCardReasoning((prev) =>
                            prev ? `${prev}. ${cleanChip}` : `I ${cleanChip.toLowerCase()}`
                          );
                        }}
                        className="text-[10px] font-bold bg-white hover:bg-[#EAEFF8] text-[#555C6E] hover:text-[#181A20] px-2.5 py-1 rounded-full border border-[#E2E6F0] transition-colors cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cardReasoning}
                      onChange={(e) => setCardReasoning(e.target.value)}
                      placeholder="What were you thinking? (e.g. 'I remembered Snell's ratio n1*sin(t1) = n2*sin(t2)...')"
                      className="flex-1 bg-white focus:bg-white text-xs text-[#181A20] placeholder-[#8C93A4] px-3.5 py-2 rounded-xl border border-[#E2E6F0] focus:border-[#FF642F] outline-none transition-all"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAnalyzeCardThought();
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAnalyzeCardThought}
                      disabled={!cardReasoning.trim() || isAnalyzingThought}
                      className="bg-[#FF642F] hover:bg-[#E85520] disabled:opacity-40 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer shadow-xs"
                    >
                      {isAnalyzingThought ? "Analyzing…" : "Check Thought"}
                    </button>
                  </div>

                  {/* AI Thought Feedback Banner */}
                  {cardThoughtAnalysis && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-[#DCE2EE] space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#181A20] flex items-center gap-1">
                          <span>🧠 AI Thinking Breakdown:</span>
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3FE] text-[#FF642F] border border-[#D1E2FB]">
                          {cardThoughtAnalysis.thinkingQuality}
                        </span>
                      </div>
                      <p className="text-xs text-[#555C6E] leading-relaxed m-0 font-medium">
                        {cardThoughtAnalysis.feedback}
                      </p>
                      {cardThoughtAnalysis.tobyComment && (
                        <div className="text-[10px] font-semibold text-[#5A2C18] bg-[#FFE4D6]/60 p-2 rounded-lg border border-[#FFBFA8]/40">
                          🤖 Toby says: &ldquo;{cardThoughtAnalysis.tobyComment}&rdquo;
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Rating Bar */}
                {isFlipped && (
                  <div className="mt-4">
                    <div className="text-xs font-bold text-[#7E8494] mb-2 text-center">
                      Rate how well you recalled this card:
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "again", label: "Again", desc: "< 10m", color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
                        { id: "hard", label: "Hard", desc: "1 day", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
                        { id: "good", label: "Good", desc: "3 days", color: "bg-blue-50 text-[#FF642F] border-blue-200 hover:bg-blue-100" },
                        { id: "easy", label: "Easy", desc: "7 days", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => handleRateReview(btn.id as any)}
                          className={`p-3 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${btn.color}`}
                        >
                          <div className="font-extrabold">{btn.label}</div>
                          <div className="text-[10px] opacity-75">{btn.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-2xl">
                  🎉
                </div>
                <h3 className="text-xl font-black text-[#18181B] mb-1">Session Complete!</h3>
                <p className="text-xs text-[#7E8494] font-medium mb-5">
                  You reviewed {sessionReviewedCount} cards and earned +{sessionXp} XP.
                </p>
                <button
                  onClick={() => setStudyViewMode(null)}
                  className="bg-[#FF642F] hover:bg-[#2554D4] text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-sm shadow-[#FF642F]/25 cursor-pointer"
                >
                  Back to Flashcard Studio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // 2. DEDICATED CARD BROWSER VIEW
  // ════════════════════════════════════════════════════════════════════
  if (studyViewMode === "browser" && activeDeckData) {
    return (
      <div className="max-w-4xl mx-auto pb-10 animate-fade-in text-[#1C1E23] font-sans antialiased">
        <div className="bg-white rounded-[32px] shadow-sm border border-[#E6EAF2] overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-[#F0F3F8] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStudyViewMode(null)}
                className="bg-[#F4F6FB] hover:bg-[#EAEFF8] text-xs py-1.5 px-3.5 rounded-full border border-[#E2E6F0] flex items-center gap-1 font-bold cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Library</span>
              </button>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#18181B] m-0">
                  {activeDeckData.deck.title} • Card Browser
                </h2>
                <p className="text-xs text-[#7E8494] m-0 font-medium">
                  {activeCards.length} total flashcards in this deck
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                setStudyViewMode("study");
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className="bg-[#FF642F] hover:bg-[#2554D4] text-white text-xs font-bold py-2 px-4 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Launch Study Mode</span>
            </button>
          </div>

          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3.5">
            {activeCards.map((c, i) => (
              <div key={c._id} className="p-4 rounded-2xl border border-[#E6EAF2] bg-[#F8FAFD] flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-[#FF642F] bg-blue-50 py-0.5 px-2 rounded-full">
                      Card #{i + 1}
                    </span>
                    <span className="text-[10px] font-bold text-[#7E8494] bg-white border border-[#E2E6F0] py-0.5 px-2 rounded-full capitalize">
                      {c.difficulty}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#18181B] mb-2">
                    <MarkdownRenderer content={c.front} />
                  </div>
                  <div className="text-xs text-[#555C6E] bg-white p-3 rounded-xl border border-[#E2E6F0]">
                    <MarkdownRenderer content={c.back} />
                  </div>
                </div>
                <div className="w-full md:w-44 shrink-0 text-right text-[11px] font-bold text-[#7E8494]">
                  <div>Mastery: {c.masteryLevel}/5</div>
                  <div className="opacity-75">{c.reviewCount} reviews</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // 3. MAIN CLEAN FLASHCARD STUDIO (FOCUSED & BEAUTIFUL)
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-[#1C1E23] font-sans antialiased">
      {/* ── 1. Top Header Bar ── */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-[#E6EAF2]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FE] text-[#FF642F] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Notes to Flashcards • Review Before You Forget</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight m-0">
              PDF Flashcard Studio
            </h1>
            <p className="text-xs sm:text-sm text-[#7E8494] font-medium mt-1 mb-0">
              Turn lecture slides, PDFs, and notes into interactive cards that help you remember formulas and key points.
            </p>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setIsGeneratorOpen(true);
            }}
            className="bg-[#FF642F] hover:bg-[#2554D4] text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-sm shadow-[#FF642F]/25 flex items-center gap-2 cursor-pointer group transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform" />
            <span>Upload PDF / Create Deck</span>
          </button>
        </div>
      </div>

      {/* ── 2. Focused Flashcard Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-gradient-to-br from-[#FFE4D6] via-[#FFBFA8] to-[#FFA199] rounded-[24px] p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A2C18]">Active Decks</span>
            <div className="w-7 h-7 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-[#2A1208]">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#1C1E23] tracking-tight">{decks ? decks.length : 0}</div>
            <div className="text-[11px] font-semibold text-[#5A2C18] mt-0.5">study decks ready</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#C4F6EE] via-[#A8E2F9] to-[#99B6F9] rounded-[24px] p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E3830]">Cards Mastered</span>
            <div className="w-7 h-7 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-[#082420]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#1C1E23] tracking-tight">{totalMasteredCount}</div>
            <div className="text-[11px] font-semibold text-[#0E3830] mt-0.5">of {totalCardsCount} cards</div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-5 border border-[#E6EAF2] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8494]">Study Streak</span>
            <div className="w-7 h-7 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#FF7A00]">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">5 🔥</div>
            <div className="text-[11px] font-semibold text-[#7E8494] mt-0.5">days active</div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-5 border border-[#E6EAF2] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8494]">Total Study XP</span>
            <div className="w-7 h-7 rounded-full bg-[#EBF3FE] flex items-center justify-center text-[#FF642F]">
              <Zap className="w-3.5 h-3.5 fill-[#FF642F]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">420</div>
            <div className="text-[11px] font-semibold text-[#7E8494] mt-0.5">points earned</div>
          </div>
        </div>
      </div>

      {/* ── 3. Search & Subject Filter Row ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C93A4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search decks by keyword…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-xs font-bold text-[#181A20] placeholder-[#8C93A4] pl-9 pr-4 py-2.5 rounded-full outline-none border border-[#E2E6F0] focus:border-[#FF642F] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7E8494] hover:text-[#181A20] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
          {["All", "Mathematics", "Physics", "Chemistry", "AI & Computer Science"].map((subj) => (
            <button
              key={subj}
              onClick={() => setFilterSubject(subj)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                filterSubject === subj
                  ? "bg-[#FF642F] text-white shadow-sm shadow-[#FF642F]/25"
                  : "bg-white text-[#555C6E] hover:text-[#181A20] border border-[#E2E6F0]"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Deck Library Grid ── */}
      {filteredDecks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDecks.map((deck) => {
            const theme = SUBJECT_THEMES[deck.subject || "General"] || SUBJECT_THEMES.General;
            const progress = deck.cardCount > 0 ? Math.round((deck.masteredCount / deck.cardCount) * 100) : 0;
            const countdownText = getExamCountdownText(deck.targetExamDate);

            return (
              <div
                key={deck._id}
                className="bg-white rounded-[28px] p-5.5 flex flex-col justify-between relative group transition-all duration-300 hover:shadow-md border border-[#E6EAF2]"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-[#7E8494] bg-[#F4F6FB] border border-[#E2E6F0] py-0.5 px-2.5 rounded-full flex items-center gap-1">
                        <span>{theme.icon}</span>
                        <span>{deck.subject || "General"}</span>
                      </span>
                      {deck.cardType && (
                        <span className="text-[9px] font-bold text-[#FF642F] bg-blue-50 py-0.5 px-2 rounded-full capitalize">
                          {deck.cardType.replace("_", " ")}
                        </span>
                      )}
                      {deck.isSample && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 py-0.5 px-2 rounded-full">
                          Sample
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleDeleteDeck(deck._id, e)}
                      className="opacity-0 group-hover:opacity-100 text-[#8C93A4] hover:text-[#E11D48] transition-opacity p-1 cursor-pointer"
                      title="Delete deck"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-extrabold text-base text-[#18181B] leading-snug mb-1.5 line-clamp-2 group-hover:text-[#FF642F] transition-colors">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-[#7E8494] font-medium line-clamp-2 mb-3 leading-relaxed">
                    {deck.description || "Interactive flashcard study deck"}
                  </p>

                  {/* 🎯 Exam Target Pill */}
                  <div className="mb-4">
                    {countdownText ? (
                      <div
                        onClick={() =>
                          setExamTargetModalDeck({
                            id: deck._id,
                            title: deck.title,
                            currentExamDate: deck.targetExamDate,
                          })
                        }
                        className="p-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2E6F0] flex items-center justify-between gap-2 cursor-pointer hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-[#059669]" />
                          <span className="text-[11px] font-bold text-[#0D3E30]">{countdownText}</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#059669] bg-emerald-50 py-0.5 px-2 rounded-full border border-emerald-200">
                          {progress}% Ready
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setExamTargetModalDeck({
                            id: deck._id,
                            title: deck.title,
                            currentExamDate: undefined,
                          })
                        }
                        className="text-[11px] font-bold text-[#7E8494] hover:text-[#FF642F] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Set Target Exam Date</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Mastery Progress + Action Buttons */}
                <div className="pt-3.5 border-t border-[#F2F4F8] mt-auto">
                  <div className="flex items-center justify-between mb-2 text-xs font-bold text-[#18181B]">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#7E8494]">
                      <Layers className="w-3.5 h-3.5" />
                      {deck.cardCount} cards • {deck.masteredCount} mastered
                    </span>
                    <span className="text-[#FF642F] font-extrabold">{progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 rounded-full bg-[#E5E9F2] overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full bg-[#FF642F] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startStudying(deck._id)}
                      className="bg-[#FF642F] hover:bg-[#2554D4] text-white flex-1 text-xs font-bold py-2 px-3 rounded-full shadow-xs shadow-[#FF642F]/25 cursor-pointer text-center transition-all"
                    >
                      <span>Study Now</span>
                    </button>
                    <button
                      onClick={() => openDeckBrowser(deck._id)}
                      className="w-8 h-8 rounded-full bg-[#F4F6FB] hover:bg-[#EAEFF8] border border-[#E2E6F0] flex items-center justify-center text-[#555C6E] hover:text-[#181A20] transition-colors cursor-pointer"
                      title="Browse Cards"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[28px] p-12 text-center border border-[#E6EAF2]">
          <BookOpen className="w-8 h-8 text-[#8C93A4] mx-auto mb-3" />
          <p className="text-sm font-bold text-[#181A20]">No flashcard decks found.</p>
          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="mt-3 text-xs font-bold text-[#FF642F] hover:underline cursor-pointer"
          >
            Upload a PDF to create your first deck →
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SET TARGET EXAM DATE MODAL (INTERVAL COMPRESSION)
      ════════════════════════════════════════════════════════════════════ */}
      {mounted && examTargetModalDeck && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl border border-[#E6EAF2] p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#FF642F] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#18181B] m-0">Set Target Exam Date</h3>
                  <p className="text-xs text-[#7E8494] m-0 line-clamp-1">{examTargetModalDeck.title}</p>
                </div>
              </div>
              <button
                onClick={() => setExamTargetModalDeck(null)}
                className="w-7 h-7 rounded-full bg-[#F4F6FB] flex items-center justify-center text-[#7E8494] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { days: 3, label: "3 Days (Cram)" },
                { days: 7, label: "1 Week" },
                { days: 14, label: "2 Weeks" },
                { days: 30, label: "1 Month" },
              ].map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setExamTargetInputDays(opt.days)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    examTargetInputDays === opt.days
                      ? "bg-[#EBF3FE] border-[#FF642F] text-[#1E3A8A]"
                      : "bg-[#F8FAFD] border-[#E2E6F0] hover:bg-white text-[#181A20]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setExamTargetModalDeck(null)}
                className="bg-[#F4F6FB] text-[#181A20] text-xs font-bold py-2 px-4 rounded-full border border-[#E2E6F0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExamTarget}
                className="bg-[#FF642F] hover:bg-[#2554D4] text-white text-xs font-bold py-2 px-5 rounded-full shadow-sm shadow-[#FF642F]/25 cursor-pointer"
              >
                Save & Recalibrate
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ════════════════════════════════════════════════════════════════════
          UPLOAD PDF / CREATE DECK STUDIO MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {mounted && isGeneratorOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl border border-[#E6EAF2] overflow-hidden flex flex-col max-h-[88vh] my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#F0F3F8] flex items-center justify-between bg-white shrink-0">
              <div>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF642F] bg-blue-50 py-0.5 px-2.5 rounded-full mb-1">
                  ✨ Gemini Multimodal Ingestion
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#18181B] m-0">Generate Flashcard Deck</h2>
              </div>

              <button
                onClick={() => !isGenerating && setIsGeneratorOpen(false)}
                disabled={isGenerating}
                className="w-8 h-8 rounded-full bg-[#F4F6FB] hover:bg-[#EAEFF8] border border-[#E2E6F0] flex items-center justify-center text-[#7E8494] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4">
              {!isGenerating ? (
                <>
                  {/* Tabs */}
                  <div className="flex rounded-2xl bg-[#F4F6FB] p-1 border border-[#E2E6F0]">
                    {[
                      { id: "upload", label: "Upload PDF / Slide", icon: Upload },
                      { id: "sample", label: "Pre-loaded Samples", icon: Sparkles },
                      { id: "text", label: "Paste Lecture Notes", icon: FileText },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setGenerationTab(tab.id as any)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          generationTab === tab.id
                            ? "bg-white text-[#18181B] shadow-xs"
                            : "text-[#7E8494] hover:text-[#18181B]"
                        }`}
                      >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {generationTab === "upload" && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) setSelectedFile(file);
                      }}
                      className="p-8 rounded-[24px] border-2 border-dashed border-[#D1E2FB] bg-[#F8FAFD] hover:bg-white text-center cursor-pointer transition-all"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt,.md"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setSelectedFile(file);
                        }}
                      />
                      <div className="w-10 h-10 rounded-full bg-[#EBF3FE] text-[#FF642F] flex items-center justify-center mx-auto mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-[#18181B] m-0">
                        {selectedFile ? selectedFile.name : "Drop PDF / Slide notes here or click to browse"}
                      </p>
                      <p className="text-[11px] text-[#7E8494] m-0 mt-1">Supports PDF & text notes up to 25 MB</p>
                    </div>
                  )}

                  {generationTab === "sample" && (
                    <div className="space-y-2">
                      {SAMPLE_PRESETS.map((sample) => (
                        <div
                          key={sample.key}
                          onClick={() => setSelectedSampleKey(sample.key)}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                            selectedSampleKey === sample.key
                              ? "bg-[#EBF3FE] border-[#FF642F]"
                              : "bg-[#F8FAFD] border-[#E2E6F0] hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-extrabold text-[#18181B]">{sample.title}</span>
                            <span className="text-[10px] font-bold text-[#FF642F] bg-white border border-[#D1E2FB] px-2 py-0.5 rounded-full">
                              {sample.subject}
                            </span>
                          </div>
                          <p className="text-xs text-[#7E8494] m-0">{sample.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {generationTab === "text" && (
                    <textarea
                      rows={4}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="Paste textbook excerpts, definitions, formulas..."
                      className="w-full p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E2E6F0] text-xs font-medium focus:outline-none focus:border-[#FF642F]"
                    />
                  )}

                  {/* Card Format Selector */}
                  <div>
                    <label className="text-xs font-bold text-[#18181B] block mb-2">Select Card Format</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {CARD_TYPE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setCardType(preset.id as any)}
                          className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                            cardType === preset.id
                              ? "bg-[#EBF3FE] border-[#FF642F] text-[#1E3A8A]"
                              : "bg-[#F8FAFD] border-[#E2E6F0] hover:bg-white text-[#555C6E]"
                          }`}
                        >
                          <preset.icon className="w-4 h-4 mx-auto mb-1 text-[#FF642F]" />
                          <div className="text-[11px] font-bold leading-tight">{preset.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Loader2 className="w-10 h-10 text-[#FF642F] animate-spin mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[#18181B] mb-1">
                    {generationStep === 1
                      ? "Reading multimodal pages…"
                      : generationStep === 2
                      ? "Extracting high-yield concepts & pitfalls…"
                      : "Structuring interactive 3D flashcards…"}
                  </h3>
                  <p className="text-xs text-[#7E8494]">Please hold on while Axiora AI builds your deck.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!isGenerating && (
              <div className="p-4 border-t border-[#F0F3F8] flex items-center justify-between bg-white shrink-0">
                <button
                  onClick={() => setIsGeneratorOpen(false)}
                  className="bg-[#F4F6FB] text-[#181A20] text-xs font-bold py-2.5 px-5 rounded-full border border-[#E2E6F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateDeck}
                  className="bg-[#FF642F] hover:bg-[#2554D4] text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-sm shadow-[#FF642F]/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Flashcards</span>
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
