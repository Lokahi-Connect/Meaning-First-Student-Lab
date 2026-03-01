import type { Task } from "../data/taskIndex";
import type { ScoreSummary } from "../data/routing";

export type ResponseMap = Record<string, string>;

function hasText(v?: string) {
  return !!v && v.trim().length >= 2;
}

// v1 join heuristics (tiny + debuggable)
function detectJoinError(task: Task, responses: ResponseMap): boolean {
  const joinText = (responses["join"] || "").toLowerCase();

  const base = task.targets.base;
  const targetWord = task.targets.words?.[0] || "";

  // If the correct word is mentioned, likely OK.
  if (targetWord && joinText.includes(targetWord.toLowerCase())) return false;

  // If base ends with 'e' and expected word drops it (make -> making),
  // treat "keep e" language as error.
  const baseEndsWithE = base.endsWith("e");
  const expectedDropsE =
    baseEndsWithE && targetWord && targetWord.toLowerCase() === `${base.slice(0, -1)}ing`;

  if (expectedDropsE) {
    const suggestsKeepingE =
      joinText.includes("keep") && joinText.includes("e") ||
      joinText.includes("stays") && joinText.includes("e") ||
      joinText.includes("no change");

    if (suggestsKeepingE) return true;

    // If they explicitly mention dropping/removing the e, likely OK.
    const mentionsDrop = joinText.includes("drop") || joinText.includes("remove");
    if (mentionsDrop && joinText.includes("e")) return false;

    // If they wrote the incorrect spelling anywhere
    if (joinText.includes(`${base}ing`.toLowerCase())) return true;
  }

  // For "jump + ing" we mostly want “no change” reasoning.
  const expectedNoChange = !baseEndsWithE && targetWord.toLowerCase() === `${base}ing`.toLowerCase();
  if (expectedNoChange) {
    // If they claim a change that doesn't fit (drop e / double / change y) flag it.
    const claimsChange =
      joinText.includes("drop") ||
      joinText.includes("remove") ||
      joinText.includes("double") ||
      joinText.includes("change");
    return claimsChange;
  }

  return false;
}

export function scoreTaskV1(task: Task, responses: ResponseMap): ScoreSummary {
  const errors: ScoreSummary["error_tags"] = [];

  // meaning field exists in t1/t2 but not necessarily in all tasks
  if (task.response.fields?.some((f) => f.id === "meaning")) {
    if (!hasText(responses["meaning"])) errors.push("meaning_error");
  }

  if (task.response.fields?.some((f) => f.id === "structure")) {
    if (!hasText(responses["structure"])) errors.push("structure_error");
  }

  if (task.response.fields?.some((f) => f.id === "family")) {
    if (!hasText(responses["family"])) errors.push("family_error");
  }

  if (task.response.fields?.some((f) => f.id === "join")) {
    if (!hasText(responses["join"]) || detectJoinError(task, responses)) errors.push("join_error");
  }

  // v1 mastery rule: no errors
  const mastered = errors.length === 0;

  return { mastered, error_tags: errors };
}
