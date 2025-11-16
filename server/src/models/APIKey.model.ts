import mongoose from 'mongoose';
import crypto from 'crypto';

const APIKeySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    hashedKey: {
      type: String,
      required: true,
    },
    prefix: {
      type: String,
      required: true,
    },
    environment: {
      type: String,
      enum: ['development', 'production'],
      default: 'development',
    },
    permissions: [
      {
        type: String,
      },
    ],
    rateLimit: {
      requestsPerHour: {
        type: Number,
        default: 1000,
      },
      requestsPerDay: {
        type: Number,
        default: 10000,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
APIKeySchema.index({ hashedKey: 1 });
APIKeySchema.index({ user: 1 });
APIKeySchema.index({ prefix: 1 });

// Method to generate API key
APIKeySchema.statics.generateKey = function () {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const prefix = 'authx_' + (Math.random() > 0.5 ? 'dev' : 'prod') + '_';
  const key = prefix + randomBytes;
  const hashedKey = crypto.createHash('sha256').update(key).digest('hex');

  return { key, hashedKey, prefix };
};

const APIKey = mongoose.model('APIKey', APIKeySchema);

export default APIKey;
