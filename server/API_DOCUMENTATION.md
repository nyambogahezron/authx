# AuthX API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Passwordless Auth](#passwordless-authentication)
- [OAuth](#oauth)
- [Multi-Factor Authentication](#multi-factor-authentication)
- [Session Management](#session-management)
- [Admin Panel](#admin-panel)
- [Webhooks](#webhooks)

## Authentication

### Register User
Creates a new user account and sends a verification email.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": false,
    "role": "user"
  }
}
```

### Login
Authenticates a user and creates a session.

**Endpoint:** `POST /api/v1/auth/login`

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "user": {
    "userId": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Note:** JWT tokens are set as HTTP-only cookies.

### Verify Email
Verifies user's email address using the token sent via email.

**Endpoint:** `POST /api/v1/auth/verify-email`

**Request Body:**
```json
{
  "email": "john@example.com",
  "verificationToken": "123456"
}
```

### Resend Verification Code
Sends a new verification code to the user's email.

**Endpoint:** `POST /api/v1/auth/resend-verification`

**Rate Limit:** 3 requests per 15 minutes per IP

### Forgot Password
Initiates password reset process.

**Endpoint:** `POST /api/v1/auth/forgot-password`

**Rate Limit:** 3 requests per hour per IP

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
Resets user password using the token sent via email.

**Endpoint:** `POST /api/v1/auth/reset-password`

**Request Body:**
```json
{
  "email": "john@example.com",
  "token": "reset_token",
  "password": "NewSecurePassword123!"
}
```

### Logout
Terminates user session.

**Endpoint:** `DELETE /api/v1/auth/logout`

**Authentication Required**

## Passwordless Authentication

### Request Magic Link
Sends a magic link to user's email for passwordless login.

**Endpoint:** `POST /api/v1/auth/magic-link/request`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Verify Magic Link
Completes login using magic link token.

**Endpoint:** `POST /api/v1/auth/magic-link/verify`

**Request Body:**
```json
{
  "email": "john@example.com",
  "token": "magic_link_token"
}
```

### Request Phone OTP
Sends OTP to user's phone number.

**Endpoint:** `POST /api/v1/auth/phone/request-otp`

**Request Body:**
```json
{
  "phoneNumber": "+1234567890"
}
```

### Verify Phone OTP
Completes login using phone OTP.

**Endpoint:** `POST /api/v1/auth/phone/verify-otp`

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

## OAuth

### Google OAuth
Initiates Google OAuth flow.

**Endpoint:** `GET /api/v1/auth/google`

**Callback:** `GET /api/v1/auth/google/callback`

### Facebook OAuth
Initiates Facebook OAuth flow.

**Endpoint:** `GET /api/v1/auth/facebook`

**Callback:** `GET /api/v1/auth/facebook/callback`

### GitHub OAuth
Initiates GitHub OAuth flow.

**Endpoint:** `GET /api/v1/auth/github`

**Callback:** `GET /api/v1/auth/github/callback`

### LinkedIn OAuth
Initiates LinkedIn OAuth flow.

**Endpoint:** `GET /api/v1/auth/linkedin`

**Callback:** `GET /api/v1/auth/linkedin/callback`

## Multi-Factor Authentication

### Setup TOTP (Authenticator App)
Sets up TOTP for MFA and returns QR code.

**Endpoint:** `POST /api/v1/mfa/totp/setup`

**Authentication Required**

**Request Body:**
```json
{
  "userId": "user_id"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "secret": "base32_secret",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Verify and Enable TOTP
Verifies TOTP token and enables MFA.

**Endpoint:** `POST /api/v1/mfa/totp/verify`

**Request Body:**
```json
{
  "userId": "user_id",
  "token": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "TOTP enabled successfully",
  "backupCodes": ["CODE1", "CODE2", "CODE3", ...]
}
```

### Verify MFA During Login
Verifies MFA code during login process.

**Endpoint:** `POST /api/v1/mfa/verify`

**Request Body:**
```json
{
  "userId": "user_id",
  "token": "123456",
  "method": "totp"
}
```

**Methods:** `totp`, `email`, `sms`, `backup`

### Setup Email MFA
Enables email-based MFA.

**Endpoint:** `POST /api/v1/mfa/email/setup`

### Setup SMS MFA
Enables SMS-based MFA.

**Endpoint:** `POST /api/v1/mfa/sms/setup`

**Request Body:**
```json
{
  "userId": "user_id",
  "phoneNumber": "+1234567890"
}
```

### Disable MFA
Disables all MFA methods for the user.

**Endpoint:** `POST /api/v1/mfa/disable`

**Request Body:**
```json
{
  "userId": "user_id",
  "password": "current_password"
}
```

## Session Management

### Get All Active Sessions
Returns all active sessions for the authenticated user.

**Endpoint:** `GET /api/v1/sessions`

**Authentication Required**

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "session_id",
      "deviceInfo": {
        "browser": {"name": "Chrome", "version": "120.0"},
        "os": {"name": "Windows", "version": "10"},
        "device": {"type": "desktop"}
      },
      "ip": "192.168.1.1",
      "isActive": true,
      "isTrusted": false,
      "lastActivity": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-10T08:00:00Z"
    }
  ]
}
```

### Revoke Specific Session
Revokes a specific session.

**Endpoint:** `DELETE /api/v1/sessions/:sessionId`

### Revoke All Other Sessions
Revokes all sessions except the current one.

**Endpoint:** `POST /api/v1/sessions/revoke-all`

### Trust Device
Marks a device as trusted.

**Endpoint:** `POST /api/v1/sessions/:sessionId/trust`

### Get Session Activity
Returns session history with pagination.

**Endpoint:** `GET /api/v1/sessions/activity?page=1&limit=20`

## Admin Panel

**Note:** All admin endpoints require admin role authentication.

### Get All Users
Lists all users with filtering and pagination.

**Endpoint:** `GET /api/v1/admin/users`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `role` (string): Filter by role
- `accountStatus` (string): Filter by status
- `isVerified` (boolean): Filter by verification status
- `mfaEnabled` (boolean): Filter by MFA status
- `search` (string): Search by name, email, or username

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 5,
    "limit": 20
  }
}
```

### Get User Details
Get detailed information about a specific user.

**Endpoint:** `GET /api/v1/admin/users/:id`

**Response includes:** User data, active sessions, recent audit logs

### Update User
Update user details.

**Endpoint:** `PATCH /api/v1/admin/users/:id`

**Request Body:**
```json
{
  "name": "New Name",
  "role": "moderator",
  "accountStatus": "active",
  "permissions": ["read", "write"]
}
```

### Delete User
Soft delete a user (sets accountStatus to 'deleted').

**Endpoint:** `DELETE /api/v1/admin/users/:id`

### Force Password Reset
Forces a password reset for a user.

**Endpoint:** `POST /api/v1/admin/users/:id/force-password-reset`

**Request Body:**
```json
{
  "newPassword": "NewSecurePassword123!"
}
```

### Dashboard Analytics
Get comprehensive analytics for the admin dashboard.

**Endpoint:** `GET /api/v1/admin/analytics`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "active": 950,
      "verified": 900,
      "mfaEnabled": 200,
      "newLast24h": 5,
      "newLast7Days": 50,
      "newLast30Days": 200
    },
    "sessions": {
      "active": 1500,
      "trusted": 300
    },
    "logins": {
      "successful": 5000,
      "failed": 100,
      "successRate": 98.04
    },
    "charts": {
      "signupsByDay": [...],
      "loginMethodsDistribution": [...],
      "roleDistribution": [...]
    }
  }
}
```

### Get Audit Logs
Retrieve audit logs with filtering.

**Endpoint:** `GET /api/v1/admin/audit-logs`

**Query Parameters:**
- `page`, `limit`: Pagination
- `event`: Filter by event type
- `status`: Filter by status
- `userId`: Filter by user
- `startDate`, `endDate`: Date range filter

## Webhooks

**Note:** All webhook endpoints require admin authentication.

### Create Webhook
Creates a new webhook endpoint.

**Endpoint:** `POST /api/v1/webhooks`

**Request Body:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["user.signup", "user.login"],
  "headers": {
    "Authorization": "Bearer your_token"
  },
  "retryAttempts": 3
}
```

