import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all users
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Get user by role (for demo auth)
export const getByRole = query({
  args: { role: v.union(v.literal("student"), v.literal("teacher")) },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users.find((u) => u.role === args.role) || null;
  },
});

// Get student with their mastery overview
export const getStudentOverview = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) return null;

    const masteryRecords = await ctx.db
      .query("mastery")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    const misconceptions = await ctx.db
      .query("misconceptions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    const totalMastery =
      masteryRecords.length > 0
        ? Math.round(
            masteryRecords.reduce((sum, m) => sum + m.score, 0) /
              masteryRecords.length
          )
        : 0;

    const highRiskConcepts = masteryRecords.filter(
      (m) => m.retentionRisk === "high"
    ).length;

    return {
      ...student,
      totalMastery,
      conceptsStudied: masteryRecords.length,
      highRiskConcepts,
      activeMisconceptions: misconceptions.filter((m) => !m.resolved).length,
      masteryRecords,
      misconceptions: misconceptions.filter((m) => !m.resolved),
    };
  },
});
