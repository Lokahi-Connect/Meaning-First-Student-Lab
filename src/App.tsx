import { useMemo, useState } from "react";
import { LESSONS } from "./data/lessons";

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

  checkJoinLabel: string;
};

function getPrompts(tier: Tier): Prompts {
  switch (tier) {
    case "emerging":
      return {
        meaningTitle: "1. Meaning",
        meaningQuestion: (word) => `What does ${word} mean here? Use your own words.`,
        structureTitle: "2. Structure Hypothesis",
        structureQuestion: "Circle what you think is the base. What do you think was added?",
        relatedTitle: "3. Related Words (Evidence)",
        relatedQuestion: (base) =>
          `Write words that belong with ${base}. You can start with: base word, base + s, base + ed.`,
        graphemeTitle: "4. Grapheme Function",
        graphemeQuestion: (suffix) =>
          `What does <-${suffix}> help this word mean? (Ongoing? Past? More than one?)`,
        checkJoinLabel: "Check the Join",
      };

    case "developing":
      return {
        meaningTitle: "1. Meaning",
        meaningQuestion: (word) =>
          `What does ${word} mean in this sentence? Point to the part of the sentence that helps you know.`,
        structureTitle: "2. Structure Hypothesis",
        structureQuestion:
          "What is the base? What suffix might be attached? Write your hypothesis before checking.",
        relatedTitle: "3. Related Words (Evidence)",
        relatedQuestion: (base) =>
          `List at least 3 words related to ${base}. Which one best proves your base choice?`,
        graphemeTitle: "4. Grapheme Function",
        graphemeQuestion: (suffix) =>
          `Explain how <-${suffix}> is functioning in this word. What meaning does it add?`,
        checkJoinLabel: "Check the Join",
      };

    case "expanding":
      return {
        meaningTitle: "1. Meaning",
        meaningQuestion: (word) =>
          `Explain the meaning of ${word} in context. If the word is doing a job in the sentence, name the job.`,
        structureTitle: "2. Structure Hypothesis",
        structureQuestion:
          "Identify the base and suffix. Then explain what changed (or did not change) at the join and why.",
        relatedTitle: "3. Related Words (Evidence)",
        relatedQuestion: (base) =>
          `Build a small word family for ${base} (4+ words). Use it as evidence for your structure.`,
        graphemeTitle: "4. Grapheme Function",
        graphemeQuestion: (suffix) =>
          `Explain the meaning contribution of <-${suffix}> and connect it to your word family evidence.`,
        checkJoinLabel: "Check the Join",
      };

    case "abstract":
      return {
        meaningTitle: "1. Meaning",
        meaningQuestion: (word) =>
          `Define ${word} in context and justify your interpretation using sentence evidence.`,
        structureTitle: "2. Structure Hypothesis",
        structureQuestion:
          "Write the morphological analysis (base + suffix). Then justify the suffixing convention at the join using evidence.",
        relatedTitle: "3. Related Words (Evidence)",
        relatedQuestion: (base) =>
          `Generate a word family for ${base}. Identify which relative word best confirms the base spelling.`,
        graphemeTitle: "4. Grapheme Function",
        graphemeQuestion: (suffix) =>
          `Explain how <-${suffix}> functions (meaning + role). Cite structural evidence from your analysis.`,
        checkJoinLabel: "Check the Join",
      };
  }
}

export default function App() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [teacherView, setTeacherView] = useState(false);
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
    setShowStructure(false);
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

      {/* 1. Meaning */}
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

      {/* 2. Structure Hypothesis */}
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
          <button
            onClick={() => setShowStructure(true)}
            style={{ marginTop: "0.5rem" }}
          >
            {prompts.checkJoinLabel}
          </button>
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
          </div>
        )}
      </section>

      {/* 3. Related Words (Evidence) */}
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

      {/* 4. Grapheme Function */}
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
            <strong>Model Explanation:</strong>
            <p>{lesson.graphemeExplanation}</p>
          </div>
        )}
      </section>
    </div>
  );
}
