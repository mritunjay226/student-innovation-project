import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users (students and teachers)
  users: defineTable({
    name: v.string(),
    role: v.union(v.literal("student"), v.literal("teacher")),
    grade: v.optional(v.string()), // e.g. "Class 12"
    avatar: v.optional(v.string()),
    clerkId: v.optional(v.string()),
    email: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  // Concepts in the knowledge graph
  concepts: defineTable({
    subject: v.string(), // "Mathematics", "Physics", "Chemistry"
    grade: v.optional(v.string()), // "Class 10", "Class 11", "Class 12"
    title: v.string(),
    description: v.string(),
    difficulty: v.number(), // 1-5
    order: v.number(), // display order
  })
    .index("by_subject", ["subject"])
    .index("by_grade", ["grade"])
    .index("by_subject_grade", ["subject", "grade"]),

  // Prerequisite edges between concepts
  prerequisiteEdges: defineTable({
    fromConceptId: v.id("concepts"),
    toConceptId: v.id("concepts"),
    confidence: v.number(), // 0-1 how confident we are in this relationship
    teacherVerified: v.boolean(),
  })
    .index("by_from", ["fromConceptId"])
    .index("by_to", ["toConceptId"]),

  // Assessment questions
  assessmentItems: defineTable({
    conceptId: v.id("concepts"),
    question: v.string(),
    type: v.union(
      v.literal("mcq"),
      v.literal("true_false"),
      v.literal("short_answer")
    ),
    options: v.optional(v.array(v.string())), // for MCQ
    correctAnswer: v.string(),
    difficulty: v.number(), // 1-5
    explanation: v.optional(v.string()),
  }).index("by_concept", ["conceptId"]),

  // Student attempts on questions
  attempts: defineTable({
    studentId: v.id("users"),
    questionId: v.id("assessmentItems"),
    conceptId: v.id("concepts"),
    answer: v.string(),
    correct: v.boolean(),
    timeTaken: v.number(), // seconds
    confidence: v.number(), // 1-5 self-rated
    reasoning: v.optional(v.string()), // Student's stated reasoning/thought process
    aiReasoningFeedback: v.optional(v.string()), // AI diagnostic feedback on their logic
  })
    .index("by_student", ["studentId"])
    .index("by_student_concept", ["studentId", "conceptId"]),

  // Mastery records per student per concept
  mastery: defineTable({
    studentId: v.id("users"),
    conceptId: v.id("concepts"),
    score: v.number(), // 0-100
    lastSeen: v.number(), // timestamp
    retentionRisk: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    attemptCount: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_student_concept", ["studentId", "conceptId"])
    .index("by_concept", ["conceptId"]),

  // Detected misconception patterns
  misconceptions: defineTable({
    studentId: v.id("users"),
    conceptId: v.id("concepts"),
    pattern: v.string(), // e.g. "formula_confusion", "concept_reversal"
    description: v.string(),
    evidence: v.string(),
    confidence: v.number(), // 0-1
    resolved: v.boolean(),
  })
    .index("by_student", ["studentId"])
    .index("by_concept", ["conceptId"]),

  // Teach-back submissions
  teachBacks: defineTable({
    studentId: v.id("users"),
    conceptId: v.id("concepts"),
    explanation: v.string(), // student's typed explanation
    aiAnalysis: v.object({
      completeness: v.number(), // 0-100
      accuracy: v.number(), // 0-100
      depth: v.number(), // 0-100
      overallScore: v.number(), // 0-100
      feedback: v.string(),
      misconceptionsFound: v.array(v.string()),
      missingConcepts: v.array(v.string()),
    }),
  })
    .index("by_student", ["studentId"])
    .index("by_student_concept", ["studentId", "conceptId"]),

  // Study actions log
  studyActions: defineTable({
    studentId: v.id("users"),
    conceptId: v.optional(v.id("concepts")),
    deckId: v.optional(v.id("flashcardDecks")),
    actionType: v.union(
      v.literal("lesson_viewed"),
      v.literal("quiz_taken"),
      v.literal("teach_back"),
      v.literal("flashcard_reviewed"),
      v.literal("prerequisite_repair")
    ),
    result: v.optional(v.string()),
  }).index("by_student", ["studentId"]),

  // Flashcard Decks generated from PDF or created by student
  flashcardDecks: defineTable({
    studentId: v.optional(v.id("users")),
    title: v.string(),
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.string()),
    cardCount: v.number(),
    masteredCount: v.number(),
    createdAt: v.number(),
    lastStudiedAt: v.optional(v.number()),
    isSample: v.optional(v.boolean()),
    description: v.optional(v.string()),
    conceptId: v.optional(v.id("concepts")),
    cardType: v.optional(v.string()),
    targetExamDate: v.optional(v.number()), // Timestamp in ms for target exam
    examReadinessScore: v.optional(v.number()), // 0-100% on-track mastery projection
  }).index("by_student", ["studentId"]),

  // Individual Flashcards with Spaced Repetition tracking
  flashcards: defineTable({
    deckId: v.id("flashcardDecks"),
    conceptId: v.optional(v.id("concepts")), // Closed-loop linked concept
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
    masteryLevel: v.number(), // 0 to 5 (Leitner box / SM-2 rating)
    intervalMs: v.optional(v.number()),
    easeFactor: v.optional(v.number()),
    nextReviewDate: v.optional(v.number()),
    lastReviewed: v.optional(v.number()),
    reviewCount: v.number(),
    correctStreak: v.number(),
    lastReasoning: v.optional(v.string()), // What the student was thinking when reviewing
    lastThoughtAnalysis: v.optional(v.string()), // AI feedback on student reasoning
  }).index("by_deck", ["deckId"]),
});
