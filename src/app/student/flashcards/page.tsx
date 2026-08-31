"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
  Lightbulb,
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
  ShieldCheck,
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
  Mathematics: { color: "#7C3AED", card: "card-lavender", border: "#D5C4FA", icon: "📐" },
  Physics: { color: "#0284C7", card: "card-sky", border: "#BADEFC", icon: "⚛️" },
  Chemistry: { color: "#059669", card: "card-mint", border: "#B2E5D3", icon: "🧪" },
  "AI & Computer Science": { color: "#7C3AED", card: "card-lavender", border: "#D5C4FA", icon: "💻" },
  General: { color: "#D97706", card: "card-butter", border: "#FDE089", icon: "📚" },
};

const CARD_TYPE_PRESETS = [
  {
    id: "direct_question",
    label: "Direct Question",
    desc: "Crisp Q&A format",
    icon: HelpCircle,
    color: "#7C3AED",
    bg: "bg-[#E8DEFF]",
  },
  {
    id: "explanatory",
    label: "Explanatory Concept",
    desc: "Deep mechanisms & proofs",
    icon: AlignLeft,
    color: "#0284C7",
    bg: "bg-[#D6E8FA]",
  },
  {
    id: "one_word",
    label: "One-Word Recall",
    desc: "Term & definition blanks",
    icon: Hash,
    color: "#D97706",
    bg: "bg-[#FEF0C3]",
  },
  {
    id: "mcq",
    label: "MCQ Quiz",
    desc: "4-option interactive cards",
    icon: CircleDot,
    color: "#059669",
    bg: "bg-[#D2F1E6]",
  },
  {
    id: "mixed",
    label: "Mixed Variety",
    desc: "Balanced mix of all types",
    icon: Sparkles,
    color: "#E11D48",
    bg: "bg-[#FCD5CE]",
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
  const { userId } = useAuth();

  // Convex Queries and Mutations
  const decks = useQuery(api.flashcards.getDecks, { studentId: userId || undefined });
  const seedSampleDecks = useMutation(api.flashcards.seedSampleDecks);
  const createDeckWithCards = useMutation(api.flashcards.createDeckWithCards);
  const reviewCardMutation = useMutation(api.flashcards.reviewCard);
  const deleteDeckMutation = useMutation(api.flashcards.deleteDeck);
  const setDeckExamTargetMutation = useMutation(api.flashcards.setDeckExamTarget);

  // Studio / Generator Modal State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generationTab, setGenerationTab] = useState<"upload" | "sample" | "text">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("General");
  const [cardCount, setCardCount] = useState(8);
  const [cardType, setCardType] = useState<"direct_question" | "explanatory" | "one_word" | "mcq" | "mixed">("explanatory");
  const [difficulty, setDifficulty] = useState<"mixed" | "easy" | "medium" | "hard">("mixed");
  const [focusArea, setFocusArea] = useState<"comprehensive" | "formulas" | "definitions" | "exam_prep">("comprehensive");
  const [selectedSampleKey, setSelectedSampleKey] = useState("smart_education");
  const [targetExamDays, setTargetExamDays] = useState<number | null>(null); // e.g. 3 days, 7 days, or custom

  // Exam Target Modal State for Existing Decks
  const [examTargetModalDeck, setExamTargetModalDeck] = useState<{ id: Id<"flashcardDecks">; title: string; currentExamDate?: number } | null>(null);
  const [examTargetInputDays, setExamTargetInputDays] = useState<number | "custom">(3);
  const [customExamDateString, setCustomExamDateString] = useState("");

  // Loading & Step State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // Active Study Session State
  const [activeDeckId, setActiveDeckId] = useState<Id<"flashcardDecks"> | null>(null);
  const [studyViewMode, setStudyViewMode] = useState<"study" | "browser" | null>(null);
  const activeDeckData = useQuery(
    api.flashcards.getDeckWithCards,
    activeDeckId ? { deckId: activeDeckId } : "skip"
  );

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showClassmateHint, setShowClassmateHint] = useState(false);
  const [selectedMcqOption, setSelectedMcqOption] = useState<string | null>(null);
  const [sessionReviewedCount, setSessionReviewedCount] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");

  // Closed-Loop Real-Time Feedback Toast
  const [syncToast, setSyncToast] = useState<{ message: string; type: "success" | "warning" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto seed starter sample decks on initial load if none exist
  useEffect(() => {
    if (decks && decks.length === 0) {
      seedSampleDecks({ studentId: userId || undefined });
    }
  }, [decks, seedSampleDecks, userId]);

  const activeCards = activeDeckData?.cards || [];
  const currentCard = activeCards[currentCardIndex] as Flashcard | undefined;

  // ── Speech Synthesis (Read Card Aloud) ──
  const speakCard = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!currentCard) return;
    const textToSpeak = isFlipped
      ? currentCard.back.replace(/[$#*_]/g, "")
      : currentCard.front.replace(/[$#*_]/g, "");

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [currentCard, isFlipped, isSpeaking]);

  // ── Handle Card Flip ──
  const handleFlip = useCallback(() => {
    soundEffects.playClick();
    setIsFlipped((prev) => !prev);
  }, []);

  // ── Handle MCQ Option Click ──
  const handleSelectOption = (opt: string) => {
    setSelectedMcqOption(opt);
    if (!currentCard) return;

    const isCorrect =
      currentCard.correctOption &&
      (opt.trim().toLowerCase() === currentCard.correctOption.trim().toLowerCase() ||
        opt.startsWith(currentCard.correctOption.substring(0, 2)));

    if (isCorrect) {
      soundEffects.playCorrect();
    } else {
      soundEffects.playClick();
    }

    // Auto-flip card after a 450ms tactile feedback pause
    setTimeout(() => {
      setIsFlipped(true);
    }, 450);
  };

  // ── Handle Spaced Repetition Rating with Closed-Loop Mastery Sync ──
  const handleRating = useCallback(
    async (rating: "again" | "hard" | "good" | "easy") => {
      if (!currentCard || !activeDeckId) return;

      try {
        if (rating === "good" || rating === "easy") {
          const newStreak = sessionStreak + 1;
          setSessionStreak(newStreak);
          if (newStreak >= 3) {
            soundEffects.playCombo(newStreak);
          } else {
            soundEffects.playCorrect();
          }
          setSessionXp((prev) => prev + (rating === "easy" ? 25 : 15));
        } else {
          setSessionStreak(0);
          soundEffects.playClick();
          setSessionXp((prev) => prev + 5);
        }

        setSessionReviewedCount((prev) => prev + 1);

        const res = await reviewCardMutation({
          cardId: currentCard._id,
          deckId: activeDeckId,
          studentId: userId || undefined,
          rating,
        });

        // Show real-time closed loop feedback banner
        if (res?.syncedConceptTitle) {
          if (res.deltaScore > 0) {
            setSyncToast({
              message: `✨ Synced to Radar: +${res.deltaScore}% on ${res.syncedConceptTitle}`,
              type: "success",
            });
          } else {
            setSyncToast({
              message: `⚠️ Retention Risk updated for ${res.syncedConceptTitle}`,
              type: "warning",
            });
          }
          setTimeout(() => setSyncToast(null), 3000);
        }

        // Advance to next card or complete session
        if (currentCardIndex < activeCards.length - 1) {
          setIsFlipped(false);
          setShowClassmateHint(false);
          setSelectedMcqOption(null);
          if (isSpeaking && typeof window !== "undefined") {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
          }
          setCurrentCardIndex((prev) => prev + 1);
        } else {
          soundEffects.playCelebration();
          setIsSessionComplete(true);
        }
      } catch (err) {
        console.error("Error updating flashcard rating:", err);
      }
    },
    [
      currentCard,
      activeDeckId,
      sessionStreak,
      reviewCardMutation,
      userId,
      currentCardIndex,
      activeCards.length,
      isSpeaking,
    ]
  );

  // ── Keyboard Shortcuts for Power Study ──
  useEffect(() => {
    if (studyViewMode !== "study" || isSessionComplete || !currentCard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === "1") {
          e.preventDefault();
          handleRating("again");
        } else if (e.key === "2") {
          e.preventDefault();
          handleRating("hard");
        } else if (e.key === "3") {
          e.preventDefault();
          handleRating("good");
        } else if (e.key === "4") {
          e.preventDefault();
          handleRating("easy");
        }
      }

      if (e.key === "ArrowRight" && currentCardIndex < activeCards.length - 1) {
        setIsFlipped(false);
        setShowClassmateHint(false);
        setSelectedMcqOption(null);
        setCurrentCardIndex((i) => i + 1);
      } else if (e.key === "ArrowLeft" && currentCardIndex > 0) {
        setIsFlipped(false);
        setShowClassmateHint(false);
        setSelectedMcqOption(null);
        setCurrentCardIndex((i) => i - 1);
      } else if (e.key === "Escape") {
        setStudyViewMode(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    studyViewMode,
    isSessionComplete,
    currentCard,
    isFlipped,
    handleFlip,
    handleRating,
    currentCardIndex,
    activeCards.length,
  ]);

  // ── Generate Flashcards via AI Route ──
  const handleGenerateDeck = async () => {
    setIsGenerating(true);
    setGenerationStep(1);

    try {
      const stepTimer1 = setTimeout(() => setGenerationStep(2), 700);
      const stepTimer2 = setTimeout(() => setGenerationStep(3), 1500);

      let response: Response;

      if (generationTab === "upload" && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", customTitle.trim());
        formData.append("subject", selectedSubject);
        formData.append("cardCount", String(cardCount));
        formData.append("cardType", cardType);
        formData.append("difficulty", difficulty);
        formData.append("focusArea", focusArea);

        response = await fetch("/api/ai/generate-flashcards", {
          method: "POST",
          body: formData,
        });
      } else if (generationTab === "sample") {
        response = await fetch("/api/ai/generate-flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sampleKey: selectedSampleKey,
            title: customTitle.trim(),
            cardCount,
            cardType,
            difficulty,
            focusArea,
          }),
        });
      } else {
        response = await fetch("/api/ai/generate-flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: rawText,
            title: customTitle.trim(),
            subject: selectedSubject,
            cardCount,
            cardType,
            difficulty,
            focusArea,
          }),
        });
      }

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setGenerationStep(4);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        setIsGenerating(false);
        setGenerationStep(0);
        if (response.status === 429) {
          alert(`⚡ ${errJson.error || "Rate limit protected"}\n\n${errJson.message || "Please wait a moment before generating more AI decks to prevent API quota exhaustion."}`);
        } else {
          alert(`⚠️ Document Upload Issue: ${errJson.error || "Failed to process document"}`);
        }
        return;
      }

      const result = await response.json();

      // Calculate Target Exam Date timestamp if set
      const now = Date.now();
      const examTimestamp = targetExamDays ? now + targetExamDays * 24 * 60 * 60 * 1000 : undefined;

      // Save into Convex Database with AI synthesized relevant title
      const synthesizedTitle =
        result.deckTitle && result.deckTitle.trim().length > 0
          ? result.deckTitle
          : customTitle.trim() ||
            (selectedFile
              ? selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
              : "Academic Flashcard Deck");

      const newDeck = await createDeckWithCards({
        studentId: userId || undefined,
        title: synthesizedTitle,
        subject: result.subject || selectedSubject || "General",
        grade: "Class 12",
        fileName: selectedFile?.name || (generationTab === "sample" ? `${selectedSampleKey}.pdf` : undefined),
        fileSize: selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : undefined,
        description: result.description || "Generated via AI Document Ingestion",
        isSample: false,
        cardType: cardType,
        cards: result.cards || [],
      });

      // If exam target was configured, update it on the deck
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

      // Open new deck immediately in Study Mode!
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

  // ── Launch Study Mode for a specific Deck ──
  const startStudying = (deckId: Id<"flashcardDecks">) => {
    soundEffects.playClick();
    setActiveDeckId(deckId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowClassmateHint(false);
    setSelectedMcqOption(null);
    setSessionReviewedCount(0);
    setSessionStreak(0);
    setSessionXp(0);
    setIsSessionComplete(false);
    setStudyViewMode("study");
  };

  // ── Open Deck Browser (Card Table) ──
  const openDeckBrowser = (deckId: Id<"flashcardDecks">) => {
    soundEffects.playClick();
    setActiveDeckId(deckId);
    setStudyViewMode("browser");
  };

  // ── Delete a Deck ──
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

  // ── Save Exam Target on Existing Deck ──
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

  // ── Filtered Decks List ──
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

  // ── Helper for exam countdown calculation ──
  const getExamCountdownText = (targetExamDate?: number) => {
    if (!targetExamDate) return null;
    const diff = targetExamDate - Date.now();
    if (diff <= 0) return "Exam today / past";
    const hours = Math.round(diff / (60 * 60 * 1000));
    if (hours < 24) return `Exam in ${hours}h (Cram Mode)`;
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    return `Exam in ${days}d`;
  };

  // ════════════════════════════════════════════════════════════════════
  // 1. DEDICATED FLASHCARD STUDY ARENA (NO BACKGROUND SPACE)
  // ════════════════════════════════════════════════════════════════════
  if (studyViewMode === "study" && activeDeckData) {
    const theme = SUBJECT_THEMES[activeDeckData.deck.subject || "General"] || SUBJECT_THEMES.General;
    return (
      <div className="max-w-2xl mx-auto pb-12 animate-fade-in">
        {/* Real-time Closed Loop Sync Toast */}
        {syncToast && (
          <div
            className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 py-2 px-4 rounded-full text-xs font-bold shadow-lg animate-fade-in flex items-center gap-1.5 ${
              syncToast.type === "success"
                ? "bg-[#D2F1E6] text-[#0D3E30] border border-[#B2E5D3]"
                : "bg-[#FEF0C3] text-[#713F12] border border-[#FDE089]"
            }`}
          >
            {syncToast.type === "success" ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#059669]" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
            )}
            <span>{syncToast.message}</span>
          </div>
        )}

        <div className="bg-[#FAF8F5] w-full rounded-[32px] sm:rounded-[36px] shadow-lg border border-[#EBE5DB] overflow-hidden flex flex-col">
          {/* Top Header Bar */}
          <div className="p-3.5 sm:p-4 border-b border-[#EBE5DB] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setStudyViewMode(null);
                }}
                className="btn-pill-white text-xs py-1.5 px-3 flex items-center gap-1 font-bold cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Decks</span>
              </button>

              <div className="truncate">
                <h2 className="text-xs sm:text-sm md:text-base font-black text-[#18181B] truncate m-0 flex items-center gap-1.5">
                  <span>{theme.icon}</span>
                  <span className="truncate">{activeDeckData.deck.title}</span>
                </h2>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#71717A] m-0">
                  Card {currentCardIndex + 1} of {activeCards.length} • {sessionStreak} 🔥 streak • +{sessionXp} XP
                  {activeDeckData.deck.targetExamDate && (
                    <span className="text-[#059669] ml-1.5 font-bold">
                      • {getExamCountdownText(activeDeckData.deck.targetExamDate)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={speakCard}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                  isSpeaking
                    ? "bg-[#8B5CF6] text-white border-[#7C3AED]"
                    : "bg-[#FAF8F5] hover:bg-[#EBE5DB] text-[#71717A] border-[#EBE5DB]"
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
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FAF8F5] hover:bg-[#EBE5DB] border border-[#EBE5DB] flex items-center justify-center text-[#71717A] hover:text-[#18181B] cursor-pointer"
                title="Close Study"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Track */}
          <div className="w-full bg-[#EBE5DB] h-1.5 shrink-0">
            <div
              className="bg-[#7C3AED] h-full transition-all duration-300"
              style={{
                width: `${((currentCardIndex + 1) / activeCards.length) * 100}%`,
              }}
            />
          </div>

          {/* Study Area / Interactive Flippable Card */}
          <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
            {!isSessionComplete && currentCard ? (
              <>
                {/* ── INTERACTIVE PHYSICAL CARD ── */}
                <div
                  className="w-full select-none cursor-pointer"
                  onClick={handleFlip}
                >
                  {!isFlipped ? (
                    /* ════ CARD FRONT FACE ════ */
                    <div className="w-full min-h-[280px] sm:min-h-[320px] rounded-[24px] p-5 sm:p-6 bg-white border-2 border-[#E4DDD1] shadow-[0_10px_30px_-6px_rgba(24,24,27,0.06)] flex flex-col justify-between transition-all duration-300 hover:border-[#8B5CF6]/50 animate-fade-in">
                      <div>
                        {/* Card Header Strip */}
                        <div className="flex items-center justify-between mb-3 border-b border-[#F4F0EB] pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="pill-chip chip-lavender text-[10px] sm:text-[11px] font-extrabold py-0.5 sm:py-1 px-2.5 sm:px-3">
                              {currentCard.cardType === "mcq"
                                ? "🔘 MCQ QUESTION"
                                : currentCard.cardType === "one_word"
                                ? "⚡ FILL IN THE BLANK"
                                : currentCard.cardType === "direct_question"
                                ? "🎯 DIRECT QUESTION"
                                : "📖 CONCEPT CHALLENGE"}
                            </span>
                            <span className="text-xs font-bold text-[#71717A]">
                              #{currentCardIndex + 1} of {activeCards.length}
                            </span>
                          </div>

                          <span
                            className={`pill-chip text-[10px] sm:text-[11px] font-bold py-0.5 sm:py-1 px-2 sm:px-2.5 capitalize ${
                              currentCard.difficulty === "hard"
                                ? "chip-peach"
                                : currentCard.difficulty === "medium"
                                ? "chip-butter"
                                : "chip-mint"
                            }`}
                          >
                            {currentCard.difficulty}
                          </span>
                        </div>

                        {/* Front Question Content */}
                        <div className="text-sm sm:text-base md:text-lg font-extrabold text-[#18181B] leading-relaxed my-2 sm:my-2.5 text-left">
                          <MarkdownRenderer content={currentCard.front} />
                        </div>

                        {/* MCQ Interactive Option Buttons (Front Side) */}
                        {currentCard.options && currentCard.options.length > 0 && (
                          <div className="space-y-2 mt-3 text-left">
                            <div className="text-[11px] font-bold text-[#71717A] mb-1 flex items-center gap-1.5">
                              <CircleDot className="w-3.5 h-3.5 text-[#8B5CF6]" />
                              <span>Select an answer:</span>
                            </div>
                            {currentCard.options.map((opt, i) => {
                              const isSelected = selectedMcqOption === opt;
                              const letterPrefix = ["A", "B", "C", "D"][i] || `${i + 1}`;
                              // Check if opt already has "A) " prefix or not
                              const hasLetterPrefix = /^[A-D]\)/i.test(opt.trim());
                              const displayOpt = hasLetterPrefix ? opt.substring(2).trim() : opt;
                              const displayLetter = hasLetterPrefix ? opt.trim().charAt(0).toUpperCase() : letterPrefix;

                              return (
                                <button
                                  key={i}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectOption(opt);
                                  }}
                                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between transition-all cursor-pointer group ${
                                    isSelected
                                      ? "bg-[#E8DEFF] border-[#7C3AED] text-[#2D1B4E] ring-2 ring-[#7C3AED]/25 shadow-sm"
                                      : "bg-[#FAF8F5] border-[#EBE5DB] hover:border-[#7C3AED] hover:bg-white text-[#18181B]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span
                                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                                        isSelected
                                          ? "bg-[#7C3AED] text-white"
                                          : "bg-white border border-[#EBE5DB] text-[#71717A] group-hover:border-[#7C3AED] group-hover:text-[#7C3AED]"
                                      }`}
                                    >
                                      {displayLetter}
                                    </span>
                                    <span className="leading-snug break-words">{displayOpt}</span>
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#7C3AED] shrink-0 ml-2" />}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Front Side Clue Peek */}
                        {currentCard.classmateHint && (
                          <div className="mt-2.5 text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                soundEffects.playHandRaise();
                                setShowClassmateHint((prev) => !prev);
                              }}
                              className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1.5 cursor-pointer py-0.5"
                            >
                              <Lightbulb className="w-3.5 h-3.5" />
                              {showClassmateHint ? "Hide Clue" : "💡 Stuck? Peek at Toby's Clue"}
                            </button>
                            {showClassmateHint && (
                              <div className="p-2.5 sm:p-3 rounded-xl bg-[#E8DEFF]/70 border border-[#D5C4FA] mt-1.5 text-xs text-[#2D1B4E] font-medium leading-relaxed animate-fade-in">
                                {currentCard.classmateHint}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Front Card Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#F4F0EB] text-xs font-semibold text-[#71717A] mt-3">
                        <span className="flex items-center gap-1.5 text-[#7C3AED] font-bold text-[11px] sm:text-xs">
                          <RotateCw className="w-3.5 h-3.5" /> Click or Space to flip card
                        </span>
                        {currentCard.tags && currentCard.tags.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {currentCard.tags.map((t) => (
                              <span key={t} className="pill-chip chip-white text-[9px] sm:text-[10px] py-0.5 px-2">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* ════ CARD BACK FACE ════ */
                    <div className="w-full min-h-[280px] sm:min-h-[320px] rounded-[24px] p-5 sm:p-6 bg-white border-2 border-[#D5C4FA] shadow-[0_10px_30px_-6px_rgba(124,58,237,0.1)] flex flex-col justify-between animate-fade-in text-left">
                      <div>
                        {/* Back Header Strip */}
                        <div className="flex items-center justify-between mb-3 border-b border-[#F4F0EB] pb-2.5">
                          <span className="pill-chip chip-mint text-[10px] sm:text-[11px] font-extrabold py-0.5 sm:py-1 px-2.5 sm:px-3">
                            ✓ EXPLANATION & ANSWER
                          </span>
                          <span className="text-[11px] sm:text-xs font-bold text-[#059669] bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200">
                            Mastery Level {currentCard.masteryLevel}/5
                          </span>
                        </div>

                        {/* MCQ Correct Option Callout if MCQ */}
                        {currentCard.correctOption && (
                          <div className="p-2.5 sm:p-3 rounded-xl bg-[#D2F1E6] border border-[#B2E5D3] mb-3 text-xs sm:text-sm font-bold text-[#0D3E30] flex items-center gap-2 shadow-xs">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#059669] shrink-0" />
                            <span>Correct Answer: {currentCard.correctOption}</span>
                          </div>
                        )}

                        {/* User Selection Feedback if MCQ */}
                        {currentCard.cardType === "mcq" && selectedMcqOption && (
                          <div
                            className={`p-2.5 rounded-xl mb-3 text-xs font-bold flex items-center gap-2 ${
                              currentCard.correctOption &&
                              (selectedMcqOption.trim().toLowerCase() === currentCard.correctOption.trim().toLowerCase() ||
                                selectedMcqOption.startsWith(currentCard.correctOption.substring(0, 2)))
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-amber-50 text-amber-900 border border-amber-200"
                            }`}
                          >
                            <span>Your Selection: {selectedMcqOption}</span>
                            {currentCard.correctOption &&
                            (selectedMcqOption.trim().toLowerCase() === currentCard.correctOption.trim().toLowerCase() ||
                              selectedMcqOption.startsWith(currentCard.correctOption.substring(0, 2))) ? (
                              <span className="text-emerald-700">✓ Correct!</span>
                            ) : (
                              <span className="text-amber-700">⚠️ Review mechanism below</span>
                            )}
                          </div>
                        )}

                        {/* Explanation Markdown Content */}
                        <div className="text-xs sm:text-sm text-[#18181B] leading-relaxed my-2">
                          <MarkdownRenderer content={currentCard.back} />
                        </div>

                        {/* Key Takeaway Box */}
                        {currentCard.keyTakeaway && (
                          <div className="p-2.5 sm:p-3 rounded-xl bg-[#FEF0C3]/70 border border-[#FDE089] mt-2.5">
                            <p className="text-xs font-bold text-[#713F12] m-0">
                              💡 <strong>Key Takeaway:</strong> {currentCard.keyTakeaway}
                            </p>
                          </div>
                        )}

                        {/* Common Pitfall Box */}
                        {currentCard.commonPitfall && (
                          <div className="p-2.5 sm:p-3 rounded-xl bg-[#FCD5CE]/70 border border-[#F9BFB4] mt-2">
                            <p className="text-xs font-bold text-[#702114] m-0">
                              ⚠️ <strong>Common Exam Trap:</strong> {currentCard.commonPitfall}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Back Card Footer */}
                      <div className="pt-3 border-t border-[#F4F0EB] flex items-center justify-between text-[11px] sm:text-xs text-[#71717A] font-semibold mt-3">
                        <span>Rate recall to schedule review</span>
                        <span className="flex items-center gap-1.5 text-[#7C3AED] font-bold">
                          <RotateCw className="w-3.5 h-3.5" /> Flip back
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Classmate Hint Expander on Back */}
                {currentCard.classmateHint && isFlipped && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#E8DEFF]/60 border border-[#D5C4FA] text-xs text-[#2D1B4E] font-medium leading-relaxed flex items-start gap-2 text-left">
                    <Lightbulb className="w-3.5 h-3.5 text-[#7C3AED] shrink-0 mt-0.5" />
                    <div>
                      <strong>Classmate Intuition:</strong> {currentCard.classmateHint}
                    </div>
                  </div>
                )}

                {/* ── Spaced Repetition Rating Buttons with Exam Compression ── */}
                <div className="mt-3.5">
                  {isFlipped ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => handleRating("again")}
                        className="p-2.5 sm:p-3 rounded-xl bg-[#FCD5CE] hover:bg-[#F9BFB4] border border-[#F9BFB4] text-[#702114] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        <span className="flex items-center gap-1">🔴 Again (1)</span>
                        <span className="text-[10px] font-medium opacity-80">
                          {activeDeckData.deck.targetExamDate ? "<15 mins" : "<10 mins"}
                        </span>
                      </button>

                      <button
                        onClick={() => handleRating("hard")}
                        className="p-2.5 sm:p-3 rounded-xl bg-[#FEF0C3] hover:bg-[#FDE089] border border-[#FDE089] text-[#713F12] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        <span className="flex items-center gap-1">🟠 Hard (2)</span>
                        <span className="text-[10px] font-medium opacity-80">
                          {activeDeckData.deck.targetExamDate ? "Compressed (hours)" : "1 day"}
                        </span>
                      </button>

                      <button
                        onClick={() => handleRating("good")}
                        className="p-2.5 sm:p-3 rounded-xl bg-[#D2F1E6] hover:bg-[#B2E5D3] border border-[#B2E5D3] text-[#0D3E30] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        <span className="flex items-center gap-1">🟢 Good (3)</span>
                        <span className="text-[10px] font-medium opacity-80">
                          {activeDeckData.deck.targetExamDate ? "Exam Scheduled" : "3 days"}
                        </span>
                      </button>

                      <button
                        onClick={() => handleRating("easy")}
                        className="p-2.5 sm:p-3 rounded-xl bg-[#D6E8FA] hover:bg-[#BADEFC] border border-[#BADEFC] text-[#13334E] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        <span className="flex items-center gap-1">🔵 Easy (4)</span>
                        <span className="text-[10px] font-medium opacity-80">
                          {activeDeckData.deck.targetExamDate ? "Mastered for Exam" : "7 days"}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (currentCardIndex > 0) {
                            setIsFlipped(false);
                            setShowClassmateHint(false);
                            setSelectedMcqOption(null);
                            setCurrentCardIndex((i) => i - 1);
                          }
                        }}
                        disabled={currentCardIndex === 0}
                        className="btn-pill-white text-xs py-2 px-3.5 cursor-pointer disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>

                      <button
                        onClick={handleFlip}
                        className="btn-pill-dark text-xs py-2 px-5 cursor-pointer shadow-md"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-[#FEF0C3]" />
                        Flip Card (Space)
                      </button>

                      <button
                        onClick={() => {
                          if (currentCardIndex < activeCards.length - 1) {
                            setIsFlipped(false);
                            setShowClassmateHint(false);
                            setSelectedMcqOption(null);
                            setCurrentCardIndex((i) => i + 1);
                          }
                        }}
                        disabled={currentCardIndex === activeCards.length - 1}
                        className="btn-pill-white text-xs py-2 px-3.5 cursor-pointer disabled:opacity-30"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ── SESSION COMPLETE CELEBRATION ── */
              <div className="text-center py-6 sm:py-8 my-auto animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#E8DEFF] text-[#7C3AED] mx-auto mb-3 flex items-center justify-center shadow-md animate-bounce">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#18181B] mb-1.5">
                  Session Complete! 🎉
                </h2>
                <p className="text-xs text-[#71717A] max-w-md mx-auto mb-5">
                  You reviewed {sessionReviewedCount} cards and earned +{sessionXp} XP. Your concept mastery radar and class-wide analytics have been updated in Convex!
                </p>

                <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto mb-6">
                  <div className="p-2.5 rounded-xl bg-[#D2F1E6] border border-[#B2E5D3]">
                    <div className="text-lg sm:text-xl font-black text-[#0D3E30]">{sessionReviewedCount}</div>
                    <div className="text-[9px] font-bold text-[#0D3E30] opacity-80 uppercase">
                      Reviewed
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FEF0C3] border border-[#FDE089]">
                    <div className="text-lg sm:text-xl font-black text-[#713F12]">+{sessionXp}</div>
                    <div className="text-[9px] font-bold text-[#713F12] opacity-80 uppercase">
                      XP Gained
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FCD5CE] border border-[#F9BFB4]">
                    <div className="text-lg sm:text-xl font-black text-[#702114]">{sessionStreak} 🔥</div>
                    <div className="text-[9px] font-bold text-[#702114] opacity-80 uppercase">
                      Max Streak
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2.5">
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setCurrentCardIndex(0);
                      setIsFlipped(false);
                      setSelectedMcqOption(null);
                      setIsSessionComplete(false);
                    }}
                    className="btn-pill-white text-xs py-2 px-4 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Study Again
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setStudyViewMode(null);
                    }}
                    className="btn-pill-dark text-xs py-2 px-5 cursor-pointer shadow-md"
                  >
                    Back to Deck Library
                  </button>
                </div>
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
      <div className="max-w-4xl mx-auto pb-10 animate-fade-in">
        <div className="bg-[#FAF8F5] w-full rounded-[32px] sm:rounded-[36px] shadow-lg border border-[#EBE5DB] overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-[#EBE5DB] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStudyViewMode(null)}
                className="btn-pill-white text-xs py-1.5 px-3 flex items-center gap-1 font-bold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Decks</span>
              </button>
              <div>
                <h2 className="text-sm sm:text-base font-black text-[#18181B] m-0">
                  {activeDeckData.deck.title} • Card Browser
                </h2>
                <p className="text-xs text-[#71717A] m-0">
                  {activeCards.length} total flashcards in this deck
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setStudyViewMode("study");
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  setSelectedMcqOption(null);
                }}
                className="btn-pill-dark text-xs py-2 px-4 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" /> Launch Study Mode
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
            {activeCards.map((c, i) => (
              <div
                key={c._id}
                className="card-pastel card-white p-4 rounded-2xl border border-[#EBE5DB] shadow-xs flex flex-col md:flex-row gap-4 justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="pill-chip chip-lavender text-[9px] font-bold py-0.5 px-2">
                      Card #{i + 1}
                    </span>
                    {c.cardType && (
                      <span className="pill-chip chip-butter text-[9px] font-bold py-0.5 px-2 capitalize">
                        {c.cardType.replace("_", " ")}
                      </span>
                    )}
                    <span
                      className={`pill-chip text-[9px] font-bold py-0.5 px-2 capitalize ${
                        c.difficulty === "hard"
                          ? "chip-peach"
                          : c.difficulty === "medium"
                          ? "chip-butter"
                          : "chip-mint"
                      }`}
                    >
                      {c.difficulty}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#18181B] mb-2">
                    <MarkdownRenderer content={c.front} />
                  </div>

                  <div className="text-[11px] text-[#52525B] bg-[#FAF8F5] p-3 rounded-xl border border-[#EBE5DB]">
                    <MarkdownRenderer content={c.back} />
                  </div>
                </div>

                <div className="w-full md:w-48 shrink-0 flex md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-[#EBE5DB] pt-2 md:pt-0 md:pl-4 text-[10px] font-bold text-[#71717A]">
                  <div>
                    <span>Mastery: {c.masteryLevel}/5</span>
                    <p className="text-[9px] font-medium opacity-70 m-0">
                      {c.reviewCount} total reviews
                    </p>
                  </div>
                  {c.keyTakeaway && (
                    <p className="text-[9px] text-[#713F12] bg-[#FEF0C3] p-1.5 rounded-lg line-clamp-2 mt-2">
                      {c.keyTakeaway}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // 3. DECK LIBRARY & MANAGEMENT VIEW (DEFAULT)
  // ════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className="max-w-6xl mx-auto pb-16 animate-fade-in-up">
        {/* ── Header & Banner ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="pill-chip chip-lavender text-xs font-bold py-1 px-3 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>AI Multimodal Ingestion • Exam-Targeted Spaced Repetition</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight mb-1">
              PDF to Flashcards
            </h1>
            <p className="text-sm text-[#71717A] font-medium">
              Turn slide decks and notes into interactive 3D cards with exam date interval compression and closed-loop mastery sync.
            </p>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setIsGeneratorOpen(true);
            }}
            className="btn-pill-dark text-xs sm:text-sm py-3 px-5 self-start sm:self-auto cursor-pointer shadow-md group"
          >
            <Plus className="w-4 h-4 text-[#FEF0C3] group-hover:rotate-90 transition-transform" />
            <span>Upload PDF / Create Deck</span>
          </button>
        </div>

        {/* ── Quick Stats Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: "Total Decks",
              value: decks ? decks.length : 0,
              sub: "decks active",
              icon: Layers,
              card: "card-lavender",
              color: "#7C3AED",
            },
            {
              label: "Cards Mastered",
              value: totalMasteredCount,
              sub: `of ${totalCardsCount} cards`,
              icon: CheckCircle2,
              card: "card-mint",
              color: "#059669",
            },
            {
              label: "Study Streak",
              value: "5",
              sub: "days active",
              icon: Flame,
              card: "card-butter",
              color: "#D97706",
            },
            {
              label: "Total XP",
              value: "420",
              sub: "points earned",
              icon: Zap,
              card: "card-peach",
              color: "#E11D48",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`card-pastel ${stat.card} p-4 rounded-2xl flex flex-col justify-between shadow-xs`}
            >
              <stat.icon className="w-4 h-4 mb-2" style={{ color: stat.color }} />
              <div>
                <div className="text-2xl font-black text-[#18181B]">{stat.value}</div>
                <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-[10px] font-medium text-[#71717A] opacity-80 mt-0.5">
                  {stat.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search & Filter Row ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="pill-search bg-white shadow-xs py-2 px-3.5 border border-[#EBE5DB] w-full sm:w-80">
            <Search className="w-4 h-4 text-[#71717A] shrink-0" />
            <input
              type="text"
              placeholder="Search decks by title or keyword…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-[#71717A] hover:text-[#18181B] px-1 cursor-pointer"
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
                className={`pill-chip text-xs py-1 px-3 font-semibold ${
                  filterSubject === subj ? "chip-dark" : "chip-white"
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* ── Deck Library Grid ── */}
        {filteredDecks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDecks.map((deck) => {
              const theme = SUBJECT_THEMES[deck.subject || "General"] || SUBJECT_THEMES.General;
              const progress =
                deck.cardCount > 0 ? Math.round((deck.masteredCount / deck.cardCount) * 100) : 0;
              const countdownText = getExamCountdownText(deck.targetExamDate);

              return (
                <div
                  key={deck._id}
                  className={`card-pastel ${theme.card} p-5 rounded-[28px] flex flex-col justify-between relative group transition-all duration-300 hover:shadow-md`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="pill-chip chip-white text-[10px] font-bold py-0.5 px-2.5 flex items-center gap-1">
                          <span>{theme.icon}</span>
                          <span>{deck.subject || "General"}</span>
                        </span>
                        {deck.cardType && (
                          <span className="pill-chip chip-butter text-[9px] font-bold py-0.5 px-2 capitalize">
                            {deck.cardType.replace("_", " ")}
                          </span>
                        )}
                        {deck.isSample && (
                          <span className="pill-chip chip-butter text-[10px] font-bold py-0.5 px-2">
                            Sample Deck
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleDeleteDeck(deck._id, e)}
                        className="opacity-0 group-hover:opacity-100 text-[#71717A] hover:text-[#E11D48] transition-opacity p-1 cursor-pointer"
                        title="Delete deck"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-black text-base text-[#18181B] leading-snug mb-1.5 line-clamp-2">
                      {deck.title}
                    </h3>
                    <p className="text-xs text-[#52525B] font-medium line-clamp-2 mb-3">
                      {deck.description || "Interactive flashcard study deck"}
                    </p>

                    {/* 🎯 Exam Target / Readiness Pill */}
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
                          className="p-2.5 rounded-xl bg-white/70 border border-[#B2E5D3] flex items-center justify-between gap-2 cursor-pointer hover:bg-white transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-[#059669]" />
                            <span className="text-[11px] font-bold text-[#0D3E30]">{countdownText}</span>
                          </div>
                          <span className="text-[10px] font-black text-[#059669] bg-[#D2F1E6] py-0.5 px-2 rounded-lg">
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
                          className="text-[11px] font-bold text-[#71717A] hover:text-[#7C3AED] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Set Target Exam Date (Compress Schedule)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Mastery Progress + Action Buttons */}
                  <div className="pt-3 border-t border-black/5 mt-auto">
                    <div className="flex items-center justify-between mb-2.5 text-xs font-bold text-[#18181B]">
                      <span className="flex items-center gap-1.5 text-[11px] text-[#71717A]">
                        <Layers className="w-3.5 h-3.5" />
                        {deck.cardCount} cards • {deck.masteredCount} mastered
                      </span>
                      <span style={{ color: theme.color }}>{progress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 rounded-full bg-white/50 overflow-hidden mb-4">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, background: theme.color }}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startStudying(deck._id)}
                        className="btn-continue flex-1 justify-center text-xs py-2 px-3 shadow-sm cursor-pointer"
                      >
                        <span>Study Now</span>
                        <span className="arrow-circle">→</span>
                      </button>

                      <button
                        onClick={() => openDeckBrowser(deck._id)}
                        className="btn-pill-white text-xs py-2 px-3 shrink-0 cursor-pointer"
                        title="Browse cards in table view"
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
          <div className="text-center py-16 card-pastel card-white rounded-[32px] p-8 border border-[#EBE5DB]">
            <BookOpen className="w-10 h-10 text-[#D4D0C8] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#18181B] mb-1">No flashcard decks found</h3>
            <p className="text-xs text-[#71717A] max-w-sm mx-auto mb-4">
              Upload your lecture slides, notes, or pick from high-yield sample study guides.
            </p>
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="btn-pill-dark text-xs py-2.5 px-5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Your First Deck
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SET TARGET EXAM DATE MODAL (INTERVAL COMPRESSION)
      ════════════════════════════════════════════════════════════════════ */}
      {mounted && examTargetModalDeck && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[28px] sm:rounded-[32px] shadow-2xl border border-[#EBE5DB] p-5 sm:p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#E8DEFF] text-[#7C3AED] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#18181B] m-0">Set Target Exam Date</h3>
                  <p className="text-[11px] text-[#71717A] m-0 line-clamp-1">{examTargetModalDeck.title}</p>
                </div>
              </div>

              <button
                onClick={() => setExamTargetModalDeck(null)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EBE5DB] flex items-center justify-center text-[#71717A] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#52525B] leading-relaxed">
              Setting an exam target activates <strong>Interval Compression</strong>: Leitner intervals automatically scale down so all cards achieve Level 4/5 mastery <em>before</em> your exam!
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Tomorrow (24h Cram)", days: 1 },
                { label: "In 3 Days", days: 3 },
                { label: "In 1 Week", days: 7 },
              ].map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setExamTargetInputDays(opt.days)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    examTargetInputDays === opt.days
                      ? "bg-[#E8DEFF] border-[#7C3AED] text-[#2D1B4E] ring-2 ring-[#7C3AED]/20 shadow-xs"
                      : "bg-[#FAF8F5] border-[#EBE5DB] hover:bg-white text-[#18181B]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#71717A] block mb-1">
                Or choose custom exam date:
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={customExamDateString}
                onChange={(e) => {
                  setCustomExamDateString(e.target.value);
                  setExamTargetInputDays("custom");
                }}
                className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE5DB] text-xs font-medium focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {examTargetModalDeck.currentExamDate && (
                <button
                  onClick={async () => {
                    await setDeckExamTargetMutation({
                      deckId: examTargetModalDeck.id,
                      targetExamDate: undefined,
                    });
                    setExamTargetModalDeck(null);
                  }}
                  className="text-xs font-bold text-[#E11D48] hover:underline cursor-pointer"
                >
                  Remove Target
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setExamTargetModalDeck(null)}
                  className="btn-pill-white text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveExamTarget}
                  className="btn-pill-dark text-xs py-2 px-5 cursor-pointer shadow-md"
                >
                  Save & Recalibrate
                </button>
              </div>
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
          <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-[32px] sm:rounded-[36px] shadow-2xl border border-[#EBE5DB] overflow-hidden flex flex-col max-h-[88vh] my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#EBE5DB] flex items-center justify-between bg-white shrink-0">
              <div>
                <div className="pill-chip chip-lavender text-[10px] font-bold py-0.5 px-2.5 mb-1">
                  ✨ Gemini Multimodal OCR
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#18181B] m-0">Generate Flashcard Deck</h2>
              </div>

              <button
                onClick={() => !isGenerating && setIsGeneratorOpen(false)}
                disabled={isGenerating}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#EBE5DB] border border-[#EBE5DB] flex items-center justify-center text-[#71717A] hover:text-[#18181B] cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 sm:space-y-5">
              {!isGenerating ? (
                <>
                  {/* Tabs: Upload / Sample Preset / Text Notes */}
                  <div className="flex rounded-2xl bg-[#EBE5DB]/60 p-1">
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
                            : "text-[#71717A] hover:text-[#18181B]"
                        }`}
                      >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* 1. Upload Tab */}
                  {generationTab === "upload" && (
                    <div className="space-y-3">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file) {
                            if (file.size > 25 * 1024 * 1024) {
                              alert(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 25 MB limit.`);
                              return;
                            }
                            setSelectedFile(file);
                          }
                        }}
                        className="p-6 sm:p-8 rounded-[24px] sm:rounded-[28px] border-2 border-dashed border-[#D5C4FA] bg-white hover:bg-[#FAF8F5] text-center cursor-pointer transition-all group"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.txt,.md"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 25 * 1024 * 1024) {
                                alert(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 25 MB limit.`);
                                return;
                              }
                              setSelectedFile(file);
                            }
                          }}
                        />

                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#E8DEFF] text-[#7C3AED] mx-auto mb-2.5 sm:mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>

                        {selectedFile ? (
                          <div>
                            <p className="text-sm font-bold text-[#18181B] mb-0.5">
                              {selectedFile.name}
                            </p>
                            <p className="text-[11px] font-semibold text-[#059669]">
                              ✓ Ready for Intelligent Ingestion ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-bold text-[#18181B] mb-1">
                              Drag & drop your PDF or notes here
                            </p>
                            <p className="text-[11px] text-[#71717A] font-medium">
                              Supports large textbook chapters, lecture slides, and syllabus outlines (up to 25 MB)
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Security & Context Preservation Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-bold text-[#71717A] pt-1">
                        <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-1.5 text-[#5B21B6]">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#7C3AED]" />
                          <span>Anti-Attack Checked</span>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-1.5 text-[#065F46]">
                          <Layers className="w-3.5 h-3.5 shrink-0 text-[#059669]" />
                          <span>Full-Context Chunking</span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-1.5 text-[#92400E]">
                          <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#D97706]" />
                          <span>Rate Limit Protected</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Sample Presets Tab */}
                  {generationTab === "sample" && (
                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-[#71717A]">
                        Select a pre-bundled study guide for instant extraction:
                      </p>
                      {SAMPLE_PRESETS.map((preset) => (
                        <div
                          key={preset.key}
                          onClick={() => {
                            soundEffects.playClick();
                            setSelectedSampleKey(preset.key);
                            setCustomTitle(preset.title);
                            setSelectedSubject(preset.subject);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            selectedSampleKey === preset.key
                              ? "bg-white border-[#7C3AED] shadow-sm ring-2 ring-[#7C3AED]/20"
                              : "bg-white border-[#EBE5DB] hover:border-[#CBC2B4]"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-xs text-[#18181B]">{preset.title}</span>
                              <span className="pill-chip chip-butter text-[9px] font-bold py-0.5 px-2">
                                {preset.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#71717A] m-0">{preset.desc}</p>
                          </div>
                          <span className="pill-chip chip-lavender text-[10px] font-bold py-0.5 px-2 shrink-0">
                            {preset.subject}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. Text Notes Tab */}
                  {generationTab === "text" && (
                    <div>
                      <label className="text-xs font-bold text-[#18181B] block mb-1.5">
                        Paste lecture transcripts or textbook paragraphs:
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Paste study text, equations, or lecture summary here..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="w-full p-3.5 rounded-2xl bg-white border border-[#EBE5DB] text-xs font-medium focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                  )}

                  {/* ── CARD FORMAT / TYPE SELECTOR ── */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#18181B] block">
                      Select Flashcard Type / Format:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CARD_TYPE_PRESETS.map((preset) => {
                        const isSelected = cardType === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              soundEffects.playClick();
                              setCardType(preset.id);
                            }}
                            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "bg-white border-[#7C3AED] ring-2 ring-[#7C3AED]/20 shadow-xs"
                                : "bg-white border-[#EBE5DB] hover:border-[#CBC2B4]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div
                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl ${preset.bg} flex items-center justify-center`}
                                style={{ color: preset.color }}
                              >
                                <preset.icon className="w-3.5 h-3.5" />
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#7C3AED]" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#18181B] mb-0.5 leading-snug">
                                {preset.label}
                              </p>
                              <p className="text-[10px] text-[#71717A] font-medium leading-tight">
                                {preset.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Title & Subject Meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#18181B] block">
                          Deck Name
                        </label>
                        <span className="text-[10px] font-bold text-[#7C3AED] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#7C3AED]" /> Auto-named by AI
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Leave blank for AI to synthesize a relevant title…"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#EBE5DB] text-xs font-medium focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#18181B] block mb-1">Subject</label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#EBE5DB] text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
                      >
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="AI & Computer Science">AI & Computer Science</option>
                        <option value="General">General Science</option>
                      </select>
                    </div>
                  </div>

                  {/* ── Upcoming Target Exam Date Selector ── */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EBE5DB] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-[#18181B] flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-[#7C3AED]" />
                        <span>Upcoming Exam Target (Interval Compression)</span>
                      </label>
                      <span className="text-[10px] font-bold text-[#059669] bg-[#D2F1E6] py-0.5 px-2 rounded-lg">
                        {targetExamDays ? `Exam in ${targetExamDays}d` : "Standard Spaced Repetition"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71717A] leading-tight">
                      Compresses Leitner review schedules so cards hit Level 4/5 mastery before your exam day.
                    </p>

                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {[
                        { label: "No Exam", days: null },
                        { label: "1 Day (Cram)", days: 1 },
                        { label: "3 Days", days: 3 },
                        { label: "7 Days", days: 7 },
                      ].map((item) => (
                        <button
                          key={String(item.days)}
                          type="button"
                          onClick={() => setTargetExamDays(item.days)}
                          className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                            targetExamDays === item.days
                              ? "bg-[#E8DEFF] border-[#7C3AED] text-[#2D1B4E] ring-2 ring-[#7C3AED]/20 shadow-xs"
                              : "bg-[#FAF8F5] border-[#EBE5DB] hover:bg-white text-[#18181B]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Extraction Customizations */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EBE5DB] space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#18181B]">Number of Cards: {cardCount}</span>
                      <span className="text-[#7C3AED]">High-Yield Extraction</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={16}
                      step={2}
                      value={cardCount}
                      onChange={(e) => setCardCount(parseInt(e.target.value, 10))}
                      className="w-full accent-[#7C3AED] cursor-pointer"
                    />

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#71717A] uppercase block mb-1">
                          Focus Style
                        </span>
                        <select
                          value={focusArea}
                          onChange={(e) => setFocusArea(e.target.value as any)}
                          className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EBE5DB] text-[11px] font-semibold"
                        >
                          <option value="comprehensive">Comprehensive</option>
                          <option value="formulas">Formulas & Laws</option>
                          <option value="definitions">Core Definitions</option>
                          <option value="exam_prep">Exam Cram (High-Yield)</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-[#71717A] uppercase block mb-1">
                          Difficulty
                        </span>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value as any)}
                          className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EBE5DB] text-[11px] font-semibold"
                        >
                          <option value="mixed">Mixed Levels</option>
                          <option value="easy">Foundational</option>
                          <option value="medium">Intermediate</option>
                          <option value="hard">Challenging</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ── GENERATING ANIMATION VIEW ── */
                <div className="py-8 sm:py-10 text-center animate-fade-in">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E8DEFF] text-[#7C3AED] mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-md animate-pulse">
                    <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin" />
                  </div>
                  <h3 className="text-base font-black text-[#18181B] mb-1">
                    Synthesizing {cardType.replace("_", " ").toUpperCase()} Deck...
                  </h3>
                  <p className="text-xs text-[#71717A] max-w-xs mx-auto mb-5 sm:mb-6">
                    Gemini Multimodal OCR is parsing document structure and generating {cardType} flashcards.
                  </p>

                  <div className="space-y-2 max-w-sm mx-auto text-left">
                    {[
                      { step: 1, label: "Ingesting PDF binary / text stream" },
                      { step: 2, label: "Multimodal visual OCR & concept extraction" },
                      { step: 3, label: `Formatting ${cardType} prompts, options & answers` },
                      { step: 4, label: "Initializing Spaced Repetition schedule in Convex" },
                    ].map((s) => (
                      <div
                        key={s.step}
                        className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                          generationStep >= s.step
                            ? "bg-[#D2F1E6] text-[#0D3E30] border border-[#B2E5D3]"
                            : "bg-white text-[#71717A] border border-[#EBE5DB] opacity-50"
                        }`}
                      >
                        {generationStep >= s.step ? (
                          <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[#71717A] shrink-0" />
                        )}
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!isGenerating && (
              <div className="p-4 sm:p-5 border-t border-[#EBE5DB] flex items-center justify-between bg-white shrink-0">
                <button
                  onClick={() => setIsGeneratorOpen(false)}
                  className="btn-pill-white text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleGenerateDeck}
                  disabled={generationTab === "upload" && !selectedFile && !customTitle}
                  className="btn-pill-dark text-xs py-2 px-5 sm:px-6 cursor-pointer shadow-md disabled:opacity-40"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FEF0C3]" />
                  Generate {cardType.replace("_", " ")} Deck
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
