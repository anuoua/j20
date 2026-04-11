import { readFileSync } from "node:fs";
import { argv } from "node:process";

interface LatencyResult {
  latency: {
    mean: number;
    p50: number;
    p75: number;
    p99: number;
    min: number;
    max: number;
    sd: number;
    rme: number;
  };
  throughput: { mean: number; p50: number };
  samplesCount: number;
  totalTime: number;
}

interface BenchResult {
  timestamp: string;
  results: Record<string, LatencyResult>;
}

function load(path: string): BenchResult {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function pct(before: number, after: number): string {
  if (before === 0) return "N/A";
  const change = ((after - before) / before) * 100;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

function color(
  text: string,
  improvement: "better" | "worse" | "neutral"
): string {
  if (process.env.NO_COLOR) return text;
  const codes = { better: "\x1b[32m", worse: "\x1b[31m", neutral: "\x1b[0m" };
  return `${codes[improvement]}${text}\x1b[0m`;
}

function main() {
  const [beforePath, afterPath] = argv.slice(2);
  if (!beforePath || !afterPath) {
    console.error("Usage: tsx bench/compare.ts <before.json> <after.json>");
    process.exit(1);
  }

  const before = load(beforePath);
  const after = load(afterPath);

  const allNames = new Set([
    ...Object.keys(before.results),
    ...Object.keys(after.results),
  ]);

  console.log(`\nBefore: ${before.timestamp}  |  After: ${after.timestamp}\n`);

  const header = [
    "Scenario".padEnd(35),
    "Before Mean".padEnd(15),
    "After Mean".padEnd(15),
    "Delta".padEnd(12),
    "Throughput Δ".padEnd(14),
  ].join("  ");
  console.log(header);
  console.log("-".repeat(header.length));

  for (const name of allNames) {
    const b = before.results[name];
    const a = after.results[name];

    if (!b || !a) {
      console.log(`${name.padEnd(35)}  ${b ? "REMOVED" : "NEW"}`);
      continue;
    }

    const meanDelta = pct(b.latency.mean, a.latency.mean);
    const tpDelta = pct(b.throughput.mean, a.throughput.mean);

    const meanImproved =
      a.latency.mean < b.latency.mean
        ? "better"
        : a.latency.mean > b.latency.mean
          ? "worse"
          : "neutral";
    const tpImproved =
      a.throughput.mean > b.throughput.mean
        ? "better"
        : a.throughput.mean < b.throughput.mean
          ? "worse"
          : "neutral";

    console.log(
      [
        name.padEnd(35),
        `${(b.latency.mean * 1000).toFixed(3)}µs`.padEnd(15),
        `${(a.latency.mean * 1000).toFixed(3)}µs`.padEnd(15),
        color(meanDelta.padEnd(12), meanImproved),
        color(tpDelta.padEnd(14), tpImproved),
      ].join("  ")
    );
  }

  console.log();
}

main();
