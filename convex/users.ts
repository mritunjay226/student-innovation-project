import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all users
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Get user by role (for demo/fallback auth)
export const getByRole = query({
  args: { role: v.union(v.literal("student"), v.literal("teacher")) },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users.find((u) => u.role === args.role) || null;
  },
});

// Get user by Clerk ID
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Sync Clerk authenticated user into Convex database
export const syncClerkUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    role: v.optional(v.union(v.literal("student"), v.literal("teacher"))),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Check if user already exists by clerkId
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      // Update details if changed
      await ctx.db.patch(existing._id, {
        name: args.name || existing.name,
        email: args.email || existing.email,
        avatar: args.avatar || existing.avatar,
        role: args.role || existing.role,
        grade: args.grade || existing.grade,
      });
      return existing._id;
    }

    // 2. Check if user exists by email
    if (args.email) {
      const existingEmail = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (existingEmail) {
        await ctx.db.patch(existingEmail._id, {
          clerkId: args.clerkId,
          name: args.name || existingEmail.name,
          avatar: args.avatar || existingEmail.avatar,
        });
        return existingEmail._id;
      }
    }

    // 3. Create new user in Convex database
    const newUserId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name || "Scholar",
      email: args.email,
      avatar: args.avatar,
      role: args.role || "student",
      grade: args.grade || "Class 12",
    });

    return newUserId;
  },
});

// Update role for a user
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("student"), v.literal("teacher")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role,
    });
    return { success: true, role: args.role };
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
