import React from "react";
import type { Task } from "../data/taskIndex";
import type { ResponseMap } from "../scoring/scoreV1";
import { MatrixBuilder } from "./MatrixBuilder";

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

  showGloss?: boolean;
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedSentence({
  sentence,
  target,
}: {
  sentence: string;
  target: string;
}) {
  const t = (target || "").trim();
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
              background: "#fff3b0",
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
  showGloss = true,
}: Props) {
  const ctx: any = (task as any).context || {};
  const targets: any = (task as any).targets || {};
  const responseCfg: any = (task as any).response || {};

  const sentences: string[] = Array.isArray(ctx.sentences)
    ? ctx.sentences
    : typeof ctx.sentence === "string"
    ? [ctx.sentence]
    : [];

  const targetWord = ctx.target_word || "";
  const baseFocus = ctx.base_focus || targets.base || "";
  const gloss = ctx.gloss || "";
  const audio = ctx.audio;

  const immediateFamily: string[] = targets.words || [];
  const relatedForms = targets.family_relatives || [];
  const twinBases = targets.twin_bases || [];

  // ----------------------------
  // PREFIX GATING (Developmental Control)
  // ----------------------------
  const allowPrefixes = Boolean((task as any).allow_prefixes);
  const gatedPrefixes: string[] = allowPrefixes ? targets.prefixes || [] : [];

  const matrixSelected: string[] = (() => {
    try {
      return JSON.parse((responses as any).matrix_selected || "[]");
    } catch {
      return [];
    }
  })();

  const proofWord = (responses as any).matrix_proof_word || "";
  const wordSum = (responses as any).matrix_word_sum || "";

  // ----------------------------
  // MORPHEME → SPELLING REBUILD UI (Feedback-only)
  // ----------------------------
  const showRebuildUI = Boolean(
    responseCfg?.spelling_rebuild_prompt ||
      (Array.isArray(responseCfg?.spelling_rebuild_examples) &&
        responseCfg.spelling_rebuild_examples.length > 0) ||
      responseCfg?.requires_spelling_rebuild === true ||
      responseCfg?.requires_spelling_rebuild === false
  );

  const rebuildBase = (responses as any).rebuild_base || "";
  const rebuildSuffix = (responses as any).rebuild_suffix || "";
  const rebuildWord = (responses as any).rebuild_word || "";

  const suffixOptions: string[] = Array.isArray(targets?.suffixes)
    ? targets.suffixes
    : [];

  const rebuildPrompt =
    responseCfg?.spelling_rebuild_prompt ||
    "Optional: Build the word by typing morphemes first, then spell the whole word after applying the join convention.";

  const rebuildExamples: string[] = Array.isArray(
    responseCfg?.spelling_rebuild_examples
  )
    ? responseCfg.spelling_rebuild_examples
    : [];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 16,
        lineHeight: 1.4,
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>
        Meaning-First Student Lab
      </h1>

      <div style={{ display: "grid", gap: 12 }}>
        {/* ---------------- Context Block ---------------- */}
        <div
          style={{
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 12,
          }}
        >
          {sentences.length ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>
                Sentence context
              </div>

              {sentences.map((s, idx) => (
                <div key={idx} style={{ fontSize: 16, marginBottom: 6 }}>
                  <HighlightedSentence sentence={s} target={targetWord} />
                </div>
              ))}

              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Target word: <strong>{targetWord}</strong>
                {baseFocus ? (
                  <>
                    {" "}
                    | Base under investigation:{" "}
                    <strong>&lt;{baseFocus}&gt;</strong>
                  </>
                ) : null}
                {showGloss && gloss ? (
                  <>
                    {" "}
                    | Common meaning here: <strong>{gloss}</strong>
                  </>
                ) : null}
              </div>

              {audio?.src ? (
                <div style={{ marginTop: 8 }}>
                  <audio controls src={audio.src} style={{ width: "100%" }} />
                </div>
              ) : null}
            </div>
          ) : null}

          <div style={{ fontSize: 16, marginBottom: 8 }}>{task.prompts.stem}</div>

          <ol style={{ paddingLeft: 18, margin: 0 }}>
            {task.prompts.questions.map((q) => (
              <li key={q.id} style={{ marginBottom: 6 }}>
                {q.text}
              </li>
            ))}
          </ol>
        </div>

        {/* ---------------- Matrix Builder ---------------- */}
        {task.response.mode === "matrix_builder" ? (
          <div
            style={{
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 12,
            }}
          >
            {!allowPrefixes && (
              <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
                In this phase, we are building with bases and suffixes only.
              </div>
            )}

            <MatrixBuilder
              base={targets.base}
              prefixes={gatedPrefixes}
              suffixes={targets.suffixes || []}
              allowedWords={immediateFamily}
              selected={matrixSelected}
              onChangeSelected={(next) =>
                setResponses({
                  ...responses,
                  matrix_selected: JSON.stringify(next),
                  family: next.join(", "),
                })
              }
              proofWord={proofWord}
              onChangeProofWord={(next) =>
                setResponses({
                  ...responses,
                  matrix_proof_word: next,
                })
              }
              wordSum={wordSum}
              onChangeWordSum={(next) =>
                setResponses({
                  ...responses,
                  matrix_word_sum: next,
                })
              }
            />

            {/* -------- Morphemes → Then Spell Whole Word (Feedback-only) -------- */}
            {showRebuildUI && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid #eee",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 6 }}>
                  Morphemes → then spell the word (feedback only)
                </div>

                <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 10 }}>
                  {rebuildPrompt}
                  {rebuildExamples.length > 0 ? (
                    <>
                      {" "}
                      Examples:{" "}
                      <strong>{rebuildExamples.join(", ")}</strong>
                    </>
                  ) : null}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                      Base morpheme (type it)
                    </div>
                    <input
                      value={rebuildBase}
                      onChange={(e) =>
                        setResponses({
                          ...responses,
                          rebuild_base: e.target.value,
                        })
                      }
                      placeholder={baseFocus ? baseFocus : "base"}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        fontSize: 16,
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                      Suffix morpheme (choose one)
                    </div>
                    <select
                      value={rebuildSuffix}
                      onChange={(e) =>
                        setResponses({
                          ...responses,
                          rebuild_suffix: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        fontSize: 16,
                        background: "white",
                      }}
                    >
                      <option value="">Select a suffix…</option>
                      {suffixOptions.map((suf: string) => (
                        <option key={suf} value={suf}>
                          {`<-${suf}>`}
                        </option>
                      ))}
                    </select>
                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                      Tip: pick the suffix that matches your proof word.
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    Spell the completed word (after the join step)
                  </div>
                  <input
                    value={rebuildWord}
                    onChange={(e) =>
                      setResponses({
                        ...responses,
                        rebuild_word: e.target.value,
                      })
                    }
                    placeholder={
                      rebuildExamples.length > 0
                        ? rebuildExamples[0]
                        : "Type the final spelling…"
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      fontSize: 16,
                    }}
                  />
                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                    Join reminder: CVC base + vowel suffix often doubles the final consonant (e.g., stop + ing → stopping).
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* ---------------- Word Family Relationships ---------------- */}
        {(immediateFamily.length > 0 ||
          relatedForms.length > 0 ||
          twinBases.length > 0) && (
          <div
            style={{
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 12,
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 8 }}>
              Word Family Relationships
            </div>

            {immediateFamily.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700 }}>Immediate Family</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
                  These words share the same base element.
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {immediateFamily.map((w: string) => (
                    <span
                      key={w}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 999,
                        padding: "6px 10px",
                        background: "#fafafa",
                        fontWeight: 700,
                      }}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {relatedForms.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700 }}>Related Forms</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
                  Meaning-related but not built by keeping the same base spelling in a
                  matrix.
                </div>
                {relatedForms.map((r: any) => (
                  <div key={r.word} style={{ marginBottom: 4 }}>
                    <strong>{r.word}</strong> — {r.relation_note}
                  </div>
                ))}
              </div>
            )}

            {twinBases.length > 0 && (
              <div>
                <div style={{ fontWeight: 700 }}>Twin Bases</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
                  Alternate base spellings representing the same core meaning.
                </div>
                {twinBases.map((t: any) => (
                  <div key={t.base} style={{ marginBottom: 4 }}>
                    <strong>&lt;{t.base}&gt;</strong> — {t.note}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- Mediator Block ---------------- */}
        <div
          style={{
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 12,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>
            {mediatorTitle || "Mediator"}
          </div>

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

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
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
      </div>
    </div>
  );
}