**Available Events:**
- `user.signup`
- `user.login`
- `user.logout`
- `user.deleted`
- `user.updated`
- `user.password_reset`
- `mfa.enabled`
- `mfa.disabled`
- `oauth.linked`
- `oauth.unlinked`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "webhook_id",
    "url": "https://example.com/webhook",
    "events": ["user.signup", "user.login"],
    "secret": "generated_secret_key",
    "isActive": true
  }
}
```

**Note:** Save the `secret` - it's used to verify webhook signatures.

### Webhook Payload Format
When an event occurs, the following payload is sent:

```json
{
  "event": "user.signup",
  "data": {
    "userId": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Headers Included:**
- `Content-Type: application/json`
- `X-Webhook-Signature`: HMAC-SHA256 signature
- `X-Webhook-Event`: Event name

### Verify Webhook Signature
To verify webhook authenticity:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

### Get All Webhooks
List all configured webhooks.

**Endpoint:** `GET /api/v1/webhooks`

### Update Webhook
Update webhook configuration.

**Endpoint:** `PATCH /api/v1/webhooks/:id`

### Delete Webhook
Delete a webhook.

**Endpoint:** `DELETE /api/v1/webhooks/:id`

### Regenerate Secret
Generate a new secret for a webhook.

**Endpoint:** `POST /api/v1/webhooks/:id/regenerate-secret`

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests (Rate Limited)
- `500`: Internal Server Error

## Rate Limiting

- **Auth endpoints:** 5 requests per 15 minutes
- **Password reset:** 3 requests per hour
- **Email verification:** 3 requests per 15 minutes
- **General API:** 100 requests per 15 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
