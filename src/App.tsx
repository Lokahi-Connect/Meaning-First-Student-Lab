import { useState } from "react";
import { LESSONS } from "./data/lessons";

type Tier = "emerging" | "developing" | "expanding" | "abstract";

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
        <h3>1. Meaning</h3>
        <p>{lesson.sentence}</p>
        <p>
          What does <strong>{lesson.word}</strong> mean?
        </p>

        <textarea
          value={meaningResponse}
          onChange={(e) => setMeaningResponse(e.target.value)}
          rows={4}
          style={{ width: "100%" }}
        />
      </section>

      {/* 2. Hypothesis About Structure */}
      <section style={{ marginTop: "2rem" }}>
        <h3>2. Structure Hypothesis</h3>
        <p>What base do you notice? What suffix might be attached?</p>

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
            Check the Join
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

      {/* 3. Evidence */}
      <section style={{ marginTop: "2rem" }}>
        <h3>3. Related Words (Evidence)</h3>
        <p>
          What other words are related to <strong>{lesson.base}</strong>?
        </p>

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

      {/* 4. Explanation */}
      <section style={{ marginTop: "2rem" }}>
        <h3>4. Grapheme Function</h3>
        <p>
          How is the grapheme &lt;-{lesson.suffix}&gt; functioning in this word?
        </p>

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
