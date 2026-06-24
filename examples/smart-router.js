/**
 * Smart Model Router — Automatically choose the best model for each task.
 * 
 * Demonstrates a 3-step agent workflow:
 *   1. Classify intent with a cheap model
 *   2. Route to the best model for that task
 *   3. Fallback handled server-side by api.meshs.one
 * 
 * Source: blog.meshs.one/posts/ai-api-gateway-quickstart-5-minutes/
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.MESHS_API_KEY || 'sk-meshs-...',
  baseURL: 'https://api.meshs.one/v1',
});

async function classifyIntent(input) {
  const result = await client.chat.completions.create({
    model: 'gpt-4.1-mini', // Fast and cheap
    messages: [{ role: 'user', content: `Classify this intent: "${input}". Reply with ONE word.` }],
  });
  return result.choices[0].message.content.toLowerCase().trim();
}

function pickModel(intent) {
  const routes = {
    code: 'claude-4-sonnet',
    creative: 'claude-4-opus',
    math: 'deepseek-r2',
    translate: 'gemini-2.5-pro',
  };

  for (const [keyword, model] of Object.entries(routes)) {
    if (intent.includes(keyword)) return model;
  }
  return 'gpt-5'; // default
}

async function smartAgent(userInput) {
  console.log(`🧠 Input: "${userInput}"`);

  const intent = await classifyIntent(userInput);
  const model = pickModel(intent);

  console.log(`🔀 Intent: ${intent} → Routing to ${model}`);

  const result = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: userInput }],
  });

  console.log(`✅ [${model}]`, result.choices[0].message.content);
}

// Example usage
smartAgent('Write a Python function to sort a list of dicts by value');
smartAgent('Translate "hello world" to Japanese');
