import { Platform } from "react-native";

const OLLAMA_BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:11434" : "http://localhost:11434";

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

/**
 * Service to interact with local Ollama instance
 */
export async function generateAIResponse(
  query: string,
  context: string,
  model: string = "llama3"
): Promise<string> {
  try {
    // Note: For real devices, the user might need to specify the IP of the device
    // or if Ollama is running on the device itself, 'localhost' or '127.0.0.1' should work.
    // On Android emulators, 10.0.2.2 points to the host machine.
    
    const prompt = `
      Context: ${context}
      
      Question: ${query}
      
      Instructions: Based on the provided context (search results), please provide a concise and helpful answer to the question. If the context doesn't contain the answer, say you don't know based on the search results.
    `;

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  } catch (error) {
    console.error("Ollama generation failed:", error);
    throw new Error("Failed to generate AI response. Make sure Ollama is running locally.");
  }
}
