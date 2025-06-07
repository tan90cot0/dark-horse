import { LLMProvider, LLMRequestOptions, LLMResponse } from './types';
import { MistralAPI } from './mistralAPI';

// Factory for creating different LLM providers
class LLMService {
  private provider: LLMProvider;
  private static instance: LLMService;

  private constructor(provider: LLMProvider) {
    this.provider = provider;
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      // Default to Mistral
      const mistralAPI = new MistralAPI();
      LLMService.instance = new LLMService(mistralAPI);
    }
    return LLMService.instance;
  }

  public static initialize(provider: LLMProvider): void {
    LLMService.instance = new LLMService(provider);
  }

  public async generateResponse(
    prompt: string,
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    return this.provider.generateResponse(prompt, options);
  }

  // Method to change provider at runtime
  public setProvider(provider: LLMProvider): void {
    this.provider = provider;
  }
}

export default LLMService;