import { useMemo, useState } from "react";
import { LESSONS } from "./data/lessons";
import { JOIN_CONVENTIONS } from "./data/joinConventions";

type Tier = "emerging" | "developing" | "expanding" | "abstract";

type Prompts = {
  meaningTitle: string;
  meaningQuestion: (word: string) => string;
  structureTitle: string;
  structureQuestion: string;
  relatedTitle: string;
  relatedQuestion: (base: string) => string;
  graphemeTitle: string;
  graphemeQuestion: (suffix: string) => string;
};

function getPrompts(tier: Tier): Prompts {
  switch (tier) {
    case "emerging":
      return {
        meaningTitle: "1. Meaning",
        meaningQuestion: (word) => `What does ${word} mean here?`,
        structureTitle: "2. Structure Hypothesis",
        structureQuestion:
          "What do you think is the base? What do you think was added?",
        relatedTitle: "3. Related Words (Evidence)",
        relatedQuestion: (base) => `Write words that belong with ${base}.`,
        graphemeTitle: "4. Grapheme Function",
        graphemeQuestion: (suffix) =>
          `What does ⟨-${suffix}⟩ help this word mean?`,
      };

    case "developing":
      return {
        meaningTitle: "1. Meaning",
        meaningQuestion: (word) => `What does ${word} mean in this sentence?`,
        structureTitle: "2. Structure Hypothesis",
        structureQuestion:
          "What is the base? What suffix might be attached? Write your hypothesis before checking.",
        relatedTitle: "3. Related Words (Evidence)",
        relatedQuestion: (base) => `List words related to ${base}.`,
        graphemeTitle: "4. Grapheme Function",
        graphemeQuestion: (suffix) =>
          `Explain how ⟨-${suffix}⟩ is functioning.`,
      };

    case "expanding":
    case "abstract":
      return {
        meaningTitle: "1. Meaning",
        meaningQuestion: (word) => `Define ${word} in context.`,
        structureTitle: "2. Structure Hypothesis",
        structureQuestion:
          "Identify the base and suffix. Then explain what changed (or did not change) at the join.",
        relatedTitle: "3. Related Words (Evidence)",
        relatedQuestion: (base) => `Build a word family for ${base}.`,
        graphemeTitle: "4. Grapheme Function",
        graphemeQuestion: (suffix) =>
          `Explain how ⟨-${suffix}⟩ functions and justify your reasoning.`,
      };

    default:
      return {
        meaningTitle: "1. Meaning",
        meaningQuestion: (word) => `What does ${word} mean here?`,
        structureTitle: "2. Structure Hypothesis",
        structureQuestion: "What is the base? What was added?",
        relatedTitle: "3. Related Words (Evidence)",
        relatedQuestion: (base) => `List words related to ${base}.`,
        graphemeTitle: "4. Grapheme Function",
        graphemeQuestion: (suffix) =>
          `What does ⟨-${suffix}⟩ contribute to meaning?`,
      };
  }
}

