import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Temporary in-memory storage for development
let inMemoryProfiles: any[] = [];

const createProfileSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein').max(50),
  description: z.string().min(10, 'Beschreibung muss mindestens 10 Zeichen lang sein').max(200),
  avatar: z.string().optional(),
  category: z.enum(['developer', 'student', 'business', 'creative', 'personal', 'general']),
  personality: z.object({
    tone: z.enum(['professional', 'casual', 'friendly', 'expert']),
    expertise: z.array(z.string()).max(10),
    interests: z.array(z.string()).max(10),
    responseStyle: z.enum(['concise', 'detailed', 'creative']),
  }),
  systemPrompt: z.string().min(20, 'System-Prompt muss mindestens 20 Zeichen lang sein'),
});

// GET /api/profiles - List user's AI profiles
export async function GET(request: NextRequest) {
  try {
    // Development mode: use dummy user
    const user = { userId: 'dev-user-123', email: 'dev@example.com' };
    
    // Use in-memory storage for development
    const profiles = inMemoryProfiles.filter(p => p.userId === user.userId && p.isActive);

    return NextResponse.json({
      profiles: profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        description: profile.description,
        avatar: profile.avatar,
        category: profile.category,
        personality: profile.personality,
        usage: profile.usage,
        createdAt: profile.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// POST /api/profiles - Create new AI profile
export async function POST(request: NextRequest) {
  try {
    // Development mode: use dummy user
    const user = { userId: 'dev-user-123', email: 'dev@example.com' };

    const body = await request.json();
    const profileData = createProfileSchema.parse(body);
    
    // Create profile in memory for development
    const newProfile = {
      id: `profile-${Date.now()}`,
      userId: user.userId,
      name: profileData.name,
      description: profileData.description,
      avatar: profileData.avatar || '🤖',
      category: profileData.category,
      personality: profileData.personality,
      usage: {
        totalChats: 0,
        totalTokens: 0,
        lastUsed: null
      },
      isActive: true,
      createdAt: new Date(),
    };
    
    // Store in memory
    inMemoryProfiles.push(newProfile);

    return NextResponse.json(
      {
        message: 'Profil erfolgreich erstellt',
        profile: newProfile,
      },
      { status: 201 }
    );
  } catch (error) {

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