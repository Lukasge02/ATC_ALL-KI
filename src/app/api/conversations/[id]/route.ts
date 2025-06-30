import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/lib/models/Conversation';
import { requireAuth } from '@/lib/auth';

// GET /api/conversations/[id] - Get specific conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = requireAuth(request);
    await connectDB();

    const conversation = await Conversation.findOne({
      _id: id,
      userId: user.userId,
    }).populate('profileId', 'name avatar category personality');

    if (!conversation) {
      return NextResponse.json(
        { error: 'Unterhaltung nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      conversation: {
        id: conversation._id,
        title: conversation.title,
        profile: conversation.profileId,
        messages: conversation.messages.map((msg: any) => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          tokens: msg.tokens,
          metadata: msg.metadata,
        })),
        metadata: conversation.metadata,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
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

// DELETE /api/conversations/[id] - Delete conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = requireAuth(request);
    await connectDB();

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: id,
        userId: user.userId,
      },
      { isArchived: true, updatedAt: new Date() },
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json(
        { error: 'Unterhaltung nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Unterhaltung erfolgreich gelöscht',
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