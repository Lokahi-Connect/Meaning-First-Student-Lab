import type { Task } from "../data/taskIndex";
import type { ResponseMap } from "../scoring/scoreV1";

// Guidance status is not "wrong/correct". It's "supported/not yet supported".
export type SupportStatus = {
  supported: boolean;
  focus: Array<"meaning" | "structure" | "join" | "family">;
  prompts: string[];
};

// helpers
const norm = (v?: string) => (v || "").toLowerCase().trim();
const hasMin = (v?: string, n = 3) => norm(v).length >= n;
const includesAny = (txt: string, needles: string[]) => needles.some((n) => txt.includes(n));

function needsMeaning(task: Task, r: ResponseMap) {
  if (!task.response.fields?.some((f) => f.id === "meaning")) return false;
  const m = norm(r.meaning);
  // For <-ing>, we want meaning signal (process/ongoing) OR at least a meaningful phrase.
  return !(includesAny(m, ["ongoing", "process", "in the process", "doing", "happening"]) || hasMin(m, 8));
}

function needsStructure(task: Task, r: ResponseMap) {
  if (!task.response.fields?.some((f) => f.id === "structure")) return false;
  const s = norm(r.structure);
  const base = norm(task.targets.base);
  const suffix = norm(task.targets.suffixes?.[0] || "");
  const showsCombine = includesAny(s, ["+", "→", "->", "plus"]);
  return !(s.includes(base) && (!suffix || s.includes(suffix)) && showsCombine);
}

function needsJoin(task: Task, r: ResponseMap) {
  if (!task.response.fields?.some((f) => f.id === "join")) return false;
  const j = norm(r.join);
  // Join explanation needs *some* join-language + reference to what changes (or explicitly "no change").
  const hasJoinLanguage = includesAny(j, ["join", "change", "no change", "stays the same", "drop", "remove", "double"]);
  return !(hasMin(j, 8) && hasJoinLanguage);
}

function needsFamily(task: Task, r: ResponseMap) {
  if (!task.response.fields?.some((f) => f.id === "family")) return false;
  const f = norm(r.family);
  return !hasMin(f, 3);
}

export function guideV1(task: Task, responses: ResponseMap): SupportStatus {
  const focus: SupportStatus["focus"] = [];
  const prompts: string[] = [];

  const wantMeaning = needsMeaning(task, responses);
  const wantStructure = needsStructure(task, responses);
  const wantJoin = needsJoin(task, responses);
  const wantFamily = needsFamily(task, responses);

  const base = task.targets.base;
  const suffix = task.targets.suffixes?.[0] || "";
  const word = task.targets.words?.[0] || "";

  if (wantMeaning) {
    focus.push("meaning");
    prompts.push(
      `Meaning first: what does <${suffix}> add to the meaning in this word? Use a phrase like “in the process of …” or “ongoing …”.`
    );
  }

  if (wantStructure) {
    focus.push("structure");
    prompts.push(`Structure: show <${base}> + <${suffix}> → <${word}> (use + and an arrow).`);
  }

  if (wantJoin) {
    focus.push("join");
    // We do not tell them the answer; we ask for evidence.
    prompts.push(
      `Check the join: compare the base spelling <${base}> with the built word <${word}>. What stayed the same? What changed (if anything)? State it clearly.`
    );
    prompts.push(
      `Evidence prompt: point to the exact letters at the join that support your claim.`
    );
  }

  if (wantFamily) {
    focus.push("family");
    prompts.push(
      `Word family evidence: name one related word that helps you keep the base spelling in mind.`
    );
  }

  // If nothing is missing, it's supported.
  const supported = focus.length === 0;

  // If supported, add a transfer-oriented confirmation prompt (optional).
  if (supported) {
    prompts.push(`Supported. Now: can you use the same reasoning on a new word?`);
  }

  return { supported, focus, prompts };
}
