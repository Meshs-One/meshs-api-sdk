declare module 'meshs-one' {
  interface MeshsOptions {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
    maxRetries?: number;
  }

  interface ChatOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
  }

  interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  interface ModelInfo {
    id: string;
    owned_by: string;
  }

  class MeshsError extends Error {
    name: 'MeshsError';
    status: number;
    body: any;
  }

  class MeshsAuthError extends MeshsError {
    name: 'MeshsAuthError';
  }

  class MeshsRateLimitError extends MeshsError {
    name: 'MeshsRateLimitError';
  }

  class MeshsOne {
    static MeshsError: typeof MeshsError;
    static MeshsAuthError: typeof MeshsAuthError;
    static MeshsRateLimitError: typeof MeshsRateLimitError;
    static KNOWN_MODELS: string[];
    static DEFAULT_MODEL: string;

    constructor(options: MeshsOptions);

    chat(messages: string | Message[], options?: ChatOptions): Promise<string>;
    chat(messages: string | Message[], options: ChatOptions & { stream: true }): AsyncGenerator<string>;

    listModels(): Promise<ModelInfo[]>;
    getKnownModels(): string[];
    ping(): Promise<boolean>;
  }

  export = MeshsOne;
}
