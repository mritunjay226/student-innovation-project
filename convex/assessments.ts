import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get questions for a concept
export const getByConcept = query({
  args: { conceptId: v.id("concepts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assessmentItems")
      .withIndex("by_concept", (q) => q.eq("conceptId", args.conceptId))
      .collect();
  },
});

// Get adaptive questions for a student (adjusts difficulty based on mastery)
export const getAdaptiveQuestions = query({
  args: {
    studentId: v.id("users"),
    conceptId: v.id("concepts"),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const mastery = await ctx.db
      .query("mastery")
      .withIndex("by_student_concept", (q) =>
        q.eq("studentId", args.studentId).eq("conceptId", args.conceptId)
      )
      .first();

    const questions = await ctx.db
      .query("assessmentItems")
      .withIndex("by_concept", (q) => q.eq("conceptId", args.conceptId))
      .collect();

    // Adaptive difficulty: low mastery → easier questions, high mastery → harder
    const targetDifficulty = mastery
      ? mastery.score < 40
        ? 2
        : mastery.score < 70
          ? 3
          : 4
      : 2;

    // Sort by closeness to target difficulty, then shuffle within same difficulty
    const sorted = questions.sort((a, b) => {
      const diffA = Math.abs(a.difficulty - targetDifficulty);
      const diffB = Math.abs(b.difficulty - targetDifficulty);
      if (diffA !== diffB) return diffA - diffB;
      return Math.random() - 0.5;
    });

    const count = args.count || 5;
    return sorted.slice(0, count);
  },
});

// Submit an attempt
export const submitAttempt = mutation({
  args: {
    studentId: v.id("users"),
    questionId: v.id("assessmentItems"),
    answer: v.string(),
    timeTaken: v.number(),
    confidence: v.number(),
    reasoning: v.optional(v.string()),
    aiReasoningFeedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Question not found");

    const correct =
      args.answer.toLowerCase().trim() ===
      question.correctAnswer.toLowerCase().trim();

    await ctx.db.insert("attempts", {
      studentId: args.studentId,
      questionId: args.questionId,
      conceptId: question.conceptId,
      answer: args.answer,
      correct,
      timeTaken: args.timeTaken,
      confidence: args.confidence,
      reasoning: args.reasoning,
      aiReasoningFeedback: args.aiReasoningFeedback,
    });

    // Log study action
    await ctx.db.insert("studyActions", {
      studentId: args.studentId,
      conceptId: question.conceptId,
      actionType: "quiz_taken",
      result: correct ? "correct" : "incorrect",
    });

    return {
      correct,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    };
  },
});

// Get student's attempt history
export const getStudentAttempts = query({
  args: { studentId: v.id("users"), conceptId: v.optional(v.id("concepts")) },
  handler: async (ctx, args) => {
    if (args.conceptId) {
      return await ctx.db
        .query("attempts")
        .withIndex("by_student_concept", (q) =>
          q
            .eq("studentId", args.studentId)
            .eq("conceptId", args.conceptId!)
        )
        .collect();
    }
    return await ctx.db
      .query("attempts")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});
