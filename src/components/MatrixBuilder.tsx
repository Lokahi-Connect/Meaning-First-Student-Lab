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

function isVowel(ch: string) {
  return ["a", "e", "i", "o", "u"].includes(ch);
}

function startsWithVowel(s: string) {
  const c = (s || "").toLowerCase().trim()[0] || "";
  return isVowel(c);
}

function endsWithConsonant(s: string) {
  const c = (s || "").toLowerCase().trim().slice(-1) || "";
  return c !== "" && !isVowel(c);
}

// Basic CVC check (English has exceptions; v1 is intentionally simple)
function isCVC(base: string) {
  const b = (base || "").toLowerCase().trim();
  if (b.length < 3) return false;
  const a = b[b.length - 3];
  const m = b[b.length - 2];
  const z = b[b.length - 1];
  if (!a || !m || !z) return false;

  // Exclude w, x, y as final doubling targets in this simple rule
  if (["w", "x", "y"].includes(z)) return false;

  return !isVowel(a) && isVowel(m) && !isVowel(z);
}

function applyJoin(base: string, suffix: string) {
  const b = (base || "").toLowerCase().trim();
  const s = (suffix || "").toLowerCase().trim();

  // No suffix
  if (!s) return { stem: b, note: "no suffix" };

  // Rule 1: Final <e> drop before vowel suffix (e.g., make + ing -> making)
  if (b.endsWith("e") && startsWithVowel(s)) {
    return { stem: b.slice(0, -1), note: "drop final <e> before a vowel suffix" };
  }

  // Rule 2: Final <y> -> <i> before suffix that does NOT start with <i>
  // (try + ed -> tried). For <-ing>, keep y (try + ing -> trying).
  if (b.endsWith("y") && endsWithConsonant(b.slice(0, -1)) && !s.startsWith("i")) {
    return { stem: b.slice(0, -1) + "i", note: "change final <y> to <i> before this suffix" };
  }

  // Rule 3: Double final consonant in CVC base before vowel suffix (run + ing -> running)
  // This is a simplified heuristic (works for run, hop, plan; not perfect for all English).
  if (isCVC(b) && startsWithVowel(s)) {
    const last = b[b.length - 1];
    return { stem: b + last, note: "double final consonant before a vowel suffix" };
  }

  // Default: no spelling change at the join
  return { stem: b, note: "no change at the join" };
}

function buildWord(prefix: string, base: string, suffix: string) {
  const pre = (prefix || "").toLowerCase().trim();
  const suf = (suffix || "").toLowerCase().trim();
  const { stem, note } = applyJoin(base, suf);
  return {
    word: `${pre}${stem}${suf}`,
    joinNote: note,
    joinedBase: stem, // base after join adjustment (for display)
  };
}

function inferAffixForWordSum(args: {
  proofWord: string;
  base: string;
  prefixes: string[];
  suffixes: string[];
}) {
  const w = (args.proofWord || "").toLowerCase().trim();
  const b = (args.base || "").toLowerCase().trim();
  const prefixes = args.prefixes.map((p) => (p || "").toLowerCase().trim()).filter(Boolean);
  const suffixes = args.suffixes.map((s) => (s || "").toLowerCase().trim()).filter(Boolean);

  // Longest matching prefix
  let pre = "";
  for (const p of prefixes) if (w.startsWith(p) && p.length > pre.length) pre = p;

  const afterPre = pre ? w.slice(pre.length) : w;

  // Longest matching suffix
  let suf = "";
  for (const s of suffixes) if (afterPre.endsWith(s) && s.length > suf.length) suf = s;

  // Best-effort only
  return { prefix: pre, suffix: suf, base: b };
}

function formatWordSum(proofWord: string, base: string, prefix: string, suffix: string) {
  const parts: string[] = [];
  if (prefix) parts.push(`<${prefix}->`);
  parts.push(`<${base}>`);
  if (suffix) parts.push(`<-${suffix}>`);

  return `<${proofWord}> = ${parts.join(" + ")}\nJoin note: ________ because ________.`;
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

    const inferred = inferAffixForWordSum({
      proofWord,
      base,
      prefixes: P,
      suffixes: S,
    });

    const template = formatWordSum(proofWord, base, inferred.prefix, inferred.suffix);
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
                  const built = buildWord(pre, base, suf);
                  const w = built.word;
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
                          minWidth: 170,
                        }}
                        title={`Join note: ${built.joinNote}`}
                      >
                        {w}
                        <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>
                          join: {built.joinNote}
                        </div>
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
              (Template fills structure only; you write the join reasoning.)
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