export default function App() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [teacherView, setTeacherView] = useState(false);

  const [joinPromptShown, setJoinPromptShown] = useState(false);
  const [showStructure, setShowStructure] = useState(false);

  const [meaningResponse, setMeaningResponse] = useState("");
  const [structureResponse, setStructureResponse] = useState("");
  const [relatedResponse, setRelatedResponse] = useState("");
  const [graphemeResponse, setGraphemeResponse] = useState("");

  const lesson = LESSONS[lessonIndex];

  const resetResponses = () => {
    setMeaningResponse("");
    setStructureResponse("");
    setRelatedResponse("");
    setGraphemeResponse("");
    setJoinPromptShown(false);
    setShowStructure(false);
  };

  const handleCheckJoins = () => {
    if (!joinPromptShown) {
      setJoinPromptShown(true);
    } else {
      setShowStructure(true);
    }
  };

  if (!lesson) return <div style={{ padding: "2rem" }}>No lessons found.</div>;

  if (!tier) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Meaning-First Student Lab</h1>
        <h2>Select Your Tier</h2>
        <button onClick={() => setTier("emerging")}>🌱 Emerging</button>
        <button onClick={() => setTier("developing")}>🌿 Developing</button>
        <button onClick={() => setTier("expanding")}>🌳 Expanding</button>
        <button onClick={() => setTier("abstract")}>🔬 Abstract</button>
      </div>
    );
  }

  const prompts = useMemo(() => getPrompts(tier), [tier]);
  const joinInfo = JOIN_CONVENTIONS[lesson.joinConvention];

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Meaning-First Student Lab</h1>

      <select
        value={lessonIndex}
        onChange={(e) => {
          setLessonIndex(Number(e.target.value));
          resetResponses();
        }}
      >
        {LESSONS.map((l, i) => (
          <option key={l.id} value={i}>
            {l.word}
          </option>
        ))}
      </select>

      <h2 style={{ marginTop: "1rem" }}>Tier: {tier}</h2>

      <div style={{ marginTop: "0.75rem" }}>
        <button onClick={() => setTier(null)}>← Change Tier</button>

        <button
          onClick={() => setTeacherView((v) => !v)}
          style={{ marginLeft: "0.75rem" }}
        >
          {teacherView ? "Student View" : "Teacher View"}
        </button>

        <button onClick={resetResponses} style={{ marginLeft: "0.75rem" }}>
          Reset
        </button>
      </div>

      {/* Meaning */}
      <section style={{ marginTop: "2rem" }}>
        <h3>{prompts.meaningTitle}</h3>
        <p>{lesson.sentence}</p>
        <p>{prompts.meaningQuestion(lesson.word)}</p>
        <textarea
          value={meaningResponse}
          onChange={(e) => setMeaningResponse(e.target.value)}
          rows={4}
          style={{ width: "100%" }}
        />
      </section>

      {/* Structure */}
      <section style={{ marginTop: "2rem" }}>
        <h3>{prompts.structureTitle}</h3>
        <p>{prompts.structureQuestion}</p>
        <textarea
          value={structureResponse}
          onChange={(e) => setStructureResponse(e.target.value)}
          rows={4}
          style={{ width: "100%" }}
        />

        {!showStructure && (
          <button onClick={handleCheckJoins} style={{ marginTop: "0.5rem" }}>
            {joinPromptShown ? "Confirm Structure" : "Check the Joins"}
          </button>
        )}

        {joinPromptShown && !showStructure && (
          <div style={{ marginTop: "0.75rem" }}>
            <strong>Check the Joins</strong>
            <ul style={{ marginTop: "0.5rem" }}>
              {tier === "emerging" ? (
                <>
                  <li>Look at the end of the base.</li>
                  <li>Does anything need to change?</li>
                  <li>No change, double, replace ⟨e⟩, or y→i?</li>
                </>
              ) : tier === "developing" ? (
                <>
                  <li>Does the base end in non-syllabic ⟨e⟩?</li>
                  <li>Does it end in consonant + ⟨y⟩?</li>
                  <li>Does it end in 1 vowel + 1 consonant?</li>
                  <li>If none apply, it may be no change.</li>
                </>
              ) : (
                <>
                  <li>State the base and suffix explicitly.</li>
                  <li>Diagnose the join condition:</li>
                  <li>non-syllabic ⟨e⟩ → replace ⟨e⟩</li>
                  <li>consonant + ⟨y⟩ → y→i (for certain suffixes)</li>
                  <li>1 vowel + 1 consonant → doubling (common in 1-syllable bases)</li>
                  <li>otherwise → no change</li>
                </>
              )}
            </ul>
          </div>
        )}

        {(showStructure || teacherView) && (
          <div
            style={{
              marginTop: "0.75rem",
              padding: "0.75rem",
              backgroundColor: "#f4f4f4",
              borderRadius: "6px",
            }}
          >
            <strong>Structure:</strong> {lesson.structure}
            <div style={{ marginTop: "0.5rem" }}>
              <strong>Join:</strong> {joinInfo.label} ({joinInfo.type}) —{" "}
              <span>{joinInfo.explanation}</span>
            </div>
          </div>
        )}
      </section>

      {/* Evidence */}
      <section style={{ marginTop: "2rem" }}>
        <h3>{prompts.relatedTitle}</h3>
        <p>{prompts.relatedQuestion(lesson.base)}</p>
        <textarea
          value={relatedResponse}
          onChange={(e) => setRelatedResponse(e.target.value)}
          rows={4}
          style={{ width: "100%" }}
        />
        {teacherView && (
          <div style={{ marginTop: "0.5rem" }}>
            <strong>Suggested:</strong> {lesson.related.join(", ")}
          </div>
        )}
      </section>

      {/* Grapheme */}
      <section style={{ marginTop: "2rem" }}>
        <h3>{prompts.graphemeTitle}</h3>
        <p>{prompts.graphemeQuestion(lesson.suffix)}</p>
        <textarea
          value={graphemeResponse}
          onChange={(e) => setGraphemeResponse(e.target.value)}
          rows={4}
          style={{ width: "100%" }}
        />

        {teacherView && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#eaeaea",
              borderRadius: "6px",
            }}
          >
            <strong>Teacher note:</strong>
            <p style={{ marginTop: "0.5rem" }}>
              Model grapheme-function explanations can be added next as a separate
              map (by suffix) or a tiered “model response” library. For now,
              use the student’s response and press for meaning + evidence.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
