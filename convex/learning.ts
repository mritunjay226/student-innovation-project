import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get misconceptions for a student
export const getByStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    const misconceptions = await ctx.db
      .query("misconceptions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    // Enrich with concept info
    const enriched = await Promise.all(
      misconceptions.map(async (m) => {
        const concept = await ctx.db.get(m.conceptId);
        return { ...m, concept };
      })
    );

    return enriched;
  },
});

// Submit a teach-back
export const submitTeachBack = mutation({
  args: {
    studentId: v.id("users"),
    conceptId: v.id("concepts"),
    explanation: v.string(),
    aiAnalysis: v.object({
      completeness: v.number(),
      accuracy: v.number(),
      depth: v.number(),
      overallScore: v.number(),
      feedback: v.string(),
      misconceptionsFound: v.array(v.string()),
      missingConcepts: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("teachBacks", {
      studentId: args.studentId,
      conceptId: args.conceptId,
      explanation: args.explanation,
      aiAnalysis: args.aiAnalysis,
    });

    // Log study action
    await ctx.db.insert("studyActions", {
      studentId: args.studentId,
      conceptId: args.conceptId,
      actionType: "teach_back",
      result: `Score: ${args.aiAnalysis.overallScore}`,
    });

    // Add any new misconceptions found
    for (const misconception of args.aiAnalysis.misconceptionsFound) {
      await ctx.db.insert("misconceptions", {
        studentId: args.studentId,
        conceptId: args.conceptId,
        pattern: "ai_detected",
        description: misconception,
        evidence: `Detected from teach-back: "${args.explanation.substring(0, 200)}..."`,
        confidence: 0.75,
        resolved: false,
      });
    }

    return { success: true };
  },
});

// Get teach-back history
export const getTeachBackHistory = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    const teachBacks = await ctx.db
      .query("teachBacks")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    const enriched = await Promise.all(
      teachBacks.map(async (t) => {
        const concept = await ctx.db.get(t.conceptId);
        return { ...t, concept };
      })
    );

    return enriched;
  },
});

// Add prerequisite edge (teacher action)
export const addPrerequisiteEdge = mutation({
  args: {
    fromConceptId: v.id("concepts"),
    toConceptId: v.id("concepts"),
    teacherVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("prerequisiteEdges", {
      fromConceptId: args.fromConceptId,
      toConceptId: args.toConceptId,
      confidence: args.teacherVerified ? 1.0 : 0.7,
      teacherVerified: args.teacherVerified,
    });
  },
});

// Verify/update a prerequisite edge (teacher action)
export const verifyEdge = mutation({
  args: {
    edgeId: v.id("prerequisiteEdges"),
    teacherVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.edgeId, {
      teacherVerified: args.teacherVerified,
      confidence: args.teacherVerified ? 1.0 : 0.5,
    });
  },
});

// Delete a prerequisite edge
export const deleteEdge = mutation({
  args: { edgeId: v.id("prerequisiteEdges") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.edgeId);
  },
});
