/**
 * Meshs One Quickstart — 5-minute setup
 * 
 * Prerequisites:
 *   1. Sign up at https://api.meshs.one/?utm_source=github&utm_medium=referral&utm_campaign=readme&utm_content=examples → get your API key
 *   2. npm install openai
 * 
 * Source: blog.meshs.one/posts/ai-api-gateway-quickstart-5-minutes/
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.MESHS_API_KEY || 'sk-meshs-...',
  baseURL: 'https://api.meshs.one/v1', // ← One line, all models
});

async function main() {
  // Basic chat — Claude Sonnet
  const response = await client.chat.completions.create({
    model: 'claude-4-sonnet',
    messages: [
      { role: 'user', content: 'Explain quantum computing in one sentence.' },
    ],
  });

  console.log('[Claude Sonnet]', response.choices[0].message.content);
}

main().catch(console.error);
