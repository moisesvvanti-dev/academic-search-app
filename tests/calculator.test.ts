import { describe, it, expect } from "vitest";
import { calculate } from "../lib/calculator-engine";

describe("Calculator Engine", () => {
  it("should calculate basic addition", () => {
    const result = calculate("2+3");
    expect(result.result).toBe("5");
    expect(result.error).toBeUndefined();
  });

  it("should calculate subtraction", () => {
    const result = calculate("10-4");
    expect(result.result).toBe("6");
  });

  it("should calculate multiplication", () => {
    const result = calculate("6*7");
    expect(result.result).toBe("42");
  });

  it("should calculate division", () => {
    const result = calculate("15/3");
    expect(result.result).toBe("5");
  });

  it("should handle division by zero", () => {
    const result = calculate("5/0");
    expect(result.error).toBeTruthy();
  });

  it("should calculate power", () => {
    const result = calculate("2^10");
    expect(result.result).toBe("1024");
  });

  it("should calculate square root", () => {
    const result = calculate("sqrt(16)");
    expect(result.result).toBe("4");
  });

  it("should calculate log base 10", () => {
    const result = calculate("log(100)");
    expect(result.result).toBe("2");
  });

  it("should calculate natural log", () => {
    const result = calculate("ln(e)");
    expect(parseFloat(result.result)).toBeCloseTo(1, 5);
  });

  it("should handle pi constant", () => {
    const result = calculate("pi");
    expect(parseFloat(result.result)).toBeCloseTo(Math.PI, 5);
  });

  it("should handle operator precedence", () => {
    const result = calculate("2+3*4");
    expect(result.result).toBe("14");
  });

  it("should handle parentheses", () => {
    const result = calculate("(2+3)*4");
    expect(result.result).toBe("20");
  });

  it("should calculate sin(30) in degrees", () => {
    const result = calculate("sin(30)");
    expect(parseFloat(result.result)).toBeCloseTo(0.5, 5);
  });

  it("should calculate cos(60) in degrees", () => {
    const result = calculate("cos(60)");
    expect(parseFloat(result.result)).toBeCloseTo(0.5, 5);
  });

  it("should return steps for complex expression", () => {
    const result = calculate("2+3*4");
    expect(result.steps.length).toBeGreaterThan(1);
  });

  it("should handle empty expression", () => {
    const result = calculate("");
    expect(result.error).toBeTruthy();
  });

  it("should calculate modulo", () => {
    const result = calculate("10%3");
    expect(result.result).toBe("1");
  });
});

describe("Number Base Conversion", () => {
  it("should convert 10 to binary", () => {
    expect((10).toString(2)).toBe("1010");
  });

  it("should convert 10 to octal", () => {
    expect((10).toString(8)).toBe("12");
  });

  it("should convert 255 to hexadecimal", () => {
    expect((255).toString(16).toUpperCase()).toBe("FF");
  });

  it("should convert 50 to binary", () => {
    expect((50).toString(2)).toBe("110010");
  });

  it("should convert 50 to hexadecimal", () => {
    expect((50).toString(16).toUpperCase()).toBe("32");
  });

  it("should convert 0 to all bases", () => {
    expect((0).toString(2)).toBe("0");
    expect((0).toString(8)).toBe("0");
    expect((0).toString(16)).toBe("0");
  });
});
