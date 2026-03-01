import React, { useMemo } from "react";

type Props = {
  base: string;
  prefixes?: string[];
  suffixes?: string[];

  selected: string[];
  onChangeSelected: (next: string[]) => void;

  proofWord: string;
  onChangeProofWord: (next: string) => void;

  wordSum: string;
  onChangeWordSum: (next: string) => void;
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function normalizeAffix(a: string) {
  return (a || "").trim();
}

function buildWord(prefix: string, base: string, suffix: string) {
  // v1 intentionally does NOT apply join conventions.
  return `${prefix}${base}${suffix}`;
}

function inferAffixForWordSum(args: {
  proofWord: string;
  base: string;
  prefixes: string[];
  suffixes: string[];
}): { prefix: string; suffix: string } {
  const w = (args.proofWord || "").toLowerCase();
  const b = (args.base || "").toLowerCase();
  const prefixes = args.prefixes.map((p) => (p || "").toLowerCase()).filter(Boolean);
  const suffixes = args.suffixes.map((s) => (s || "").toLowerCase()).filter(Boolean);

  // Find prefix: choose the longest prefix that matches the start of the word
  let pre = "";
  for (const p of prefixes) {
    if (w.startsWith(p) && p.length > pre.length) pre = p;
  }

  // After removing prefix, the remainder should contain base + suffix
  const afterPre = pre ? w.slice(pre.length) : w;

  // Find suffix: choose the longest suffix that matches the end
  let suf = "";
  for (const s of suffixes) {
    if (afterPre.endsWith(s) && s.length > suf.length) suf = s;
  }

  // Validate that base is present (best effort)
  // We do not fail hard; we just return what we can infer.
  const basePresent = afterPre.includes(b);
  if (!basePresent) {
    // If base isn’t found, don’t guess affixes too aggressively.
    return { prefix: pre, suffix: suf };
  }

  return { prefix: pre, suffix: suf };
}

function formatWordSum(proofWord: string, base: string, prefix: string, suffix: string) {
  const parts: string[] = [];

  if (prefix) parts.push(`<${prefix}->`);
  parts.push(`<${base}>`);
  if (suffix) parts.push(`<-${suffix}>`);

  const rightSide = parts.join(" + ");

  return `<${proofWord}> = ${rightSide}\nJoin note: ________ because ________.`;
}

export function MatrixBuilder({
  base,
  prefixes = [],
  suffixes = [],
  selected,
  onChangeSelected,
  proofWord,
  onChangeProofWord,
  wordSum,
  onChangeWordSum,
}: Props) {
  const P = useMemo(() => uniq(prefixes.map(normalizeAffix)).filter(Boolean), [prefixes]);
  const S = useMemo(() => uniq(suffixes.map(normalizeAffix)).filter(Boolean), [suffixes]);

  const left = P.length ? P : [""];
  const right = S.length ? S : [""];

  function toggleWord(w: string) {
    const next = selected.includes(w) ? selected.filter((x) => x !== w) : [...selected, w];
    onChangeSelected(next);

    if (!proofWord && next.length) onChangeProofWord(next[0]);

    if (proofWord && !next.includes(proofWord)) {
      onChangeProofWord(next[0] || "");
      onChangeWordSum("");
    }
  }

  const hasSelected = selected.length > 0;

  function startWordSumTemplate() {
    if (!proofWord) return;

    const { prefix, suffix } = inferAffixForWordSum({
      proofWord,
      base,
      prefixes: P,
      suffixes: S,
    });

    const template = formatWordSum(proofWord, base, prefix, suffix);
    onChangeWordSum(template);
  }

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12, marginBottom: 12 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Matrix Builder</div>

      <div style={{ marginBottom: 10, fontSize: 14, opacity: 0.85 }}>
        Base: <strong>&lt;{base}&gt;</strong> (Click a cell to select a word as evidence.)
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 8 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>prefix</th>
              <th style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>base</th>
              {right.map((suf) => (
                <th key={suf} style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
                  suffix {suf ? `(<-${suf}>)` : ""}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {left.map((pre) => (
              <tr key={pre || "∅"}>
                <td
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #eee",
                    borderRadius: 10,
                    minWidth: 90,
                    background: "#fafafa",
                    fontWeight: 700,
                  }}
                >
                  {pre ? `<${pre}->` : "∅"}
                </td>

                <td
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #eee",
                    borderRadius: 10,
                    minWidth: 110,
                    background: "#fafafa",
                    fontWeight: 800,
                  }}
                >
                  {"<"}
                  {base}
                  {">"}
                </td>

                {right.map((suf) => {
                  const w = buildWord(pre, base, suf);
                  const isSelected = selected.includes(w);

                  return (
                    <td key={`${pre}::${suf}`}>
                      <button
                        onClick={() => toggleWord(w)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: "1px solid #111",
                          background: isSelected ? "#fff3b0" : "white",
                          cursor: "pointer",
                          fontWeight: 800,
                          minWidth: 150,
                        }}
                        title="Click to select as evidence"
                      >
                        {w}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Selected words (evidence)</div>
        {hasSelected ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {selected.map((w) => (
              <span
                key={w}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 999,
                  padding: "6px 10px",
                  background: "#fafafa",
                  fontWeight: 800,
                }}
              >
                {w}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ opacity: 0.75 }}>No words selected yet.</div>
        )}
      </div>

      {/* Proof step */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed #ddd" }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Proof (required before Continue)</div>

        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 8 }}>
          Choose one selected word, then write a word sum that resembles the word and shows its structure.
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: 700 }}>
            Proof word
            <select
              value={proofWord}
              onChange={(e) => {
                onChangeProofWord(e.target.value);
                onChangeWordSum("");
              }}
              disabled={!hasSelected}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ccc",
              }}
            >
              <option value="" disabled>
                {hasSelected ? "Select a word…" : "Select words above first…"}
              </option>
              {selected.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={startWordSumTemplate}
              disabled={!proofWord}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #111",
                background: proofWord ? "white" : "#f3f3f3",
                cursor: proofWord ? "pointer" : "not-allowed",
                fontWeight: 800,
                opacity: proofWord ? 1 : 0.6,
              }}
              title="Prefills a structure template. You still explain the join."
            >
              Start my word sum
            </button>

            <div style={{ fontSize: 12, opacity: 0.75 }}>
              (Template fills structure only, not the join reasoning.)
            </div>
          </div>

          <label style={{ fontWeight: 700 }}>
            Word sum proof
            <textarea
              value={wordSum}
              onChange={(e) => onChangeWordSum(e.target.value)}
              rows={4}
              placeholder={proofWord ? "Write your proof here…" : "Choose a proof word first."}
              disabled={!proofWord}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ccc",
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
