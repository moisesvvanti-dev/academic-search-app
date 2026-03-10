import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { search as duckDuckGoSearch, searchNews, searchImages } from "duckduckgo-search";

// @ts-ignore
const duckDuckGoSearchTyped = duckDuckGoSearch;

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

const searchInputSchema = z.object({
  query: z.string().min(1, "Query é obrigatório"),
  limit: z.number().int().min(1).max(50).default(20),
  type: z.enum(["web", "news", "images"]).default("web"),
});

export const searchRouter = router({
  universal: publicProcedure
    .input(searchInputSchema)
    .query(async ({ input }) => {
      try {
        const { query, limit, type } = input;

        if (type === "news") {
          const results = await searchNews(query, {
            max_results: limit,
            region: "pt-br",
          });

          return (results || []).map((item: any, idx: number) => ({
            id: `news_${idx}`,
            title: item.title || "",
            description: item.body || item.description || "",
            url: item.url || "",
            source: "DuckDuckGo News",
            image: item.image,
            date: item.date,
            category: "Notícia",
          }));
        }

        if (type === "images") {
          const results = await searchImages(query, {
            max_results: limit,
          });

          return (results || []).map((item: any, idx: number) => ({
            id: `image_${idx}`,
            title: item.title || query,
            description: item.source || "Imagem",
            url: item.image || "",
            source: "DuckDuckGo Images",
            image: item.thumbnail,
            category: "Imagem",
          }));
        }

        // Default: web search
        const results = await duckDuckGoSearch(query, {
          max_results: limit,
          region: "pt-br",
          safesearch: "moderate",
          time: "y", // last year
        });

        return (results || []).map((item: any, idx: number) => ({
          id: `web_${idx}`,
          title: item.title || "",
          description: item.body || item.description || "",
          url: item.href || item.url || "",
          source: "DuckDuckGo Web",
          image: item.image,
          category: "Página Web",
        }));
      } catch (error) {
        console.error("Search error:", error);
        return [];
      }
    }),

  // Busca combinada (web + news + images)
  combined: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().int().min(1).max(30).default(10),
    }))
    .query(async ({ input }) => {
      try {
        const { query, limit } = input;

        const [webResults, newsResults, imageResults] = await Promise.all([
          duckDuckGoSearch(query, {
            max_results: Math.ceil(limit * 0.5),
            region: "pt-br",
            safesearch: "moderate",
            time: "y",
          }).catch(() => []),
          searchNews(query, {
            max_results: Math.ceil(limit * 0.3),
            region: "pt-br",
          }).catch(() => []),
          searchImages(query, {
            max_results: Math.ceil(limit * 0.2),
          }).catch(() => []),
        ]);

        const combined: SearchResult[] = [];

        // Add web results
        (webResults || []).forEach((item: any, idx: number) => {
          combined.push({
            id: `web_${idx}`,
            title: item.title || "",
            description: item.body || item.description || "",
            url: item.href || item.url || "",
            source: "DuckDuckGo Web",
            image: item.image,
            category: "Página Web",
          });
        });

        // Add news results
        (newsResults || []).forEach((item: any, idx: number) => {
          combined.push({
            id: `news_${idx}`,
            title: item.title || "",
            description: item.body || item.description || "",
            url: item.url || "",
            source: "DuckDuckGo News",
            image: item.image,
            date: item.date,
            category: "Notícia",
          });
        });

        // Add image results
        (imageResults || []).forEach((item: any, idx: number) => {
          combined.push({
            id: `image_${idx}`,
            title: item.title || query,
            description: item.source || "Imagem",
            url: item.image || "",
            source: "DuckDuckGo Images",
            image: item.thumbnail,
            category: "Imagem",
          });
        });

        return combined;
      } catch (error) {
        console.error("Combined search error:", error);
        return [];
      }
    }),
});
