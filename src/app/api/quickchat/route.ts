import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Nachricht ist erforderlich' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API-Schlüssel nicht konfiguriert' },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Du bist ein hilfreicher KI-Assistent von ALL-KI. Antworte auf Deutsch, sei freundlich und hilfsbereit. Halte deine Antworten präzise aber informativ."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('Keine Antwort von OpenAI erhalten');
    }

    return NextResponse.json({
      response,
      model: "gpt-3.5-turbo",
      usage: completion.usage,
    });

  } catch (error) {

    if (error instanceof Error) {
      // OpenAI API errors
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'API-Schlüssel ungültig' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'API-Kontingent erschöpft' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der Nachricht' },
      { status: 500 }
    );
  }
}