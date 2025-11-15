import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    deviceFingerprint: {
      type: String,
      required: true,
    },
    deviceInfo: {
      browser: {
        name: String,
        version: String,
      },
      os: {
        name: String,
        version: String,
      },
      device: {
        type: String,
        vendor: String,
        model: String,
      },
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isTrusted: {
      type: Boolean,
      default: false,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
SessionSchema.index({ user: 1, isActive: 1 });
SessionSchema.index({ token: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', SessionSchema);

export default Session;
