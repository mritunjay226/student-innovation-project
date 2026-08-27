import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get mastery records for a student with optional subject and grade filters
export const getStudentMastery = query({
  args: {
    studentId: v.id("users"),
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("mastery")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    // Enrich with concept info
    const enriched = await Promise.all(
      records.map(async (r) => {
        const concept = await ctx.db.get(r.conceptId);
        return { ...r, concept };
      })
    );

    let filtered = enriched.filter((r) => r.concept !== null);

    if (args.subject && args.subject !== "All Subjects") {
      filtered = filtered.filter((r) => r.concept?.subject === args.subject);
    }

    if (args.grade && args.grade !== "All Grades") {
      filtered = filtered.filter((r) => r.concept?.grade === args.grade);
    }

    return filtered;
  },
});

// Get class-wide mastery overview (for teacher) with optional subject and grade filters
export const getClassGaps = query({
  args: {
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let concepts = await ctx.db.query("concepts").collect();

    if (args.subject && args.subject !== "All Subjects") {
      concepts = concepts.filter((c) => c.subject === args.subject);
    }

    if (args.grade && args.grade !== "All Grades") {
      concepts = concepts.filter((c) => c.grade === args.grade);
    }

    const allMastery = await ctx.db.query("mastery").collect();
    const allMisconceptions = await ctx.db.query("misconceptions").collect();

    const classGaps = concepts
      .map((concept) => {
        const masteryForConcept = allMastery.filter(
          (m) => m.conceptId === concept._id
        );
        const avgMastery =
          masteryForConcept.length > 0
            ? Math.round(
                masteryForConcept.reduce((sum, m) => sum + m.score, 0) /
                  masteryForConcept.length
              )
            : 0;
        const misconceptionsForConcept = allMisconceptions.filter(
          (m) => m.conceptId === concept._id && !m.resolved
        );

        let signal: "Strong" | "Watch" | "High gap";
        let suggestedAction: string;

        if (avgMastery >= 80) {
          signal = "Strong";
          suggestedAction = "Continue to next topic";
        } else if (avgMastery >= 55) {
          signal = "Watch";
          suggestedAction = "Retrieval practice recommended";
        } else {
          signal = "High gap";
          suggestedAction = "Re-teach prerequisite fundamentals";
        }

        return {
          concept,
          avgMastery,
          signal,
          suggestedAction,
          misconceptionCount: misconceptionsForConcept.length,
          studentCount: masteryForConcept.length,
        };
      })
      .sort((a, b) => a.concept.order - b.concept.order);

    return classGaps;
  },
});

// Update mastery after an attempt
export const updateAfterAttempt = mutation({
  args: {
    studentId: v.id("users"),
    conceptId: v.id("concepts"),
    correct: v.boolean(),
    confidence: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mastery")
      .withIndex("by_student_concept", (q) =>
        q.eq("studentId", args.studentId).eq("conceptId", args.conceptId)
      )
      .first();

    if (existing) {
      const delta = args.correct ? 8 : -5;
      const confidenceBonus = args.correct ? (args.confidence - 3) * 2 : 0;
      const newScore = Math.max(
        0,
        Math.min(100, existing.score + delta + confidenceBonus)
      );

      const newRisk: "low" | "medium" | "high" =
        newScore >= 80 ? "low" : newScore >= 50 ? "medium" : "high";

      await ctx.db.patch(existing._id, {
        score: newScore,
        lastSeen: Date.now(),
        retentionRisk: newRisk,
        attemptCount: existing.attemptCount + 1,
      });
    } else {
      const initialScore = args.correct ? 60 : 20;
      await ctx.db.insert("mastery", {
        studentId: args.studentId,
        conceptId: args.conceptId,
        score: initialScore,
        lastSeen: Date.now(),
        retentionRisk: initialScore >= 50 ? "medium" : "high",
        attemptCount: 1,
      });
    }
  },
});

// Update mastery after teach-back
export const updateAfterTeachBack = mutation({
  args: {
    studentId: v.id("users"),
    conceptId: v.id("concepts"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mastery")
      .withIndex("by_student_concept", (q) =>
        q.eq("studentId", args.studentId).eq("conceptId", args.conceptId)
      )
      .first();

    if (existing) {
      const newScore = Math.round(existing.score * 0.4 + args.score * 0.6);
      const newRisk: "low" | "medium" | "high" =
        newScore >= 80 ? "low" : newScore >= 50 ? "medium" : "high";

      await ctx.db.patch(existing._id, {
        score: newScore,
        lastSeen: Date.now(),
        retentionRisk: newRisk,
      });
    }
  },
});
