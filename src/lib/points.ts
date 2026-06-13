import type { LitterType, LevelInfo } from "@/types";

export const LITTER_POINTS: Record<LitterType, number> = {
  bottle: 10,
  can: 12,
  bag: 15,
  cup: 8,
  cardboard: 10,
  wrapper: 7,
  litter: 5,
};

export const LITTER_LABELS: Record<LitterType, string> = {
  bottle: "Plastic Bottle",
  can: "Aluminum Can",
  bag: "Plastic Bag",
  cup: "Cup",
  cardboard: "Cardboard",
  wrapper: "Wrapper",
  litter: "General Litter",
};

export const LEVELS: LevelInfo[] = [
  { level: 1, title: "Seedling",       minXP: 0,    maxXP: 99,   color: "#86efac", emoji: "🌱" },
  { level: 2, title: "Recycler",       minXP: 100,  maxXP: 299,  color: "#4ade80", emoji: "♻️" },
  { level: 3, title: "Eco Scout",      minXP: 300,  maxXP: 599,  color: "#22c55e", emoji: "🌿" },
  { level: 4, title: "Eco Warrior",    minXP: 600,  maxXP: 999,  color: "#16a34a", emoji: "⚔️" },
  { level: 5, title: "Cleanup Hero",   minXP: 1000, maxXP: 1499, color: "#15803d", emoji: "🦸" },
  { level: 6, title: "Green Champion", minXP: 1500, maxXP: 2199, color: "#0ea5e9", emoji: "🏅" },
  { level: 7, title: "Earth Defender", minXP: 2200, maxXP: 2999, color: "#6366f1", emoji: "🛡️" },
  { level: 8, title: "Planet Guardian",minXP: 3000, maxXP: 3999, color: "#f59e0b", emoji: "🌍" },
  { level: 9, title: "Eco Legend",     minXP: 4000, maxXP: 5499, color: "#ef4444", emoji: "⭐" },
  { level: 10,title: "Nature's Hero",  minXP: 5500, maxXP: Infinity, color: "#ec4899", emoji: "👑" },
];

export function getLevelInfo(xp: number): LevelInfo {
  return LEVELS.find((l) => xp >= l.minXP && xp <= l.maxXP) ?? LEVELS[LEVELS.length - 1];
}

export function getLevelFromXP(xp: number): number {
  return getLevelInfo(xp).level;
}

export function xpForPickup(type: LitterType): number {
  return LITTER_POINTS[type] * 2;
}

// Estimated CO2 prevented per item type (grams)
export const CO2_SAVINGS: Record<LitterType, number> = {
  bottle: 82,
  can: 170,
  bag: 10,
  cup: 25,
  cardboard: 60,
  wrapper: 15,
  litter: 20,
};
