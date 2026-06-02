import type { Doc, Id } from "../../convex/_generated/dataModel";
import type { Task, Project, TaskStatus } from "@/types";

/**
 * Map a Convex task document to the Pomotask Task type.
 * Handles the field name differences (title→name) and provides defaults
 * for pomotask-specific fields not present in all Convex task documents.
 */
export function mapConvexTaskToPomotask(doc: Doc<"tasks">): Task {
  return {
    id: doc._id,
    projectId: doc.projectId as string,
    name: doc.title,
    estimatedPomodoros: doc.estimatedPomodoros ?? 1,
    realPomodoros: doc.realPomodoros ?? 0,
    status: normalizeStatus(doc.status),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt ?? doc._creationTime,
    completedAt: doc.completedAt,
  };
}

/**
 * Map a Convex project document to the Pomotask Project type.
 */
export function mapConvexProjectToPomotask(doc: Doc<"projects">): Project {
  return {
    id: doc._id,
    name: doc.name,
    color: doc.color ?? "#6366f1",
    description: doc.description,
    createdAt: doc.createdAt ?? 0,
    updatedAt: doc.updatedAt ?? 0,
  };
}

/** Normalize Convex status values to Pomotask TaskStatus */
function normalizeStatus(status: string): TaskStatus {
  switch (status) {
    case "pending":
      return "pending";
    case "in_progress":
      return "in_progress";
    case "completed":
      return "completed";
    case "divided":
      return "divided";
    default:
      return "pending";
  }
}

/** Re-export Id type for use in hooks */
export type { Id };
