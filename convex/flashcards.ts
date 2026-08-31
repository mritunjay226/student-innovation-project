import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Get all Flashcard Decks for student (plus preloaded sample decks) ──
export const getDecks = query({
  args: { studentId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let decks = await ctx.db.query("flashcardDecks").collect();

    // If studentId provided, filter by student or global sample decks
    if (args.studentId) {
      decks = decks.filter(
        (d) => d.studentId === args.studentId || d.isSample === true || !d.studentId
      );
    }

    // Sort: newest first
    decks.sort((a, b) => b.createdAt - a.createdAt);

    return decks;
  },
});

// ── Get single Deck with all its Flashcards ──
export const getDeckWithCards = query({
  args: { deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);
    if (!deck) return null;

    const cards = await ctx.db
      .query("flashcards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();

    return {
      deck,
      cards,
    };
  },
});

// ── Create a new Deck and batch-insert all Flashcards ──
export const createDeckWithCards = mutation({
  args: {
    studentId: v.optional(v.id("users")),
    title: v.string(),
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.string()),
    description: v.optional(v.string()),
    isSample: v.optional(v.boolean()),
    conceptId: v.optional(v.id("concepts")),
    cardType: v.optional(v.string()),
    cards: v.array(
      v.object({
        front: v.string(),
        back: v.string(),
        keyTakeaway: v.optional(v.string()),
        commonPitfall: v.optional(v.string()),
        cardType: v.optional(
          v.union(
            v.literal("direct_question"),
            v.literal("explanatory"),
            v.literal("one_word"),
            v.literal("mcq")
          )
        ),
        options: v.optional(v.array(v.string())),
        correctOption: v.optional(v.string()),
        difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
        tags: v.optional(v.array(v.string())),
        classmateHint: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 1. Create Deck Record
    const deckId = await ctx.db.insert("flashcardDecks", {
      studentId: args.studentId,
      title: args.title,
      subject: args.subject || "General",
      grade: args.grade || "Class 12",
      fileName: args.fileName,
      fileSize: args.fileSize,
      cardCount: args.cards.length,
      masteredCount: 0,
      createdAt: now,
      lastStudiedAt: undefined,
      isSample: args.isSample || false,
      description: args.description || "Generated with AI Document Extraction",
      conceptId: args.conceptId,
      cardType: args.cardType || "explanatory",
    });

    // 2. Insert all Cards
    for (const card of args.cards) {
      await ctx.db.insert("flashcards", {
        deckId,
        front: card.front,
        back: card.back,
        keyTakeaway: card.keyTakeaway,
        commonPitfall: card.commonPitfall,
        cardType: card.cardType || (args.cardType as any) || "explanatory",
        options: card.options,
        correctOption: card.correctOption,
        difficulty: card.difficulty,
        tags: card.tags || [args.subject || "General"],
        classmateHint: card.classmateHint,
        masteryLevel: 0,
        nextReviewDate: now,
        lastReviewed: undefined,
        reviewCount: 0,
        correctStreak: 0,
      });
    }

    return { deckId, cardCount: args.cards.length };
  },
});

// ── Set Target Exam Date for a Deck (Interval Compression) ──
export const setDeckExamTarget = mutation({
  args: {
    deckId: v.id("flashcardDecks"),
    targetExamDate: v.optional(v.number()), // Timestamp in ms or undefined to clear
  },
  handler: async (ctx, args) => {
    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");

    const now = Date.now();
    let readinessScore = 0;

    const cards = await ctx.db
      .query("flashcards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();

    if (cards.length > 0) {
      const mastered = cards.filter((c) => c.masteryLevel >= 4).length;
      readinessScore = Math.round((mastered / cards.length) * 100);
    }

    await ctx.db.patch(args.deckId, {
      targetExamDate: args.targetExamDate,
      examReadinessScore: readinessScore,
    });

    return { success: true, targetExamDate: args.targetExamDate, examReadinessScore: readinessScore };
  },
});

// ── Submit Spaced Repetition Review for a Card ──
export const reviewCard = mutation({
  args: {
    cardId: v.id("flashcards"),
    deckId: v.id("flashcardDecks"),
    studentId: v.optional(v.id("users")),
    rating: v.union(
      v.literal("again"),
      v.literal("hard"),
      v.literal("good"),
      v.literal("easy")
    ),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");

    const deck = await ctx.db.get(args.deckId);
    const now = Date.now();
    let newMastery = card.masteryLevel;
    let newStreak = card.correctStreak;
    let intervalMs = 24 * 60 * 60 * 1000; // default 1 day

    // ── 1. Check for Exam Date Interval Compression ──
    const targetExamDate = deck?.targetExamDate;
    const isExamTargeted = targetExamDate && targetExamDate > now;
    const timeRemainingMs = isExamTargeted ? targetExamDate - now : null;

    if (isExamTargeted && timeRemainingMs) {
      const hoursRemaining = timeRemainingMs / (60 * 60 * 1000);

      if (hoursRemaining <= 24) {
        // Cram Window (<24 hours to exam)
        switch (args.rating) {
          case "again":
            newStreak = 0;
            newMastery = Math.max(0, Math.floor(card.masteryLevel - 1));
            intervalMs = 15 * 60 * 1000; // 15 mins
            break;
          case "hard":
            newStreak = Math.max(1, card.correctStreak);
            newMastery = Math.min(5, card.masteryLevel + 0.5);
            intervalMs = 2 * 60 * 60 * 1000; // 2 hours
            break;
          case "good":
            newStreak = card.correctStreak + 1;
            newMastery = Math.min(5, Math.floor(card.masteryLevel + 1));
            intervalMs = 6 * 60 * 60 * 1000; // 6 hours
            break;
          case "easy":
            newStreak = card.correctStreak + 2;
            newMastery = Math.min(5, Math.floor(card.masteryLevel + 2));
            intervalMs = Math.min(timeRemainingMs - 60 * 60 * 1000, 12 * 60 * 60 * 1000); // 12 hours max
            break;
        }
      } else {
        // Multi-Day Exam Curve Compression (e.g. 2-10 days)
        const daysRemaining = hoursRemaining / 24;
        switch (args.rating) {
          case "again":
            newStreak = 0;
            newMastery = Math.max(0, Math.floor(card.masteryLevel - 1));
            intervalMs = 25 * 60 * 1000; // 25 mins
            break;
          case "hard":
            newStreak = Math.max(1, card.correctStreak);
            newMastery = Math.min(5, card.masteryLevel + 0.5);
            intervalMs = Math.max(4 * 60 * 60 * 1000, Math.round(daysRemaining * 0.15 * 24 * 60 * 60 * 1000));
            break;
          case "good":
            newStreak = card.correctStreak + 1;
            newMastery = Math.min(5, Math.floor(card.masteryLevel + 1));
            intervalMs = Math.max(12 * 60 * 60 * 1000, Math.round(daysRemaining * 0.45 * 24 * 60 * 60 * 1000));
            break;
          case "easy":
            newStreak = card.correctStreak + 2;
            newMastery = Math.min(5, Math.floor(card.masteryLevel + 2));
            intervalMs = Math.max(24 * 60 * 60 * 1000, Math.round(daysRemaining * 0.85 * 24 * 60 * 60 * 1000));
            break;
        }
      }
    } else {
      // Standard SM-2 / Leitner Spaced Repetition Intervals
      switch (args.rating) {
        case "again":
          newStreak = 0;
          newMastery = Math.max(0, Math.floor(card.masteryLevel - 1));
          intervalMs = 10 * 60 * 1000; // 10 minutes
          break;
        case "hard":
          newStreak = Math.max(1, card.correctStreak);
          newMastery = Math.min(5, card.masteryLevel + 0.5);
          intervalMs = 1 * 24 * 60 * 60 * 1000; // 1 day
          break;
        case "good":
          newStreak = card.correctStreak + 1;
          newMastery = Math.min(5, Math.floor(card.masteryLevel + 1));
          intervalMs = Math.max(2, Math.min(14, (card.correctStreak + 1) * 2)) * 24 * 60 * 60 * 1000; // 2 to 14 days
          break;
        case "easy":
          newStreak = card.correctStreak + 2;
          newMastery = Math.min(5, Math.floor(card.masteryLevel + 2));
          intervalMs = Math.max(4, Math.min(30, (card.correctStreak + 2) * 3)) * 24 * 60 * 60 * 1000; // 4 to 30 days
          break;
      }
    }

    // ── 2. Update Card Record ──
    await ctx.db.patch(args.cardId, {
      masteryLevel: Math.round(newMastery),
      correctStreak: newStreak,
      reviewCount: card.reviewCount + 1,
      lastReviewed: now,
      intervalMs,
      nextReviewDate: now + intervalMs,
    });

    // ── 3. Recalculate Deck Mastered Count & Exam Readiness ──
    const allCards = await ctx.db
      .query("flashcards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();

    const masteredCards = allCards.filter(
      (c) => (c._id === args.cardId ? Math.round(newMastery) >= 4 : c.masteryLevel >= 4)
    ).length;

    const readinessScore = allCards.length > 0 ? Math.round((masteredCards / allCards.length) * 100) : 0;

    await ctx.db.patch(args.deckId, {
      lastStudiedAt: now,
      masteredCount: masteredCards,
      examReadinessScore: readinessScore,
    });

    // ── 4. Closed-Loop Mastery Sync with Concept Radar & Teacher Console ──
    let syncedConceptTitle: string | null = null;
    let deltaScore = 0;

    if (args.studentId) {
      // Find linked concept: from card.conceptId, deck.conceptId, or search matching concept
      let targetConceptId = card.conceptId || deck?.conceptId;

      if (!targetConceptId && deck?.subject) {
        const matchingConcepts = await ctx.db
          .query("concepts")
          .withIndex("by_subject", (q) => q.eq("subject", deck.subject!))
          .collect();

        // Match by title substring or default to first concept in that subject
        const match = matchingConcepts.find((c) =>
          deck.title.toLowerCase().includes(c.title.toLowerCase()) ||
          c.title.toLowerCase().includes(deck.title.toLowerCase())
        );

        if (match) targetConceptId = match._id;
        else if (matchingConcepts.length > 0) targetConceptId = matchingConcepts[0]._id;
      }

      if (targetConceptId) {
        const concept = await ctx.db.get(targetConceptId);
        if (concept) {
          syncedConceptTitle = concept.title;

          // Retrieve existing mastery record
          const existingMastery = await ctx.db
            .query("mastery")
            .withIndex("by_student_concept", (q) =>
              q.eq("studentId", args.studentId!).eq("conceptId", targetConceptId!)
            )
            .first();

          deltaScore = (args.rating === "good" || args.rating === "easy") ? 6 : -4;

          if (existingMastery) {
            const updatedScore = Math.max(0, Math.min(100, existingMastery.score + deltaScore));
            const updatedRisk: "low" | "medium" | "high" =
              updatedScore >= 80 ? "low" : updatedScore >= 50 ? "medium" : "high";

            await ctx.db.patch(existingMastery._id, {
              score: updatedScore,
              lastSeen: now,
              retentionRisk: updatedRisk,
              attemptCount: existingMastery.attemptCount + 1,
            });
          } else {
            const initialScore = deltaScore > 0 ? 65 : 30;
            await ctx.db.insert("mastery", {
              studentId: args.studentId,
              conceptId: targetConceptId,
              score: initialScore,
              lastSeen: now,
              retentionRisk: initialScore >= 50 ? "medium" : "high",
              attemptCount: 1,
            });
          }

          // If student failed card and card has a common pitfall, log into misconceptions table
          if ((args.rating === "again" || args.rating === "hard") && card.commonPitfall) {
            const existingMisconception = await ctx.db
              .query("misconceptions")
              .withIndex("by_student", (q) => q.eq("studentId", args.studentId!))
              .filter((q) => q.eq(q.field("conceptId"), targetConceptId))
              .first();

            if (!existingMisconception) {
              await ctx.db.insert("misconceptions", {
                studentId: args.studentId,
                conceptId: targetConceptId,
                pattern: "flashcard_exam_trap",
                description: card.commonPitfall,
                evidence: `Struggled with flashcard: "${card.front.substring(0, 100)}..."`,
                confidence: 0.85,
                resolved: false,
              });
            }
          }
        }
      }

      // Log study action
      await ctx.db.insert("studyActions", {
        studentId: args.studentId,
        deckId: args.deckId,
        conceptId: targetConceptId,
        actionType: "flashcard_reviewed",
        result: `Rating: ${args.rating} | Mastery: ${Math.round(newMastery)}/5${
          syncedConceptTitle ? ` | Synced to: ${syncedConceptTitle}` : ""
        }`,
      });
    }

    return {
      success: true,
      masteryLevel: Math.round(newMastery),
      correctStreak: newStreak,
      nextReviewInMinutes: Math.round(intervalMs / (60 * 1000)),
      isExamCompressed: Boolean(isExamTargeted),
      syncedConceptTitle,
      deltaScore,
    };
  },
});

// ── Delete a Deck and cascade-delete its Flashcards ──
export const deleteDeck = mutation({
  args: { deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("flashcards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();

    for (const card of cards) {
      await ctx.db.delete(card._id);
    }

    await ctx.db.delete(args.deckId);
    return { success: true, deletedCards: cards.length };
  },
});

// ── Seed Preloaded High-Yield Sample Decks ──
export const seedSampleDecks = mutation({
  args: { studentId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("flashcardDecks").collect();
    if (existing.length > 0) return { count: existing.length, seeded: false };

    const now = Date.now();

    // 1. Smart Education AI Prototype Architecture Deck
    const deck1 = await ctx.db.insert("flashcardDecks", {
      studentId: args.studentId,
      title: "Smart Education AI Prototype Notes",
      subject: "AI & Computer Science",
      grade: "Class 12",
      fileName: "Smart_Education_AI_Prototype.pdf",
      fileSize: "109.8 KB",
      cardCount: 6,
      masteredCount: 2,
      createdAt: now - 3 * 24 * 60 * 60 * 1000,
      lastStudiedAt: now - 12 * 60 * 60 * 1000,
      isSample: true,
      description: "Prerequisite graphs, dynamic mastery Bayesian modeling, and teach-back architecture extracted from research paper",
    });

    const deck1Cards = [
      {
        front: "How does a **Prerequisite Graph (DAG)** eliminate blind rote memorization in adaptive curricula?",
        back: "A **Directed Acyclic Graph (DAG)** represents knowledge concepts as vertices and pedagogical dependencies as directed edges ($A \\rightarrow B$):\n\n* **Root-Cause Isolation**: When a student misses an advanced diagnostic item (e.g. Chain Rule), the engine traverses backward along DAG edges to test whether the foundational sub-skill (Limits or Function Composition) was the true failure point.\n* **Cognitive Sequencing**: Prevents cognitive overload by locking advanced nodes until foundational upstream dependencies exceed a 75% mastery threshold.",
        keyTakeaway: "Traversing DAG edges pinpoints the upstream root cause of diagnostic quiz errors rather than blindly repeating advanced questions.",
        commonPitfall: "Assuming all concepts are linear chapters—many advanced topics require multi-branch prerequisite synthesis across different subjects.",
        difficulty: "hard" as const,
        tags: ["DAG", "Prerequisites", "Knowledge Graph"],
        classmateHint: "Toby says: Think of a tech tree in a strategy game—you can't forge steel weapons if your iron mining technology is at Level 0!",
        masteryLevel: 4,
        nextReviewDate: now + 3 * 24 * 60 * 60 * 1000,
        reviewCount: 3,
        correctStreak: 3,
      },
      {
        front: "What are the 4 core dimensions evaluated by the **Feynman Teach-Back Protocol**?",
        back: "The AI classmate pod listens to student-typed explanations and evaluates 4 pedagogical pillars:\n\n1. **Completeness (0-100%)**: Did the explanation cover all boundary conditions and core laws?\n2. **Accuracy (0-100%)**: Are the formulas, units, and chemical/physical balance strictly correct?\n3. **Intuitive Depth vs Rote (0-100%)**: Does the student articulate *why* the phenomenon occurs using real-world analogies, or are they just repeating textbook definitions?\n4. **Misconception Detection**: Flags micro-fallacies (e.g. confusing velocity with acceleration or sign reversals).",
        keyTakeaway: "If you cannot explain a concept simply without academic jargon, you do not truly understand it.",
        commonPitfall: "Relying on memorized buzzwords instead of explaining the underlying physical mechanism.",
        difficulty: "medium" as const,
        tags: ["Teach-Back", "Feynman Method", "Evaluation"],
        classmateHint: "Maya says: Toby acts confused on purpose until your explanation covers the underlying 'why' rather than just reciting definitions.",
        masteryLevel: 4,
        nextReviewDate: now + 5 * 24 * 60 * 60 * 1000,
        reviewCount: 4,
        correctStreak: 3,
      },
      {
        front: "How does **Spaced Repetition (Leitner / SM-2)** mathematically counteract the Ebbinghaus Forgetting Curve?",
        back: "Memory retention decays exponentially according to: $$R = e^{-t / S}$$\nwhere $R$ is retrieval probability, $t$ is time elapsed, and $S$ is memory stability.\n\n* **Forgotten / Hard Cards**: Interval resets to $<10\\text{ minutes}$ and stability is recalibrated.\n* **Recalled / Mastered Cards**: Stability increases multiplicatively ($S_{n+1} = S_n \\times \\text{Ease Factor}$), pushing reviews to 1 day $\\rightarrow$ 3 days $\\rightarrow$ 7 days $\\rightarrow$ 14 days $\\rightarrow$ 30 days.",
        keyTakeaway: "Reviews scheduled at the exact point of near-forgetting produce maximum neural memory consolidation.",
        commonPitfall: "Cramming 100 cards the night before an exam—exponential decay wipes out 80% within 48 hours without spaced intervals.",
        difficulty: "easy" as const,
        tags: ["Spaced Repetition", "Ebbinghaus", "SM-2"],
        classmateHint: "Sam says: Intervals expand geometrically on success and collapse to zero on failure.",
        masteryLevel: 2,
        nextReviewDate: now,
        reviewCount: 1,
        correctStreak: 1,
      },
      {
        front: "What is **Human-in-the-Loop (HITL)** validation and why is it mandatory for automated slide extraction?",
        back: "When Multimodal LLMs extract diagnostic items and prerequisite links from lecture slides:\n\n* Extracted relationships enter an **Educator Review Queue** as unverified proposals.\n* Teachers can modify confidence scores, verify valid edges, or reject spurious connections.\n* **Pedagogical Safety**: Ensures zero black-box hallucinations enter the official student curriculum graph.",
        keyTakeaway: "AI drafts curriculum proposals; human educators approve them—combining AI speed with human pedagogical verification.",
        commonPitfall: "Trusting raw AI extractions directly without subject-matter teacher verification.",
        difficulty: "medium" as const,
        tags: ["HITL", "Curriculum Ingestion", "Safety"],
        classmateHint: "Leo says: Human oversight keeps our study material 100% accurate and exam-ready!",
        masteryLevel: 0,
        nextReviewDate: now,
        reviewCount: 0,
        correctStreak: 0,
      },
      {
        front: "Why are **Micro-Misconception Diagnostics** more effective than standard percentage grades?",
        back: "A standard score (e.g., '70% on Chapter 4') tells a student they failed 30% of the material, but provides zero actionable insight on *how* to fix it.\n\n* **Micro-Misconception Tagging**: Detects the precise conceptual bug (e.g., *'Equating normal force to mg on an inclined plane'*).\n* **Targeted Remediation**: Launches an instant 45-second interactive repair module addressing that specific error, restoring mastery in minutes.",
        keyTakeaway: "Pinpointing the exact cognitive error prevents compounding learning gaps in downstream topics.",
        commonPitfall: "Re-reading the entire 50-page chapter when only one specific formula condition was misunderstood.",
        difficulty: "hard" as const,
        tags: ["Misconceptions", "Remediation", "Diagnostics"],
        classmateHint: "Toby says: If a bicycle chain has one loose link, you don't buy a whole new bicycle—you just fix the loose link!",
        masteryLevel: 1,
        nextReviewDate: now,
        reviewCount: 1,
        correctStreak: 1,
      },
      {
        front: "How does **Diagnostic Item Calibration** maintain the Zone of Proximal Development (ZPD)?",
        back: "It uses adaptive item selection based on student real-time confidence and response accuracy:\n\n* Poses median-difficulty items first.\n* If answered correctly with high speed, escalates to multi-step synthesis challenges.\n* If missed, steps back to foundational sub-items to detect missing prerequisite skills without inducing student anxiety.",
        keyTakeaway: "Dynamic difficulty calibration keeps learners engaged at the exact frontier of their current ability.",
        commonPitfall: "Giving beginner students graduate-level problems (cognitive overload) or advanced students trivial definitions (boredom).",
        difficulty: "easy" as const,
        tags: ["Adaptive Assessment", "ZPD", "Calibration"],
        classmateHint: "Leo says: Always stays right at your edge of learning!",
        masteryLevel: 1,
        nextReviewDate: now,
        reviewCount: 1,
        correctStreak: 1,
      },
    ];

    for (const card of deck1Cards) {
      await ctx.db.insert("flashcards", {
        deckId: deck1,
        front: card.front,
        back: card.back,
        keyTakeaway: card.keyTakeaway,
        commonPitfall: card.commonPitfall,
        difficulty: card.difficulty,
        tags: card.tags,
        classmateHint: card.classmateHint,
        masteryLevel: card.masteryLevel,
        nextReviewDate: card.nextReviewDate,
        lastReviewed: now - 12 * 60 * 60 * 1000,
        reviewCount: card.reviewCount,
        correctStreak: card.correctStreak,
      });
    }

    // 2. Calculus Derivatives & Limit Theorems Deck
    const deck2 = await ctx.db.insert("flashcardDecks", {
      studentId: args.studentId,
      title: "Calculus: Differentiation, Chain Rule & Limits",
      subject: "Mathematics",
      grade: "Class 12",
      fileName: "Calculus_Chapter4_Notes.pdf",
      fileSize: "245.2 KB",
      cardCount: 6,
      masteredCount: 3,
      createdAt: now - 7 * 24 * 60 * 60 * 1000,
      lastStudiedAt: now - 24 * 60 * 60 * 1000,
      isSample: true,
      description: "Master differentiation rules, chain rule for nested composites, and implicit derivatives with formulas",
    });

    const deck2Cards = [
      {
        front: "What is the **Formal Limit Definition of the Derivative** $f'(x)$, and what is its geometric meaning?",
        back: "$$f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}$$\n\n* **Geometric Meaning**: Represents the instantaneous slope of the tangent line touching the curve $y = f(x)$ at $(x, f(x))$.\n* As the distance $h$ between two secant points approaches zero, the secant line rotates into the exact tangent line.",
        keyTakeaway: "The derivative is the limit of average rate of change over an infinitely shrinking interval.",
        commonPitfall: "Dividing by zero before taking the limit—the expression must be factored or simplified first.",
        difficulty: "medium" as const,
        tags: ["Limits", "Derivative", "Tangent Slope"],
        classmateHint: "Toby says: Think of your car speedometer—it shows your instantaneous rate right now, not your average trip speed!",
        masteryLevel: 5,
        nextReviewDate: now + 7 * 24 * 60 * 60 * 1000,
        reviewCount: 5,
        correctStreak: 4,
      },
      {
        front: "How do you apply the **Chain Rule** to nested composite functions like $y = \\sin(3x^2 + 5)$?",
        back: "$$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$$\n\n**Step-by-Step for $\\sin(3x^2 + 5)$**:\n1. Outside function $f(u) = \\sin(u) \\implies f'(u) = \\cos(u)$\n2. Inside function $g(x) = 3x^2 + 5 \\implies g'(x) = 6x$\n3. Multiply: $$\\frac{dy}{dx} = \\cos(3x^2 + 5) \\cdot (6x) = 6x\\cos(3x^2 + 5)$$",
        keyTakeaway: "Differentiate the outer shell keeping the interior intact, then multiply by the derivative of the interior.",
        commonPitfall: "Differentiating the inner expression inside the cosine directly, e.g. writing $\\cos(6x)$ instead of $\\cos(3x^2 + 5) \\cdot 6x$.",
        difficulty: "hard" as const,
        tags: ["Chain Rule", "Calculus", "Differentiation"],
        classmateHint: "Sam says: Never change the inside term until you multiply by its derivative on the outside!",
        masteryLevel: 4,
        nextReviewDate: now + 4 * 24 * 60 * 60 * 1000,
        reviewCount: 3,
        correctStreak: 2,
      },
      {
        front: "What is the **Product Rule** and why is $(u \\cdot v)' \\neq u' \\cdot v'$?",
        back: "$$(u \\cdot v)' = u' \\cdot v + u \\cdot v'$$\n\n* **Why not $u'v'$?** Geometrically, an area $A = u \\cdot v$ expands in two directions: when $u$ grows by $\\Delta u$ and $v$ grows by $\\Delta v$, total area change is $\\Delta A = v\\Delta u + u\\Delta v + \\Delta u\\Delta v$.\n* **Example**: $\\frac{d}{dx}[x^3 \\cdot e^x] = (3x^2)e^x + x^3(e^x) = x^2 e^x (3 + x)$.",
        keyTakeaway: "$$\\frac{d}{dx}[uv] = u'v + uv'$$ ('Derivative of first $\\times$ second $+$ first $\\times$ derivative of second').",
        commonPitfall: "Distributing the derivative simply as $(x^3)' \\cdot (e^x)' = 3x^2 e^x$, which is completely false.",
        difficulty: "easy" as const,
        tags: ["Product Rule", "Derivatives"],
        classmateHint: "Leo says: 1 D-2 plus 2 D-1! Simple rhythm.",
        masteryLevel: 5,
        nextReviewDate: now + 8 * 24 * 60 * 60 * 1000,
        reviewCount: 4,
        correctStreak: 4,
      },
      {
        front: "How does **Implicit Differentiation** work for circles $x^2 + y^2 = 25$?",
        back: "Treat $y$ as an implicit function of $x$ ($y = y(x)$) and apply the Chain Rule to $y^2$:\n\n1. Differentiate both sides with respect to $x$:\n$$\\frac{d}{dx}[x^2] + \\frac{d}{dx}[y^2] = \\frac{d}{dx}[25]$$\n$$2x + 2y\\frac{dy}{dx} = 0$$\n2. Isolate $\\frac{dy}{dx}$:\n$$2y\\frac{dy}{dx} = -2x \\implies \\frac{dy}{dx} = -\\frac{x}{y}$$",
        keyTakeaway: "Whenever you differentiate any $y$-term with respect to $x$, immediately append $\\frac{dy}{dx}$.",
        commonPitfall: "Treating $y$ as a constant and writing $\\frac{d}{dx}[y^2] = 0$.",
        difficulty: "hard" as const,
        tags: ["Implicit Differentiation", "Geometry"],
        classmateHint: "Maya says: Notice at the circle's top $(0, 5)$, slope is $-0/5 = 0$ (horizontal), and at $(5, 0)$, slope is undefined (vertical tangent).",
        masteryLevel: 1,
        nextReviewDate: now,
        reviewCount: 1,
        correctStreak: 0,
      },
      {
        front: "What is the **Fundamental Theorem of Calculus (FTC)** Part 1 and Part 2?",
        back: "* **Part 1 (Accumulation Derivative)**:\n$$\\frac{d}{dx}\\left[\\int_a^x f(t)dt\\right] = f(x)$$\n* **Part 2 (Definite Integral Evaluation)**:\n$$\\int_a^b f(x)dx = F(b) - F(a), \\quad \\text{where } F'(x) = f(x)$$\n* **Significance**: Proves that differentiation and integration are inverse mathematical operations.",
        keyTakeaway: "Definite integration equals the net difference of the antiderivative at the interval boundaries.",
        commonPitfall: "Forgetting the $+ C$ constant on indefinite integrals, or adding $+ C$ to definite integrals.",
        difficulty: "hard" as const,
        tags: ["FTC", "Integrals", "Antiderivative"],
        classmateHint: "Toby says: Slicing an area into tiny slope slivers (derivative) is the exact inverse of gluing slivers back into area (integral).",
        masteryLevel: 4,
        nextReviewDate: now + 5 * 24 * 60 * 60 * 1000,
        reviewCount: 3,
        correctStreak: 2,
      },
      {
        front: "What is the derivative of $\\ln(x)$, $e^{kx}$, and $\\tan(x)$?",
        back: "* $$\\frac{d}{dx}[\\ln(x)] = \\frac{1}{x} \\quad (x > 0)$$\n* $$\\frac{d}{dx}[e^{kx}] = k \\cdot e^{kx}$$\n* $$\\frac{d}{dx}[\\tan(x)] = \\sec^2(x) = 1 + \\tan^2(x)$$",
        keyTakeaway: "Exponential $e^x$ is its own derivative; natural log reciprocalizes its argument.",
        commonPitfall: "Confusing $\\frac{d}{dx}[\\ln(x)] = 1/x$ with integration $\\int x^{-1}dx = \\ln|x| + C$.",
        difficulty: "easy" as const,
        tags: ["Formulas", "Trigonometry", "Logarithms"],
        classmateHint: "Sam says: Memorize these three fundamental derivatives—they appear on almost every calculus exam.",
        masteryLevel: 4,
        nextReviewDate: now + 3 * 24 * 60 * 60 * 1000,
        reviewCount: 2,
        correctStreak: 2,
      },
    ];

    for (const card of deck2Cards) {
      await ctx.db.insert("flashcards", {
        deckId: deck2,
        front: card.front,
        back: card.back,
        keyTakeaway: card.keyTakeaway,
        commonPitfall: card.commonPitfall,
        difficulty: card.difficulty,
        tags: card.tags,
        classmateHint: card.classmateHint,
        masteryLevel: card.masteryLevel,
        nextReviewDate: card.nextReviewDate,
        lastReviewed: now - 24 * 60 * 60 * 1000,
        reviewCount: card.reviewCount,
        correctStreak: card.correctStreak,
      });
    }

    // 3. Physics Newton's Laws & Dynamics Deck
    const deck3 = await ctx.db.insert("flashcardDecks", {
      studentId: args.studentId,
      title: "Physics: Newton's Laws, Dynamics & Energy",
      subject: "Physics",
      grade: "Class 12",
      fileName: "Physics_Mechanics_Lecture.pdf",
      fileSize: "312.4 KB",
      cardCount: 4,
      masteredCount: 1,
      createdAt: now - 5 * 24 * 60 * 60 * 1000,
      lastStudiedAt: now - 36 * 60 * 60 * 1000,
      isSample: true,
      description: "Free body diagrams, static vs kinetic friction, momentum conservation, and work-energy theorem",
    });

    const deck3Cards = [
      {
        front: "State **Newton's Second Law** in both acceleration and momentum forms.",
        back: "$$\\Sigma \\vec{F} = m\\vec{a} = \\frac{d\\vec{p}}{dt}$$\n\n* **Acceleration Form**: Acceleration is directly proportional to net external force and inversely proportional to mass.\n* **Momentum Form**: Net force equals the instantaneous rate of change of linear momentum ($\\vec{p} = m\\vec{v}$).\n* If $\\Sigma \\vec{F} = 0$, linear momentum is strictly conserved ($m\\vec{v} = \\text{const}$).",
        keyTakeaway: "Net force causes acceleration; without a net external force, velocity and momentum remain unchanged.",
        commonPitfall: "Using individual forces instead of the vector sum $\\Sigma \\vec{F}$ when calculating acceleration.",
        difficulty: "easy" as const,
        tags: ["Newton 2", "Momentum", "Dynamics"],
        classmateHint: "Sam says: Always resolve forces into $x$ and $y$ components before calculating $\\Sigma F_x = ma_x$ and $\\Sigma F_y = ma_y$.",
        masteryLevel: 4,
        nextReviewDate: now + 3 * 24 * 60 * 60 * 1000,
        reviewCount: 3,
        correctStreak: 2,
      },
      {
        front: "Why do action-reaction pairs in **Newton's Third Law** never cancel each other out in a Free Body Diagram?",
        back: "$$\\vec{F}_{A \\text{ on } B} = -\\vec{F}_{B \\text{ on } A}$$\n\n* **Key Principle**: The action force and reaction force act on **two completely different bodies**.\n* When you draw a Free Body Diagram for Body $A$, you only include forces acting **ON** Body $A$ (not the force Body $A$ exerts on Body $B$).\n* Forces only cancel when opposing forces act simultaneously on the **same single object**.",
        keyTakeaway: "Equal and opposite, but acting on different objects—hence they never cancel.",
        commonPitfall: "Claiming a horse cannot pull a cart because the cart pulls back with equal force—the horse moves forward because its hooves push against the ground.",
        difficulty: "medium" as const,
        tags: ["Newton 3", "FBD", "Action-Reaction"],
        classmateHint: "Maya says: When you push the wall, the wall pushes you back—you feel the force on your hands, the wall feels the force on its surface.",
        masteryLevel: 2,
        nextReviewDate: now,
        reviewCount: 1,
        correctStreak: 1,
      },
      {
        front: "What is the physical difference between **Static Friction** ($f_s$) and **Kinetic Friction** ($f_k$)?",
        back: "* **Static Friction ($f_s \\le \\mu_s N$)**: An **inequality** that self-adjusts to match whatever force is applied until it reaches its maximum threshold $f_{s,\\max} = \\mu_s N$.\n* **Kinetic Friction ($f_k = \\mu_k N$)**: A **constant value** once sliding begins, with coefficient $\\mu_k < \\mu_s$ (microscopic surface bonds break once in motion).",
        keyTakeaway: "Static friction matches applied force up to a threshold; kinetic friction is constant and weaker.",
        commonPitfall: "Assuming static friction is always equal to $\\mu_s N$—if you push a 500N fridge with 10N, static friction is exactly 10N, not $\\mu_s N$.",
        difficulty: "hard" as const,
        tags: ["Friction", "Normal Force", "Mechanics"],
        classmateHint: "Toby says: It takes a huge push to break a couch free (static), but once it's sliding, it's easier to keep it moving (kinetic)!",
        masteryLevel: 1,
        nextReviewDate: now,
        reviewCount: 1,
        correctStreak: 0,
      },
      {
        front: "State the **Work-Energy Theorem** and explain when Mechanical Energy is conserved.",
        back: "$$W_{\\text{net}} = \\Delta K = \\frac{1}{2}mv_f^2 - \\frac{1}{2}mv_i^2$$\n\n* **Work Definition**: $W = \\int \\vec{F} \\cdot d\\vec{r} = F \\cdot d \\cdot \\cos(\\theta)$\n* **Conservation of Mechanical Energy ($E = K + U = \\text{const}$)** holds **if and only if** all non-conservative forces (friction, air drag) do zero net work ($W_{\\text{nc}} = 0$).",
        keyTakeaway: "Total work done by all forces equals change in kinetic energy ($W_{\\text{net}} = \\Delta K$).",
        commonPitfall: "Assuming work is done when force is perpendicular to displacement (e.g. uniform circular motion does $0$ work because $\\cos(90^\\circ) = 0$).",
        difficulty: "medium" as const,
        tags: ["Work", "Energy", "Conservation"],
        classmateHint: "Sam says: If force is perpendicular to motion (like centripetal force or normal force), work is strictly zero.",
        masteryLevel: 1,
        nextReviewDate: now,
        reviewCount: 1,
        correctStreak: 1,
      },
    ];

    for (const card of deck3Cards) {
      await ctx.db.insert("flashcards", {
        deckId: deck3,
        front: card.front,
        back: card.back,
        keyTakeaway: card.keyTakeaway,
        commonPitfall: card.commonPitfall,
        difficulty: card.difficulty,
        tags: card.tags,
        classmateHint: card.classmateHint,
        masteryLevel: card.masteryLevel,
        nextReviewDate: card.nextReviewDate,
        lastReviewed: now - 36 * 60 * 60 * 1000,
        reviewCount: card.reviewCount,
        correctStreak: card.correctStreak,
      });
    }

    return { count: 3, seeded: true };
  },
});

