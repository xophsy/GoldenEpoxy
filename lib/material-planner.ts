export type FloorSystem = "flake" | "metallic" | "solid";
export type ThicknessProfile = "standard" | "thicker";
export type AreaMode = "total" | "sections";

export type JobSection = {
  id: string;
  name: string;
  length: number;
  width: number;
};

export type MaterialJob = {
  id: string;
  name: string;
  date: string;
  areaMode: AreaMode;
  totalSqFt: number;
  sections: JobSection[];
  system: FloorSystem;
  profile: ThicknessProfile;
  allowancePct: number;
  flakePrimer: boolean;
  solidTopcoat: boolean;
  baseColor: string;
  finishColor: string;
};

export type MaterialLine = {
  id: string;
  name: string;
  purpose: string;
  quantity: number;
  unit: "gal" | "lb" | "oz";
  packageCount: number;
  packageSize: number;
  packageUnit: "kit" | "box" | "pack" | "jar";
  packageDescription: string;
  thicknessMils?: number;
  coverage?: number;
  coverageUnit?: "sq ft/gal" | "sq ft/lb";
  source: string;
};

export type MaterialResult = {
  areaSqFt: number;
  planningAreaSqFt: number;
  lines: MaterialLine[];
};

export const systemGuides = {
  flake: {
    name: "1150FC Flake",
    description: "Pigmented fast-cure epoxy, full decorative chip broadcast, and clear polyaspartic topcoat.",
    url: "https://simiron.com/wp-content/uploads/2023/05/SIM_SimFlake-SB-1-Day-Epoxy.pdf",
  },
  metallic: {
    name: "SimFloor Metallic",
    description: "Primer, tinted epoxy base, metallic epoxy layer, and satin protective topcoat.",
    url: "https://simiron.com/wp-content/uploads/2023/04/SIM_SimFloor_Metallic_SystemGuide_vFIN.pdf",
  },
  solid: {
    name: "Solid HB-Epoxy",
    description: "Clear primer and pigmented epoxy, with an optional satin protective topcoat.",
    url: "https://simiron.com/wp-content/uploads/2025/12/SIM_SimFloor_HB-Epoxy_SystemGuide_vFIN.pdf",
    topcoatUrl: "https://simiron.com/wp-content/uploads/2025/12/SIM_SimFloor_Epoxy_Siloxane_SystemGuide_vFIN.pdf",
  },
} as const;

export const baseColors = ["Haze Gray", "Light Gray", "Deck Gray", "Sandstone", "White", "Black", "Tile Red"] as const;

function nonnegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function wholePackages(quantity: number, packageSize: number) {
  return quantity > 0 ? Math.ceil(quantity / packageSize - 1e-9) : 0;
}

export function getJobArea(job: MaterialJob) {
  if (job.areaMode === "total") return nonnegative(job.totalSqFt);
  return job.sections.reduce((sum, section) => sum + nonnegative(section.length) * nonnegative(section.width), 0);
}

function liquidLine(args: {
  id: string;
  name: string;
  purpose: string;
  area: number;
  thicknessMils: number;
  coverage: number;
  kitGallons: number;
  packageDescription: string;
  source: string;
}): MaterialLine {
  const quantity = args.area / args.coverage;
  return {
    id: args.id,
    name: args.name,
    purpose: args.purpose,
    quantity,
    unit: "gal",
    packageCount: wholePackages(quantity, args.kitGallons),
    packageSize: args.kitGallons,
    packageUnit: "kit",
    packageDescription: args.packageDescription,
    thicknessMils: args.thicknessMils,
    coverage: args.coverage,
    coverageUnit: "sq ft/gal",
    source: args.source,
  };
}

function accessoryLine(args: {
  id: string;
  name: string;
  purpose: string;
  resin: MaterialLine;
  ouncesPerThreeGallons: number;
  packsPerKit?: number;
  packageUnit: "pack" | "jar";
  source: string;
}): MaterialLine {
  const multiplier = args.packsPerKit ?? 1;
  const packageSize = args.ouncesPerThreeGallons;
  return {
    id: args.id,
    name: args.name,
    purpose: args.purpose,
    quantity: (args.resin.quantity / 3) * packageSize * multiplier,
    unit: "oz",
    packageCount: args.resin.packageCount * multiplier,
    packageSize,
    packageUnit: args.packageUnit,
    packageDescription: `${packageSize}-oz ${args.packageUnit}; ${multiplier} per 3-gal epoxy mix`,
    source: args.source,
  };
}

