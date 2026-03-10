import { trpc } from "@/lib/trpc";

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  image?: string;
  date?: string;
  category?: string;
}

// Cache em memória
const searchCache: Record<string, { results: SearchResult[]; timestamp: number }> = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

function getCacheKey(query: string, type: string): string {
  return `${type}_${query.toLowerCase()}`;
}

/**
 * Hook para busca com DuckDuckGo
 * Use dentro de componentes React
 */
export function useSearchDuckDuckGo() {
  const searchQuery = trpc.search.universal.useQuery;
  const combinedQuery = trpc.search.combined.useQuery;

  return {
    searchQuery,
    combinedQuery,
  };
}

/**
 * Função para busca direta (sem hook)
 * Útil para contextos não-React
 */
export async function searchWithDuckDuckGo(
  query: string,
  type: "web" | "news" | "images" = "web",
  useCache = true
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const cacheKey = getCacheKey(query, type);

  if (useCache && searchCache[cacheKey]) {
    const cached = searchCache[cacheKey];
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Cache hit for "${query}" (${type})`);
      return cached.results;
    }
  }

  console.log(`Searching DuckDuckGo for "${query}" (${type})...`);

  try {
    // Fazer requisição direta ao servidor
    const baseUrl = typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/trpc/search.universal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        json: {
          query: query.trim(),
          limit: 20,
          type,
        },
      }),
    });

    if (!response.ok) {
      console.error(`Search failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const results = data.result?.data || [];

    // Cache results
    searchCache[cacheKey] = { results, timestamp: Date.now() };

    console.log(`Found ${results.length} results for "${query}" (${type})`);
    return results;
  } catch (error) {
    console.error("DuckDuckGo search error:", error);
    return [];
  }
}

/**
 * Busca combinada (web + news + images)
 */
export async function combinedSearch(
  query: string,
  useCache = true
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const cacheKey = getCacheKey(query, "combined");

  if (useCache && searchCache[cacheKey]) {
    const cached = searchCache[cacheKey];
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Cache hit for combined search "${query}"`);
      return cached.results;
    }
  }

  console.log(`Combined search for "${query}"...`);

  try {
    const baseUrl = typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/trpc/search.combined`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        json: {
          query: query.trim(),
          limit: 30,
        },
      }),
    });

    if (!response.ok) {
      console.error(`Combined search failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const results = data.result?.data || [];

    // Cache results
    searchCache[cacheKey] = { results, timestamp: Date.now() };

    console.log(`Found ${results.length} combined results for "${query}"`);
    return results;
  } catch (error) {
    console.error("Combined search error:", error);
    return [];
  }
}

export function clearSearchCache() {
  Object.keys(searchCache).forEach((key) => delete searchCache[key]);
}
