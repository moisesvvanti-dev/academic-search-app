import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as ddg from "duckduckgo-search";

// Workaround for duckduckgo-search internal bug: this.logger.warning is not a function
if (typeof console !== 'undefined' && !(console as any).warning) {
  (console as any).warning = console.warn;
}

const defaultExport = ddg as any;
const searchApi = defaultExport.default || defaultExport;

async function fetchGenerator(genPromise: any, limit: number) {
  const results = [];
  try {
    const gen = await genPromise;
    if (!gen) return [];
    // DuckDuckGo Search API returns an AsyncGenerator in v1.x
    for await (const item of gen) {
      results.push(item);
      if (results.length >= limit) break;
    }
  } catch (error) {
    console.warn("鸭DuckDuckGo search error:", error);
  }
  return results;
}

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
          const gen = searchApi.text(query + " news", {
            region: "pt-br",
          });
          const results = await fetchGenerator(gen, limit);

          return results.map((item: any, idx: number) => ({
            id: `news_${idx}`,
            title: item.title || "",
            description: item.body || item.description || "",
            url: item.href || item.url || "",
            source: "DuckDuckGo News",
            image: item.image,
            date: item.date,
            category: "Notícia",
          }));
        }

        if (type === "images") {
          const gen = searchApi.images(query, {
            region: "pt-br",
          });
          const results = await fetchGenerator(gen, limit);

          return results.map((item: any, idx: number) => ({
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
        const gen = searchApi.text(query, {
          region: "pt-br",
          time: "y", // last year
        });
        const results = await fetchGenerator(gen, limit);

        return results.map((item: any, idx: number) => ({
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
          fetchGenerator(searchApi.text(query, {
            region: "pt-br",
            time: "y",
          }), Math.ceil(limit * 0.5)),
          fetchGenerator(searchApi.text(query + " news", {
            region: "pt-br",
          }), Math.ceil(limit * 0.3)),
          fetchGenerator(searchApi.images(query, {
            region: "pt-br",
          }), Math.ceil(limit * 0.2)),
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
