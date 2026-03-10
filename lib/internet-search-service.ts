/**
 * Real internet search service using multiple APIs
 * Supports: Web search, News, Images
 * APIs: DuckDuckGo (primary), Google (fallback), Bing (fallback)
 */

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  imageUrl?: string;
  date?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  source: string;
  timestamp: number;
}

/**
 * Search the internet using backend API
 * The backend uses duckduckgo-search library for real searches
 */
export async function searchInternet(
  query: string,
  type: "web" | "news" | "images" = "web"
): Promise<SearchResponse> {
  try {
    const response = await fetch("/api/trpc/search.universal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      query,
      results: data.results || [],
      source: data.source || "duckduckgo",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Internet search error:", error);
    throw error;
  }
}

/**
 * Combined search across web, news, and images
 */
export async function searchCombined(query: string): Promise<{
  web: SearchResult[];
  news: SearchResult[];
  images: SearchResult[];
}> {
  try {
    const [webResults, newsResults, imageResults] = await Promise.all([
      searchInternet(query, "web").then((r) => r.results),
      searchInternet(query, "news").then((r) => r.results),
      searchInternet(query, "images").then((r) => r.results),
    ]);

    return {
      web: webResults,
      news: newsResults,
      images: imageResults,
    };
  } catch (error) {
    console.error("Combined search error:", error);
    return {
      web: [],
      news: [],
      images: [],
    };
  }
}

/**
 * Check network connectivity
 */
export async function checkNetworkConnectivity(): Promise<{
  isConnected: boolean;
  type: "wifi" | "cellular" | "none";
}> {
  try {
    // Try a simple HEAD request to check connectivity
    const response = await fetch("https://www.google.com", {
      method: "HEAD",
      mode: "no-cors",
    });
    
    return {
      isConnected: true,
      type: "wifi", // Default to wifi, actual type detection would require native module
    };
  } catch (error) {
    return {
      isConnected: false,
      type: "none",
    };
  }
}

/**
 * Format search results for display
 */
export function formatSearchResults(results: SearchResult[]): SearchResult[] {
  return results
    .filter((r) => r.title && r.url)
    .map((r, index) => ({
      ...r,
      id: r.id || `${index}-${Date.now()}`,
    }));
}
