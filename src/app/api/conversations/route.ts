import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/lib/models/Conversation';
import { requireAuth } from '@/lib/auth';

// GET /api/conversations - List user's conversations
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const query: any = {
      userId: user.userId,
      isArchived: false,
    };

    if (profileId) {
      query.profileId = profileId;
    }

    const conversations = await Conversation.find(query)
      .populate('profileId', 'name avatar category')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip(offset)
      .select('title messages metadata createdAt updatedAt');

    const conversationList = conversations.map(conv => ({
      id: conv._id,
      title: conv.title,
      profile: conv.profileId,
      lastMessage: conv.messages.length > 0 ? {
        content: conv.messages[conv.messages.length - 1].content,
        timestamp: conv.messages[conv.messages.length - 1].timestamp,
        role: conv.messages[conv.messages.length - 1].role,
      } : null,
      messageCount: conv.messages.length,
      totalTokens: conv.metadata.totalTokens,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));

    return NextResponse.json({
      conversations: conversationList,
      hasMore: conversations.length === limit,
    });

  } catch (error) {

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentifizierung erforderlich' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}