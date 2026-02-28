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
  {
    id: "jumping_1",
    word: "jumping",
    sentence: "The child is jumping over the puddle.",
    base: "jump",
    suffix: "ing",
    structure: "jump + ing",
    related: ["jump", "jumps", "jumped"],
    graphemeExplanation:
      "The suffix <-ing> signals ongoing action."
  }
];
