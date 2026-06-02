import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List all projects owned by the authenticated user */
export const listProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("ownerUserId"), identity.subject))
      .order("desc")
      .take(200);
  },
});

/** Get a single project by ID (returns null when projectId is empty/invalid) */
export const getProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    if (!args.projectId || args.projectId === "skip") return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await ctx.db.get(args.projectId as any);
  },
});

/** Create a new Pomodoro project */
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    return await ctx.db.insert("projects", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ownerUserId: identity.subject as any,
      name: args.name,
      description: args.description,
      color: args.color ?? "#6366f1",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update a project (name, color, description) */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name;
    if (args.description !== undefined) patch.description = args.description;
    if (args.color !== undefined) patch.color = args.color;

    await ctx.db.patch(args.projectId, patch);
    return await ctx.db.get(args.projectId);
  },
});

/** Delete a project */
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.db.delete(args.projectId as any);
  },
});

// ─── Migration mutations ───

/**
 * Insert a project during Dexie→Convex migration.
 * Accepts explicit ownerUserId so it works immediately after sign-up
 * (does not rely on ctx.auth identity).
 */
export const migrateUserProject = mutation({
  args: {
    ownerUserId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.ownerUserId)
      throw new Error("Not authenticated");
    return await ctx.db.insert("projects", {
      ownerUserId: args.ownerUserId,
      name: args.name,
      description: args.description,
      color: args.color ?? "#6366f1",
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
  },
});
