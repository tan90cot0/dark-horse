import LLMService from './llm/index';

export interface SurpriseContent {
  question: string;
  celebrationTitle: string;
  celebrationMessage: string;
  questionGif: string;
  celebrationGif: string;
}

// Curated list of romantic/cute GIFs for questions
const questionGifs = [
  'https://media.giphy.com/media/FTGah7Mx3ss04PcasF/giphy.gif',
  'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
  'https://media.giphy.com/media/3oKIPgvPwXi2ZAIS5O/giphy.gif',
  'https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif',
  'https://media.giphy.com/media/l1J9wXoC8W4JFmREY/giphy.gif'
];

// Curated list of celebration GIFs
const celebrationGifs = [
  'https://media.giphy.com/media/UMon0fuimoAN9ueUNP/giphy.gif',
  'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
  'https://media.giphy.com/media/3o6Zt7g9nH1nFGeBcQ/giphy.gif',
  'https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif',
  'https://media.giphy.com/media/l0MYJnJQ4EiYLxvQ4/giphy.gif'
];

class SurpriseService {
  private llmService = LLMService.getInstance();

  async generateSurpriseContent(): Promise<SurpriseContent> {
    try {
      const prompt = `Generate a cute, romantic, and playful question that someone would ask their crush or girlfriend. The question should be sweet, adorable, and make her smile. It could be about dating, being together, or spending time together. Think of it like a cute proposal or asking someone out.

Also generate a celebration message for when she says "Yes!" - it should be sweet, romantic, and express happiness about being together.

Format your response as JSON with this structure:
{
  "question": "Your cute romantic question here",
  "celebrationTitle": "Short celebratory title",
  "celebrationMessage": "Longer celebration message about being together"
}

Make it different each time - be creative! Examples could be about:
- Will you be my girlfriend?
- Want to go on adventures together?
- Will you be mine forever?
- Can I be your boyfriend?
- Want to make beautiful memories together?
- Will you let me love you forever?
- Can we be each other's forever person?

Keep it sweet, romantic, and genuinely cute - like something that would make a girl's heart melt!`;

      const response = await this.llmService.generateResponse(prompt, {
        temperature: 0.9, // High creativity
        maxTokens: 500,
        systemPrompt: "You are a hopeless romantic who writes the sweetest, most heartfelt proposals and romantic messages. You specialize in cute, genuine romantic content that makes hearts flutter."
      });

      let content;
      try {
        content = JSON.parse(response.content);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        console.warn('Failed to parse AI response, using fallback content');
        content = this.getFallbackContent();
      }

      return {
        question: content.question,
        celebrationTitle: content.celebrationTitle,
        celebrationMessage: content.celebrationMessage,
        questionGif: this.getRandomGif(questionGifs),
        celebrationGif: this.getRandomGif(celebrationGifs)
      };
    } catch (error) {
      console.error('Error generating surprise content:', error);
      return this.getFallbackContent();
    }
  }

  private getFallbackContent(): SurpriseContent {
    const fallbackQuestions = [
      "Will you be my girlfriend forever? 💕",
      "Can I be the one who makes you smile every day?",
      "Will you let me love you with all my heart?",
      "Want to create beautiful memories together?",
      "Can we be each other's forever person?",
      "Will you be mine, today and always?",
      "Want to go on adventures together, hand in hand?"
    ];

    const fallbackTitles = [
      "Yay! You made my heart so happy! 💖",
      "I'm the luckiest person in the world! ✨",
      "You just made all my dreams come true! 🌟",
      "My heart is bursting with joy! 💕",
      "This is the best day ever! 🎉",
      "You're my everything! 💝",
      "Forever and always, it's you and me! 💞"
    ];

    const fallbackMessages = [
      "I promise to make you smile every single day, hold your hand through everything, and love you more than words can say! 💕",
      "You're my sunshine, my happiness, and my heart's greatest treasure. Here's to our beautiful forever! ✨",
      "Every moment with you feels like a fairytale. I can't wait to write our love story together! 📖💕",
      "You make my world brighter, my heart fuller, and my life complete. I love you endlessly! 🌟",
      "Thank you for saying yes to being mine! I promise to cherish you, love you, and make you happy always! 💖",
      "You're my person, my heart, my everything. Ready for a lifetime of love and laughter together! 😊💕"
    ];

    return {
      question: this.getRandomItem(fallbackQuestions),
      celebrationTitle: this.getRandomItem(fallbackTitles),
      celebrationMessage: this.getRandomItem(fallbackMessages),
      questionGif: this.getRandomGif(questionGifs),
      celebrationGif: this.getRandomGif(celebrationGifs)
    };
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomGif(gifs: string[]): string {
    return this.getRandomItem(gifs);
  }
}

export default new SurpriseService(); 