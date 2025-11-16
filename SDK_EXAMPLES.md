# AuthX SDK Examples

Example code for integrating AuthX into your applications.

## JavaScript/TypeScript SDK

### Installation

```bash
npm install axios
```

### Basic Setup

```typescript
// authx-client.ts
import axios, { AxiosInstance } from 'axios';

export class AuthXClient {
  private client: AxiosInstance;
  private apiKey?: string;
  private accessToken?: string;

  constructor(config: {
    baseURL: string;
    apiKey?: string;
  }) {
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for cookies
    });

    if (config.apiKey) {
      this.apiKey = config.apiKey;
      this.client.defaults.headers.common['X-API-Key'] = config.apiKey;
    }

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          this.accessToken = undefined;
        }
        return Promise.reject(error);
      }
    );
  }

  // Set access token
  setAccessToken(token: string) {
    this.accessToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Authentication Methods
  async register(data: {
    name: string;
    email: string;
    password: string;
  }) {
    const response = await this.client.post('/api/v1/auth/register', data);
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.client.post('/api/v1/auth/login', data);
    return response.data;
  }

  async logout() {
    const response = await this.client.delete('/api/v1/auth/logout');
    this.accessToken = undefined;
    return response.data;
  }

  async verifyEmail(data: { email: string; verificationToken: string }) {
    const response = await this.client.post('/api/v1/auth/verify-email', data);
    return response.data;
  }

  async requestMagicLink(email: string) {
    const response = await this.client.post('/api/v1/auth/magic-link/request', {
      email,
    });
    return response.data;
  }

  async verifyMagicLink(data: { email: string; token: string }) {
    const response = await this.client.post(
      '/api/v1/auth/magic-link/verify',
      data
    );
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/api/v1/auth/forgot-password', {
      email,
    });
    return response.data;
  }

  async resetPassword(data: {
    email: string;
    token: string;
    password: string;
  }) {
    const response = await this.client.post('/api/v1/auth/reset-password', data);
    return response.data;
  }

  // Phone Authentication
  async requestPhoneOTP(phoneNumber: string) {
    const response = await this.client.post('/api/v1/auth/phone/request-otp', {
      phoneNumber,
    });
    return response.data;
  }

  async verifyPhoneOTP(data: { phoneNumber: string; otp: string }) {
    const response = await this.client.post(
      '/api/v1/auth/phone/verify-otp',
      data
    );
    return response.data;
  }

  // MFA Methods
  async setupTOTP(userId: string) {
    const response = await this.client.post('/api/v1/mfa/totp/setup', {
      userId,
    });
    return response.data;
  }

  async verifyTOTP(data: { userId: string; token: string }) {
    const response = await this.client.post('/api/v1/mfa/totp/verify', data);
    return response.data;
  }

  async verifyMFA(data: { userId: string; token: string; method: string }) {
    const response = await this.client.post('/api/v1/mfa/verify', data);
    return response.data;
  }

  async disableMFA(data: { userId: string; password: string }) {
    const response = await this.client.post('/api/v1/mfa/disable', data);
    return response.data;
  }

  // Session Management
  async getSessions() {
    const response = await this.client.get('/api/v1/sessions');
    return response.data;
  }

  async revokeSession(sessionId: string) {
    const response = await this.client.delete(`/api/v1/sessions/${sessionId}`);
    return response.data;
  }

  async revokeAllSessions() {
    const response = await this.client.post('/api/v1/sessions/revoke-all');
    return response.data;
  }

  async trustDevice(sessionId: string) {
    const response = await this.client.post(
      `/api/v1/sessions/${sessionId}/trust`
    );
    return response.data;
  }

  // User Management
  async getCurrentUser() {
    const response = await this.client.get('/api/v1/users/me');
    return response.data;
  }

  async updateUser(data: { name?: string; email?: string }) {
    const response = await this.client.patch('/api/v1/users/update', data);
    return response.data;
  }

  async updatePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    const response = await this.client.patch(
      '/api/v1/users/update-password',
      data
    );
    return response.data;
  }
}

// Export singleton instance
export default AuthXClient;
```

### Usage Examples

#### Basic Authentication

```typescript
import AuthXClient from './authx-client';

const authx = new AuthXClient({
  baseURL: 'http://localhost:5000',
});

// Register a new user
async function registerUser() {
  try {
    const result = await authx.register({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePassword123!',
    });
    console.log('User registered:', result);
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

// Login
async function loginUser() {
  try {
    const result = await authx.login({
      email: 'john@example.com',
      password: 'SecurePassword123!',
    });
    console.log('Logged in:', result);
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// Verify email
async function verifyUserEmail() {
  try {
    await authx.verifyEmail({
      email: 'john@example.com',
      verificationToken: '123456',
    });
    console.log('Email verified successfully');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}
```

#### Magic Link Authentication

