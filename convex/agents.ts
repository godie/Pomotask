import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const registerAgent = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    capabilities: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert("agents", {
      name: args.name,
      type: args.type,
      status: "active",
      capabilities: args.capabilities,
      lastSeenAt: Date.now(),
    });

    return await ctx.db.get(agentId);
  },
});

export const heartbeatAgent = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");

    await ctx.db.patch(args.agentId, {
      lastSeenAt: Date.now(),
      status: "active",
    });

    return { agentId: args.agentId, status: "alive", lastSeenAt: Date.now() };
  },
});

export const getAgentStatus = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) return null;

    const tasksClaimed = (await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("claimedBy"), args.agentId))
      .collect()).length;

    const tasksCompleted = (await ctx.db
      .query("tasks")
      .filter((q) =>
        q.and(
          q.eq(q.field("claimedBy"), args.agentId),
          q.eq(q.field("status"), "completed"),
        ),
      )
      .collect()).length;

    return {
      agentId: args.agentId,
      name: agent.name,
      type: agent.type,
      status: agent.status,
      capabilities: agent.capabilities,
      lastSeenAt: agent.lastSeenAt,
      tasksClaimed,
      tasksCompleted,
    };
  },
});