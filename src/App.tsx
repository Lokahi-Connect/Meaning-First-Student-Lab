import { useState } from "react";
import { LESSONS } from "./data/lessons";

type Tier = "emerging" | "developing" | "expanding" | "abstract";

export default function App() {
  const [tier, setTier] = useState<Tier | null>(null);

  const lesson = LESSONS[0];

  if (!lesson) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Meaning-First Student Lab</h1>
        <p>No lesson found. Add at least one lesson in <code>src/data/lessons.ts</code>.</p>
      </div>
    );
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
      <h2>Tier: {tier}</h2>

      <button onClick={() => setTier(null)} style={{ marginBottom: "2rem" }}>
        ← Change Tier
      </button>

      {/* 1. Meaning (in sentence context) */}
      <section>
        <h3>1. Meaning</h3>
        <p>{lesson.sentence}</p>
        <p>
          What does the word <strong>{lesson.word}</strong> mean in this sentence?
        </p>
      </section>

      {/* 2. Structure (morphemes) */}
      <section style={{ marginTop: "2rem" }}>
        <h3>2. Structure</h3>

        {tier === "emerging" && <p>{lesson.structure}</p>}

        {tier === "developing" && (
          <p>What base do you notice? What suffix might be attached?</p>
        )}

        {(tier === "expanding" || tier === "abstract") && (
          <p>
            Identify the base and the suffix, then explain why the spelling remains stable.
          </p>
        )}
      </section>

      {/* 3. Related Words (word family) */}
      <section style={{ marginTop: "2rem" }}>
        <h3>3. Related Words</h3>

        {tier === "emerging" && <p>{lesson.related.join(", ")}</p>}

        {tier !== "emerging" && (
          <p>
            What other words are related to <strong>{lesson.base}</strong>?
          </p>
        )}
      </section>

      {/* 4. Grapheme Function */}
      <section style={{ marginTop: "2rem" }}>
        <h3>4. Grapheme Function</h3>

        {tier === "emerging" && <p>{lesson.graphemeExplanation}</p>}

        {tier !== "emerging" && (
          <p>
            How is the grapheme &lt;-{lesson.suffix}&gt; functioning in this word?
          </p>
        )}
      </section>
    </div>
  );
}
