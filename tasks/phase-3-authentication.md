# Phase 3: Authentication

## Overview
Implement JWT-based authentication with Express backend and React frontend, including user registration, login, logout, and protected routes.

**Reference**: SPECIFICATION.md - Section 6 (Authentication & User Management)

---

## Task 3.1: Create User Model (MongoDB)

### Description
Define the User schema with Mongoose including password hashing.

### Files to Create
```
server/src/models/User.ts
```

### Implementation
```typescript
import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  fullName: string;
  avatar?: string;
  companyName?: string;
  role: 'user' | 'admin';
  teamId?: mongoose.Types.ObjectId;
  teamRole?: 'owner' | 'admin' | 'member';
  isVerified: boolean;
  lastLogin?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include in queries by default
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    avatar: {
      type: String,
    },
    companyName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    teamRole: {
      type: String,
      enum: ['owner', 'admin', 'member'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ teamId: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find by email
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Transform output (remove sensitive fields)
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
```

### Acceptance Criteria
- [ ] User schema defined
- [ ] Password hashing on save
- [ ] Compare password method works
- [ ] Sensitive fields excluded
- [ ] Indexes created

---

## Task 3.2: Create JWT Utilities

### Description
Build utility functions for JWT token generation and verification.

### Installation
```bash
cd server
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

### Files to Create
```
server/src/utils/jwt.ts
```

### Implementation
```typescript
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRES = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};

