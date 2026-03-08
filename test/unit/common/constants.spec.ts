import {
  getPlanningPokerValues,
  PLANNING_POKER_SCALES,
  SESSION_STATUS,
} from "../../../src/common/constants";

describe("common/constants", () => {
  describe("PLANNING_POKER_SCALES", () => {
    it("has fibonacci, tshirt and points", () => {
      expect(PLANNING_POKER_SCALES.fibonacci.values).toEqual([1, 2, 3, 5, 8, 13, 21]);
      expect(PLANNING_POKER_SCALES.tshirt.values).toEqual(["XS", "S", "M", "L", "XL"]);
      expect(PLANNING_POKER_SCALES.points.values).toEqual([1, 2, 3, 4, 5]);
    });

    it("each scale has id and name", () => {
      Object.values(PLANNING_POKER_SCALES).forEach((scale) => {
        expect(scale.id).toBeDefined();
        expect(scale.name).toBeDefined();
        expect(Array.isArray(scale.values)).toBe(true);
      });
    });
  });

  describe("getPlanningPokerValues", () => {
    it("returns points scale by default", () => {
      expect(getPlanningPokerValues()).toEqual([1, 2, 3, 4, 5]);
    });

    it("returns values for given scale id", () => {
      expect(getPlanningPokerValues("fibonacci")).toEqual([1, 2, 3, 5, 8, 13, 21]);
      expect(getPlanningPokerValues("tshirt")).toEqual(["XS", "S", "M", "L", "XL"]);
      expect(getPlanningPokerValues("points")).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("SESSION_STATUS", () => {
    it("has expected keys", () => {
      expect(SESSION_STATUS).toMatchObject({
        OPEN: "open",
        VOTING: "voting",
        REVEALED: "revealed",
        CLOSED: "closed",
      });
    });

    it("values are strings", () => {
      Object.values(SESSION_STATUS).forEach((v) => {
        expect(typeof v).toBe("string");
      });
    });
  });
});
