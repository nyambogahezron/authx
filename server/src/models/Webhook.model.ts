import mongoose from 'mongoose';

const WebhookSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    events: [
      {
        type: String,
        enum: [
          'user.signup',
          'user.login',
          'user.logout',
          'user.deleted',
          'user.updated',
          'user.password_reset',
          'mfa.enabled',
          'mfa.disabled',
          'oauth.linked',
          'oauth.unlinked',
        ],
        required: true,
      },
    ],
    secret: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
    },
    retryAttempts: {
      type: Number,
      default: 3,
    },
    lastTriggered: {
      type: Date,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Webhook = mongoose.model('Webhook', WebhookSchema);

export default Webhook;
