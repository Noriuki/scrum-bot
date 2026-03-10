export const SESSION_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
  VOTING: "voting",
  REVEALED: "revealed",
};

export type PlanningPokerScaleSlug = "fibonacci" | "tshirt" | "points";

export interface PlanningPokerScale {
  name: string;
  slug: PlanningPokerScaleSlug;
  values: readonly number[] | readonly string[];
}

export const PLANNING_POKER_SCALES: Record<PlanningPokerScaleSlug, PlanningPokerScale> = {
  fibonacci: {
    slug: "fibonacci",
    name: "Fibonacci Sequence",
    values: [1, 2, 3, 5, 8, 13, 21],
  },
  tshirt: {
    slug: "tshirt",
    name: "T-Shirt Size",
    values: ["XS", "S", "M", "L", "XL"],
  },
  points: {
    slug: "points",
    name: "Story Points",
    values: [1, 2, 3, 4, 5],
  },
};

export function getPlanningPokerValues(scaleSlug: PlanningPokerScaleSlug) {
  return PLANNING_POKER_SCALES[scaleSlug].values ?? [];
}
