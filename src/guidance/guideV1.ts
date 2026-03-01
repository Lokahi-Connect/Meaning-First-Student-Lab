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
  const ctx: any = (task as any).context;
  if (Array.isArray(ctx?.sentences) && ctx.sentences.length) return ctx.sentences;
  if (typeof ctx?.sentence === "string" && ctx.sentence.trim()) return [ctx.sentence];
  return [];
}

function parseMatrixSelected(responses: ResponseMap): string[] {
  try {
    return JSON.parse((responses as any).matrix_selected || "[]");
  } catch {
    return [];
  }
}

// ✅ v1 proof rule: the word sum must resemble the chosen proof word and show structure.
// We enforce: includes proof word, includes base, includes + or arrow, and includes at least one known affix.
function matrixProofSupported(task: Task, responses: ResponseMap): boolean {
  const selected = parseMatrixSelected(responses);
  const proofWord = norm((responses as any).matrix_proof_word);
  const wordSum = norm((responses as any).matrix_word_sum);

  if (!selected.length) return false;
  if (!proofWord) return false;
  if (!selected.map((w) => w.toLowerCase()).includes(proofWord)) return false;
  if (!hasMin(wordSum, 8)) return false;

  const base = norm(task.targets.base);
  const prefixes = (task.targets.prefixes || []).map((p) => p.toLowerCase());
  const suffixes = (task.targets.suffixes || []).map((s) => s.toLowerCase());
  const affixes = [...prefixes, ...suffixes].filter(Boolean);

  const hasStructureSymbol = includesAny(wordSum, ["+", "→", "->", "plus", "="]);
  const mentionsProofWord = wordSum.includes(proofWord);
  const mentionsBase = wordSum.includes(base);
  const mentionsSomeAffix = affixes.length ? affixes.some((a) => wordSum.includes(a)) : true;

  return hasStructureSymbol && mentionsProofWord && mentionsBase && mentionsSomeAffix;
}

function needsMeaning(task: Task, r: ResponseMap) {
  if (!task.response.fields?.some((f) => f.id === "meaning")) return false;
  const m = norm((r as any).meaning);
  return !hasMin(m, 8);
}

function needsStructure(task: Task, r: ResponseMap) {
  if (!task.response.fields?.some((f) => f.id === "structure")) return false;
  const s = norm((r as any).structure);
  const base = norm(task.targets.base);
  const suffix = norm(task.targets.suffixes?.[0] || "");
  const showsCombine = includesAny(s, ["+", "→", "->", "plus", "="]);
  const mentionsBase = s.includes(base);
  const mentionsSuffix = suffix ? s.includes(suffix) : true;
  return !(mentionsBase && mentionsSuffix && showsCombine);
}

function needsJoin(task: Task, r: ResponseMap) {
  if (!task.response.fields?.some((f) => f.id === "join")) return false;
  const j = norm((r as any).join);
  const hasJoinLanguage = includesAny(j, [
    "join",
    "change",
    "changed",
    "no change",
    "stays the same",
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

  const ctx: any = (task as any).context || {};
  const sentences = getSentences(task);
  const hasAudio = !!ctx.audio?.src;

  const base = task.targets.base;
  const suffix = task.targets.suffixes?.[0] || "";
  const built = task.targets.words?.[0] || "";
  const target = ctx.target_word || built || "";

  // Sentence-first anchor
  if (sentences.length) {
    prompts.push(
      `Sentence anchor: reread the sentence${sentences.length > 1 ? "s" : ""}. Track the highlighted <${target}>.`
    );
  }
  if (hasAudio) {
    prompts.push(`Accessibility option: press play and listen once for meaning before revising.`);
  }

  // ✅ Matrix tasks require proof before supported
  if (task.response.mode === "matrix_builder") {
    const selected = parseMatrixSelected(responses);

    if (!selected.length) {
      focus.push("family");
      prompts.push(`Matrix step: select at least 4 words from the matrix as evidence.`);
    }

    if (!matrixProofSupported(task, responses)) {
      focus.push("structure");
      prompts.push(
        `Proof required: choose ONE selected word and write a word sum that resembles it and shows structure.`
      );
      prompts.push(
        `Use a format like: <word> = <base> + <affix> (then add a join note if needed).`
      );
      prompts.push(
        `Your proof must include: the proof word, the base <${base}>, and an affix from the matrix.`
      );
    }

    const supported = focus.length === 0;
    if (supported) prompts.push(`Supported ✅ You can continue.`);
    else prompts.push(`Revise only the parts listed above, then click “Check my evidence” again.`);
    return { supported, focus, prompts };
  }

  // Non-matrix tasks
  const wantMeaning = needsMeaning(task, responses);
  const wantStructure = needsStructure(task, responses);
  const wantJoin = needsJoin(task, responses);
  const wantFamily = needsFamily(task, responses);

  if (wantMeaning) {
    focus.push("meaning");
    prompts.push(`Meaning (use-based): In THIS sentence, what does <${target}> mean? Use the sentence as evidence.`);
  }
  if (wantStructure) {
    focus.push("structure");
    prompts.push(`Structure: show <${base}> + <${suffix}> → <${built}> (use + and an arrow).`);
  }
  if (wantJoin) {
    focus.push("join");
    prompts.push(`Join check: compare <${base}> with <${built}>. What stayed the same? What changed (if anything)?`);
    prompts.push(`Point to the exact letters that support your claim.`);
  }
  if (wantFamily) {
    focus.push("family");
    prompts.push(`Related words: name one related word that supports the base spelling (word family evidence).`);
  }

  const supported = focus.length === 0;
  if (supported) prompts.push(`Supported ✅ You can continue. Next: transfer this reasoning to a new word.`);
  else prompts.push(`Revise only the parts listed above, then click “Check my evidence” again.`);

  return { supported, focus, prompts };
}
