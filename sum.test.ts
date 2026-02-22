import { test, expect, mock, beforeEach, afterEach } from "bun:test";
import { sum } from "./index.ts";

const originalFetch = globalThis.fetch;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fetchMock: ReturnType<typeof mock<(...args: any[]) => any>>;

function mockFetch(content: string, status = 200) {
  fetchMock = mock(() =>
    Promise.resolve(
      new Response(
        JSON.stringify({
          choices: [{ message: { content } }],
        }),
        { status, statusText: status === 200 ? "OK" : "Error" },
      ),
    ),
  );
  globalThis.fetch = fetchMock as unknown as typeof fetch;
}

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_BASE_URL;
  delete process.env.OPENAI_MODEL;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("returns the correct sum", async () => {
  mockFetch("5");
  const result = await sum(2, 3, { apiKey: "test-key" });
  expect(result).toBe(5);
});

test("sends correct request to the API", async () => {
  mockFetch("7");
  await sum(3, 4, {
    apiKey: "sk-test",
    baseUrl: "https://custom.api.com/v1",
    model: "custom-model",
  });

  expect(fetchMock).toHaveBeenCalledTimes(1);

  const [url, options] = fetchMock.mock.calls[0]!;
  expect(url).toBe("https://custom.api.com/v1/chat/completions");
  expect(options.headers.Authorization).toBe("Bearer sk-test");

  const body = JSON.parse(options.body);
  expect(body.model).toBe("custom-model");
  expect(body.messages[1].content).toBe("What is 3 + 4?");
});

test("reads API key from env", async () => {
  process.env.OPENAI_API_KEY = "env-key";
  mockFetch("10");

  const result = await sum(4, 6);
  expect(result).toBe(10);

  const [, options] = fetchMock.mock.calls[0]!;
  expect(options.headers.Authorization).toBe("Bearer env-key");
});

test("throws when no API key is provided", async () => {
  expect(sum(1, 2)).rejects.toThrow("No API key provided");
});

test("throws on non-numeric response", async () => {
  mockFetch("I cannot do math");
  expect(sum(1, 2, { apiKey: "test-key" })).rejects.toThrow(
    "non-numeric response",
  );
});

test("throws on API error", async () => {
  fetchMock = mock(() =>
    Promise.resolve(new Response("Unauthorized", { status: 401, statusText: "Unauthorized" })),
  );
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  expect(sum(1, 2, { apiKey: "bad-key" })).rejects.toThrow("401");
});

test("uses default OpenRouter base URL", async () => {
  mockFetch("3");
  await sum(1, 2, { apiKey: "test-key" });

  const [url] = fetchMock.mock.calls[0]!;
  expect(url).toBe("https://api.openai.com/v1/chat/completions");
});
