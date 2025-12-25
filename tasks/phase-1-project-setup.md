# Phase 1: Project Setup & Foundation

## Overview
Initialize the monorepo structure with React (Vite) frontend and Express.js backend, configure MongoDB, and set up the development environment with Mantine UI.

**Reference**: SPECIFICATION.md - Section 4 (Technical Architecture)

---

## Task 1.1: Initialize Project Structure

### Description
Create the monorepo structure with separate client and server directories.

### Requirements
- Create root project folder with shared configuration
- Initialize client (React + Vite + TypeScript)
- Initialize server (Express + TypeScript)
- Set up shared types directory

### Commands
```bash
# Create project structure
mkdir -p callmentor-pro/{client,server,shared/types}
cd callmentor-pro

# Initialize root package.json (optional for scripts)
npm init -y

# Initialize client
cd client
npm create vite@latest . -- --template react-ts
npm install

# Initialize server
cd ../server
npm init -y
npm install express mongoose dotenv cors helmet
npm install -D typescript @types/node @types/express @types/cors ts-node nodemon
npx tsc --init
```

### Final Structure
```
callmentor-pro/
├── client/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── server/
│   ├── src/
│   ├── tsconfig.json
│   └── package.json
├── shared/
│   └── types/
├── .gitignore
├── .env.example
└── README.md
```

### Acceptance Criteria
- [ ] Client runs with `npm run dev` on port 5173
- [ ] Server runs with `npm run dev` on port 5000
- [ ] TypeScript compiles without errors in both
- [ ] Shared types directory accessible from both

---

## Task 1.2: Configure Vite & React

### Description
Set up Vite configuration with path aliases and environment variables.

### Files to Create/Modify

#### vite.config.ts
```typescript
// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

#### tsconfig.json (client)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@store/*": ["src/store/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Acceptance Criteria
- [ ] Path aliases work correctly
- [ ] Environment variables load
- [ ] Proxy to backend works
- [ ] HMR functions properly

---

## Task 1.3: Configure Express Server

### Description
Set up Express server with TypeScript, middleware, and basic route structure.

### Files to Create

#### server/src/app.ts
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (to be added)
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/calls', callsRoutes);
// app.use('/api/v1/teams', teamsRoutes);
// app.use('/api/v1/analytics', analyticsRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    },
  });
});

export default app;
```

#### server/src/index.ts
```typescript
import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

#### server/src/config/database.ts
```typescript
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/callmentor';

    await mongoose.connect(mongoUri);

    console.log('MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};
```

#### server/tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### server/package.json scripts
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src/**/*.ts"
  }
}
```

### Acceptance Criteria
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] MongoDB connection works
- [ ] CORS allows frontend requests

---

## Task 1.4: Set Up Mantine UI

### Description
Install and configure Mantine v7 with custom dark theme using violet/purple colors.

### Installation
```bash
cd client
npm install @mantine/core @mantine/hooks @mantine/form @mantine/notifications @mantine/charts
npm install @tabler/icons-react
npm install postcss postcss-preset-mantine postcss-simple-vars
```

### Files to Create/Modify

#### client/postcss.config.cjs
```javascript
module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
  },
};
```

#### client/src/theme/index.ts
```typescript
import { createTheme, MantineColorsTuple } from '@mantine/core';

// Custom violet palette
const violet: MantineColorsTuple = [
  '#f5f3ff',
  '#ede9fe',
  '#ddd6fe',
  '#c4b5fd',
  '#a78bfa',
  '#8b5cf6',
  '#7c3aed',
  '#6d28d9',
  '#5b21b6',
  '#4c1d95',
];

export const theme = createTheme({
  primaryColor: 'violet',
  primaryShade: { light: 6, dark: 5 },

  colors: {
    violet,
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },

  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',

  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontWeight: '600',
  },

  defaultRadius: 'md',

  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },
    Card: {
      defaultProps: {
        padding: 'lg',
        radius: 'md',
        withBorder: true,
      },
    },
    TextInput: {
      defaultProps: {
        size: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        size: 'md',
      },
    },
  },
});
```

#### client/src/main.tsx
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from './theme';
import App from './App';