export const generateTokenPair = (user: { _id: string; email: string; role: string }) => {
  const payload: TokenPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
```

### Acceptance Criteria
- [ ] Access token generation works
- [ ] Refresh token generation works
- [ ] Token verification works
- [ ] Expiration configured correctly

---

## Task 3.3: Create Auth Middleware

### Description
Build Express middleware for protecting routes and validating JWT tokens.

### Files to Create
```
server/src/middleware/auth.ts
```

### Implementation
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { User, IUser } from '@/models/User';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No authentication token provided',
        },
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token',
        },
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired',
        },
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error',
      },
    });
  }
};

// Optional auth - attaches user if token present, but doesn't require it
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
      }
    }

    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};

// Role-based access control
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    }

    next();
  };
};
```

### Acceptance Criteria
- [ ] Middleware extracts token
- [ ] Token verification works
- [ ] User attached to request
- [ ] Error handling correct
- [ ] Optional auth variant works

---

## Task 3.4: Create Auth Controller

### Description
Build controller functions for register, login, logout, and token refresh.

### Files to Create
```
server/src/controllers/auth.controller.ts
```

### Implementation
```typescript
import { Request, Response } from 'express';
import { User } from '@/models/User';
import { generateTokenPair, verifyRefreshToken } from '@/utils/jwt';

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, companyName } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'An account with this email already exists',
        },
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      fullName,
      companyName,
    });

    // Generate tokens
    const tokens = generateTokenPair({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'An account with this email already exists',
        },
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: messages.join(', '),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create account',
      },
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Generate tokens
    const tokens = generateTokenPair({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Update refresh token and last login
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Login failed',
      },
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    // Clear refresh token
    user.refreshToken = undefined;
    await user.save();

    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Logout failed',
      },
    });
  }
};

// Refresh tokens
export const refreshTokens = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Refresh token is required',
        },
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user with stored refresh token
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        },
      });
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Update refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Token refresh failed',
      },
    });
  }
};

// Get current user
export const getMe = async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.user,
  });
};

// Update profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { fullName, companyName, avatar } = req.body;
    const user = req.user!;

    // Update allowed fields
    if (fullName) user.fullName = fullName;
    if (companyName !== undefined) user.companyName = companyName;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update profile',
      },
    });
  }
};
```

### Acceptance Criteria
- [ ] Register creates user
- [ ] Login validates credentials
- [ ] Tokens generated correctly
- [ ] Logout clears refresh token
- [ ] Token refresh works
- [ ] Get current user works

---

## Task 3.5: Create Auth Routes

### Description
Define Express routes for authentication endpoints.

### Files to Create
```
server/src/routes/auth.routes.ts
```

### Implementation
```typescript
import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshTokens,
  getMe,
  updateProfile,
} from '@/controllers/auth.controller';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { registerSchema, loginSchema } from '@/validators/auth.validator';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshTokens);

// Protected routes
router.use(authMiddleware);
router.post('/logout', logout);
router.get('/me', getMe);
router.patch('/me', updateProfile);

export default router;
```

### Files to Create: Validation
```
server/src/middleware/validate.ts
server/src/validators/auth.validator.ts
```

### Validation Middleware
```typescript
// server/src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors,
        },
      });
    }

    req.body = value;
    next();
  };
};
```

### Auth Validators
```typescript
// server/src/validators/auth.validator.ts
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .pattern(/\d/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one number',
      'any.required': 'Password is required',
    }),
  fullName: Joi.string()
    .min(2)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Full name is required',
    }),
  companyName: Joi.string()
    .allow('')
    .optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});
```

### Install Joi
```bash
cd server
npm install joi
```

### Acceptance Criteria
- [ ] Routes defined correctly
- [ ] Validation works
- [ ] Protected routes require auth
- [ ] Error responses consistent

---

## Task 3.6: Create API Service (Frontend)

### Description
Build the API service layer for making authenticated requests.

### Installation
```bash
cd client
npm install axios
```

### Files to Create
```
client/src/services/api.ts
client/src/services/auth.service.ts
```

### API Base Configuration
```typescript
// client/src/services/api.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 and not a refresh request, try to refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Update tokens
          useAuthStore.getState().setToken(accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout
        useAuthStore.getState().logout();
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Auth Service
```typescript
// client/src/services/auth.service.ts
import api from './api';
import type { User, LoginFormValues, RegisterFormValues } from '@/types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async register(data: RegisterFormValues): Promise<AuthResponse> {
    const response = await api.post('/auth/register', {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      companyName: data.companyName,
    });
    return response.data.data;
  },

  async login(data: LoginFormValues): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch('/auth/me', data);
    return response.data.data;
  },

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },
};
```

### Acceptance Criteria
- [ ] API client configured
- [ ] Auth interceptor adds token
- [ ] Token refresh automatic
- [ ] Service functions work

---

## Task 3.7: Create Login Page

### Description
Build the login page with form validation using Mantine and Formik.

### Installation
```bash
cd client
npm install formik yup
```

### Files to Create
```
client/src/pages/Auth/Login.tsx
client/src/components/auth/LoginForm.tsx
```

### Login Form Component
```typescript
// client/src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Anchor,
  Alert,
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';

export function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email address';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        email: values.email,
        password: values.password,
      });

      // Store tokens
      login(response.user, response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}

        <TextInput
          label="Email"
          placeholder="you@example.com"
          size="md"
          {...form.getInputProps('email')}
        />

        <PasswordInput
          label="Password"
          placeholder="Your password"
          size="md"
          {...form.getInputProps('password')}
        />

        <Checkbox
          label="Remember me"
          {...form.getInputProps('rememberMe', { type: 'checkbox' })}
        />

        <Button
          type="submit"
          fullWidth
          size="md"
          loading={loading}
          variant="gradient"
          gradient={{ from: 'violet.7', to: 'violet.5' }}
        >
          Sign In
        </Button>

        <Text ta="center" size="sm" c="dimmed">
          Don't have an account?{' '}
          <Anchor component={Link} to="/register" c="violet">
            Sign up
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
}
```

### Login Page
```typescript
// client/src/pages/Auth/Login.tsx
import { Container, Title, Text, Paper, Stack } from '@mantine/core';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Container size={420} py={80}>
      <Stack align="center" gap="md">
        <Title ta="center" c="white">
          Welcome back
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          Sign in to your CallMentor Pro account
        </Text>
      </Stack>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" bg="dark.7">
        <LoginForm />
      </Paper>
    </Container>
  );
}
```

### Acceptance Criteria
- [ ] Form validates inputs
- [ ] Error messages display
- [ ] Loading state works
- [ ] Successful login redirects
- [ ] Link to register page

---

## Task 3.8: Create Register Page

### Description
Build the registration page with password confirmation.

### Files to Create
```
client/src/pages/Auth/Register.tsx
client/src/components/auth/RegisterForm.tsx
```

### Register Form Component
```typescript
// client/src/components/auth/RegisterForm.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Anchor,
  Alert,
  Checkbox,
  Progress,
  Popover,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text
      c={meets ? 'teal' : 'red'}
      style={{ display: 'flex', alignItems: 'center' }}
      size="xs"
    >
      {meets ? <IconCheck size={14} /> : <IconX size={14} />}
      <Box ml={7}>{label}</Box>
    </Text>
  );
}

