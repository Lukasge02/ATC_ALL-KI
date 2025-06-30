import mongoose, { Document, Schema } from 'mongoose';

export interface IAIProfile extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  avatar: string;
  category: 'developer' | 'student' | 'business' | 'creative' | 'personal' | 'general';
  personality: {
    tone: 'professional' | 'casual' | 'friendly' | 'expert';
    expertise: string[];
    interests: string[];
    responseStyle: 'concise' | 'detailed' | 'creative';
  };
  systemPrompt: string;
  isActive: boolean;
  usage: {
    totalChats: number;
    totalTokens: number;
    lastUsed: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AIProfileSchema = new Schema<IAIProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  avatar: {
    type: String,
    required: true,
    default: '🤖'
  },
  category: {
    type: String,
    enum: ['developer', 'student', 'business', 'creative', 'personal', 'general'],
    required: true
  },
  personality: {
    tone: {
      type: String,
      enum: ['professional', 'casual', 'friendly', 'expert'],
      default: 'friendly'
    },
    expertise: [{
      type: String,
      trim: true
    }],
    interests: [{
      type: String,
      trim: true
    }],
    responseStyle: {
      type: String,
      enum: ['concise', 'detailed', 'creative'],
      default: 'detailed'
    }
  },
  systemPrompt: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usage: {
    totalChats: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
AIProfileSchema.index({ userId: 1, isActive: 1 });
AIProfileSchema.index({ category: 1 });
AIProfileSchema.index({ 'usage.lastUsed': -1 });

export default mongoose.models.AIProfile || mongoose.model<IAIProfile>('AIProfile', AIProfileSchema);