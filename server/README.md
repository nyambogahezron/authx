# AuthX - Comprehensive Authentication System

AuthX is a complete, production-ready authentication system with extensive features for modern web and mobile applications.

## 🚀 Features

### Core Authentication
- ✅ Email + Password Authentication
- ✅ Email Verification
- ✅ Magic Link Login (Passwordless)
- ✅ Phone Number + OTP Login
- ✅ Username-based Login Support
- ✅ Social OAuth Providers (Google, Facebook, GitHub, LinkedIn, Twitter/X)
- ✅ Password Reset & Recovery

### Security Features
- ✅ Rate Limiting (configurable per endpoint)
- ✅ Brute-Force Protection (account locking after failed attempts)
- ✅ Device Fingerprinting
- ✅ Session Management (web & mobile)
- ✅ Security Headers (Helmet)
- ✅ MongoDB Injection Prevention
- ✅ HPP Protection
- ✅ Audit Logging

### Multi-Factor Authentication (MFA)
- ✅ TOTP/Authenticator Apps (Google Authenticator, Authy, etc.)
- ✅ Email OTP
- ✅ SMS OTP (Twilio integration ready)
- ✅ Backup Codes

### Session & Token Management
- ✅ JWT Access Tokens
- ✅ Refresh Tokens
- ✅ Session Tracking
- ✅ Device Management
- ✅ Trusted Devices
- ✅ Cross-device Session Syncing
- ✅ Session Revocation

### User Management
- ✅ User Profiles (with custom attributes)
- ✅ Role-based Access Control (RBAC)
- ✅ Permission Groups
- ✅ User Activity Tracking
- ✅ Login History
- ✅ Device List

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Server Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env-example.txt .env
```

4. Configure environment variables in `.env`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
EMAIL=your_email@example.com
EMAIL_PASSWORD=your_email_password
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# SMS Provider (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

5. Build the project:
```bash
npm run build
```

6. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## 🔌 API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Verify Email
```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "verificationToken": "123456"
}
```

#### Logout
```http
DELETE /api/v1/auth/logout
```

### Magic Link (Passwordless) Endpoints

#### Request Magic Link
```http
POST /api/v1/auth/magic-link/request
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Verify Magic Link
```http
POST /api/v1/auth/magic-link/verify
Content-Type: application/json

{
  "email": "john@example.com",
  "token": "magic_link_token"
}
```

### Phone Authentication

#### Request OTP
```http
POST /api/v1/auth/phone/request-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}
```

#### Verify OTP
```http
POST /api/v1/auth/phone/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

### OAuth Endpoints

#### Google OAuth
```http
GET /api/v1/auth/google
GET /api/v1/auth/google/callback
```

#### Facebook OAuth
```http
GET /api/v1/auth/facebook
GET /api/v1/auth/facebook/callback
```

#### GitHub OAuth
```http
GET /api/v1/auth/github
GET /api/v1/auth/github/callback
```

#### LinkedIn OAuth
```http
GET /api/v1/auth/linkedin
GET /api/v1/auth/linkedin/callback
```

### MFA Endpoints

#### Setup TOTP
```http
POST /api/v1/mfa/totp/setup
Content-Type: application/json

{
  "userId": "user_id_here"
}
```

#### Verify TOTP
```http
POST /api/v1/mfa/totp/verify
Content-Type: application/json

{
  "userId": "user_id_here",
  "token": "123456"
}
```

#### Verify MFA During Login
```http
POST /api/v1/mfa/verify
Content-Type: application/json

{
  "userId": "user_id_here",
  "token": "123456",
  "method": "totp"
}
```

### Session Management

#### Get All Sessions
```http
GET /api/v1/sessions
```

#### Revoke Session
```http
DELETE /api/v1/sessions/:sessionId
```

#### Revoke All Sessions
```http
POST /api/v1/sessions/revoke-all
```

#### Trust Device
```http
POST /api/v1/sessions/:sessionId/trust
```

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files. Use environment-specific configurations.

2. **JWT Secret**: Use a strong, random JWT secret (at least 32 characters).

3. **HTTPS**: Always use HTTPS in production.

4. **Rate Limiting**: Configure rate limits based on your use case.

5. **Password Policy**: Enforce strong passwords (min 8 characters, mix of letters, numbers, symbols).

6. **Session Expiry**: Configure appropriate session lifetimes.

## 📊 Database Models

### User Model
- name, email, username (optional)
- phoneNumber, phoneVerified
- role, permissions
- avatar, bio, customAttributes
- password (hashed)
- MFA settings
- Login tracking (lastLogin, lastLoginIp, loginAttempts, lockUntil)

### Session Model
- user reference
- token, deviceFingerprint
- deviceInfo (browser, OS, device type)
- IP, userAgent, location
- isActive, isTrusted
- lastActivity, expiresAt

### MFA Model
- user reference
- isEnabled
- methods (SMS, Email, TOTP)
- backupCodes
- preferredMethod

### OAuth Account Model
- user reference
- provider (google, facebook, github, etc.)
- providerId, providerEmail
- accessToken, refreshToken
- providerProfile

### Audit Log Model
- user reference
- event type
- metadata
- IP, userAgent, location
- status, timestamp

## 🧪 Testing

Run tests (when implemented):
```bash
npm test
```

## 📝 License

ISC

## 👨‍💻 Author

Nyamboga Hezron

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, email your-email@example.com or open an issue in the GitHub repository.