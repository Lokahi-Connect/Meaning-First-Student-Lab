import rules from "../../data/routing/rules_v1.json";
import type { Task } from "./taskIndex";

export type ScoreSummary = {
  mastered: boolean;
  error_tags: Array<
    "meaning_error" | "structure_error" | "family_error" | "join_error" | "grapheme_language_error"
  >;
};

type RouteRule = {
  from_task_type: string;
  if_error_tag?: ScoreSummary["error_tags"][number];
  if_mastered?: boolean;
  to_task_id: string;
};

export function nextTaskId(currentTask: Task, score: ScoreSummary): string | null {
  const routes = (rules as { routes: RouteRule[] }).routes;

  // Priority 1: error-based routes
  for (const err of score.error_tags) {
    const match = routes.find(
      (r) => r.from_task_type === currentTask.task_type && r.if_error_tag === err
    );
    if (match) return match.to_task_id;
  }

  // Priority 2: mastery routes
  const masteryMatch = routes.find(
    (r) => r.from_task_type === currentTask.task_type && r.if_mastered === score.mastered
  );
  if (masteryMatch) return masteryMatch.to_task_id;

  return null;
}
