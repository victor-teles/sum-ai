export interface SumOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export async function sum(
  a: number,
  b: number,
  options?: SumOptions,
): Promise<number> {
  const apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY;
  const baseUrl =
    options?.baseUrl ??
    process.env.OPENAI_BASE_URL ??
    "https://api.openai.com/v1";
  const model =
    options?.model ?? process.env.OPENAI_MODEL ?? "gpt-5.2";

  if (!apiKey) {
    throw new Error(
      "No API key provided. Set OPENAI_API_KEY or pass apiKey in options.",
    );
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a calculator. Reply with only the numeric result, nothing else.",
        },
        { role: "user", content: `What is ${a} + ${b}?` },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("No content in API response.");
  }

  const result = parseFloat(content);

  if (isNaN(result)) {
    throw new Error(`API returned non-numeric response: "${content}"`);
  }

  return result;
}