// Import Mantine styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
```

### Acceptance Criteria
- [ ] Mantine components render correctly
- [ ] Dark theme is default
- [ ] Violet primary color works
- [ ] Custom theme overrides apply
- [ ] Notifications system works

---

## Task 1.5: Set Up Client Folder Structure

### Description
Create the complete folder structure for the React frontend.

### Structure to Create
```
client/src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Logo.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── layout/              # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── AuthLayout.tsx
│   ├── landing/             # Landing page components
│   ├── auth/                # Auth form components
│   ├── calls/               # Call-related components
│   ├── analytics/           # Chart & analytics components
│   └── team/                # Team management components
├── pages/
│   ├── Landing/
│   │   └── index.tsx
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Dashboard/
│   │   └── index.tsx
│   ├── Calls/
│   │   ├── CallsList.tsx
│   │   └── CallDetail.tsx
│   ├── Team/
│   │   └── index.tsx
│   └── Settings/
│       └── index.tsx
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useCalls.ts
│   └── useAnalytics.ts
├── store/                   # Zustand stores
│   ├── authStore.ts
│   └── uiStore.ts
├── services/                # API service layer
│   ├── api.ts
│   ├── auth.service.ts
│   ├── calls.service.ts
│   └── analytics.service.ts
├── utils/                   # Helper utilities
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── types/                   # TypeScript types
│   └── index.ts
├── mocks/                   # Mock data
│   ├── calls.ts
│   ├── users.ts
│   └── analytics.ts
├── styles/                  # Global styles
│   └── global.css
├── theme/
│   └── index.ts
├── App.tsx
└── main.tsx
```

### Placeholder Files
Create basic placeholder files for each to avoid import errors:

```typescript
// client/src/pages/Landing/index.tsx
export default function LandingPage() {
  return <div>Landing Page</div>;
}

// client/src/pages/Auth/Login.tsx
export default function LoginPage() {
  return <div>Login Page</div>;
}

// client/src/pages/Dashboard/index.tsx
export default function DashboardPage() {
  return <div>Dashboard</div>;
}
```

### Acceptance Criteria
- [ ] All folders created
- [ ] Placeholder pages exist
- [ ] No import errors
- [ ] Structure matches spec

---

## Task 1.6: Set Up Server Folder Structure

### Description
Create the complete folder structure for the Express backend.

### Structure to Create
```
server/src/
├── routes/
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── calls.routes.ts
│   ├── teams.routes.ts
│   └── analytics.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── calls.controller.ts
│   ├── teams.controller.ts
│   └── analytics.controller.ts
├── models/
│   ├── User.ts
│   ├── Call.ts
│   ├── Team.ts
│   └── Invitation.ts
├── middleware/
│   ├── auth.ts
│   ├── validate.ts
│   ├── errorHandler.ts
│   └── rateLimiter.ts
├── services/
│   ├── ai/
│   │   ├── analyzer.ts
│   │   ├── prompts.ts
│   │   └── index.ts
│   └── metrics/
│       └── calculator.ts
├── utils/
│   ├── jwt.ts
│   ├── validators.ts
│   └── helpers.ts
├── config/
│   ├── database.ts
│   └── constants.ts
├── types/
│   └── index.ts
├── app.ts
└── index.ts
```

### Placeholder Route Files
```typescript
// server/src/routes/index.ts
import { Router } from 'express';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;

// server/src/routes/auth.routes.ts
import { Router } from 'express';

const router = Router();

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