export function calculateMaterialPlan(job: MaterialJob): MaterialResult {
  const areaSqFt = getJobArea(job);
  const allowancePct = Math.min(50, nonnegative(job.allowancePct));
  const planningAreaSqFt = areaSqFt * (100 + allowancePct) / 100;
  const lines: MaterialLine[] = [];
  if (planningAreaSqFt <= 0) return { areaSqFt, planningAreaSqFt, lines };

  const profile = job.profile === "thicker" ? "thicker" : "standard";
  const addPrimer = () => lines.push(liquidLine({
    id: "primer",
    name: "1000HS epoxy primer",
    purpose: "Seals prepared concrete and helps the next coating bond while reducing outgassing.",
    area: planningAreaSqFt,
    thicknessMils: 5,
    coverage: 320,
    kitGallons: 1.5,
    packageDescription: "1.5-gal kit (2:1 base to activator)",
    source: systemGuides[job.system].url,
  }));

  if (job.system === "flake") {
    if (job.flakePrimer) addPrimer();
    const base = liquidLine({
      id: "flake-base",
      name: "1150FC fast-cure epoxy",
      purpose: "Forms the pigmented base that bonds to the floor and holds the chip broadcast.",
      area: planningAreaSqFt,
      thicknessMils: 16,
      coverage: 100,
      kitGallons: 3,
      packageDescription: "3-gal mix (2 gal base + 1 gal activator)",
      source: systemGuides.flake.url,
    });
    lines.push(base, accessoryLine({
      id: "flake-tint", name: `Simiron E-Tint — ${job.baseColor}`,
      purpose: "Colors the epoxy beneath the decorative chip blend.",
      resin: base, ouncesPerThreeGallons: 16, packageUnit: "pack", source: systemGuides.flake.url,
    }));
    const chipPounds = planningAreaSqFt / 6;
    lines.push({
      id: "chip", name: job.finishColor ? `Decorative Chip — ${job.finishColor}` : "Decorative Chip",
      purpose: "Broadcast into the wet basecoat to create the full flake finish and texture.",
      quantity: chipPounds, unit: "lb", packageCount: wholePackages(chipPounds, 40),
      packageSize: 40, packageUnit: "box", packageDescription: "40-lb box",
      coverage: 6, coverageUnit: "sq ft/lb", source: systemGuides.flake.url,
    });
    lines.push(liquidLine({
      id: "flake-topcoat", name: "Polyaspartic HS Slow Cure",
      purpose: "Seals the chip broadcast and provides the clear wear surface.",
      area: planningAreaSqFt,
      thicknessMils: profile === "thicker" ? 16 : 12,
      coverage: profile === "thicker" ? 100 : 133,
      kitGallons: 2,
      packageDescription: "2-gal kit (1:1 base to activator)",
      source: systemGuides.flake.url,
    }));
  }

  if (job.system === "metallic") {
    addPrimer();
    const base = liquidLine({
      id: "metallic-base", name: "1100SL tinted epoxy basecoat",
      purpose: "Creates an even background color beneath the translucent metallic layer.",
      area: planningAreaSqFt,
      thicknessMils: profile === "thicker" ? 12 : 10,
      coverage: profile === "thicker" ? 134 : 160,
      kitGallons: 3,
      packageDescription: "3-gal mix (2 gal base + 1 gal activator)",
      source: systemGuides.metallic.url,
    });
    lines.push(base, accessoryLine({
      id: "metallic-base-tint", name: `Simiron E-Tint — ${job.baseColor}`,
      purpose: "Pigments the background coat for the metallic design.",
      resin: base, ouncesPerThreeGallons: 16, packageUnit: "pack", source: systemGuides.metallic.url,
    }));
    const metallic = liquidLine({
      id: "metallic-layer", name: "1100SL Slow Cure metallic layer",
      purpose: "Carries the metallic pigment and creates the flowing depth and pattern.",
      area: planningAreaSqFt,
      thicknessMils: profile === "thicker" ? 48 : 36,
      coverage: profile === "thicker" ? 33.4 : 44.5,
      kitGallons: 3,
      packageDescription: "3-gal mix (2 gal base + 1 gal Slow Cure activator)",
      source: systemGuides.metallic.url,
    });
    lines.push(metallic, accessoryLine({
      id: "metallic-additive", name: job.finishColor ? `Metallic Additive — ${job.finishColor}` : "Metallic Additive",
      purpose: "Creates the metallic color movement within the epoxy layer.",
      resin: metallic, ouncesPerThreeGallons: 32, packageUnit: "jar", source: systemGuides.metallic.url,
    }));
    lines.push(liquidLine({
      id: "metallic-topcoat", name: "971EPS satin topcoat",
      purpose: "Protects the metallic design with a clear wear and UV-resistant surface.",
      area: planningAreaSqFt,
      thicknessMils: profile === "thicker" ? 5 : 4,
      coverage: profile === "thicker" ? 320 : 400,
      kitGallons: 1,
      packageDescription: "1-gal kit (2:1 base to activator)",
      source: systemGuides.metallic.url,
    }));
  }

  if (job.system === "solid") {
    addPrimer();
    const color = liquidLine({
      id: "solid-coat", name: "1100SL solid-color epoxy",
      purpose: "Provides the continuous colored floor finish over the sealed concrete.",
      area: planningAreaSqFt,
      thicknessMils: profile === "thicker" ? 12 : 10,
      coverage: profile === "thicker" ? 134 : 160,
      kitGallons: 3,
      packageDescription: "3-gal mix (2 gal base + 1 gal activator)",
      source: systemGuides.solid.url,
    });
    lines.push(color, accessoryLine({
      id: "solid-tint", name: `Simiron U-Tint — ${job.baseColor}`,
      purpose: "Pigments the epoxy; White and Sandstone use two packs per 3-gal mix for better hide.",
      resin: color, ouncesPerThreeGallons: 16,
      packsPerKit: job.baseColor === "White" || job.baseColor === "Sandstone" ? 2 : 1,
      packageUnit: "pack", source: systemGuides.solid.url,
    }));
    if (job.solidTopcoat) lines.push(liquidLine({
      id: "solid-topcoat", name: "971EPS satin topcoat",
      purpose: "Adds a clear protective layer for abrasion, chemical, and UV resistance.",
      area: planningAreaSqFt,
      thicknessMils: profile === "thicker" ? 5 : 4,
      coverage: profile === "thicker" ? 320 : 400,
      kitGallons: 1,
      packageDescription: "1-gal kit (2:1 base to activator)",
      source: systemGuides.solid.topcoatUrl,
    }));
  }

  return { areaSqFt, planningAreaSqFt, lines };
}
