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

function getSentences(task: Task): string[] {
  // Supports BOTH formats:
  // - new: context.sentences: string[]
  // - old: context.sentence: string
  const ctx: any = (task as any).context;
  if (Array.isArray(ctx?.sentences) && ctx.sentences.length) return ctx.sentences;
  if (typeof ctx?.sentence === "string" && ctx.sentence.trim()) return [ctx.sentence];
  return [];
}

function needsMeaning(task: Task, r: ResponseMap) {
  if (!task.response.fields?.some((f) => f.id === "meaning")) return false;

  // Meaning response should be anchored to the sentence(s), not a blank label.
  const m = norm((r as any).meaning);
  return !hasMin(m, 8);
}

function needsStructure(task: Task, r: ResponseMap) {
  if (!task.response.fields?.some((f) => f.id === "structure")) return false;

  const s = norm((r as any).structure);
  const base = norm(task.targets.base);
  const suffix = norm(task.targets.suffixes?.[0] || "");

  // Require evidence of structure: base + suffix + combine symbol
  const showsCombine = includesAny(s, ["+", "→", "->", "plus"]);
  const mentionsBase = s.includes(base);
  const mentionsSuffix = suffix ? s.includes(suffix) : true;

  return !(mentionsBase && mentionsSuffix && showsCombine);
}

function needsJoin(task: Task, r: ResponseMap) {
  if (!task.response.fields?.some((f) => f.id === "join")) return false;

  const j = norm((r as any).join);

  // Join response needs explicit join-language OR explicit comparison language.
  const hasJoinLanguage = includesAny(j, [
    "join",
    "change",
    "changed",
    "no change",
    "stays the same",
    "stayed the same",
    "drop",
    "remove",
    "double",
    "compare",
    "letters",
  ]);

  return !(hasMin(j, 10) && hasJoinLanguage);
}

function needsFamily(task: Task, r: ResponseMap) {
  if (!task.response.fields?.some((f) => f.id === "family")) return false;

  const f = norm((r as any).family);
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
  const built = task.targets.words?.[0] || "";

  const ctx: any = (task as any).context || {};
  const target = ctx.target_word || built || "";
  const gloss = ctx.gloss || "";
  const sentences = getSentences(task);
  const hasAudio = !!ctx.audio?.src;

  // Sentence-first anchor (always available as a mediator nudge)
  if (sentences.length) {
    prompts.push(
      `Sentence anchor: reread the sentence${sentences.length > 1 ? "s" : ""}. Track the highlighted <${target}>.`
    );
  } else {
    prompts.push(`Sentence anchor: look for the target word <${target}> in the sentence context.`);
  }

  if (hasAudio) {
    prompts.push(`Accessibility option: press play and listen once for meaning before revising.`);
  }

  // Focused guidance (not evaluative)
  if (wantMeaning) {
    focus.push("meaning");
    prompts.push(
      `Meaning (use-based): In THIS sentence, what does <${target}> mean? Say it in your own words using the sentence as evidence.`
    );
    if (gloss) {
      // Not an answer key; it's a scaffold to confirm direction if you choose to display it.
      prompts.push(
        `Self-check (optional): your meaning should match the sentence use (common meaning here: “${gloss}”).`
      );
    }
  }

  if (wantStructure) {
    focus.push("structure");
    prompts.push(
      `Structure: show the build using symbols: <${base}> + <${suffix}> → <${built}>.`
    );
    prompts.push(`Evidence cue: you must name BOTH the base and the suffix.`);
  }

  if (wantJoin) {
    focus.push("join");
    prompts.push(
      `Join check: compare the spelling in the base <${base}> with the spelling in the built word <${built}>.`
    );
    prompts.push(
      `What stayed the same? What changed (if anything)? Point to the exact letters that support your claim.`
    );
  }

  if (wantFamily) {
    focus.push("family");
    prompts.push(
      `Related words: name one related word that helps you keep the base spelling in mind (word family evidence).`
    );
  }

  const supported = focus.length === 0;

  if (supported) {
    prompts.push(`Supported ✅ You can continue. Next: transfer this reasoning to a new word.`);
  } else {
    prompts.push(`Revise only the parts listed above, then click “Check my evidence” again.`);
  }

  return { supported, focus, prompts };
}
