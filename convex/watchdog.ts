import { internalMutation } from "./_generated/server";

export const resetStuckTasks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const STUCK_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();

    // Se usa .collect() aquí porque es una operación interna de limpieza (watchdog)
    // que se ejecuta en el backend, no por acción directa de un usuario.
    // El volumen de tareas in_progress simultáneas se espera que sea bajo.
    const inProgressTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status_type", (q) => q.eq("status", "in_progress"))
      .collect();

    for (const task of inProgressTasks) {
      // Excluir tareas que esperan clarificación
      if (task.waitingForClarification) continue;

      // Verificar si la tarea está estancada basándose en startedAt
      if (task.startedAt && now - task.startedAt > STUCK_THRESHOLD_MS) {
        const newRetryCount = task.retryCount + 1;
        const shouldFail = newRetryCount >= task.maxRetries;

        if (shouldFail) {
          await ctx.db.patch(task._id, {
            status: "failed",
            retryCount: newRetryCount,
            endedAt: now,
          });

          await ctx.db.insert("taskLogs", {
            taskId: task._id,
            agentId: task.claimedBy!,
            message: `Task marked as failed due to timeout (stuck for > 30 min). Retries: ${newRetryCount}/${task.maxRetries}`,
            level: "error",
            timestamp: now,
          });
        } else {
          await ctx.db.patch(task._id, {
            status: "pending",
            retryCount: newRetryCount,
            claimedBy: undefined,
            startedAt: undefined,
          });

          await ctx.db.insert("taskLogs", {
            taskId: task._id,
            agentId: task.claimedBy!,
            message: `Task reset to pending due to timeout (stuck for > 30 min). Retries: ${newRetryCount}/${task.maxRetries}`,
            level: "warn",
            timestamp: now,
          });
        }
      }
    }
  },
});
