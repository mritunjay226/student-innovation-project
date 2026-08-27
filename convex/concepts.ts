import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all concepts with optional subject and grade filters
export const getAll = query({
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

    return concepts.sort((a, b) => a.order - b.order);
  },
});

// Get a single concept by ID
export const getById = query({
  args: { id: v.id("concepts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get concept map with edges filtered by subject
export const getConceptMap = query({
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

    const conceptIds = new Set(concepts.map((c) => c._id));
    const allEdges = await ctx.db.query("prerequisiteEdges").collect();

    // Only include edges where both nodes are in the filtered set
    const edges = allEdges.filter(
      (e) => conceptIds.has(e.fromConceptId) && conceptIds.has(e.toConceptId)
    );

    return {
      concepts: concepts.sort((a, b) => a.order - b.order),
      edges,
    };
  },
});

// Get concepts with mastery data for a student
export const getWithMastery = query({
  args: {
    studentId: v.id("users"),
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

    const masteryRecords = await ctx.db
      .query("mastery")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    const allEdges = await ctx.db.query("prerequisiteEdges").collect();

    const masteryMap = new Map(
      masteryRecords.map((m) => [m.conceptId, m])
    );

    const conceptsWithMastery = concepts.map((c) => ({
      ...c,
      mastery: masteryMap.get(c._id) || null,
    }));

    const conceptIds = new Set(concepts.map((c) => c._id));
    const edges = allEdges.filter(
      (e) => conceptIds.has(e.fromConceptId) && conceptIds.has(e.toConceptId)
    );

    return {
      concepts: conceptsWithMastery.sort((a, b) => a.order - b.order),
      edges,
    };
  },
});
