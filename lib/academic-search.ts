export interface AcademicPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year?: number;
  source: string;
  links: string[];
  doi?: string;
  venue?: string;
  citationCount?: number;
  isOpenAccess?: boolean;
  fields?: string[];
}

export interface SearchFilters {
  area?: string;
  type?: string;
  language?: string;
  yearFrom?: number;
  yearTo?: number;
}

// Semantic Scholar API (free, no key required)
const SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1";

// CrossRef API (free, no key required)
const CROSSREF_API = "https://api.crossref.org/works";

// PubMed API (free, no key required)
const PUBMED_SEARCH_API = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const PUBMED_FETCH_API = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";
const PUBMED_SUMMARY_API = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";

// Cache in memory
const searchCache: Record<string, { results: AcademicPaper[]; timestamp: number }> = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCacheKey(query: string, filters: SearchFilters): string {
  return `${query}|${JSON.stringify(filters)}`;
}

function isRelevant(paper: AcademicPaper, query: string): boolean {
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const text = `${paper.title} ${paper.abstract} ${paper.fields?.join(" ") || ""}`.toLowerCase();
  const matchCount = queryWords.filter((word) => text.includes(word)).length;
  return matchCount >= Math.max(1, Math.floor(queryWords.length * 0.4));
}

async function searchSemanticScholar(query: string, limit = 10): Promise<AcademicPaper[]> {
  try {
    const fields = "paperId,title,authors,abstract,year,externalIds,openAccessPdf,fieldsOfStudy,citationCount,venue,url";
    const url = `${SEMANTIC_SCHOLAR_API}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`;

    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const papers: AcademicPaper[] = [];

    for (const item of data.data || []) {
      if (!item.title) continue;

      const links: string[] = [];
      if (item.url) links.push(item.url);
      if (item.openAccessPdf?.url) links.push(item.openAccessPdf.url);
      if (item.externalIds?.DOI) {
        links.push(`https://doi.org/${item.externalIds.DOI}`);
      }
      if (item.externalIds?.PubMed) {
        links.push(`https://pubmed.ncbi.nlm.nih.gov/${item.externalIds.PubMed}/`);
      }

      papers.push({
        id: item.paperId || `ss_${Date.now()}_${Math.random()}`,
        title: item.title,
        authors: (item.authors || []).map((a: { name: string }) => a.name).slice(0, 5),
        abstract: item.abstract || "Resumo não disponível.",
        year: item.year,
        source: "Semantic Scholar",
        links: [...new Set(links)],
        doi: item.externalIds?.DOI,
        venue: item.venue,
        citationCount: item.citationCount,
        isOpenAccess: !!item.openAccessPdf,
        fields: item.fieldsOfStudy || [],
      });
    }

    return papers;
  } catch (e) {
    console.error("Semantic Scholar error:", e);
    return [];
  }
}

async function searchCrossRef(query: string, limit = 8): Promise<AcademicPaper[]> {
  try {
    const url = `${CROSSREF_API}?query=${encodeURIComponent(query)}&rows=${limit}&select=DOI,title,author,abstract,published,container-title,link,is-referenced-by-count`;

    const response = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "AcademicoSearch/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const papers: AcademicPaper[] = [];

    for (const item of data.message?.items || []) {
      if (!item.title?.[0]) continue;

      const links: string[] = [];
      if (item.DOI) links.push(`https://doi.org/${item.DOI}`);
      for (const link of item.link || []) {
        if (link.URL && !links.includes(link.URL)) links.push(link.URL);
      }

      const year = item.published?.["date-parts"]?.[0]?.[0];

      papers.push({
        id: `cr_${item.DOI || Date.now()}`,
        title: item.title[0],
        authors: (item.author || []).map((a: { given?: string; family?: string }) =>
          `${a.given || ""} ${a.family || ""}`.trim()
        ).slice(0, 5),
        abstract: item.abstract
          ? item.abstract.replace(/<[^>]+>/g, "").trim()
          : "Resumo não disponível.",
        year,
        source: "CrossRef",
        links: [...new Set(links)],
        doi: item.DOI,
        venue: item["container-title"]?.[0],
        citationCount: item["is-referenced-by-count"],
        isOpenAccess: false,
        fields: [],
      });
    }

    return papers;
  } catch (e) {
    console.error("CrossRef error:", e);
    return [];
  }
}

