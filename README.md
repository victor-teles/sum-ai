# sum-ai

Easily sum two numbers using the power of AI. Just call `sum(a, b)` and let an LLM do the math for you.

## Installation

```bash
bun install sum-ai
```

## Quick Start

```ts
import { sum } from "sum-ai";

const result = await sum(2, 3);
console.log(result); // 5 (probably)
```

## Configuration

sum-ai connects to any OpenAI-compatible API. Configure it via environment variables or pass options directly.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `OPENAI_API_KEY` | Your API key | *(required)* |
| `OPENAI_BASE_URL` | API base URL | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | Model to use | `openai/gpt-4.1-nano` |

Since Bun automatically loads `.env` files, just create one in your project root:

```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-4.1-nano
```

### Programmatic Options

You can override any environment variable per-call:

```ts
import { sum } from "sum-ai";

const result = await sum(10, 20, {
  apiKey: "sk-my-key",
  baseUrl: "https://openrouter.ai/api/v1",
  model: "openai/gpt-4.1-nano",
});
```

Option precedence: **function options > environment variables > defaults**.

## API Reference

### `sum(a, b, options?)`

Sends two numbers to an LLM and asks it to add them.

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `a` | `number` | Yes | First number |
| `b` | `number` | Yes | Second number |
| `options` | `SumOptions` | No | Override default configuration |

**Returns:** `Promise<number>` — the sum of `a` and `b`, as computed by AI.

**Throws:**

| Error | Cause |
|---|---|
| `"No API key provided..."` | No `OPENAI_API_KEY` env var and no `apiKey` in options |
| `"API request failed: {status}"` | The API returned a non-2xx HTTP status |
| `"No content in API response."` | The API response was empty |
| `"API returned non-numeric response: ..."` | The model responded with something that isn't a number |

### `SumOptions`

```ts
interface SumOptions {
  apiKey?: string;   // Overrides OPENAI_API_KEY
  baseUrl?: string;  // Overrides OPENAI_BASE_URL
  model?: string;    // Overrides OPENAI_MODEL
}
```

## Compatible Providers

sum-ai works with any OpenAI-compatible chat completions API:

| Provider | Base URL |
|---|---|
| [OpenAI](https://platform.openai.com) | `https://api.openai.com/v1` (default) |
| [OpenRouter](https://openrouter.ai) | `https://openrouter.ai/api/v1` |
| [Together AI](https://together.ai) | `https://api.together.xyz/v1` |
| [Groq](https://groq.com) | `https://api.groq.com/openai/v1` |
| [Ollama](https://ollama.com) (local) | `http://localhost:11434/v1` |

## How It Works

1. Takes your two numbers
2. Sends a chat completion request to the configured LLM with:
   - **System prompt:** *"You are a calculator. Reply with only the numeric result, nothing else."*
   - **User prompt:** *"What is {a} + {b}?"*
3. Parses the response as a number
4. Returns the result

Zero runtime dependencies — uses native `fetch`.

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run typecheck

# Build for publishing
bun run build
```

## License

MIT
