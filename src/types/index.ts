// ─── Auth ───────────────────────────────────────────────────────────────────

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string | null;
  points: number;
  level: number;
  xp: number;
  streak: number;
}

// ─── Detection ──────────────────────────────────────────────────────────────

export type LitterType =
  | "bottle"
  | "can"
  | "bag"
  | "cup"
  | "cardboard"
  | "wrapper"
  | "litter";

export interface DetectionBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DetectedObject {
  class: LitterType;
  confidence: number;
  bbox: [number, number, number, number];
  points: number;
  fingerprint: string;
}

export interface DetectionResponse {
  detections: DetectedObject[];
  scored: ScoredPickup[];
  sessionActive: boolean;
}

export interface ScoredPickup {
  fingerprint: string;
  class: LitterType;
  points: number;
  timestamp: number;
}

// ─── Gamification ────────────────────────────────────────────────────────────

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  color: string;
  emoji: string;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  pointReward: number;
  earnedAt?: string | null;
}

export interface UserStats {
  points: number;
  totalItems: number;
  level: number;
  xp: number;
  streak: number;
  bottlesCollected: number;
  cansCollected: number;
  bagsCollected: number;
  cupsCollected: number;
  otherCollected: number;
  sessions: number;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
  profileIcon?: string;
  points: number;
  totalItems: number;
  level: number;
  streak: number;
}

// ─── API Responses ──────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface CleanupSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string | null;
  itemCount: number;
  pointsEarned: number;
  active: boolean;
}
