export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  image?: string;
  date?: string;
  author?: string;
  category?: string;
}

// Cache in memory
const searchCache: Record<string, { results: SearchResult[]; timestamp: number }> = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCacheKey(query: string): string {
  return `universal_${query.toLowerCase()}`;
}

// Wikipedia API
async function searchWikipedia(query: string, limit = 10): Promise<SearchResult[]> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srwhat=text&srlimit=${limit}&format=json&origin=*`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const results: SearchResult[] = [];

    for (const item of data.query?.search || []) {
      const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`;

      results.push({
        id: `wiki_${item.pageid}`,
        title: item.title,
        description: item.snippet.replace(/<[^>]+>/g, "").trim(),
        url: pageUrl,
        source: "Wikipedia",
        category: "Enciclopédia",
      });
    }

    console.log(`Wikipedia: ${results.length} results`);
    return results;
  } catch (e) {
    console.error("Wikipedia error:", e);
    return [];
  }
}

// Open Library API (livros)
async function searchOpenLibrary(query: string, limit = 10): Promise<SearchResult[]> {
  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=${limit}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const results: SearchResult[] = [];

    for (const item of data.docs || []) {
      if (!item.title) continue;

      const author = item.author_name?.[0] || "Autor desconhecido";
      const year = item.first_publish_year;
      const coverUrl = item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : undefined;

      results.push({
        id: `book_${item.key}`,
        title: item.title,
        description: `Por ${author}${year ? ` (${year})` : ""}. ${item.edition_count || 1} edição(ões) disponível(is).`,
        url: `https://openlibrary.org${item.key}`,
        source: "Open Library",
        image: coverUrl,
        author,
        category: "Livro",
      });
    }

    console.log(`Open Library: ${results.length} results`);
    return results;
  } catch (e) {
    console.error("Open Library error:", e);
    return [];
  }
}

// Wikidata API (dados estruturados)
async function searchWikidata(query: string, limit = 10): Promise<SearchResult[]> {
  try {
    const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=pt&limit=${limit}&format=json`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const results: SearchResult[] = [];

    for (const item of data.search || []) {
      results.push({
        id: `wikidata_${item.id}`,
        title: item.label,
        description: item.description || "Entidade Wikidata",
        url: `https://www.wikidata.org/wiki/${item.id}`,
        source: "Wikidata",
        category: "Dados Estruturados",
      });
    }

    console.log(`Wikidata: ${results.length} results`);
    return results;
  } catch (e) {
    console.error("Wikidata error:", e);
    return [];
  }
}

// arXiv API (pré-prints científicos)
async function searchArxiv(query: string, limit = 10): Promise<SearchResult[]> {
  try {
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const text = await response.text();

    // Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const entries = xmlDoc.getElementsByTagName("entry");
    const results: SearchResult[] = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const title = entry.getElementsByTagName("title")[0]?.textContent || "";
      const summary = entry.getElementsByTagName("summary")[0]?.textContent || "";
      const id = entry.getElementsByTagName("id")[0]?.textContent || "";
      const published = entry.getElementsByTagName("published")[0]?.textContent || "";
      const authors = Array.from(entry.getElementsByTagName("author"))
        .map((a) => a.getElementsByTagName("name")[0]?.textContent)
        .filter(Boolean)
        .slice(0, 3)
        .join(", ");

      if (!title) continue;

      results.push({
        id: `arxiv_${id.split("/").pop()}`,
        title: title.trim(),
        description: summary.trim().slice(0, 200),
        url: id,
        source: "arXiv",
        author: authors,
        date: published?.split("T")[0],
        category: "Pré-print Científico",
      });
    }

    console.log(`arXiv: ${results.length} results`);
    return results;
  } catch (e) {
    console.error("arXiv error:", e);
    return [];
  }
}

