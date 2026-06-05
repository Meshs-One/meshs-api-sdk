# 🛠️ Meshs One API SDK

> **One API key. All top AI models.** OpenAI-compatible. No geo-blocking. No rate limits.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why Meshs One?

- 🎯 **30+ models, one API key** — GPT-5, Claude 4, Gemini 2.5, DeepSeek R2, Qwen 3
- 💰 **80% cheaper** than official API pricing
- ⚡ **< 200ms latency** via global edge nodes (Singapore, Tokyo, US, EU)
- 🔄 **OpenAI SDK compatible** — swap `base_url`, zero code changes
- 🛡️ **99.9% uptime** with automatic model fallback

## Quick Start

```bash
npm install meshs-one-api
```

```javascript
import { MeshsOne } from 'meshs-one-api';

const client = new MeshsOne({
  apiKey: 'your-api-key'
});

// Use GPT-5
const gptResponse = await client.chat.completions.create({
  model: 'gpt-5',
  messages: [{ role: 'user', content: 'Explain quantum computing in 3 sentences.' }]
});

// Switch to Claude — same syntax
const claudeResponse = await client.chat.completions.create({
  model: 'claude-4-opus',
  messages: [{ role: 'user', content: 'Write a poem about APIs.' }]
});
```

## OpenAI SDK Compatibility

Already using the OpenAI SDK? Just change the `baseURL`:

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.meshs.one/v1',
  apiKey: 'your-api-key'
});

// All your existing code works!
```

## Supported Models

| Model | Category | Input / 1M tokens | Output / 1M tokens |
|:---|:---|:---|:---|
| GPT-5 | OpenAI | $2.50 | $10.00 |
| Claude 4 Opus | Anthropic | $3.00 | $15.00 |
| Claude 4 Sonnet | Anthropic | $1.50 | $7.50 |
| Gemini 2.5 Pro | Google | $1.25 | $5.00 |
| DeepSeek R2 | DeepSeek | $0.27 | $1.10 |
| Qwen 3 72B | Alibaba | $0.15 | $0.60 |

*Prices via api.meshs.one gateway. Official prices are typically 3-5x higher.*

## Documentation

- 📖 Full API Reference: [docs.meshs.one](https://docs.meshs.one) (coming soon)
- 📝 Blog: [blog.meshs.one](https://blog.meshs.one)
- 🐦 Updates: [@Meshs_One](https://x.com/Meshs_One)

## Get Your API Key

👉 Sign up at [api.meshs.one](https://api.meshs.one) — **$5 free credit**, no credit card required.

---

Made with ❤️ by [Meshs One](https://meshs.one) | Hong Kong 🇭🇰
