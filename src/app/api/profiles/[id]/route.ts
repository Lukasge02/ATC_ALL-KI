import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import AIProfile from '@/lib/models/AIProfile';
import { requireAuth } from '@/lib/auth';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().min(10).max(200).optional(),
  avatar: z.string().emoji().optional(),
  personality: z.object({
    tone: z.enum(['professional', 'casual', 'friendly', 'expert']).optional(),
    expertise: z.array(z.string()).max(10).optional(),
    interests: z.array(z.string()).max(10).optional(),
    responseStyle: z.enum(['concise', 'detailed', 'creative']).optional(),
  }).optional(),
  systemPrompt: z.string().min(20).optional(),
});

// GET /api/profiles/[id] - Get specific profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = requireAuth(request);
    await connectDB();

    const profile = await AIProfile.findOne({
      _id: id,
      userId: user.userId,
      isActive: true,
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: {
        id: profile._id,
        name: profile.name,
        description: profile.description,
        avatar: profile.avatar,
        category: profile.category,
        personality: profile.personality,
        systemPrompt: profile.systemPrompt,
        usage: profile.usage,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
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

// PUT /api/profiles/[id] - Update profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = requireAuth(request);
    await connectDB();

    const body = await request.json();
    const updateData = updateProfileSchema.parse(body);

    const profile = await AIProfile.findOneAndUpdate(
      {
        _id: id,
        userId: user.userId,
        isActive: true,
      },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profil erfolgreich aktualisiert',
      profile: {
        id: profile._id,
        name: profile.name,
        description: profile.description,
        avatar: profile.avatar,
        category: profile.category,
        personality: profile.personality,
        usage: profile.usage,
        updatedAt: profile.updatedAt,
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

    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// DELETE /api/profiles/[id] - Delete profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = requireAuth(request);
    await connectDB();

    const profile = await AIProfile.findOneAndUpdate(
      {
        _id: id,
        userId: user.userId,
        isActive: true,
      },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profil erfolgreich gelöscht',
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