// Project Gutenberg (livros públicos)
async function searchGutenberg(query: string, limit = 10): Promise<SearchResult[]> {
  try {
    const url = `https://gutendex.com/books?search=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const results: SearchResult[] = [];

    for (const item of data.results?.slice(0, limit) || []) {
      const author = item.authors?.[0]?.name || "Autor desconhecido";
      const coverUrl = item.formats?.["image/jpeg"];

      results.push({
        id: `gutenberg_${item.id}`,
        title: item.title,
        description: `Por ${author}. Livro de domínio público disponível em múltiplos formatos.`,
        url: `https://www.gutenberg.org/ebooks/${item.id}`,
        source: "Project Gutenberg",
        image: coverUrl,
        author,
        category: "Livro Público",
      });
    }

    console.log(`Gutenberg: ${results.length} results`);
    return results;
  } catch (e) {
    console.error("Gutenberg error:", e);
    return [];
  }
}

// DuckDuckGo Instant Answer API (fallback geral)
async function searchDuckDuckGo(query: string, limit = 10): Promise<SearchResult[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const results: SearchResult[] = [];

    // Add instant answer if available
    if (data.AbstractText) {
      results.push({
        id: `ddg_instant`,
        title: data.Heading || query,
        description: data.AbstractText,
        url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        source: "DuckDuckGo",
        category: "Resposta Instantânea",
      });
    }

    // Add related topics
    for (const topic of data.RelatedTopics?.slice(0, Math.min(limit - 1, 5)) || []) {
      if (topic.Text) {
        results.push({
          id: `ddg_topic_${topic.FirstURL?.split("/").pop() || Math.random()}`,
          title: topic.Text.split(" - ")[0],
          description: topic.Text.split(" - ")[1] || topic.Text,
          url: topic.FirstURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          source: "DuckDuckGo",
          image: topic.Icon?.URL,
          category: "Tópico Relacionado",
        });
      }
    }

    console.log(`DuckDuckGo: ${results.length} results`);
    return results;
  } catch (e) {
    console.error("DuckDuckGo error:", e);
    return [];
  }
}

export async function universalSearch(query: string, useCache = true): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const cacheKey = getCacheKey(query);

  if (useCache && searchCache[cacheKey]) {
    const cached = searchCache[cacheKey];
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Cache hit for "${query}"`);
      return cached.results;
    }
  }

  console.log(`Universal search for "${query}"...`);

  // Run all searches in parallel
  const [wikiResults, bookResults, wikidataResults, arxivResults, gutenbergResults, ddgResults] =
    await Promise.allSettled([
      searchWikipedia(query, 8),
      searchOpenLibrary(query, 8),
      searchWikidata(query, 8),
      searchArxiv(query, 8),
      searchGutenberg(query, 5),
      searchDuckDuckGo(query, 10),
    ]);

  const allResults: SearchResult[] = [
    ...(wikiResults.status === "fulfilled" ? wikiResults.value : []),
    ...(bookResults.status === "fulfilled" ? bookResults.value : []),
    ...(wikidataResults.status === "fulfilled" ? wikidataResults.value : []),
    ...(arxivResults.status === "fulfilled" ? arxivResults.value : []),
    ...(gutenbergResults.status === "fulfilled" ? gutenbergResults.value : []),
    ...(ddgResults.status === "fulfilled" ? ddgResults.value : []),
  ];

  console.log(`Total results: ${allResults.length}`);

  // Deduplicate by URL
  const seen = new Set<string>();
  const deduplicated = allResults.filter((result) => {
    if (seen.has(result.url)) return false;
    seen.add(result.url);
    return true;
  });

  // Sort by source priority and title
  const sourcePriority: Record<string, number> = {
    Wikipedia: 1,
    arXiv: 2,
    "Open Library": 3,
    "Project Gutenberg": 4,
    Wikidata: 5,
    DuckDuckGo: 6,
  };

  deduplicated.sort((a, b) => {
    const priorityDiff = (sourcePriority[a.source] || 99) - (sourcePriority[b.source] || 99);
    if (priorityDiff !== 0) return priorityDiff;
    return a.title.localeCompare(b.title);
  });

  // Cache results
  searchCache[cacheKey] = { results: deduplicated, timestamp: Date.now() };

  return deduplicated;
}

export function clearSearchCache() {
  Object.keys(searchCache).forEach((key) => delete searchCache[key]);
}
