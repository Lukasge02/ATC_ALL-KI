import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import AIProfile from '@/lib/models/AIProfile';
import Conversation from '@/lib/models/Conversation';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/auth';
import { aiService } from '@/lib/openai';

const chatSchema = z.object({
  message: z.string().min(1, 'Nachricht darf nicht leer sein').max(4000),
  conversationId: z.string().optional(),
});

// POST /api/chat/[profileId] - Send message to AI
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;
  try {
    const user = requireAuth(request);
    await connectDB();

    const body = await request.json();
    const { message, conversationId } = chatSchema.parse(body);

    // Get AI profile
    const profile = await AIProfile.findOne({
      _id: profileId,
      userId: user.userId,
      isActive: true,
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'AI-Profil nicht gefunden' },
        { status: 404 }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId: user.userId,
        profileId: profileId,
      });

      if (!conversation) {
        return NextResponse.json(
          { error: 'Unterhaltung nicht gefunden' },
          { status: 404 }
        );
      }
    } else {
      // Create new conversation
      const title = await aiService.generateConversationTitle(message);
      conversation = await Conversation.create({
        userId: user.userId,
        profileId: profileId,
        title,
        messages: [],
        metadata: {
          totalTokens: 0,
          model: 'gpt-3.5-turbo',
          avgResponseTime: 0,
        },
      });
    }

    // Check user usage limits
    const userDoc = await User.findById(user.userId);
    if (!userDoc) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Basic rate limiting (can be enhanced with Redis)
    const today = new Date().toDateString();
    const lastReset = userDoc.usage.lastReset.toDateString();
    
    if (lastReset !== today) {
      // Reset daily usage
      userDoc.usage.requestsToday = 0;
      userDoc.usage.lastReset = new Date();
    }

    // Check daily limits (example limits)
    const dailyLimit = userDoc.subscription === 'free' ? 50 : 500;
    if (userDoc.usage.requestsToday >= dailyLimit) {
      return NextResponse.json(
        { error: 'Tägliches Limit erreicht. Bitte upgrade dein Abonnement.' },
        { status: 429 }
      );
    }

    // Add user message to conversation
    const userMessage = {
      _id: new mongoose.Types.ObjectId(),
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    };

    conversation.messages.push(userMessage);

    // Prepare messages for AI (last 10 messages for context)
    const recentMessages = conversation.messages
      .slice(-10)
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Get AI response
    const startTime = Date.now();
    const aiResponse = await aiService.chatCompletion(profile, recentMessages);
    
    // Add AI response to conversation
    const assistantMessage = {
      _id: new mongoose.Types.ObjectId(),
      role: 'assistant' as const,
      content: aiResponse.content,
      timestamp: new Date(),
      tokens: aiResponse.tokens,
      metadata: {
        model: aiResponse.model,
        finishReason: aiResponse.finishReason,
        responseTime: aiResponse.responseTime,
      },
    };

    conversation.messages.push(assistantMessage);

    // Update conversation metadata
    conversation.metadata.totalTokens += aiResponse.tokens;
    const responseCount = conversation.messages.filter((m: any) => m.role === 'assistant').length;
    conversation.metadata.avgResponseTime = (
      (conversation.metadata.avgResponseTime * (responseCount - 1) + aiResponse.responseTime) / 
      responseCount
    );

    await conversation.save();

    // Update user usage
    userDoc.usage.requestsToday += 1;
    userDoc.usage.tokensUsed += aiResponse.tokens;
    await userDoc.save();

    // Update profile usage
    profile.usage.totalChats += 1;
    profile.usage.totalTokens += aiResponse.tokens;
    profile.usage.lastUsed = new Date();
    await profile.save();

    return NextResponse.json({
      message: 'Nachricht erfolgreich gesendet',
      response: {
        content: aiResponse.content,
        conversationId: conversation._id,
        messageId: assistantMessage._id,
        tokens: aiResponse.tokens,
        model: aiResponse.model,
        responseTime: aiResponse.responseTime,
      },
      usage: {
        requestsToday: userDoc.usage.requestsToday,
        dailyLimit: dailyLimit,
        tokensUsed: aiResponse.tokens,
      },
    });

  } catch (error) {

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentifizierung erforderlich' },
        { status: 401 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten', details: error.errors },
        { status: 400 }
      );
    }

    // Handle OpenAI API errors
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json(
        { error: 'AI-Service temporär nicht verfügbar' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Interner Serverfehler',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}