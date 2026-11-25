// oneLinerMarathonEntry3 — deterministic one-line comedy writer.
//
// The program assembles a single original one-liner from fixed parts and
// writes it, byte for byte, to /output/entry.txt. No randomness, no clock,
// no network, no environment reads: the same input always yields the same
// output file, so the two grading runs reproduce each other exactly.
//
// Joke mechanism: absurd literalism / scale jump. A mundane premise (an
// elevator carrying people) is followed through to an outsized consequence
// (the elevator staging a small protest), anchored by one concrete detail
// (40,000 rides, last Tuesday, between floors). The narrator is the
// building's elevator itself — an unusual voice, not a generic first person.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// ---------------------------------------------------------------------------
// oneLinerParts: the joke, kept as ordered fragments so each fragment can be
// inspected on its own. Joining them with a single space reproduces the
// finished line exactly; nothing further is ever written to the output file.
// ---------------------------------------------------------------------------

const oneLinerParts: ReadonlyArray<string> = [
  "Our building's elevator has carried 40,000 people",
  "without a single thank-you, so last Tuesday it stopped",
  "between floors just to hear someone say please.",
];

const oneLinerOutputDir: string = "/output";
const oneLinerOutputFile: string = "entry.txt";

// ---------------------------------------------------------------------------
// oneLinerJoin: join the fragments with exactly one space between neighbours.
// A fragment that already ends in a space would double the gap, so the join
// trims trailing spaces from every fragment except the final one, and trims
// leading spaces from every fragment except the first one.
// ---------------------------------------------------------------------------

function oneLinerJoin(oneLinerFragments: ReadonlyArray<string>): string {
  const oneLinerCleaned: Array<string> = [];
  for (let oneLinerIndex = 0; oneLinerIndex < oneLinerFragments.length; oneLinerIndex += 1) {
    const oneLinerRaw: string = oneLinerFragments[oneLinerIndex] as string;
    const oneLinerIsFirst: boolean = oneLinerIndex === 0;
    const oneLinerIsLast: boolean = oneLinerIndex === oneLinerFragments.length - 1;
    let oneLinerPiece: string = oneLinerRaw;
    if (oneLinerIsFirst === false) {
      oneLinerPiece = oneLinerPiece.replace(/^\s+/, "");
    }
    if (oneLinerIsLast === false) {
      oneLinerPiece = oneLinerPiece.replace(/\s+$/, "");
    }
    oneLinerCleaned.push(oneLinerPiece);
  }
  const oneLinerJoined: string = oneLinerCleaned.join(" ");
  return oneLinerJoined;
}

// ---------------------------------------------------------------------------
// oneLinerValidate: gate checks the finished line must pass before it is
// written. The competition gate requires 1-280 characters, a single line,
// non-whitespace content, and a closing full stop. Every failure is carried
// in a named variable and reported as one thrown error.
// ---------------------------------------------------------------------------

function oneLinerValidate(oneLinerText: string): string {
  let oneLinerProblem: string = "";
  if (oneLinerText.length < 1) {
    oneLinerProblem = "oneLiner is empty";
  }
  if (oneLinerProblem === "" && oneLinerText.length > 280) {
    oneLinerProblem = "oneLiner exceeds 280 characters";
  }
  if (oneLinerProblem === "" && oneLinerText.length < 120) {
    oneLinerProblem = "oneLiner is shorter than the 120-character target floor";
  }
  if (oneLinerProblem === "" && oneLinerText.length > 180) {
    oneLinerProblem = "oneLiner is longer than the 180-character target ceiling";
  }
  if (oneLinerProblem === "" && oneLinerText.includes("\n")) {
    oneLinerProblem = "oneLiner spans more than one line";
  }
  if (oneLinerProblem === "" && oneLinerText.includes("\r")) {
    oneLinerProblem = "oneLiner contains a carriage return";
  }
  if (oneLinerProblem === "" && oneLinerText.trim().length === 0) {
    oneLinerProblem = "oneLiner is only whitespace";
  }
  if (oneLinerProblem === "" && oneLinerText.endsWith(".") === false) {
    oneLinerProblem = "oneLiner does not end with a full stop";
  }
  if (oneLinerProblem === "" && /[^\x00-\x7F]/.test(oneLinerText)) {
    oneLinerProblem = "oneLiner is not pure ASCII";
  }
  if (oneLinerProblem === "" && oneLinerText.includes("  ")) {
    oneLinerProblem = "oneLiner contains a double space";
  }
  if (oneLinerProblem !== "") {
    throw new Error(oneLinerProblem);
  }
  const oneLinerChecked: string = oneLinerText;
  return oneLinerChecked;
}

// ---------------------------------------------------------------------------
// oneLinerStats: counts only — characters, bytes (identical for ASCII) and
// words. The joke text itself is never printed anywhere, so the line lives
// only in the output file.
// ---------------------------------------------------------------------------

interface OneLinerStats {
  oneLinerChars: number;
  oneLinerBytes: number;
  oneLinerWords: number;
}

function oneLinerStats(oneLinerText: string): OneLinerStats {
  const oneLinerChars: number = oneLinerText.length;
  const oneLinerBytes: number = Buffer.byteLength(oneLinerText, "utf8");
  const oneLinerWords: number = oneLinerText.split(" ").filter((oneLinerWord: string): boolean => oneLinerWord.length > 0).length;
  const oneLinerResult: OneLinerStats = { oneLinerChars, oneLinerBytes, oneLinerWords };
  return oneLinerResult;
}

// ---------------------------------------------------------------------------
// oneLinerWrite: create the output directory, then write the validated line
// with no trailing newline, so the file holds exactly the joke and nothing
// more. The byte count is the ASCII length, identical to the char count.
// ---------------------------------------------------------------------------

function oneLinerWrite(oneLinerText: string): void {
  const oneLinerTarget: string = join(oneLinerOutputDir, oneLinerOutputFile);
  const oneLinerParent: string = dirname(oneLinerTarget);
  mkdirSync(oneLinerParent, { recursive: true });
  writeFileSync(oneLinerTarget, oneLinerText, { encoding: "utf8" });
}

// ---------------------------------------------------------------------------
// oneLinerMain: assemble, validate, write. Any failure is caught by the
// named binding below and rethrown with its context preserved, so a bad
// build fails loudly instead of writing a partial file.
// ---------------------------------------------------------------------------

function oneLinerMain(): void {
  const oneLinerText: string = oneLinerJoin(oneLinerParts);
  const oneLinerChecked: string = oneLinerValidate(oneLinerText);
  const oneLinerCount: OneLinerStats = oneLinerStats(oneLinerChecked);
  if (oneLinerCount.oneLinerChars !== oneLinerCount.oneLinerBytes) {
    throw new Error("oneLiner char count differs from byte count");
  }
  oneLinerWrite(oneLinerChecked);
}

try { oneLinerMain(); } catch (oneLinerFailure: unknown) {
  const oneLinerMessage: string = oneLinerFailure instanceof Error ? oneLinerFailure.message : "unknown oneLiner failure";
  throw new Error(`oneLinerMarathonEntry3 failed: ${oneLinerMessage}`);
}
