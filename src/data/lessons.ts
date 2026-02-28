export interface Lesson {
  id: string;
  word: string;
  sentence: string;
  base: string;
  suffix: string;
  structure: string;
  related: string[];
  graphemeExplanation: string;
}

export const LESSONS: Lesson[] = [
  // 1) NO CHANGE (vowel suffix joins with no spelling change)
  {
    id: "suffixing_no_change_intro",
    word: "jumping",
    sentence: "The child is jumping over the puddle.",
    base: "jump",
    suffix: "ing",
    structure: "jump + ing → jumping",
    related: ["jump", "jumps", "jumped"],
    graphemeExplanation:
      "No-change convention: add the vowel suffix <-ing> directly to the base <jump>. The spelling of the base remains stable."
  },

  // 2) DOUBLING
  {
    id: "suffixing_doubling_intro",
    word: "running",
    sentence: "The dog is running fast.",
    base: "run",
    suffix: "ing",
    structure: "run + ing → running",
    related: ["run", "runs", "runner"],
    graphemeExplanation:
      "Doubling convention: the final consonant doubles before adding the vowel suffix <-ing> to keep the base spelling pattern working as intended (run → running)."
  },

  // 3) REPLACE FINAL NON-SYLLABIC <e> (commonly taught as “final-e drop”)
  {
    id: "suffixing_final_e_intro",
    word: "making",
    sentence: "He is making dinner.",
    base: "make",
    suffix: "ing",
    structure: "make + ing → making",
    related: ["make", "maker", "made"],
    graphemeExplanation:
      "Final non-syllabic <e> convention: when adding a vowel suffix like <-ing>, the final non-syllabic <e> is removed before the suffix is added (make → making)."
  },

  // 4) CHANGE FINAL <y> TO <i> (triggered by certain suffixes like <-ed>, <-es>, <-er>, <-est>)
  {
    id: "suffixing_y_to_i_intro",
    word: "tried",
    sentence: "Yesterday, she tried a new strategy.",
    base: "try",
    suffix: "ed",
    structure: "try + ed → tried",
    related: ["try", "tries", "trying"],
    graphemeExplanation:
      "Final <y> to <i> convention: when a base ends in consonant + <y>, the <y> changes to <i> before adding certain suffixes such as <-ed> or <-es> (try → tried, tries)."
  }
];
