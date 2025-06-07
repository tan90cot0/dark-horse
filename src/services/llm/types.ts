// Common interface for all LLM providers
export interface LLMProvider {
    generateResponse: (
      prompt: string, 
      options?: LLMRequestOptions
    ) => Promise<LLMResponse>;
  }
  
  // Chat message format (similar to OpenAI)
  export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }
  
  // Generic request options
  export interface LLMRequestOptions {
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
    systemPrompt?: string;
    history?: ChatMessage[];
    persona?: string;
  }
  
  // Generic response structure
  export interface LLMResponse {
    content: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    finishReason?: string;
    raw?: any; // Original response from the provider
  }