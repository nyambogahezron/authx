import mongoose from 'mongoose';

const MFASchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    methods: {
      sms: {
        enabled: { type: Boolean, default: false },
        phoneNumber: { type: String },
      },
      email: {
        enabled: { type: Boolean, default: false },
      },
      totp: {
        enabled: { type: Boolean, default: false },
        secret: { type: String },
        verified: { type: Boolean, default: false },
      },
    },
    backupCodes: [
      {
        code: { type: String, required: true },
        used: { type: Boolean, default: false },
        usedAt: { type: Date },
      },
    ],
    preferredMethod: {
      type: String,
      enum: ['sms', 'email', 'totp'],
    },
  },
  {
    timestamps: true,
  }
);

const MFA = mongoose.model('MFA', MFASchema);

export default MFA;
