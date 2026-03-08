/**
 * Shared constants (planning poker scales, session statuses).
 */

export const SESSION_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
  VOTING: "voting",
  REVEALED: "revealed",
} as const;

/** Identificador da escala de estimativa */
export type PlanningPokerScaleId = "fibonacci" | "tshirt" | "points";

/** Escala de planejamento: nome + valores (números ou tamanhos de camisa) */
export interface PlanningPokerScale {
  id: PlanningPokerScaleId;
  name: string;
  values: readonly number[] | readonly string[];
}

/** Escalas disponíveis (Fibonacci, tamanho de camisa, pontos da story) */
export const PLANNING_POKER_SCALES: Record<PlanningPokerScaleId, PlanningPokerScale> = {
  fibonacci: {
    id: "fibonacci",
    name: "Fibonacci",
    values: [1, 2, 3, 5, 8, 13, 21],
  },
  tshirt: {
    id: "tshirt",
    name: "Tamanho de camisa",
    values: ["XS", "S", "M", "L", "XL"],
  },
  points: {
    id: "points",
    name: "Pontos da story",
    values: [1, 2, 3, 4, 5],
  },
};

/** Retorna os valores da escala pelo id; default points */
export function getPlanningPokerValues(
  scaleId: PlanningPokerScaleId = "points",
): readonly number[] | readonly string[] {
  return PLANNING_POKER_SCALES[scaleId].values;
}
