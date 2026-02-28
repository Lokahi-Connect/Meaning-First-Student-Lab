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
  // 1) NO CHANGE
  {
    id: "suffixing_no_change_intro",
    word: "jumping",
    sentence: "The child is jumping over the puddle.",
    base: "jump",
    suffix: "ing",
    structure: "jump + ing → jumping",
    related: ["jump", "jumps", "jumped"],
    graphemeExplanation:
      "When adding the vowel suffix <-ing>, the base <jump> remains orthographically stable. No structural change is required."
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
      "Before adding the vowel suffix <-ing>, the final consonant of the base <run> doubles. The doubling preserves the intended vowel pattern of the base."
  },

  // 3) REPLACE FINAL NON-SYLLABIC <e>
  {
    id: "suffixing_final_e_intro",
    word: "making",
    sentence: "He is making dinner.",
    base: "make",
    suffix: "ing",
    structure: "make + ing → making",
    related: ["make", "maker", "made"],
    graphemeExplanation:
      "When a base ends in non-syllabic <e>, the <e> is removed before adding a vowel suffix like <-ing>. The base meaning remains stable."
  },

  // 4) CHANGE FINAL <y> TO <i>
  {
    id: "suffixing_y_to_i_intro",
    word: "tried",
    sentence: "Yesterday, she tried a new strategy.",
    base: "try",
    suffix: "ed",
    structure: "try + ed → tried",
    related: ["try", "tries", "trying"],
    graphemeExplanation:
      "When a base ends in consonant + <y>, the <y> changes to <i> before adding certain suffixes such as <-ed> or <-es>. The base meaning remains consistent across the word family."
  }
];
