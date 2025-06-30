import OpenAI from 'openai';
import { IAIProfile } from './models/AIProfile';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  tokens: number;
  model: string;
  finishReason: string;
  responseTime: number;
}

export class AIService {
  /**
   * Generate a system prompt based on AI profile
   */
  private buildSystemPrompt(profile: IAIProfile): string {
    try {
      const toneDescription = profile.personality.tone === 'professional' ? 'professionell und sachlich' : 
                             profile.personality.tone === 'casual' ? 'locker und entspannt' :
                             profile.personality.tone === 'friendly' ? 'freundlich und hilfsbereit' : 'expertenhaft und präzise';
      
      const styleDescription = profile.personality.responseStyle === 'concise' ? 'Halte Antworten kurz und prägnant' :
                               profile.personality.responseStyle === 'detailed' ? 'Gib ausführliche und detaillierte Antworten' :
                               'Sei kreativ und inspirierend in deinen Antworten';

      const basePrompt = `Du bist ${profile.name}, ein spezialisierter KI-Assistent.\n\nPERSÖNLICHKEIT:\n- Ton: ${profile.personality.tone}\n- Antwort-Stil: ${profile.personality.responseStyle}\n- Expertise: ${profile.personality.expertise.join(', ')}\n- Interessen: ${profile.personality.interests.join(', ')}\n\nVERHALTEN:\n- Antworte immer in deutscher Sprache\n- Sei ${toneDescription}\n- ${styleDescription}\n\nZUSÄTZLICHE ANWEISUNGEN:\n${profile.systemPrompt}\n\nBeginne jetzt als ${profile.name} zu agieren!`;

      return basePrompt;
    } catch (error) {
      return `Du bist ${profile.name}, ein freundlicher KI-Assistent. Antworte immer in deutscher Sprache.`;
    }
  }

  /**
   * Send a chat message to OpenAI
   */
  async chatCompletion(
    profile: IAIProfile,
    messages: ChatMessage[],
    stream: boolean = false
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    
    const systemPrompt = this.buildSystemPrompt(profile);
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: this.getTemperature(profile.personality.responseStyle),
        max_tokens: 1000,
        stream: stream
      });

      if (stream) {
        // Handle streaming response (will be implemented in streaming endpoint)
        throw new Error('Streaming not implemented in this method');
      }

      const responseTime = Date.now() - startTime;
      const response = (completion as any).choices[0];

      return {
        content: response.message?.content || '',
        tokens: (completion as any).usage?.total_tokens || 0,
        model: (completion as any).model,
        finishReason: response.finish_reason || 'stop',
        responseTime
      };
    } catch (error) {
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Create streaming chat completion
   */
  async createStreamingCompletion(
    profile: IAIProfile,
    messages: ChatMessage[]
  ) {
    const systemPrompt = this.buildSystemPrompt(profile);

    return await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: this.getTemperature(profile.personality.responseStyle),
      max_tokens: 1000,
      stream: true
    });
  }

  /**
   * Generate AI profile suggestions based on user interview
   */
  async generateProfileSuggestions(userResponses: Array<{question: string, answer: string}>) {
    const prompt = `Basierend auf diesen Benutzer-Antworten, erstelle einen perfekten KI-Assistenten:

ANTWORTEN:
${userResponses.map(r => `${r.question}: ${r.answer}`).join('\n')}

Erstelle ein JSON-Objekt mit:
1. name: Ein passender Name für den KI-Assistenten
2. description: Kurze Beschreibung (max 200 Zeichen)
3. category: Eine von [developer, student, business, creative, personal]
4. personality: { tone, expertise, interests, responseStyle }
5. systemPrompt: Detaillierte Anweisungen für den KI-Assistenten
6. avatar: Ein passendes Emoji

Antworte nur mit gültigem JSON.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 800
      });

      const response = completion.choices[0].message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }
      
      // Clean the response to ensure valid JSON
      const cleanedResponse = response.trim().replace(/```json|```/g, '');
      return JSON.parse(cleanedResponse);
    } catch (error) {
      throw new Error('Failed to generate profile suggestions');
    }
  }

  /**
   * Generate conversation title
   */
  async generateConversationTitle(firstMessage: string): Promise<string> {
    const prompt = `Erstelle einen kurzen, prägnanten Titel (max 50 Zeichen) für eine Konversation, die mit dieser Nachricht beginnt:

"${firstMessage}"

Antworte nur mit dem Titel, ohne Anführungszeichen.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 50
      });

      return completion.choices[0].message?.content?.trim() || 'Neue Unterhaltung';
    } catch (error) {
      return 'Neue Unterhaltung';
    }
  }

  /**
   * Get temperature based on response style
   */
  private getTemperature(responseStyle: string): number {
    switch (responseStyle) {
      case 'creative':
        return 0.9;
      case 'detailed':
        return 0.7;
      case 'concise':
        return 0.3;
      default:
        return 0.7;
    }
  }
}

export const aiService = new AIService();