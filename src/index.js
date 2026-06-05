/**
 * Meshs One — Official Node.js SDK
 *
 * One API key. 30+ AI models. OpenAI-compatible.
 *
 * @example
 * ```js
 * const MeshsOne = require('meshs-one');
 * const client = new MeshsOne({ apiKey: 'sk-xxx' });
 *
 * const reply = await client.chat('What is AI?');
 * console.log(reply);
 * ```
 *
 * @license MIT
 * @see https://api.meshs.one
 */

const https = require('https');
const http = require('http');

// ─── Models Registry ──────────────────────────────────────────────
const KNOWN_MODELS = [
  'claude-4-opus',
  'claude-4-sonnet',
  'gpt-5',
  'gpt-4o',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'deepseek-r2',
  'deepseek-v3',
  'qwen-3',
  'qwen-3-turbo',
];

const DEFAULT_MODEL = 'gpt-4o';
const BASE_URL = 'api.meshs.one';

// ─── Errors ───────────────────────────────────────────────────────
class MeshsError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'MeshsError';
    this.status = status;
    this.body = body;
  }
}

class MeshsAuthError extends MeshsError {
  constructor(body) {
    super('Authentication failed. Check your API key.', 401, body);
    this.name = 'MeshsAuthError';
  }
}

class MeshsRateLimitError extends MeshsError {
  constructor(body) {
    super('Rate limit exceeded. Slow down.', 429, body);
    this.name = 'MeshsRateLimitError';
  }
}

// ─── Retry Logic ──────────────────────────────────────────────────
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(fn, { maxRetries = 3, baseDelay = 1000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Don't retry auth errors
      if (err instanceof MeshsAuthError) throw err;
      if (attempt === maxRetries) throw err;
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  throw lastError;
}

// ─── HTTP Client ──────────────────────────────────────────────────
function makeRequest(path, { method = 'POST', headers = {}, body = null, timeout = 60000 } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://${BASE_URL}${path}`);
    const isHttps = url.protocol === 'https:';
    const transport = isHttps ? https : http;

    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (body) reqHeaders['Content-Length'] = Buffer.byteLength(body);

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: reqHeaders,
      timeout,
    };

    const req = transport.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { raw };
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data, headers: res.headers });
          return;
        }

        const msg = data.error?.message || data.message || `HTTP ${res.statusCode}`;

        if (res.statusCode === 401) reject(new MeshsAuthError(data));
        else if (res.statusCode === 429) reject(new MeshsRateLimitError(data));
        else reject(new MeshsError(msg, res.statusCode, data));
      });
    });

    req.on('error', (err) => {
      reject(new MeshsError(`Network error: ${err.message}`, 0, null));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new MeshsError('Request timed out', 0, null));
    });

    if (body) req.write(body);
    req.end();
  });
}

// ─── Streaming ────────────────────────────────────────────────────
async function* streamRequest(path, { method = 'POST', headers = {}, body = null, timeout = 120000 } = {}) {
  const url = new URL(`https://${BASE_URL}${path}`);
  const transport = url.protocol === 'https:' ? https : http;

  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (body) reqHeaders['Content-Length'] = Buffer.byteLength(body);

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method,
    headers: reqHeaders,
    timeout,
  };

  let buffer = '';
  let finished = false;

  await new Promise((resolve, reject) => {
    const req = transport.request(options, (res) => {
      if (res.statusCode >= 400) {
        let errBody = '';
        res.on('data', (chunk) => (errBody += chunk.toString()));
        res.on('end', () => reject(new MeshsError(`HTTP ${res.statusCode}`, res.statusCode, errBody)));
        return;
      }

      res.on('data', (chunk) => {
        buffer += chunk.toString();
      });

      res.on('end', () => {
        finished = true;
        resolve();
      });

      res.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new MeshsError('Stream timed out', 0, null));
    });

    if (body) req.write(body);
    req.end();
  });

  // Parse SSE stream from buffer
  const lines = buffer.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') return;
      try {
        const parsed = JSON.parse(payload);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // skip unparseable lines
      }
    }
  }
}

// ─── Client ────────────────────────────────────────────────────────
class MeshsOne {
  /**
   * @param {Object} options
   * @param {string} options.apiKey - Your Meshs One API key
   * @param {string} [options.baseUrl] - Override API base URL
   * @param {number} [options.timeout=60000] - Request timeout in ms
   * @param {number} [options.maxRetries=3] - Auto-retry count
   */
  constructor({ apiKey, baseUrl, timeout = 60000, maxRetries = 3 } = {}) {
    if (!apiKey) throw new MeshsError('apiKey is required. Get one at https://api.meshs.one', 0, null);
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || BASE_URL;
    this.timeout = timeout;
    this.maxRetries = maxRetries;
  }

  /**
   * Send a chat completion request.
   * @param {string|Array} messages - User message string, or array of {role, content}
   * @param {Object} [options]
   * @param {string} [options.model='gpt-4o'] - Model name
   * @param {number} [options.maxTokens] - Max output tokens
   * @param {number} [options.temperature=0.7] - Creativity (0-2)
   * @param {boolean} [options.stream=false] - Stream response
   * @returns {Promise<string|Object|AsyncGenerator>}
   */
  async chat(messages, options = {}) {
    const { model = DEFAULT_MODEL, maxTokens, temperature = 0.7, stream = false } = options;

    if (typeof messages === 'string') {
      messages = [{ role: 'user', content: messages }];
    }

    const body = {
      model,
      messages,
      temperature,
      ...(maxTokens && { max_tokens: maxTokens }),
      ...(stream && { stream: true }),
    };

    if (stream) {
      return streamRequest('/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify(body),
        timeout: this.timeout * 2,
      });
    }

    const result = await withRetry(
      () =>
        makeRequest('/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.apiKey}` },
          body: JSON.stringify(body),
          timeout: this.timeout,
        }),
      { maxRetries: this.maxRetries }
    );

    return result.data.choices?.[0]?.message?.content || result.data;
  }

  /**
   * List available models.
   * @returns {Promise<Array<{id: string, owned_by: string}>>}
   */
  async listModels() {
    const result = await makeRequest('/v1/models', {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      timeout: this.timeout,
    });
    return result.data.data || result.data;
  }

  /**
   * Get models that are currently available (from known registry).
   * @returns {string[]}
   */
  getKnownModels() {
    return [...KNOWN_MODELS];
  }

  /**
   * Quick check: is the API key valid?
   * @returns {Promise<boolean>}
   */
  async ping() {
    try {
      await makeRequest('/v1/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        timeout: 10000,
      });
      return true;
    } catch {
      return false;
    }
  }
}

// ─── Exports ──────────────────────────────────────────────────────
MeshesOne.MeshsError = MeshsError;
MeshesOne.MeshsAuthError = MeshsAuthError;
MeshesOne.MeshsRateLimitError = MeshsRateLimitError;
MeshesOne.KNOWN_MODELS = KNOWN_MODELS;
MeshesOne.DEFAULT_MODEL = DEFAULT_MODEL;

module.exports = MeshsOne;
