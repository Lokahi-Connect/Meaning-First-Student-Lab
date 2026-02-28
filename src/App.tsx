import { useState } from "react";
import { LESSONS } from "./data/lessons";

type Tier = "emerging" | "developing" | "expanding" | "abstract";

export default function App() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [lessonIndex, setLessonIndex] = useState(0);

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
  };

  if (!lesson) {
    return <div>No lessons found.</div>;
  }

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

      {/* Lesson Selector */}
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

      <button onClick={() => setTier(null)}>← Change Tier</button>
      <button onClick={resetResponses} style={{ marginLeft: "0.75rem" }}>
        Reset responses
      </button>

      {/* 1. Meaning */}
      <section style={{ marginTop: "2rem" }}>
        <h3>1. Meaning</h3>
        <p>{lesson.sentence}</p>
        <p>
          What does <strong>{lesson.word}</strong> mean in this sentence?
        </p>
        <textarea
          value={meaningResponse}
          onChange={(e) => setMeaningResponse(e.target.value)}
          placeholder="Write your thinking..."
          rows={4}
          style={{ width: "100%" }}
        />
      </section>

      {/* 2. Structure */}
      <section style={{ marginTop: "2rem" }}>
        <h3>2. Structure</h3>
        <p>{lesson.structure}</p>
        <textarea
          value={structureResponse}
          onChange={(e) => setStructureResponse(e.target.value)}
          placeholder="Identify base and suffix..."
          rows={4}
          style={{ width: "100%" }}
        />
      </section>

      {/* 3. Related Words */}
      <section style={{ marginTop: "2rem" }}>
        <h3>3. Related Words</h3>
        <p>
          What other words are related to <strong>{lesson.base}</strong>?
        </p>
        <textarea
          value={relatedResponse}
          onChange={(e) => setRelatedResponse(e.target.value)}
          placeholder="List related words..."
          rows={4}
          style={{ width: "100%" }}
        />
      </section>

      {/* 4. Grapheme Function */}
      <section style={{ marginTop: "2rem" }}>
        <h3>4. Grapheme Function</h3>
        <p>
          How is the grapheme &lt;-{lesson.suffix}&gt; functioning in this word?
        </p>
        <textarea
          value={graphemeResponse}
          onChange={(e) => setGraphemeResponse(e.target.value)}
          placeholder="Explain how the suffix functions..."
          rows={4}
          style={{ width: "100%" }}
        />
      </section>
    </div>
  );
}
