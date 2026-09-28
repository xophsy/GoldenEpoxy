import assert from "node:assert/strict";
import test from "node:test";
import { calculateMaterialPlan, getJobArea } from "../lib/material-planner.ts";

function job(patch = {}) {
  return {
    id: "test", name: "Test job", date: "2026-09-28", areaMode: "total", totalSqFt: 500,
    sections: [], system: "flake", profile: "standard", allowancePct: 10,
    flakePrimer: false, solidTopcoat: false, baseColor: "Haze Gray", finishColor: "",
    ...patch,
  };
}

function line(result, id) {
  const found = result.lines.find((item) => item.id === id);
  assert.ok(found, `missing ${id}`);
  return found;
}

test("flake job includes allowance, full boxes, tint packs and optional primer", () => {
  const result = calculateMaterialPlan(job({ flakePrimer: true }));
  assert.equal(result.areaSqFt, 500);
  assert.equal(result.planningAreaSqFt, 550);
  assert.equal(line(result, "primer").packageCount, 2);
  assert.equal(line(result, "flake-base").quantity, 5.5);
  assert.equal(line(result, "flake-base").packageCount, 2);
  assert.equal(line(result, "flake-tint").packageCount, 2);
  assert.equal(line(result, "chip").packageCount, 3);
  assert.equal(line(result, "flake-topcoat").packageCount, 3);
});

test("thicker flake profile changes topcoat, not specified 16-mil basecoat", () => {
  const standard = calculateMaterialPlan(job({ totalSqFt: 200 }));
  const thicker = calculateMaterialPlan(job({ totalSqFt: 200, profile: "thicker" }));
  assert.equal(line(standard, "flake-base").thicknessMils, 16);
  assert.equal(line(thicker, "flake-base").thicknessMils, 16);
  assert.equal(line(standard, "flake-topcoat").packageCount, 1);
  assert.equal(line(thicker, "flake-topcoat").packageCount, 2);
  assert.ok(!standard.lines.some((item) => item.id === "primer"));
});

test("metallic job keeps separate base and slow-cure kits with additive jars", () => {
  const standard = calculateMaterialPlan(job({ system: "metallic", totalSqFt: 800, allowancePct: 0 }));
  const thicker = calculateMaterialPlan(job({ system: "metallic", totalSqFt: 800, allowancePct: 0, profile: "thicker" }));
  assert.equal(line(standard, "primer").packageCount, 2);
  assert.equal(line(standard, "metallic-base").packageCount, 2);
  assert.equal(line(standard, "metallic-base-tint").packageCount, 2);
  assert.equal(line(standard, "metallic-layer").packageCount, 6);
  assert.equal(line(standard, "metallic-additive").packageCount, 6);
  assert.equal(line(standard, "metallic-topcoat").packageCount, 2);
  assert.equal(line(thicker, "metallic-layer").packageCount, 8);
});

test("solid color topcoat is optional and White requires two tint packs per kit", () => {
  const base = calculateMaterialPlan(job({ system: "solid", totalSqFt: 160, allowancePct: 0, baseColor: "White" }));
  assert.equal(line(base, "solid-coat").quantity, 1);
  assert.equal(line(base, "solid-tint").packageCount, 2);
  assert.ok(!base.lines.some((item) => item.id === "solid-topcoat"));
  const protectedJob = calculateMaterialPlan(job({ system: "solid", totalSqFt: 160, allowancePct: 0, baseColor: "White", solidTopcoat: true }));
  assert.equal(line(protectedJob, "solid-topcoat").packageCount, 1);
});

test("kit boundary and measured sections calculate without early rounding", () => {
  const exact = calculateMaterialPlan(job({ totalSqFt: 300, allowancePct: 0 }));
  const over = calculateMaterialPlan(job({ totalSqFt: 300.01, allowancePct: 0 }));
  assert.equal(line(exact, "flake-base").packageCount, 1);
  assert.equal(line(over, "flake-base").packageCount, 2);
  const sections = job({ areaMode: "sections", sections: [
    { id: "a", name: "Garage", length: 10, width: 12 },
    { id: "b", name: "Workshop", length: 8, width: 10 },
  ] });
  assert.equal(getJobArea(sections), 200);
  assert.equal(calculateMaterialPlan(sections).planningAreaSqFt, 220);
});