export default router;
```

### Acceptance Criteria
- [ ] All folders created
- [ ] Placeholder routes work
- [ ] Structure matches spec
- [ ] TypeScript compiles

---

## Task 1.7: Create TypeScript Type Definitions

### Description
Define shared TypeScript interfaces and types for the application.

### Files to Create

#### client/src/types/index.ts (and shared/types/index.ts)
```typescript
// ============ USER TYPES ============
export interface User {
  _id: string;
  email: string;
  fullName: string;
  avatar?: string;
  companyName?: string;
  role: 'user' | 'admin';
  teamId?: string;
  teamRole?: 'owner' | 'admin' | 'member';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============ CALL TYPES ============
export interface Call {
  _id: string;
  userId: string;
  teamId?: string;
  title: string;
  prospect: Prospect;
  repName: string;
  date: string;
  duration: number;
  transcript: TranscriptSegment[];
  transcriptText?: string;
  audioUrl?: string;
  summary: string;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  metrics: CallMetrics;
  objections: Objection[];
  coachingFeedback: CoachingFeedback;
  tags: string[];
  status: CallStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export type CallStatus = 'pending' | 'processing' | 'analyzed' | 'error';

export interface Prospect {
  name: string;
  company: string;
  role?: string;
}

export interface TranscriptSegment {
  speaker: 'rep' | 'prospect';
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
}

// ============ METRICS TYPES ============
export interface CallMetrics {
  talkRatio: number;
  questionCount: number;
  longestMonologue: number;
  fillerWordCount: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  engagementScore: number;
}

// ============ SCORING TYPES ============
export interface ScoreBreakdown {
  overall: number;
  categories: {
    discovery: CategoryScore;
    talkBalance: CategoryScore;
    objectionHandling: CategoryScore;
    nextSteps: CategoryScore;
    rapport: CategoryScore;
    accuracy: CategoryScore;
  };
}

export interface CategoryScore {
  score: number;
  weight: number;
  reasoning: string;
  highlights?: string[];
}

// ============ OBJECTION TYPES ============
export interface Objection {
  id: string;
  text: string;
  type: ObjectionType;
  timestamp?: string;
  addressed: boolean;
  handling: ObjectionHandling;
  repResponse?: string;
}

export type ObjectionType =
  | 'pricing'
  | 'timeline'
  | 'competition'
  | 'authority'
  | 'need'
  | 'other';

export type ObjectionHandling = 'well' | 'partial' | 'poor' | 'missed';

// ============ COACHING TYPES ============
export interface CoachingFeedback {
  summary: string;
  strengths: Strength[];
  improvements: Improvement[];
  actionItems: ActionItem[];
}

export interface Strength {
  title: string;
  description: string;
  quote?: string;
  timestamp?: string;
  impact?: 'high' | 'medium';
}

export interface Improvement {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  quote?: string;
  timestamp?: string;
  suggestion: string;
  example?: string;
}

export interface ActionItem {
  task: string;
  type: 'practice' | 'study' | 'review' | 'discuss';
  completed?: boolean;
}

// ============ TEAM TYPES ============
export interface Team {
  _id: string;
  name: string;
  slug: string;
  ownerId: string;
  settings: TeamSettings;
  stats: TeamStats;
  createdAt: string;
  updatedAt: string;
}

export interface TeamSettings {
  allowMemberInvites: boolean;
  defaultRole: 'admin' | 'member';
}

export interface TeamStats {
  memberCount: number;
  callCount: number;
  avgScore: number;
}

export interface TeamMember {
  user: User;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface Invitation {
  _id: string;
  teamId: string;
  email: string;
  role: 'admin' | 'member';
  token: string;
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
}

// ============ ANALYTICS TYPES ============
export interface DashboardMetrics {
  avgScore: number;
  avgScoreTrend: number;
  totalCalls: number;
  totalCallsTrend: number;
  avgTalkRatio: number;
  activeReps: number;
}

export interface ScoreTrendPoint {
  date: string;
  score: number;
}

export interface ObjectionStat {
  type: ObjectionType;
  label: string;
  count: number;
  percentage: number;
}

export interface RepPerformance {
  user: Pick<User, '_id' | 'fullName' | 'avatar' | 'email'>;
  calls: number;
  avgScore: number;
  talkRatio: number;
  trend: number;
}

// ============ API TYPES ============
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// ============ FORM TYPES ============
export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName?: string;
  acceptTerms: boolean;
}

export interface UploadCallFormValues {
  title: string;
  prospectName: string;
  prospectCompany: string;
  prospectRole?: string;
  transcriptText: string;
}
```

### Acceptance Criteria
- [ ] All types from spec defined
- [ ] Types are exported correctly
- [ ] No TypeScript errors
- [ ] Types work in both client and server

---

## Task 1.8: Set Up Environment Configuration

### Description
Create environment variable templates and configuration files.

### Files to Create

#### .env.example (root)
```env
# ============ CLIENT ============
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=CallMentor Pro

# ============ SERVER ============
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/callmentor

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# AI (choose one or both)
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key

# Feature Flags
USE_MOCK_AI=false
USE_MOCK_DATA=false

# Optional: File Storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@callmentor.pro
```

#### server/src/config/constants.ts
```typescript
export const constants = {
  app: {
    name: 'CallMentor Pro',
    version: '1.0.0',
  },

  jwt: {
    accessExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  scoring: {
    weights: {
      discovery: 0.25,
      talkBalance: 0.20,
      objectionHandling: 0.20,
      nextSteps: 0.15,
      rapport: 0.10,
      accuracy: 0.10,
    },
    thresholds: {
      excellent: 80,
      good: 60,
      fair: 40,
    },
  },

  talkRatio: {
    ideal: { min: 40, max: 60 },
    acceptable: { min: 30, max: 70 },
  },

  features: {
    useMockAI: process.env.USE_MOCK_AI === 'true',
    useMockData: process.env.USE_MOCK_DATA === 'true',
  },
} as const;
```

#### client/src/utils/constants.ts
```typescript
export const APP_NAME = 'CallMentor Pro';
export const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const SCORE_COLORS = {
  excellent: '#22c55e', // Green - 80+
  good: '#84cc16',      // Lime - 60-79
  fair: '#eab308',      // Yellow - 40-59
  poor: '#ef4444',      // Red - <40
} as const;

export const SCORE_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Needs Work',
} as const;

export const OBJECTION_TYPES = {
  pricing: { label: 'Pricing', color: '#ef4444' },
  timeline: { label: 'Timeline', color: '#f59e0b' },
  competition: { label: 'Competition', color: '#8b5cf6' },
  authority: { label: 'Authority', color: '#3b82f6' },
  need: { label: 'Need/Fit', color: '#22c55e' },
  other: { label: 'Other', color: '#6b7280' },
} as const;

export const DATE_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
] as const;
```

### Acceptance Criteria
- [ ] Environment template created
- [ ] Constants accessible
- [ ] Feature flags work
- [ ] No hardcoded values

---

## Task 1.9: Set Up React Router

### Description
Configure React Router with the application routes and layouts.

### Files to Create

#### client/src/App.tsx
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthLayout from '@/components/layout/AuthLayout';

// Pages
import LandingPage from '@/pages/Landing';
import LoginPage from '@/pages/Auth/Login';
import RegisterPage from '@/pages/Auth/Register';
import DashboardPage from '@/pages/Dashboard';
import CallsListPage from '@/pages/Calls/CallsList';
import CallDetailPage from '@/pages/Calls/CallDetail';
import TeamPage from '@/pages/Team';
import SettingsPage from '@/pages/Settings';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>; // Replace with proper loading
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public route wrapper (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calls" element={<CallsListPage />} />
          <Route path="/calls/:id" element={<CallDetailPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Install React Router
```bash
cd client
npm install react-router-dom
```

### Acceptance Criteria
- [ ] Routes are defined
- [ ] Protected routes redirect
- [ ] Public routes redirect authenticated users
- [ ] 404 handling works

---

## Task 1.10: Set Up Zustand Store

### Description
Configure Zustand for global state management.

### Installation
```bash
cd client
npm install zustand
```

### Files to Create

#### client/src/store/authStore.ts
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
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

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }),

      setLoading: (isLoading) => set({ isLoading }),
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

#### client/src/store/uiStore.ts
```typescript
import { create } from 'zustand';

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,

  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed
  })),

  setSidebarCollapsed: (collapsed) => set({
    sidebarCollapsed: collapsed
  }),
}));
```

### Acceptance Criteria
- [ ] Auth store persists token
- [ ] UI store manages sidebar
- [ ] State updates correctly
- [ ] TypeScript types work

---

## Phase 1 Checklist Summary

| Task | Description | Status |
|------|-------------|--------|
| 1.1 | Initialize project structure | [ ] |
| 1.2 | Configure Vite & React | [ ] |
| 1.3 | Configure Express server | [ ] |
| 1.4 | Set up Mantine UI | [ ] |
| 1.5 | Set up client folder structure | [ ] |
| 1.6 | Set up server folder structure | [ ] |
| 1.7 | Create TypeScript types | [ ] |
| 1.8 | Set up environment configuration | [ ] |
| 1.9 | Set up React Router | [ ] |
| 1.10 | Set up Zustand store | [ ] |

---

## Dependencies for Next Phase
Before starting Phase 2 (Landing Page), ensure:
- Frontend runs without errors
- Backend health check works
- Mantine theme is configured with violet colors
- Routes are defined
- TypeScript compiles cleanly
