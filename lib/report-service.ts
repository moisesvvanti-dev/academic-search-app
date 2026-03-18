import { generateAIResponse } from "./ollama-service";
import { SearchResult } from "./internet-search-service";

/**
 * Service to generate comprehensive reports from search results
 */
export async function generateAcademicReport(query: string, results: SearchResult[]): Promise<string> {
  const context = results
    .slice(0, 10)
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.description}\nFonte: ${r.source}`)
    .join("\n\n");

  const prompt = `
Faça um relatório acadêmico detalhado sobre "${query}" baseado nos seguintes resultados de pesquisa:

${context}

O relatório deve conter:
1. Introdução ao tema.
2. Pontos principais encontrados nas fontes.
3. Síntese das informações.
4. Conclusão.

Use uma linguagem formal e estruturada. Se houver dados numéricos, destaque-os.
`;

  return generateAIResponse(query, prompt);
}

/**
 * Extracts numeric data from search results to display in a table
 */
export function extractNumericData(results: SearchResult[]): { label: string; value: string; unit?: string }[] {
  const data: { label: string; value: string; unit?: string }[] = [];
  
  // Simple regex to find numbers followed by common units or labels
  const numberRegex = /(\d+[,.]?\d*)\s*(kg|km|m|%|habitantes|reais|dólares|anos|milhões|bilhões)/gi;

  results.forEach(result => {
    const text = `${result.title} ${result.description}`;
    let match;
    while ((match = numberRegex.exec(text)) !== null) {
      data.push({
        label: result.title.substring(0, 30) + "...",
        value: match[1],
        unit: match[2]
      });
    }
  });

  return data;
}
