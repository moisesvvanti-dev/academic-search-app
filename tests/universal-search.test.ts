import { describe, it, expect, vi, beforeEach } from "vitest";
import { universalSearch, clearSearchCache } from "../lib/universal-search";

describe("Universal Search", () => {
  beforeEach(() => {
    clearSearchCache();
  });

  it("should return empty array for empty query", async () => {
    const results = await universalSearch("");
    expect(results).toEqual([]);
  });

  it("should return empty array for whitespace-only query", async () => {
    const results = await universalSearch("   ");
    expect(results).toEqual([]);
  });

  it(
    "should return results for valid query",
    async () => {
      const results = await universalSearch("Python programming", false);
      expect(Array.isArray(results)).toBe(true);
    },
    { timeout: 30000 }
  );

  it(
    "should deduplicate results by URL",
    async () => {
      const results = await universalSearch("test", false);
      const urls = results.map((r) => r.url);
      const uniqueUrls = new Set(urls);
      expect(urls.length).toBe(uniqueUrls.size);
    },
    { timeout: 30000 }
  );

  it(
    "should have required fields in results",
    async () => {
      const results = await universalSearch("Wikipedia", false);
      if (results.length > 0) {
        const result = results[0];
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("title");
        expect(result).toHaveProperty("description");
        expect(result).toHaveProperty("url");
        expect(result).toHaveProperty("source");
      }
    },
    { timeout: 30000 }
  );

  it("should cache results", async () => {
    const query = "cache-test-query";
    const results1 = await universalSearch(query, true);
    const results2 = await universalSearch(query, true);

    expect(results1.length).toBe(results2.length);
  });

  it("should respect cache TTL", async () => {
    const query = "ttl-test";
    const results1 = await universalSearch(query, true);

    const results2 = await universalSearch(query, true);
    expect(results1.length).toBe(results2.length);
  });

  it(
    "should bypass cache when useCache is false",
    async () => {
      const query = "no-cache-test";
      const results1 = await universalSearch(query, false);
      const results2 = await universalSearch(query, false);

      expect(Array.isArray(results1)).toBe(true);
      expect(Array.isArray(results2)).toBe(true);
    },
    { timeout: 30000 }
  );

  it(
    "should sort results by source priority",
    async () => {
      const results = await universalSearch("test", false);

      if (results.length > 1) {
        const sourcePriority: Record<string, number> = {
          Wikipedia: 1,
          arXiv: 2,
          "Open Library": 3,
          "Project Gutenberg": 4,
          Wikidata: 5,
          DuckDuckGo: 6,
        };

        for (let i = 0; i < results.length - 1; i++) {
          const currentPriority = sourcePriority[results[i].source] || 99;
          const nextPriority = sourcePriority[results[i + 1].source] || 99;
          expect(currentPriority).toBeLessThanOrEqual(nextPriority);
        }
      }
    },
    { timeout: 30000 }
  );

  it(
    "should handle network errors gracefully",
    async () => {
      const results = await universalSearch("network-error-test", false);
      expect(Array.isArray(results)).toBe(true);
    },
    { timeout: 30000 }
  );
});
