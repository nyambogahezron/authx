import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    event: {
      type: String,
      required: true,
      enum: [
        'user.signup',
        'user.login',
        'user.logout',
        'user.password_reset',
        'user.password_change',
        'user.email_verified',
        'user.deleted',
        'user.updated',
        'session.created',
        'session.revoked',
        'mfa.enabled',
        'mfa.disabled',
        'mfa.verified',
        'oauth.linked',
        'oauth.unlinked',
        'suspicious.login',
        'failed.login',
      ],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    location: {
      country: String,
      city: String,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ event: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

export default AuditLog;
