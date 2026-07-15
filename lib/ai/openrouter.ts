const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const MAX_RETRIES = 2;

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing OPENROUTER_API_KEY");
  return key;
}

export async function callWithRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
    }
  }
  throw lastError;
}

export async function openrouterEmbed(input: string, model: string): Promise<number[]> {
  return callWithRetry(async () => {
    const res = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, input }),
    });
    if (!res.ok) throw new Error(`OpenRouter embeddings failed: ${res.status} ${await res.text()}`);
    const json = await res.json();
    return json.data[0].embedding as number[];
  });
}

export async function openrouterChat(params: {
  model: string;
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
}): Promise<string> {
  return callWithRetry(async () => {
    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: params.model,
        messages: [{ role: "system", content: params.system }, ...params.messages],
      }),
    });
    if (!res.ok) throw new Error(`OpenRouter chat failed: ${res.status} ${await res.text()}`);
    const json = await res.json();
    return json.choices[0].message.content as string;
  });
}