async function searchPubMed(query: string, limit = 8): Promise<AcademicPaper[]> {
  try {
    const searchUrl = `${PUBMED_SEARCH_API}?db=pubmed&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json`;
    const searchResp = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
    if (!searchResp.ok) return [];

    const searchData = await searchResp.json();
    const ids: string[] = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const summaryUrl = `${PUBMED_SUMMARY_API}?db=pubmed&id=${ids.join(",")}&retmode=json`;
    const summaryResp = await fetch(summaryUrl, { signal: AbortSignal.timeout(10000) });
    if (!summaryResp.ok) return [];

    const summaryData = await summaryResp.json();
    const papers: AcademicPaper[] = [];

    for (const id of ids) {
      const item = summaryData.result?.[id];
      if (!item || !item.title) continue;

      const links: string[] = [
        `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      ];
      if (item.elocationid) {
        const doi = item.elocationid.replace("doi: ", "").trim();
        if (doi) links.push(`https://doi.org/${doi}`);
      }

      const year = item.pubdate ? parseInt(item.pubdate.split(" ")[0]) : undefined;

      papers.push({
        id: `pm_${id}`,
        title: item.title.replace(/\.$/, ""),
        authors: (item.authors || []).map((a: { name: string }) => a.name).slice(0, 5),
        abstract: "Acesse o link para ver o resumo completo no PubMed.",
        year,
        source: "PubMed",
        links: [...new Set(links)],
        doi: item.elocationid?.replace("doi: ", ""),
        venue: item.source,
        citationCount: undefined,
        isOpenAccess: false,
        fields: ["Medicine", "Biology"],
      });
    }

    return papers;
  } catch (e) {
    console.error("PubMed error:", e);
    return [];
  }
}

export async function searchAcademicPapers(
  query: string,
  filters: SearchFilters = {},
  useCache = true
): Promise<AcademicPaper[]> {
  if (!query.trim()) return [];

  const cacheKey = getCacheKey(query, filters);

  if (useCache && searchCache[cacheKey]) {
    const cached = searchCache[cacheKey];
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.results;
    }
  }

  // Run all searches in parallel
  const [ssResults, crResults, pmResults] = await Promise.allSettled([
    searchSemanticScholar(query, 12),
    searchCrossRef(query, 8),
    searchPubMed(query, 8),
  ]);

  const allResults: AcademicPaper[] = [
    ...(ssResults.status === "fulfilled" ? ssResults.value : []),
    ...(crResults.status === "fulfilled" ? crResults.value : []),
    ...(pmResults.status === "fulfilled" ? pmResults.value : []),
  ];

  // Deduplicate by DOI or title
  const seen = new Set<string>();
  const deduplicated = allResults.filter((paper) => {
    const key = paper.doi || paper.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Filter by relevance
  const relevant = deduplicated.filter((paper) => isRelevant(paper, query));

  // Apply additional filters
  let filtered = relevant;

  if (filters.yearFrom) {
    filtered = filtered.filter((p) => !p.year || p.year >= (filters.yearFrom || 0));
  }
  if (filters.yearTo) {
    filtered = filtered.filter((p) => !p.year || p.year <= (filters.yearTo || 9999));
  }

  // Sort by citation count and year
  filtered.sort((a, b) => {
    const citA = a.citationCount || 0;
    const citB = b.citationCount || 0;
    if (citB !== citA) return citB - citA;
    return (b.year || 0) - (a.year || 0);
  });

  const results = filtered.slice(0, 30);

  // Cache results
  searchCache[cacheKey] = { results, timestamp: Date.now() };

  return results;
}

export function clearSearchCache() {
  Object.keys(searchCache).forEach((key) => delete searchCache[key]);
}
