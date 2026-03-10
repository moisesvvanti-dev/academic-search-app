declare module "duckduckgo-search" {
  export interface SearchOptions {
    max_results?: number;
    region?: string;
    safesearch?: "off" | "moderate" | "strict";
    time?: "d" | "w" | "m" | "y";
  }

  export interface SearchResult {
    title: string;
    href?: string;
    url?: string;
    body?: string;
    description?: string;
    image?: string;
  }

  export interface NewsResult {
    title: string;
    url: string;
    body?: string;
    description?: string;
    image?: string;
    date?: string;
  }

  export interface ImageResult {
    title: string;
    image: string;
    thumbnail?: string;
    source?: string;
  }

  export function search(
    query: string,
    options?: SearchOptions
  ): Promise<SearchResult[]>;

  export function searchNews(
    query: string,
    options?: SearchOptions & { region?: string }
  ): Promise<NewsResult[]>;

  export function searchImages(
    query: string,
    options?: SearchOptions
  ): Promise<ImageResult[]>;
}
