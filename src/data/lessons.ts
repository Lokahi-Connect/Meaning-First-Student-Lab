export type JoinConventionType = "None" | "Double" | "Replace" | "Change" | "Toggle";

export interface Lesson {
  id: string;
  word: string;
  sentence: string;
  base: string;
  suffix: string;
  structure: string;
  related: string[];
  graphemeExplanation: string;
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
    graphemeExplanation:
      "No-change convention: add the vowel suffix ⟨-ing⟩ directly to the base ⟨jump⟩. The spelling of the base remains stable.",
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
    graphemeExplanation:
      "Doubling convention: when a one-syllable base ends in a single vowel followed by a single consonant (VC), the final consonant doubles before adding a vowel suffix such as ⟨-ing⟩.",
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
    graphemeExplanation:
      "Replace convention: final ⟨e⟩ is replaced before adding a vowel suffix like ⟨-ing⟩.",
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
    graphemeExplanation:
      "Change convention: when a base ends in consonant + ⟨y⟩, the ⟨y⟩ changes to ⟨i⟩ before adding certain suffixes such as ⟨-ed⟩ (but not before ⟨-ing⟩).",
    joinConvention: "Change",
  },
];
