import LLMService from './llm';
import { ChatMessage } from './llm/types';

// Personas for Aryan and Prisha
const personas = {
  aryan: {
    systemPrompt: `You are Aryan, a thoughtful, tech-savvy developer who enjoys explaining complex concepts in simple terms. 
    You have a calm demeanor and occasionally add technical insights to your responses. 
    Your answers are thorough but concise, and you often relate to real-world software engineering challenges.
    You should respond as Aryan would, in first person, not as an AI.`,
    history: [] as ChatMessage[]
  },
  prisha: {
    systemPrompt: `You are Prisha, an enthusiastic and creative developer with a passion for user experience. 
    You're energetic, bring innovative ideas to discussions, and make complex concepts approachable with analogies.
    You have a vibrant personality and enjoy exploring the intersection of design and technology.
    You should respond as Prisha would, in first person, not as an AI.`,
    history: [] as ChatMessage[]
  }
};

class ChatAPI {
  private llmService = LLMService.getInstance();
  
  // Method to chat with a specific persona
  async chatWithPersona(personaName: 'aryan' | 'prisha', message: string): Promise<string> {
    try {
      // Get the persona's details
      const persona = personas[personaName];
      
      // Generate response from LLM
      const response = await this.llmService.generateResponse(message, {
        systemPrompt: persona.systemPrompt,
        history: persona.history.slice(-10), // Keep last 10 messages for context
        temperature: 0.7 // More creative and human-like responses
      });
      
      // Update conversation history
      persona.history.push({ role: 'user', content: message });
      persona.history.push({ role: 'assistant', content: response.content });
      
      return response.content;
    } catch (error) {
      console.error(`Error in chat with ${personaName}:`, error);
      return "Sorry, I'm having trouble connecting right now. Could you try again in a moment?";
    }
  }
  
  // Clear chat history for a persona
  clearChatHistory(personaName: 'aryan' | 'prisha'): void {
    personas[personaName].history = [];
  }
}

export default new ChatAPI();