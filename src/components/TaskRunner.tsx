<div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12, marginBottom: 10 }}>
  <div style={{ fontWeight: 700, marginBottom: 6 }}>Sentence</div>
  <div style={{ fontSize: 16, marginBottom: 6 }}>{task.context.sentence}</div>
  <div style={{ fontSize: 13, opacity: 0.8 }}>
    Target word: <strong>{task.context.target_word}</strong> | Common meaning here:{" "}
    <strong>{task.context.gloss}</strong>
  </div>
</div>

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

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 16, lineHeight: 1.4 }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Meaning-First Student Lab</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
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
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Supports</div>
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
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Your responses</div>

          {fields.map((f) => (
            <div key={f.id} style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
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
                fontWeight: 700,
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
                fontWeight: 700,
                opacity: canContinue ? 1 : 0.6,
              }}
            >
              Continue
            </button>
          </div>

          {statusText ? <div style={{ marginTop: 10 }}>{statusText}</div> : null}
        </div>

        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{mediatorTitle || "Mediator"}</div>
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