const requirements = [
  { re: /.{8,}/, label: 'At least 8 characters' },
  { re: /[0-9]/, label: 'Contains a number' },
  { re: /[a-z]/, label: 'Contains lowercase letter' },
  { re: /[A-Z]/, label: 'Contains uppercase letter' },
];

function getStrength(password: string) {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

export function RegisterForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popoverOpened, setPopoverOpened] = useState(false);

  const form = useForm({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      acceptTerms: false,
    },
    validate: {
      fullName: (value) => {
        if (!value) return 'Full name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return null;
      },
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email address';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/\d/.test(value)) return 'Password must contain a number';
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.password) return 'Passwords do not match';
        return null;
      },
      acceptTerms: (value) => {
        if (!value) return 'You must accept the terms of service';
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        companyName: values.companyName || undefined,
        acceptTerms: values.acceptTerms,
      });

      // Store tokens
      login(response.user, response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.values.password);
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(form.values.password)}
    />
  ));

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}

        <TextInput
          label="Full Name"
          placeholder="John Doe"
          required
          size="md"
          {...form.getInputProps('fullName')}
        />

        <TextInput
          label="Email"
          placeholder="you@example.com"
          required
          size="md"
          {...form.getInputProps('email')}
        />

        <Popover
          opened={popoverOpened}
          position="bottom"
          width="target"
          transitionProps={{ transition: 'pop' }}
        >
          <Popover.Target>
            <div
              onFocusCapture={() => setPopoverOpened(true)}
              onBlurCapture={() => setPopoverOpened(false)}
            >
              <PasswordInput
                label="Password"
                placeholder="Create a password"
                required
                size="md"
                {...form.getInputProps('password')}
              />
            </div>
          </Popover.Target>
          <Popover.Dropdown>
            <Progress color={color} value={strength} size={5} mb="xs" />
            {checks}
          </Popover.Dropdown>
        </Popover>

        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          required
          size="md"
          {...form.getInputProps('confirmPassword')}
        />

        <TextInput
          label="Company Name (Optional)"
          placeholder="Your company"
          size="md"
          {...form.getInputProps('companyName')}
        />

        <Checkbox
          label={
            <>
              I agree to the{' '}
              <Anchor href="#" target="_blank" size="sm">
                Terms of Service
              </Anchor>{' '}
              and{' '}
              <Anchor href="#" target="_blank" size="sm">
                Privacy Policy
              </Anchor>
            </>
          }
          {...form.getInputProps('acceptTerms', { type: 'checkbox' })}
          error={form.errors.acceptTerms}
        />

        <Button
          type="submit"
          fullWidth
          size="md"
          loading={loading}
          variant="gradient"
          gradient={{ from: 'violet.7', to: 'violet.5' }}
        >
          Create Account
        </Button>

        <Text ta="center" size="sm" c="dimmed">
          Already have an account?{' '}
          <Anchor component={Link} to="/login" c="violet">
            Sign in
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
}
```

### Register Page
```typescript
// client/src/pages/Auth/Register.tsx
import { Container, Title, Text, Paper, Stack } from '@mantine/core';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <Container size={460} py={80}>
      <Stack align="center" gap="md">
        <Title ta="center" c="white">
          Create your account
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          Start your 7-day free trial of CallMentor Pro
        </Text>
      </Stack>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" bg="dark.7">
        <RegisterForm />
      </Paper>
    </Container>
  );
}
```

### Acceptance Criteria
- [ ] All fields validate
- [ ] Password strength indicator
- [ ] Password confirmation matches
- [ ] Terms checkbox required
- [ ] Successful register redirects

---

## Task 3.9: Create Auth Layout

### Description
Build the layout component for authentication pages.

### Files to Create
```
client/src/components/layout/AuthLayout.tsx
```

### Implementation
```typescript
// client/src/components/layout/AuthLayout.tsx
import { Outlet, Link } from 'react-router-dom';
import { Box, Container, Group, Text } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';

