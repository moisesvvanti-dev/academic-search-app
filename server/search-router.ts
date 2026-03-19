import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as ddg from "duckduckgo-search";

export const searchInputSchema = z.object({
  query: z.string().min(1, "Query é obrigatório"),
  limit: z.number().int().min(1).max(100).default(50),
  type: z.enum(["web", "news", "images"]).default("web"),
});

// Suppress console warnings from duckduckgo-search module
(console as any).warning = console.warn;

async function performRealSearch(query: string, type: "web" | "news" | "images", limit: number) {
  try {
    const defaultExport = ddg as any;
    const searchApi = defaultExport.default || defaultExport;
    const results: any[] = [];

    if (type === "web" || type === "news") {
      // News search uses the news() function if available, else fallback to text
      const searchMethod = type === "news" && searchApi.news ? searchApi.news : searchApi.text;
      
      // Request exactly the most recent results using the 'time' parameter (last day "d" or week "w")
      const searchOptions: any = { region: "pt-br", max_results: limit };
      if (type === "news") {
        searchOptions.time = "d"; // enforce freshest news from today
      }

      const iter = await searchMethod(query, searchOptions);
      
      for await (const result of iter) {
        results.push({
          id: `ddg_${type}_${results.length}`,
          title: result.title,
          description: result.body || result.snippet || "",
          url: result.href || result.url,
          source: result.source || "DuckDuckGo",
          date: result.date || undefined,
          category: type === "news" ? "Notícia" : "Página Web"
        });
        if (results.length >= limit) break;
      }
    } else if (type === "images") {
      const iter = await searchApi.images(query, { region: "pt-br", max_results: limit });
      for await (const img of iter) {
        results.push({
          id: `ddg_img_${results.length}`,
          title: img.title || query,
          description: img.source || "Image Result",
          url: img.url || img.image,
          imageUrl: img.image || img.url,
          source: img.source || "DuckDuckGo Images",
          category: "Imagem"
        });
        if (results.length >= limit) break;
      }
    }

    return results;
  } catch (error) {
    console.error("DuckDuckGo search error:", error);
    return [];
  }
}

export const searchRouter = router({
  universal: publicProcedure
    .input(searchInputSchema)
    .query(async ({ input }) => {
      const { query, limit, type } = input;
      return performRealSearch(query, type, limit);
    }),

  combined: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const { query, limit } = input;
      const results = await performRealSearch(query, "web", limit);
      return results;
    }),
});
