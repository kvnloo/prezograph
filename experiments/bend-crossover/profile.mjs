// Offline, opt-in profile of Prezograph's supported JSON compile + camera bounds.
// No runtime changes, native Bend bridge, network access, GPU work, or persistent output.
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { compileDeck } from "../../src/core/compile.js";
import { boundsFor } from "../../src/core/geometry.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const deckFile = resolve(root, "examples/graphs-are-awesome/reviewed.deck.json");
const deck = JSON.parse(readFileSync(deckFile, "utf8"));

function percentile(samples, q) {
  if (samples.length === 0) throw new TypeError("missing samples");
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1)];
}

function sample() {
  const started = performance.now();
  const compiled = compileDeck(deck);
  const compiledAt = performance.now();
  let focusWindows = 0;
  let allInstanceWindows = 0;
  for (const scene of compiled.scenes) {
    const ids = scene.instances.map((instance) => instance.id);
    const sceneBounds = boundsFor(ids, compiled.instanceMap);
    if (!Number.isFinite(sceneBounds.width) || !Number.isFinite(sceneBounds.height)) {
      throw new Error("non-finite scene bounds");
    }
    allInstanceWindows++;
    for (const beat of scene.beats) {
      const bounds = boundsFor(beat.focus, compiled.instanceMap);
      if (!Number.isFinite(bounds.width) || !Number.isFinite(bounds.height)) {
        throw new Error("non-finite focus bounds");
      }
      focusWindows++;
    }
  }
  const finished = performance.now();
  return {
    compile_ms: compiledAt - started,
    geometry_ms: finished - compiledAt,
    total_ms: finished - started,
    scenes: compiled.scenes.length,
    focus_windows: focusWindows,
    scene_windows: allInstanceWindows
  };
}

const warmups = 20;
const repetitions = 101;
for (let i = 0; i < warmups; i++) sample();
const measurements = Array.from({ length: repetitions }, () => sample());
const first = measurements[0];
const summary = {
  kind: "prezograph_compile_geometry_cpu_profile",
  fixture: "examples/graphs-are-awesome/reviewed.deck.json",
  fixture_bytes: readFileSync(deckFile).length,
  node: process.version,
  repeats: repetitions,
  warmups,
  scenes: first.scenes,
  focus_windows: first.focus_windows,
  scene_windows: first.scene_windows,
  compile_ms_p50: percentile(measurements.map((x) => x.compile_ms), 0.5),
  compile_ms_p95: percentile(measurements.map((x) => x.compile_ms), 0.95),
  geometry_ms_p50: percentile(measurements.map((x) => x.geometry_ms), 0.5),
  geometry_ms_p95: percentile(measurements.map((x) => x.geometry_ms), 0.95),
  total_ms_p50: percentile(measurements.map((x) => x.total_ms), 0.5),
  total_ms_p95: percentile(measurements.map((x) => x.total_ms), 0.95),
  bend_gpu_measured: false,
  browser_render_measured: false
};
console.log(JSON.stringify(summary, null, 2));
