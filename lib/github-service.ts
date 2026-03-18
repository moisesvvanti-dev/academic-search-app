import axios from "axios";

const GITHUB_API_URL = "https://api.github.com/repos/moisesvvanti-dev/pdfs/contents/";

export interface GitHubFile {
  name: string;
  path: string;
  download_url: string;
  type: "file" | "dir";
  size: number;
}

/**
 * Fetches the list of files from the specified GitHub repository
 */
export async function fetchPdfs(): Promise<GitHubFile[]> {
  try {
    const response = await axios.get(GITHUB_API_URL);
    return response.data.filter((file: any) => 
      file.type === "file" && 
      (file.name.toLowerCase().endsWith(".pdf") || file.name.toLowerCase().endsWith(".doc") || file.name.toLowerCase().endsWith(".docx"))
    );
  } catch (error) {
    console.error("Error fetching PDFs from GitHub:", error);
    throw new Error("Não foi possível carregar os arquivos de estudo do GitHub.");
  }
}