export default function AuthLayout() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--mantine-color-dark-9) 0%, var(--mantine-color-dark-8) 100%)',
      }}
    >
      {/* Simple Header */}
      <Container size="xl" py="md">
        <Group justify="space-between">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Group gap="xs">
              <IconSparkles size={24} color="var(--mantine-color-violet-5)" />
              <Text fw={700} size="lg" c="white">
                CallMentor Pro
              </Text>
            </Group>
          </Link>
        </Group>
      </Container>

      {/* Auth Content */}
      <Outlet />

      {/* Footer */}
      <Box
        py="xl"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Text ta="center" size="xs" c="dimmed">
          © {new Date().getFullYear()} CallMentor Pro. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] Layout wraps auth pages
- [ ] Logo links to home
- [ ] Footer visible
- [ ] Outlet renders child routes

---

## Task 3.10: Update Auth Store

### Description
Enhance the auth store to handle initialization and persistence correctly.

### Files to Modify
```
client/src/store/authStore.ts
```

### Implementation
```typescript
// client/src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => set({ token }),

      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      }),

      logout: () => {
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      initialize: async () => {
        const { token } = get();

        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          // Try to get current user with existing token
          const user = await authService.getMe();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token invalid or expired, try refresh
          const refreshToken = localStorage.getItem('refreshToken');

          if (refreshToken) {
            try {
              const tokens = await authService.refreshTokens(refreshToken);
              set({ token: tokens.accessToken });
              localStorage.setItem('refreshToken', tokens.refreshToken);

              const user = await authService.getMe();
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch (refreshError) {
              // Refresh failed, clear everything
              localStorage.removeItem('refreshToken');
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
      }),
    }
  )
);
```

### Initialize on App Mount
```typescript
// In App.tsx or main.tsx
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ... rest of app
}
```

### Acceptance Criteria
- [ ] Token persisted in localStorage
- [ ] Initialize checks token validity
- [ ] Automatic token refresh
- [ ] Logout clears all tokens

---

## Phase 3 Checklist Summary

| Task | Description | Status |
|------|-------------|--------|
| 3.1 | Create User Model (MongoDB) | [ ] |
| 3.2 | Create JWT utilities | [ ] |
| 3.3 | Create auth middleware | [ ] |
| 3.4 | Create auth controller | [ ] |
| 3.5 | Create auth routes | [ ] |
| 3.6 | Create API service (frontend) | [ ] |
| 3.7 | Create login page | [ ] |
| 3.8 | Create register page | [ ] |
| 3.9 | Create auth layout | [ ] |
| 3.10 | Update auth store | [ ] |

---

## Dependencies for Next Phase
Before starting Phase 4 (Dashboard), ensure:
- Register/Login flows work end-to-end
- JWT tokens generated and validated
- Protected routes redirect properly
- User data accessible in frontend
