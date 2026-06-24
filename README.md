# meshs-one · Node.js SDK

> **One API key. 30+ AI models. Zero dependencies.**

[![npm version](https://img.shields.io/npm/v/meshs-one.svg)](https://www.npmjs.com/package/meshs-one)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why

- 🎯 **30+ models, one key** — GPT-5, Claude 4, Gemini 2.5, DeepSeek R2, Qwen 3
- 💰 **Up to 80% cheaper** than official pricing
- 🔄 **OpenAI SDK compatible** — swap `base_url`, zero migration
- 🛡️ **Built-in retry** — auto-retries on network errors
- 🧵 **Streaming** — async generator for real-time responses
- 📦 **Zero dependencies** — pure Node.js, no npm bloat

## Install

```bash
npm install meshs-one
```

## Quick Start

```js
const MeshsOne = require('meshs-one');

const client = new MeshsOne({ apiKey: 'your-api-key' });

// Simple chat
const reply = await client.chat('Explain quantum computing in one sentence.');
console.log(reply);

// With system prompt + model selection
const reply2 = await client.chat([
  { role: 'system', content: 'You are a Python expert.' },
  { role: 'user', content: 'Write a FastAPI endpoint for file upload.' }
], { model: 'claude-4-sonnet' });

console.log(reply2);
```

## API Reference

### `new MeshsOne(options)`

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `apiKey` | string | **required** | Your API key from api.meshs.one |
| `timeout` | number | 60000 | Request timeout (ms) |
| `maxRetries` | number | 3 | Auto-retry count |

### `client.chat(messages, options?)`

Send a chat completion. Returns the response text (string).

```js
// String shorthand
await client.chat('Hello!');

// Full message array
await client.chat([
  { role: 'user', content: 'Hello!' }
]);

// With options
await client.chat('Hello!', {
  model: 'claude-4-opus',
  temperature: 0.7,
  maxTokens: 2000
});

// Streaming
const stream = await client.chat('Tell me a story', { stream: true });
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

### `client.listModels()`

```js
const models = await client.listModels();
// [{ id: 'gpt-5', owned_by: 'openai' }, ...]
```

### `client.ping()`

```js
const ok = await client.ping(); // true | false
```

### `client.getKnownModels()`

```js
const models = client.getKnownModels();
// ['claude-4-opus', 'claude-4-sonnet', 'gpt-5', 'gpt-4o', ...]
```

## Error Handling

```js
const { MeshsError, MeshsAuthError, MeshsRateLimitError } = MeshsOne;

try {
  await client.chat('Hello');
} catch (err) {
  if (err instanceof MeshsAuthError) {
    console.error('Invalid API key');
  } else if (err instanceof MeshsRateLimitError) {
    console.error('Too many requests, slow down');
  } else if (err instanceof MeshsError) {
    console.error(`Meshs error: ${err.message} (HTTP ${err.status})`);
  }
}
```

## OpenAI SDK Compatibility

Already using `openai` npm package? Just change baseURL:

```js
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.meshs.one/v1',
  apiKey: 'your-api-key'
});
// All your existing code works!
```

## Models

| Model | Provider | Best for |
|:---|:---|:---|
| `gpt-5` | OpenAI | General purpose, math |
| `gpt-4o` | OpenAI | Balanced cost/quality |
| `claude-4-opus` | Anthropic | Long-form writing |
| `claude-4-sonnet` | Anthropic | Code generation |
| `gemini-2.5-pro` | Google | Translation, vision |
| `gemini-2.5-flash` | Google | Fast, cheap |
| `deepseek-r2` | DeepSeek | Math, reasoning |
| `deepseek-v3` | DeepSeek | Budget batch |
| `qwen-3` | Alibaba | Budget batch |
| `qwen-3-turbo` | Alibaba | Fast, cheapest |

## 📚 Tutorials

| Date | Tutorial | Blog | Code |
|:---|:---|:---|:---|
| 2026-06-24 | AI API Gateway Quickstart: One Key, 30+ Models in 5 Minutes | [blog.meshs.one](https://blog.meshs.one/posts/ai-api-gateway-quickstart-5-minutes/) | [examples/quickstart.js](examples/quickstart.js) · [smart-router.js](examples/smart-router.js) |

More tutorials coming soon. Have a use case to share? [Open an issue](https://github.com/Meshs-One/meshs-api-sdk/issues).

## License

MIT © [Meshs One](https://meshs.one)

---

[Get API Key](https://api.meshs.one/?ref=github) · [Blog](https://blog.meshs.one) · [X](https://x.com/Meshs_One)
