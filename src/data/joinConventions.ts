export type JoinConventionType = "None" | "Double" | "Replace" | "Change" | "Toggle";

export interface JoinConvention {
  type: JoinConventionType;
  label: string;
  explanation: string;
}

export const JOIN_CONVENTIONS: Record<JoinConventionType, JoinConvention> = {
  None: {
    type: "None",
    label: "No Change",
    explanation:
      "Add the vowel suffix directly to the base. The spelling of the base remains stable.",
  },
  Double: {
    type: "Double",
    label: "Doubling",
    explanation:
      "When a base ends in a single vowel followed by a single consonant, the final consonant doubles before adding a vowel suffix.",
  },
  Replace: {
    type: "Replace",
    label: "Final <e> Replacement",
    explanation:
      "When a base ends in final <e>, the <e> is replaced before adding a vowel suffix.",
  },
  Change: {
    type: "Change",
    label: "<y> to <i>",
    explanation:
      "When a base ends in consonant + <y>, the <y> changes to <i> before certain suffixes.",
  },
  Toggle: {
    type: "Toggle",
    label: "Toggle",
    explanation:
      "Some joins toggle depending on suffix type or stress pattern.",
  },
};
