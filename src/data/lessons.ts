export type JoinConventionType = "None" | "Double" | "Replace" | "Change" | "Toggle";

export interface Lesson {
  id: string;
  word: string;
  sentence: string;
  base: string;
  suffix: string;
  structure: string;
  related: string[];
  joinConvention: JoinConventionType;
}

export const LESSONS: Lesson[] = [
  {
    id: "suffixing_no_change_intro",
    word: "jumping",
    sentence: "The child is jumping over the puddle.",
    base: "jump",
    suffix: "ing",
    structure: "jump + ing → jumping",
    related: ["jump", "jumps", "jumped"],
    joinConvention: "None",
  },
  {
    id: "suffixing_doubling_intro",
    word: "running",
    sentence: "The dog is running fast.",
    base: "run",
    suffix: "ing",
    structure: "run + ing → running",
    related: ["run", "runs", "runner"],
    joinConvention: "Double",
  },
  {
    id: "suffixing_final_e_intro",
    word: "making",
    sentence: "He is making dinner.",
    base: "make",
    suffix: "ing",
    structure: "make + ing → making",
    related: ["make", "maker", "made"],
    joinConvention: "Replace",
  },
  {
    id: "suffixing_y_to_i_intro",
    word: "tried",
    sentence: "Yesterday, she tried a new strategy.",
    base: "try",
    suffix: "ed",
    structure: "try + ed → tried",
    related: ["try", "tries", "trying"],
    joinConvention: "Change",
  },
];
