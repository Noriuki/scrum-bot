import { isUuid, noop } from "../../../src/common/utils";

describe("common/utils", () => {
  describe("noop", () => {
    it("returns undefined", () => {
      expect(noop()).toBeUndefined();
    });

    it("can be called without args", () => {
      expect(() => noop()).not.toThrow();
    });
  });

  describe("isUuid", () => {
    it("returns true for valid UUID v4", () => {
      expect(isUuid("a1b2c3d4-e5f6-4789-ab12-3456789abcde")).toBe(true);
      expect(isUuid("00000000-0000-4000-8000-000000000000")).toBe(true);
    });

    it("returns false for invalid strings", () => {
      expect(isUuid("")).toBe(false);
      expect(isUuid("not-a-uuid")).toBe(false);
      expect(isUuid("a1b2c3d4-e5f6-5789-ab12-3456789abcde")).toBe(false); // version 5
      expect(isUuid("a1b2c3d4e5f64789ab123456789abcde")).toBe(false); // no hyphens
      expect(isUuid("a1b2c3d4-e5f6-4789-c212-3456789abcde")).toBe(false); // invalid variant (c)
    });

    it("returns false for non-strings", () => {
      expect(isUuid(null as unknown as string)).toBe(false);
      expect(isUuid(undefined as unknown as string)).toBe(false);
    });
  });
});
