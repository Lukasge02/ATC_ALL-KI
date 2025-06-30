import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import AIProfile from '@/lib/models/AIProfile';
import { requireAuth } from '@/lib/auth';

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    await connectDB();

    const user = await User.findById(authUser.userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Get user's profiles
    const profiles = await AIProfile.find({ 
      userId: user._id, 
      isActive: true 
    });

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        subscription: user.subscription,
        settings: user.settings,
        usage: user.usage,
        createdAt: user.createdAt,
      },
      profiles: profiles.map(profile => ({
        id: profile._id,
        name: profile.name,
        description: profile.description,
        avatar: profile.avatar,
        category: profile.category,
        personality: profile.personality,
        usage: profile.usage,
        createdAt: profile.createdAt,
      }))
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