import mongoose from 'mongoose';

const OAuthAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      required: true,
      enum: [
        'google',
        'facebook',
        'github',
        'linkedin',
        'twitter',
        'apple',
        'discord',
        'reddit',
        'microsoft',
        'spotify',
      ],
    },
    providerId: {
      type: String,
      required: true,
    },
    providerEmail: {
      type: String,
    },
    providerProfile: {
      type: mongoose.Schema.Types.Mixed,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    tokenExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
OAuthAccountSchema.index({ provider: 1, providerId: 1 }, { unique: true });
OAuthAccountSchema.index({ user: 1 });

const OAuthAccount = mongoose.model('OAuthAccount', OAuthAccountSchema);

export default OAuthAccount;
