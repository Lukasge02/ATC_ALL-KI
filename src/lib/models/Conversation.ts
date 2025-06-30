import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens?: number;
  metadata?: {
    model?: string;
    finishReason?: string;
    responseTime?: number;
  };
}

export interface IConversation extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  profileId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  metadata: {
    totalTokens: number;
    model: string;
    avgResponseTime: number;
  };
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  tokens: {
    type: Number,
    default: 0
  },
  metadata: {
    model: String,
    finishReason: String,
    responseTime: Number
  }
});

const ConversationSchema = new Schema<IConversation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  profileId: {
    type: Schema.Types.ObjectId,
    ref: 'AIProfile',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  messages: [MessageSchema],
  metadata: {
    totalTokens: {
      type: Number,
      default: 0
    },
    model: {
      type: String,
      default: 'gpt-3.5-turbo'
    },
    avgResponseTime: {
      type: Number,
      default: 0
    }
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
ConversationSchema.index({ userId: 1, isArchived: 1 });
ConversationSchema.index({ profileId: 1 });
ConversationSchema.index({ createdAt: -1 });
ConversationSchema.index({ 'messages.timestamp': -1 });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);