```typescript
// Request magic link
async function requestMagicLink() {
  try {
    await authx.requestMagicLink('john@example.com');
    console.log('Magic link sent to email');
  } catch (error) {
    console.error('Failed to send magic link:', error);
  }
}

// Verify magic link (typically from URL parameter)
async function verifyMagicLink(token: string) {
  try {
    const result = await authx.verifyMagicLink({
      email: 'john@example.com',
      token,
    });
    console.log('Logged in via magic link:', result);
  } catch (error) {
    console.error('Magic link verification failed:', error);
  }
}
```

#### Multi-Factor Authentication

```typescript
// Setup TOTP
async function setupMFA(userId: string) {
  try {
    const result = await authx.setupTOTP(userId);
    console.log('TOTP Secret:', result.data.secret);
    console.log('QR Code:', result.data.qrCode);
    // Display QR code for user to scan with authenticator app
  } catch (error) {
    console.error('MFA setup failed:', error);
  }
}

// Verify and enable TOTP
async function enableMFA(userId: string, token: string) {
  try {
    const result = await authx.verifyTOTP({ userId, token });
    console.log('MFA enabled. Backup codes:', result.backupCodes);
    // Store backup codes securely
  } catch (error) {
    console.error('MFA verification failed:', error);
  }
}

// Verify MFA during login
async function loginWithMFA(userId: string, mfaToken: string) {
  try {
    await authx.verifyMFA({
      userId,
      token: mfaToken,
      method: 'totp',
    });
    console.log('MFA verified, login complete');
  } catch (error) {
    console.error('MFA verification failed:', error);
  }
}
```

#### Session Management

```typescript
// Get all active sessions
async function viewSessions() {
  try {
    const result = await authx.getSessions();
    console.log('Active sessions:', result.data);
  } catch (error) {
    console.error('Failed to get sessions:', error);
  }
}

// Revoke a specific session
async function revokeSession(sessionId: string) {
  try {
    await authx.revokeSession(sessionId);
    console.log('Session revoked');
  } catch (error) {
    console.error('Failed to revoke session:', error);
  }
}

// Logout from all devices
async function logoutEverywhere() {
  try {
    await authx.revokeAllSessions();
    console.log('Logged out from all devices');
  } catch (error) {
    console.error('Failed to revoke all sessions:', error);
  }
}
```

## React Integration

```tsx
// hooks/useAuth.ts
import { createContext, useContext, useState, useEffect } from 'react';
import AuthXClient from '../lib/authx-client';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const authx = new AuthXClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  });

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const result = await authx.getCurrentUser();
        setUser(result.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authx.login({ email, password });
    setUser(result.user);
  };

  const logout = async () => {
    await authx.logout();
    setUser(null);
  };

  const register = async (name: string, email: string, password: string) => {
    await authx.register({ name, email, password });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

```tsx
// components/LoginForm.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## Node.js Backend Integration

```typescript
// middleware/authx-verify.ts
import axios from 'axios';

export async function verifyAuthXToken(token: string) {
  try {
    const response = await axios.get(
      `${process.env.AUTHX_API_URL}/api/v1/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    return null;
  }
}

// Express middleware
export function authxMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  verifyAuthXToken(token)
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.user = user;
      next();
    })
    .catch(() => {
      res.status(500).json({ error: 'Auth verification failed' });
    });
}
```

## Python SDK

```python
# authx_client.py
import requests
from typing import Optional, Dict, Any

class AuthXClient:
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({'X-API-Key': api_key})
    
    def register(self, name: str, email: str, password: str) -> Dict[str, Any]:
        """Register a new user"""
        response = self.session.post(
            f'{self.base_url}/api/v1/auth/register',
            json={'name': name, 'email': email, 'password': password}
        )
        response.raise_for_status()
        return response.json()
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Login a user"""
        response = self.session.post(
            f'{self.base_url}/api/v1/auth/login',
            json={'email': email, 'password': password}
        )
        response.raise_for_status()
        return response.json()
    
    def request_magic_link(self, email: str) -> Dict[str, Any]:
        """Request a magic link for passwordless login"""
        response = self.session.post(
            f'{self.base_url}/api/v1/auth/magic-link/request',
            json={'email': email}
        )
        response.raise_for_status()
        return response.json()

# Usage
if __name__ == '__main__':
    authx = AuthXClient('http://localhost:5000')
    
    # Register
    result = authx.register(
        name='John Doe',
        email='john@example.com',
        password='SecurePassword123!'
    )
    print('User registered:', result)
    
    # Login
    result = authx.login(
        email='john@example.com',
        password='SecurePassword123!'
    )
    print('Logged in:', result)
```

## Mobile Integration (React Native)

```typescript
// services/authx.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000';

export const authxService = {
  async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email,
      password,
    });

    if (response.data.user) {
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  async logout() {
    await axios.delete(`${API_URL}/api/v1/auth/logout`);
    await AsyncStorage.removeItem('user');
  },

  async getCurrentUser() {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },
};
```

These examples demonstrate how to integrate AuthX into various platforms and frameworks.
