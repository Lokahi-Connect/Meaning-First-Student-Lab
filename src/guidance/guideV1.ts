import type { Task } from "../data/taskIndex";
import type { ResponseMap } from "../scoring/scoreV1";

export type SupportStatus = {
  supported: boolean;
  focus: Array<"meaning" | "structure" | "join" | "family">;
  prompts: string[];
};

const norm = (v?: string) => (v || "").toLowerCase().trim();
const hasMin = (v?: string, n = 3) => norm(v).length >= n;
const includesAny = (txt: string, needles: string[]) => needles.some((n) => txt.includes(n));

function needsMeaning(task: Task, r: ResponseMap) {
  if (!task.response.fields?.some((f) => f.id === "meaning")) return false;
  const m = norm(r.meaning);
  return !hasMin(m, 8);
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
  const hasJoinLanguage = includesAny(j, [
    "join",
    "change",
    "no change",
    "stays the same",
    "drop",
    "remove",
    "double",
  ]);
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
  const target = task.context?.target_word || word;

  if (wantMeaning) {
    focus.push("meaning");
    prompts.push(
      `Meaning anchor: reread the sentence(s). What does <${target}> mean here? Use the sentence as evidence.`
    );
    if (task.context?.audio?.src) {
      prompts.push(`Accessibility option: press play and listen once for meaning before revising.`);
    }
  }

  if (wantStructure) {
    focus.push("structure");
    prompts.push(`Structure: show <${base}> + <${suffix}> → <${word}> (use + and an arrow).`);
  }

  if (wantJoin) {
    focus.push("join");
    prompts.push(
      `Check the join: compare the base spelling <${base}> with the built word <${word}>. What stayed the same? What changed (if anything)?`
    );
    prompts.push(`Evidence prompt: point to the exact letters at the join that support your claim.`);
  }

  if (wantFamily) {
    focus.push("family");
    prompts.push(
      `Word family evidence: name one related word that helps you keep the base spelling in mind.`
    );
  }

  const supported = focus.length === 0;

  if (supported) {
    prompts.push(`Supported. Continue when ready, then transfer this reasoning to a new word.`);
  }

  return { supported, focus, prompts };
}
