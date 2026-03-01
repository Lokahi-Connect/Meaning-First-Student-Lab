import React from "react";
import type { Task } from "../data/taskIndex";
import type { ResponseMap } from "../scoring/scoreV1";

type Props = {
  task: Task;
  responses: ResponseMap;
  setResponses: (next: ResponseMap) => void;

  onCheck: () => void;
  onContinue: () => void;

  statusText?: string;
  mediatorTitle?: string;
  mediatorPrompts?: string[];
  canContinue?: boolean;
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedSentence({ sentence, target }: { sentence: string; target: string }) {
  const t = target.trim();
  if (!t) return <span>{sentence}</span>;

  const re = new RegExp(`(${escapeRegExp(t)})`, "gi");
  const parts = sentence.split(re);

  return (
    <span>
      {parts.map((p, i) => {
        const isMatch = p.toLowerCase() === t.toLowerCase();
        return isMatch ? (
          <mark
            key={i}
            style={{
              padding: "0 4px",
              borderRadius: 6,
              background: "#fff3b0"
            }}
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        );
      })}
    </span>
  );
}

export function TaskRunner({
  task,
  responses,
  setResponses,
  onCheck,
  onContinue,
  statusText,
  mediatorTitle,
  mediatorPrompts,
  canContinue,
}: Props) {
  const fields = task.response.fields || [];
  const sentences = task.context?.sentences || [];
  const targetWord = task.context?.target_word || "";

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 16, lineHeight: 1.4 }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Meaning-First Student Lab</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
          {/* Sentence-first context block */}
          <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, marginBottom: 10 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Sentence context</div>

            {sentences.map((s: string, idx: number) => (
              <div key={idx} style={{ fontSize: 16, marginBottom: 6 }}>
                <HighlightedSentence sentence={s} target={targetWord} />
              </div>
            ))}

            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>
              Target word: <strong>{task.context.target_word}</strong>
              {"  "} | {"  "}
              Common meaning here: <strong>{task.context.gloss}</strong>
            </div>

            {task.context.audio?.src ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  {task.context.audio.caption || "Listen"}
                </div>
                <audio controls src={task.context.audio.src} style={{ width: "100%" }} />
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                  Tip: listen once for meaning, then again while you look at the highlighted word.
                </div>
              </div>
            ) : null}
          </div>

          <div style={{ fontSize: 16, marginBottom: 8 }}>{task.prompts.stem}</div>

          <ol style={{ paddingLeft: 18, margin: 0 }}>
            {task.prompts.questions.map((q) => (
              <li key={q.id} style={{ marginBottom: 6 }}>
                {q.text}
              </li>
            ))}
          </ol>

          {task.prompts.supports?.length ? (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #ddd" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Supports</div>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {task.prompts.supports.map((s, idx) => (
                  <li key={idx}>
                    <strong>{s.type}:</strong> {s.content}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Your responses</div>

          {fields.map((f) => (
            <div key={f.id} style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>
                {f.label}
              </label>
              <textarea
                value={responses[f.id] || ""}
                onChange={(e) => setResponses({ ...responses, [f.id]: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onCheck}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #111",
                background: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Check my evidence
            </button>

            <button
              onClick={onContinue}
              disabled={!canContinue}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #111",
                background: canContinue ? "white" : "#f3f3f3",
                cursor: canContinue ? "pointer" : "not-allowed",
                fontWeight: 800,
                opacity: canContinue ? 1 : 0.6,
              }}
            >
              Continue
            </button>
          </div>

          {statusText ? <div style={{ marginTop: 10 }}>{statusText}</div> : null}
        </div>

        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>{mediatorTitle || "Mediator"}</div>
          {mediatorPrompts?.length ? (
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {mediatorPrompts.map((p, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  {p}
                </li>
              ))}
            </ul>
          ) : (
            <div>Write your responses, then click “Check my evidence”.</div>
          )}
        </div>
      </div>
    </div>
  );
}
