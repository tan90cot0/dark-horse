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
      const prompt = `Generate a fun, romantic, and playful question for a coding partnership website. The question should be about collaboration, coding together, or building something amazing together. It should be sweet but not overly cheesy. 

Also generate a celebration message for when they say "Yes!" - it should be enthusiastic and mention coding adventures, late-night debugging sessions, or building amazing projects together.

Format your response as JSON with this structure:
{
  "question": "Your fun question here",
  "celebrationTitle": "Short celebratory title",
  "celebrationMessage": "Longer celebration message about coding together"
}

Make it different each time - be creative! Examples could be about:
- Building the next big thing together
- Debugging life's challenges as a team
- Creating amazing projects side by side
- Being coding companions forever
- Solving algorithms of the heart together

Keep it fun, sweet, and coding-themed!`;

      const response = await this.llmService.generateResponse(prompt, {
        temperature: 0.9, // High creativity
        maxTokens: 500,
        systemPrompt: "You are a creative writer who specializes in romantic, tech-themed content. You write fun, playful, and sweet messages for couples who code together."
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
      "Will you be my coding partner forever?",
      "Want to debug life's challenges together?",
      "Ready to commit to our repository of love?",
      "Shall we merge our coding dreams together?",
      "Want to build the next big thing as a team?"
    ];

    const fallbackTitles = [
      "Yay! Let's keep building amazing things together! 🎉",
      "Perfect! Our coding journey continues! 💻✨",
      "Awesome! Ready for more coding adventures! 🚀",
      "Yes! Time to build something incredible! ⭐",
      "Fantastic! Our partnership is now officially merged! 🔀"
    ];

    const fallbackMessages = [
      "Here's to many more coding adventures, late-night debugging sessions, and celebrating every small victory together! 💻✨",
      "From algorithms to UI designs, from bugs to features - we'll tackle them all side by side! 🐛➡️✨",
      "Ready for endless commits, pull requests, and the occasional merge conflict... but mostly lots of fun! 🎯",
      "Let's write the most beautiful code together and create digital magic that changes the world! 🌟",
      "Time to turn coffee into code and dreams into reality - our partnership is the best framework ever! ☕➡️🚀"
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