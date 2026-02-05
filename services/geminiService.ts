
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;
  private chatInstance: Chat | null = null;

  constructor() {
    // Fix: Use named parameter for apiKey and use process.env.API_KEY directly
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async startNewChat() {
    this.chatInstance = this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
  }

  async sendMessage(message: string, imagesBase64?: string[]) {
    if (!this.chatInstance) {
      await this.startNewChat();
    }

    if (imagesBase64 && imagesBase64.length > 0) {
      const parts: any[] = [{ text: message }];
      imagesBase64.forEach(base64 => {
        parts.push({ inlineData: { mimeType: 'image/png', data: base64 } });
      });
      
      // Fix: Use the correct object structure for multimodal generateContent call
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts },
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      // Fix: Access .text property directly
      return response.text || '';
    }

    const response: GenerateContentResponse = await this.chatInstance!.sendMessage({
      message: message
    });
    // Fix: Access .text property directly
    return response.text || '';
  }

  async *sendMessageStream(message: string, imagesBase64?: string[]) {
    if (!this.chatInstance) {
      await this.startNewChat();
    }

    if (imagesBase64 && imagesBase64.length > 0) {
        const parts: any[] = [{ text: message }];
        imagesBase64.forEach(base64 => {
          parts.push({ inlineData: { mimeType: 'image/png', data: base64 } });
        });

        // Fix: Use the correct object structure for multimodal generateContentStream call
        const stream = await this.ai.models.generateContentStream({
            model: 'gemini-3-pro-preview',
            contents: { parts },
            config: { systemInstruction: SYSTEM_INSTRUCTION }
        });
        for await (const chunk of stream) {
            // Fix: Access .text property directly from the chunk
            yield chunk.text || '';
        }
    } else {
        const stream = await this.chatInstance!.sendMessageStream({
            message: message
        });
        for await (const chunk of stream) {
            const c = chunk as GenerateContentResponse;
            // Fix: Access .text property directly from the chunk
            yield c.text || '';
        }
    }
  }
}

export const geminiService = new GeminiService();
