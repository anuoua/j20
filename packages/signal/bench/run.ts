import { Bench } from "tinybench";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createScenarios } from "./scenarios.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const outputPath =
  process.argv[2] || join(__dirname, "results", `bench-${Date.now()}.json`);

async function main() {
  const scenarios = createScenarios();
  const bench = new Bench({ time: 1000 });

  for (const scenario of scenarios) {
    bench.add(scenario.name, scenario.fn, {
      beforeAll: scenario.beforeAll,
    });
  }

  console.log("Running benchmarks...\n");
  await bench.run();

  const results: Record<string, unknown> = {};
  for (const task of bench.tasks) {
    if (!task.result || task.result.state !== "completed") {
      console.warn(`⚠ ${task.name}: ${task.result?.state || "no result"}`);
      continue;
    }
    results[task.name] = {
      latency: {
        mean: task.result.latency.mean,
        p50: task.result.latency.p50,
        p75: task.result.latency.p75,
        p99: task.result.latency.p99,
        min: task.result.latency.min,
        max: task.result.latency.max,
        sd: task.result.latency.sd,
        rme: task.result.latency.rme,
      },
      throughput: {
        mean: task.result.throughput.mean,
        p50: task.result.throughput.p50,
      },
      samplesCount: task.result.latency.samplesCount,
      totalTime: task.result.totalTime,
    };
  }

  const output = {
    timestamp: new Date().toISOString(),
    results,
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(formatTable(output.results as Record<string, LatencyResult>));
  console.log(`\nResults saved to: ${outputPath}`);
}

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

function formatTable(results: Record<string, LatencyResult>): string {
  const rows: string[][] = [];
  rows.push(
    [
      "Scenario",
      "Mean (ms)",
      "p50 (ms)",
      "p99 (ms)",
      "Throughput (ops/s)",
      "Samples",
    ].map((h) => h.padEnd(22))
  );

  for (const [name, r] of Object.entries(results)) {
    rows.push([
      name.padEnd(30),
      r.latency.mean.toFixed(6).padEnd(22),
      r.latency.p50.toFixed(6).padEnd(22),
      r.latency.p99.toFixed(6).padEnd(22),
      Math.round(r.throughput.mean).toLocaleString().padEnd(22),
      String(r.samplesCount).padEnd(22),
    ]);
  }

  return rows.map((row) => row.join("  ")).join("\n");
}

main().catch(console.error);
