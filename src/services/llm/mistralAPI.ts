import { LLMProvider, LLMRequestOptions, LLMResponse, ChatMessage } from './types';

// Mistral API implementation
export class MistralAPI implements LLMProvider {
  private apiKey: string;
  private apiUrl: string;
  private defaultModel: string;

  constructor(
    apiKey: string = import.meta.env.VITE_MISTRAL_API_KEY as string,
    apiUrl: string = 'https://api.mistral.ai/v1/chat/completions',
    defaultModel: string = 'mistral-medium'
  ) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.defaultModel = defaultModel;
  }

  async generateResponse(
    prompt: string,
    options: LLMRequestOptions = {}
  ): Promise<LLMResponse> {
    try {
      const messages: ChatMessage[] = [];
      
      // Add system prompt if provided
      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        });
      }
      
      // Add persona-specific system prompt if provided
      if (options.persona) {
        messages.push({
          role: 'system',
          content: `You are ${options.persona}. Respond in a style and with knowledge consistent with this persona.`
        });
      }
      
      // Add conversation history if provided
      if (options.history && options.history.length > 0) {
        messages.push(...options.history);
      }
      
      // Add the current user message
      messages.push({
        role: 'user',
        content: prompt
      });
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2048,
          stop: options.stopSequences
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Mistral API Error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        },
        finishReason: data.choices[0].finish_reason,
        raw: data
      };
    } catch (error) {
      console.error('Error calling Mistral API:', error);
      throw error;
    }
  }
}