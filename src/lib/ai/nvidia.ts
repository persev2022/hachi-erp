/**
 * NVIDIA NIM AI Client — Multi-model support for Hachi ERP
 * 
 * Models used:
 * - Chat: nvidia/llama-3.3-nemotron-super-49b-v1 (best quality)
 * - Fast: nvidia/llama-3.1-nemotron-nano-8b-v1 (quick responses)
 * - Embeddings: nvidia/nv-embed-v1 (semantic search)
 * - Reranking: nvidia/nv-rerankqa-mistral-4b-v3 (improve search results)
 * - Vision: nvidia/llama-3.1-nemotron-nano-vl-8b-v1 (read documents/images)
 * 
 * All use same API key and base URL: https://integrate.api.nvidia.com/v1
 */

const BASE_URL = "https://integrate.api.nvidia.com/v1";

export const NVIDIA_MODELS = {
  // Best quality for complex analysis (Nemotron 3, replaces deprecated llama-3.3-nemotron-super-49b)
  chat: "nvidia/nemotron-3-super-120b-a12b",
  // Deep reasoning for financial analysis (Nemotron 3 with reasoning traces)
  reasoning: "nvidia/nemotron-3-super-120b-a12b",
  // Fast fallback (uses the same reliable Nemotron 3 model)
  fast: "nvidia/nemotron-3-super-120b-a12b",
  // Text summarization and reports
  summarize: "mistralai/mistral-nemotron",
  // Embeddings for semantic search
  embedding: "nvidia/nv-embed-v1",
  // Reranking search results
  rerank: "nvidia/nv-rerankqa-mistral-4b-v3",
  // Vision - read images and documents
  vision: "nvidia/llama-3.1-nemotron-nano-vl-8b-v1",
} as const;

function getApiKey(): string {
  return process.env.NVIDIA_API_KEY || "";
}

/**
 * Deep financial reasoning — uses the reasoning model with a fallback chain.
 * Tries the reasoning model first, falls back to the standard chat model if unavailable.
 */
export async function financialReasoning(params: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NVIDIA_API_KEY not configured");

  const models = [NVIDIA_MODELS.reasoning, NVIDIA_MODELS.fast];
  let lastError: any = null;

  for (const model of models) {
    try {
      // Reasoning models need extra tokens for the reasoning trace + final answer
      const isReasoning = model === NVIDIA_MODELS.reasoning;
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: params.systemPrompt },
            { role: "user", content: params.userPrompt },
          ],
          max_tokens: (params.maxTokens || 2048) + (isReasoning ? 2048 : 0),
          temperature: 0.3,
          top_p: 0.95,
          stream: false,
        }),
      });
      if (!response.ok) { lastError = await response.text(); continue; }
      const data = await response.json();
      const msg = data.choices?.[0]?.message;
      // Prefer final content; if empty (all budget went to reasoning), use reasoning
      const content = msg?.content?.trim() || msg?.reasoning_content?.trim();
      if (content) return content;
    } catch (e) {
      lastError = e;
    }
  }
  throw new Error(`Todos os modelos falharam: ${String(lastError).slice(0, 200)}`);
}

/**
 * Chat completion — main AI interaction
 */
export async function chat(params: {
  messages: { role: string; content: string }[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NVIDIA_API_KEY not configured");

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: params.model || NVIDIA_MODELS.chat,
      messages: params.messages,
      max_tokens: params.maxTokens || 1024,
      temperature: params.temperature || 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`NVIDIA API error: ${response.status} - ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Fast chat — uses smaller model for quick responses
 */
export async function fastChat(messages: { role: string; content: string }[]): Promise<string> {
  return chat({ messages, model: NVIDIA_MODELS.fast, maxTokens: 512, temperature: 0.5 });
}

/**
 * Summarize text — uses Mistral Nemotron for summarization
 */
export async function summarize(text: string, instruction?: string): Promise<string> {
  return chat({
    messages: [
      { role: "system", content: instruction || "Resuma o texto a seguir de forma concisa e profissional em português brasileiro." },
      { role: "user", content: text },
    ],
    model: NVIDIA_MODELS.summarize,
    maxTokens: 500,
    temperature: 0.3,
  });
}

/**
 * Generate embeddings for semantic search
 */
export async function embed(texts: string[]): Promise<number[][]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NVIDIA_API_KEY not configured");

  const response = await fetch(`${BASE_URL}/embeddings`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: NVIDIA_MODELS.embedding,
      input: texts,
      input_type: "query",
      encoding_format: "float",
      truncate: "END",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`NVIDIA Embed error: ${response.status} - ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.data?.map((d: any) => d.embedding) || [];
}

/**
 * Rerank search results by relevance
 */
export async function rerank(query: string, passages: string[]): Promise<{ index: number; score: number }[]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NVIDIA_API_KEY not configured");

  const response = await fetch(`${BASE_URL}/ranking`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: NVIDIA_MODELS.rerank,
      query: { text: query },
      passages: passages.map((text) => ({ text })),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`NVIDIA Rerank error: ${response.status} - ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.rankings || [];
}

/**
 * Analyze image/document using vision model
 */
export async function analyzeImage(imageBase64: string, question: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NVIDIA_API_KEY not configured");

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: NVIDIA_MODELS.vision,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: question },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      }],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`NVIDIA Vision error: ${response.status} - ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Generate clinical insight from evolution data
 */
export async function generateClinicalInsight(evolutions: string[], patientName: string): Promise<string> {
  return chat({
    messages: [
      {
        role: "system",
        content: `Você é um assistente clínico especializado em centros terapêuticos de dependência química. Analise as evoluções do paciente e forneça:
1. Resumo do progresso
2. Pontos de atenção
3. Recomendações
Seja conciso, profissional e em português brasileiro.`,
      },
      {
        role: "user",
        content: `Analise as evoluções do paciente "${patientName}":\n\n${evolutions.join("\n\n")}`,
      },
    ],
    model: NVIDIA_MODELS.chat,
    maxTokens: 800,
    temperature: 0.4,
  });
}

/**
 * Predict revenue based on historical data
 */
export async function predictRevenue(data: { mes: string; receita: number; despesa: number }[]): Promise<string> {
  return chat({
    messages: [
      {
        role: "system",
        content: "Você é um analista financeiro. Com base nos dados históricos, projete a receita para os próximos 3 meses e identifique tendências. Responda em português, de forma objetiva com números.",
      },
      {
        role: "user",
        content: `Dados financeiros mensais:\n${data.map((d) => `${d.mes}: Receita R$${d.receita}, Despesa R$${d.despesa}`).join("\n")}`,
      },
    ],
    model: NVIDIA_MODELS.fast,
    maxTokens: 500,
    temperature: 0.3,
  });
}

/**
 * Check if NVIDIA API is available
 */
export function isAvailable(): boolean {
  return !!getApiKey();
}
