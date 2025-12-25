# CallMentor Pro - Technical Specification Document

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Positioning](#2-product-vision--positioning)
3. [Target Audience](#3-target-audience)
4. [Technical Architecture](#4-technical-architecture)
5. [Landing Page Specification](#5-landing-page-specification)
6. [Authentication & User Management](#6-authentication--user-management)
7. [Core Features Specification](#7-core-features-specification)
8. [AI Integration Strategy](#8-ai-integration-strategy)
9. [Database Schema Design](#9-database-schema-design)
10. [API Design](#10-api-design)
11. [UI/UX Guidelines](#11-uiux-guidelines)
12. [Mocking Strategy for MVP](#12-mocking-strategy-for-mvp)
13. [Implementation Roadmap](#13-implementation-roadmap)
14. [Production Considerations](#14-production-considerations)

---

## 1. Executive Summary

### Product Name
**CallMentor Pro** - AI-Driven Sales Conversation Intelligence

### One-Liner
Unlock your sales team's potential with AI-powered call analytics and personalized coaching insights.

### Problem Statement
Sales leaders face critical challenges:
- Limited visibility into individual rep conversations and techniques
- Inconsistent coaching quality across the team
- Time-consuming manual call review process
- Difficulty identifying patterns in successful vs unsuccessful calls
- Lack of objective metrics for performance improvement

### Solution
An intelligent conversation analytics platform that automatically processes sales calls, delivers objective performance scores, surfaces coaching opportunities, and provides data-driven insights to accelerate team performance.

### MVP Scope
This MVP showcases the core value through:
- A modern, conversion-optimized landing page
- Secure JWT-based authentication
- 4 AI-powered features (conversation analysis, performance scoring, coaching recommendations, team insights)
- Production-ready architecture with clear documentation

---

## 2. Product Vision & Positioning

### Value Proposition
> "From raw conversations to actionable coaching - in seconds, not hours."

CallMentor Pro transforms sales conversations into measurable coaching opportunities, enabling sales leaders to:
- **Reclaim 8+ hours/week** previously spent on manual reviews
- **Surface hidden patterns** across all team conversations
- **Deliver targeted coaching** based on objective data
- **Measure improvement** with consistent scoring metrics

### Competitive Differentiation
Positioned against enterprise players like Gong and Chorus, CallMentor Pro offers:
- Purpose-built for **growing teams (10-100 reps)**
- **Faster deployment** with immediate time-to-value
- **Coaching-centric design** vs full revenue intelligence
- **Transparent, affordable pricing** for scaling organizations

### Core Principles
1. **Data-Driven Coaching**: Every insight backed by conversation data
2. **Actionable Recommendations**: Specific, implementable feedback
3. **Minimal Friction**: Upload and analyze in under 2 minutes
4. **Progressive Complexity**: Simple start, powerful when needed

---

## 3. Target Audience

### Primary Persona: Alex - Sales Director
- **Role**: Director of Sales at mid-market SaaS company
- **Team Size**: 15-30 account executives
- **Pain Points**:
  - Can't personally review all team calls
  - Coaching feedback is delayed and inconsistent
  - Top performer techniques aren't documented or shared
  - Struggles to justify coaching program ROI
- **Goals**:
  - Increase team win rate by 20%
  - Reduce new rep ramp time from 6 to 4 months
  - Create scalable coaching program

### Secondary Persona: Jordan - Account Executive
- **Role**: Senior AE with 3 years experience
- **Experience**: Solid performer seeking improvement
- **Pain Points**:
  - Limited self-improvement resources
  - Feedback is vague and infrequent
  - Unclear what differentiates top performers
- **Goals**:
  - Consistently exceed quota
  - Develop advanced objection handling
  - Prepare for management track

### Tertiary Persona: Morgan - VP of Revenue
- **Role**: VP at early-stage startup ($5-20M ARR)
- **Context**: Building sales org from scratch
- **Pain Points**:
  - No established sales playbook
  - Training first sales hires personally
  - Need to scale sales knowledge quickly
- **Goals**:
  - Document winning sales patterns
  - Build repeatable sales process
  - Enable rapid team expansion

---

## 4. Technical Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18 + Vite | Fast dev experience, modern React patterns, excellent HMR |
| **UI Framework** | Mantine v7 | Complete component library, built-in dark mode, excellent DX |
| **Styling** | Mantine Styles + CSS Modules | Scoped styles, theme integration |
| **Routing** | React Router v6 | Industry standard, nested routes support |
| **State Management** | Zustand + React Query | Lightweight global state + server state caching |
| **Forms** | Formik + Yup | Robust form handling and validation |
| **Backend** | Express.js | Minimal, flexible Node.js framework |
| **Database** | MongoDB + Mongoose | Flexible schema, excellent for JSON-heavy data |
| **Authentication** | JWT + bcrypt | Stateless auth, industry standard security |
| **AI/LLM** | Anthropic Claude / OpenAI GPT-4 | Advanced reasoning for conversation analysis |
| **Charts** | Chart.js + react-chartjs-2 | Lightweight, highly customizable charts |
| **File Storage** | Cloudinary / AWS S3 | Audio file storage with CDN |
| **Deployment** | Railway / Render (Backend), Vercel (Frontend) | Simple deployment, good free tiers |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────────────┐   │
│  │  Landing   │ │   Auth     │ │ Dashboard  │ │ Feature Pages   │   │
│  │   Page     │ │   Pages    │ │   Layout   │ │(Calls, Team...) │   │
│  └────────────┘ └────────────┘ └────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │ HTTP/REST
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Backend (Express.js)                            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────────────┐   │
│  │   Auth     │ │   Calls    │ │   Teams    │ │   Analytics     │   │
│  │  Routes    │ │  Routes    │ │  Routes    │ │    Routes       │   │
│  └────────────┘ └────────────┘ └────────────┘ └─────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Middleware Layer                          │    │
│  │  (Auth, Validation, Error Handling, Rate Limiting)          │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   MongoDB Atlas  │ │   AI Services    │ │  File Storage    │
│   (Database)     │ │ (Claude/OpenAI)  │ │ (Cloudinary/S3)  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Project Structure

```
callmentor-pro/
├── client/                         # React Frontend
│   ├── src/
│   │   ├── pages/                  # Route components
│   │   │   ├── Landing/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── Dashboard/
│   │   │   ├── Calls/
│   │   │   │   ├── CallsList.tsx
│   │   │   │   └── CallDetail.tsx
│   │   │   ├── Team/
│   │   │   └── Settings/
│   │   ├── components/             # Reusable components
│   │   │   ├── common/             # Shared UI components
│   │   │   ├── layout/             # Layout components
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── DashboardLayout.tsx
│   │   │   ├── calls/              # Call-specific components
│   │   │   ├── analytics/          # Chart components
│   │   │   └── coaching/           # Coaching components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── store/                  # Zustand stores
│   │   ├── services/               # API service layer
│   │   ├── utils/                  # Helper utilities
│   │   ├── types/                  # TypeScript types
│   │   ├── styles/                 # Global styles
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                         # Express Backend
│   ├── src/
│   │   ├── routes/                 # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── calls.routes.ts
│   │   │   ├── teams.routes.ts
│   │   │   └── analytics.routes.ts
│   │   ├── controllers/            # Route controllers
│   │   ├── models/                 # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── Call.ts
│   │   │   ├── Team.ts
│   │   │   └── Invitation.ts
│   │   ├── middleware/             # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── validate.ts
│   │   │   └── errorHandler.ts
│   │   ├── services/               # Business logic
│   │   │   ├── ai/
│   │   │   │   ├── analyzer.ts
│   │   │   │   └── prompts.ts
│   │   │   └── metrics/
│   │   ├── utils/                  # Utilities
│   │   ├── config/                 # Configuration
│   │   └── app.ts                  # Express app setup
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                         # Shared types/constants
│   └── types/
│
├── tasks/                          # Implementation task files
├── .env.example
├── docker-compose.yml
├── SPECIFICATION.md
└── README.md
```

---

## 5. Landing Page Specification

### Design Philosophy
- **Dark theme primary** with violet/purple accent colors
- **Sidebar-oriented preview** showing the dashboard style
- **Gradient backgrounds** for visual depth
- **Animated elements** for engagement

### Structure & Sections

#### 5.1 Hero Section
**Purpose**: Immediate value communication with visual impact

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo: CallMentor Pro]          [Features] [Pricing] [Login] [CTA] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   From Raw Conversations to                                          │
│   Actionable Coaching - Instantly                                    │
│                                                                      │
│   AI-powered conversation intelligence that transforms               │
│   every sales call into a growth opportunity.                        │
│                                                                      │
│   [Start Free Trial]    [Book Demo]                                  │
│                                                                      │
│   ✓ 7-day free trial  ✓ No credit card  ✓ Setup in 5 min          │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │     [Dashboard Preview - Dark Theme with Purple Accents]    │   │
│   │     Showing: Sidebar, Score Cards, Analysis View            │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.2 Problem Statement Section
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Your Sales Team Deserves Better                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │  8+ Hours/Week  │  │   90% of Calls  │  │  Inconsistent   │      │
│  │                 │  │                 │  │                 │      │
│  │  Lost to manual │  │  Never get      │  │  Coaching that  │      │
│  │  call reviews   │  │  reviewed       │  │  varies by day  │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
│                                                                      │
│  "We were flying blind. With 20 reps making 100+ calls daily,       │
│   there was no way to know what was working until quota time."      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.3 Solution Section - How It Works
```
┌─────────────────────────────────────────────────────────────────────┐
│                  Three Steps to Better Coaching                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ①                      ②                      ③                   │
│   CAPTURE               ANALYZE                COACH                 │
│   ─────────            ─────────              ─────────              │
│   [Icon: Upload]       [Icon: AI Brain]       [Icon: Growth]        │
│                                                                      │
│   Upload recordings    AI processes each      Get personalized      │
│   or paste call        conversation for       coaching insights     │
│   transcripts          scoring & insights     and track progress    │
│                                                                      │
│   Supports:            Evaluates:             Delivers:              │
│   • Audio files        • Talk ratio           • Strengths           │
│   • Text transcripts   • Discovery skills     • Improvements        │
│   • CRM integrations   • Objection handling   • Action items        │
│                        • Next steps           • Team benchmarks     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.4 Features Grid
```
┌─────────────────────────────────────────────────────────────────────┐
│               Everything You Need in One Platform                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────┐  ┌────────────────────────────┐     │
│  │  [Icon] SMART SCORING      │  │  [Icon] OBJECTION RADAR    │     │
│  │                            │  │                            │     │
│  │  Objective 0-100 scores    │  │  Automatic detection of    │     │
│  │  across 6 key dimensions   │  │  objections & how they     │     │
│  │  with detailed breakdown   │  │  were handled or missed    │     │
│  └────────────────────────────┘  └────────────────────────────┘     │
│                                                                      │
│  ┌────────────────────────────┐  ┌────────────────────────────┐     │
│  │  [Icon] AI COACH           │  │  [Icon] TEAM INSIGHTS      │     │
│  │                            │  │                            │     │
│  │  Personalized feedback     │  │  Aggregate performance     │     │
│  │  with specific quotes &    │  │  dashboards and rep        │     │
│  │  improvement suggestions   │  │  comparisons at a glance   │     │
│  └────────────────────────────┘  └────────────────────────────┘     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.5 Social Proof
```
┌─────────────────────────────────────────────────────────────────────┐
│             Trusted by Forward-Thinking Sales Teams                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   [Logo] [Logo] [Logo] [Logo] [Logo]                                │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  "CallMentor Pro gave us visibility we never had before.   │   │
│   │   Our team's average score improved 27% in 8 weeks."       │   │
│   │                                                             │   │
│   │   — David Chen, Head of Sales @ GrowthTech                 │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐            │
│   │    10,000+    │ │      4.8★     │ │      27%      │            │
│   │ Calls Analyzed│ │ User Rating   │ │ Avg Improvement│            │
│   └───────────────┘ └───────────────┘ └───────────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.6 Pricing Section
```
┌─────────────────────────────────────────────────────────────────────┐
│                    Simple, Transparent Pricing                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │     STARTER     │ │   PROFESSIONAL  │ │   ENTERPRISE    │        │
│  │                 │ │   ★ POPULAR ★   │ │                 │        │
│  │   $49/month     │ │   $146/month    │ │    Custom       │        │
│  │                 │ │                 │ │                 │        │
│  │ • 5 users       │ │ • 20 users      │ │ • Unlimited     │        │
│  │ • 100 calls/mo  │ │ • 500 calls/mo  │ │ • Unlimited     │        │
│  │ • Basic scoring │ │ • Full scoring  │ │ • Custom AI     │        │
│  │ • Email support │ │ • AI coaching   │ │ • SSO & API     │        │
│  │                 │ │ • Team insights │ │ • Dedicated CSM │        │
│  │                 │ │ • Priority supp │ │                 │        │
│  │                 │ │                 │ │                 │        │
│  │  [Start Trial]  │ │  [Start Trial]  │ │ [Contact Sales] │        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.7 Final CTA
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│          Ready to Transform Your Sales Coaching?                     │
│                                                                      │
│   Join hundreds of sales teams already using CallMentor Pro          │
│                                                                      │
│                    [Start Your Free Trial]                           │
│                                                                      │
│   No credit card required • Setup in under 5 minutes                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.8 Footer
```
┌─────────────────────────────────────────────────────────────────────┐
│  CallMentor Pro                                                      │
│                                                                      │
│  Product           Resources        Company        Legal            │
│  ─────────         ─────────        ───────        ─────            │
│  Features          Documentation    About Us       Privacy          │
│  Pricing           API Docs         Careers        Terms            │
│  Integrations      Blog             Contact        Security         │
│  Changelog         Help Center                                      │
│                                                                      │
│  [Twitter] [LinkedIn] [YouTube]                                     │
│                                                                      │
│  © 2024 CallMentor Pro. All rights reserved.                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Authentication & User Management

### Authentication Architecture

Using JWT (JSON Web Tokens) with refresh token rotation for security.

#### 6.1 Auth Flow
```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    Register     │─────▶│  Email Verify   │─────▶│   Dashboard     │
│     Page        │      │   (Optional)    │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                                         ▲
┌─────────────────┐                                      │
│     Login       │──────────────────────────────────────┘
│     Page        │
└─────────────────┘
```

#### 6.2 JWT Strategy
```typescript
// Token structure
interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  teamId?: string;
}

// Access token: 15 minutes
// Refresh token: 7 days (stored in httpOnly cookie)
```

#### 6.3 Auth Endpoints
```
POST /api/auth/register     - Create new account
POST /api/auth/login        - Authenticate user
POST /api/auth/logout       - Invalidate session
POST /api/auth/refresh      - Refresh access token
POST /api/auth/forgot       - Request password reset
POST /api/auth/reset        - Reset password
GET  /api/auth/me           - Get current user
```

#### 6.4 Register Page
```typescript
// Registration form fields
interface RegisterForm {
  fullName: string;        // Required, min 2 chars
  email: string;           // Required, valid email
  password: string;        // Required, min 8 chars, 1 number
  confirmPassword: string; // Must match password
  companyName?: string;    // Optional
  acceptTerms: boolean;    // Required, must be true
}
```

#### 6.5 Login Page
```typescript
// Login form fields
interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

#### 6.6 Backend Auth Implementation
```typescript
// server/src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### 6.7 User Model (MongoDB)
```typescript
// server/src/models/User.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  fullName: {
    type: String,
    required: true,
  },
  avatar: String,
  companyName: String,
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
  lastLogin: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
```

---

## 7. Core Features Specification

### Feature 1: Call Library & Analysis

#### Purpose
Central hub for managing and viewing all analyzed sales conversations.

#### UI - Calls List Page
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                                        │
│ │ Sidebar  │   All Conversations                    [+ New Call]   │
│ │          │   ─────────────────────────────────────────────────   │
│ │ Dashboard│   [Search...] [Filter ▾] [Date Range ▾] [Status ▾]   │
│ │ ────────│                                                        │
│ │ ◉ Calls │   ┌─────────────────────────────────────────────────┐ │
│ │ Team    │   │ ┌────┐  Discovery Call - TechCorp      92/100  │ │
│ │ Coaching│   │ │ TC │  Marcus Johnson • Dec 22 • 28 min       │ │
│ │ Settings│   │ └────┘  Strong discovery, pricing handled well   │ │
│ │          │   │         [Pricing] [Decision Maker] [Analyzed ✓] │ │
│ │          │   └─────────────────────────────────────────────────┘ │
│ │          │                                                        │
│ │          │   ┌─────────────────────────────────────────────────┐ │
│ │          │   │ ┌────┐  Demo Call - StartupXYZ         78/100  │ │
│ │          │   │ │ SX │  Sarah Kim • Dec 21 • 45 min            │ │
│ │          │   │ └────┘  Good demo, missed timeline objection     │ │
│ │          │   │         [Timeline] [Technical] [Analyzed ✓]     │ │
│ │          │   └─────────────────────────────────────────────────┘ │
│ │          │                                                        │
│ │          │   ┌─────────────────────────────────────────────────┐ │
│ │          │   │ ┌────┐  Follow-up - GlobalInc          65/100  │ │
│ │          │   │ │ GI │  James Lee • Dec 20 • 15 min            │ │
│ │          │   │ └────┘  Weak discovery, needs improvement        │ │
│ │          │   │         [Need] [Rapport] [Analyzed ✓]           │ │
│ │          │   └─────────────────────────────────────────────────┘ │
│ └──────────┘                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

#### UI - Call Detail Page
```
┌─────────────────────────────────────────────────────────────────────┐
│ ◀ Back                              [Re-analyze] [Delete] [Share]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Discovery Call - TechCorp                                          │
│  Rep: Marcus Johnson | Dec 22, 2024 | 28 minutes                   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                          SCORE                               │   │
│  │                                                              │   │
│  │          ┌──────────────────────┐                           │   │
│  │          │                      │                           │   │
│  │          │         92           │   Excellent               │   │
│  │          │                      │   Top 15% of team calls   │   │
│  │          └──────────────────────┘                           │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │  Overview    │ │  Transcript  │ │   Coaching   │ │ Objections │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
│                                                                      │
│  [Tab Content Area]                                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Data Models
```typescript
interface Call {
  _id: string;
  userId: string;
  teamId?: string;

  // Basic info
  title: string;
  prospect: {
    name: string;
    company: string;
    role?: string;
  };
  repName: string;
  date: Date;
  duration: number;  // seconds

  // Content
  transcript: TranscriptSegment[];
  audioUrl?: string;

  // AI Analysis
  summary: string;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  metrics: CallMetrics;
  objections: Objection[];
  coachingFeedback: CoachingFeedback;
  tags: string[];

  // Status
  status: 'pending' | 'processing' | 'analyzed' | 'error';
  errorMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

interface TranscriptSegment {
  speaker: 'rep' | 'prospect';
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface CallMetrics {
  talkRatio: number;        // 0-100 percentage
  questionCount: number;
  longestMonologue: number; // seconds
  fillerWordCount: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  engagementScore: number;  // 0-100
}
```

---

### Feature 2: AI Scoring System

#### Scoring Dimensions
| Category | Weight | What It Measures |
|----------|--------|------------------|
| **Discovery & Needs** | 25% | Open questions, pain point identification, depth of understanding |
| **Talk Balance** | 20% | Rep talk time vs prospect (ideal: 40-60%) |
| **Objection Handling** | 20% | Recognition and resolution of concerns |
| **Next Steps** | 15% | Clear actions, commitment level, timeline |
| **Rapport & Trust** | 10% | Personalization, active listening, empathy |
| **Accuracy** | 10% | Product knowledge, correct information |

#### Score Breakdown Structure
```typescript
interface ScoreBreakdown {
  overall: number;  // 0-100
  categories: {
    discovery: CategoryScore;
    talkBalance: CategoryScore;
    objectionHandling: CategoryScore;
    nextSteps: CategoryScore;
    rapport: CategoryScore;
    accuracy: CategoryScore;
  };
}

interface CategoryScore {
  score: number;        // 0-100
  weight: number;       // 0.10 - 0.25
  reasoning: string;    // AI explanation
  highlights?: string[]; // Key moments
}
```

#### Score Visualization
```
┌─────────────────────────────────────────────────────────────────────┐
│  Performance Breakdown                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Discovery & Needs (25%)                                            │
│  ████████████████████████████████████░░░░░░░░░░  88/100             │
│  "Excellent use of open-ended questions to uncover needs"           │
│                                                                      │
│  Talk Balance (20%)                                                  │
│  ██████████████████████████████████████████████  95/100             │
│  "Perfect 45% talk ratio - ideal for discovery calls"               │
│                                                                      │
│  Objection Handling (20%)                                           │
│  ████████████████████████████████████████░░░░░░  90/100             │
│  "Addressed pricing concern effectively with ROI data"              │
│                                                                      │
│  Next Steps (15%)                                                    │
│  ██████████████████████████████░░░░░░░░░░░░░░░░  75/100             │
│  "Clear follow-up agreed but no specific date set"                  │
│                                                                      │
│  Rapport & Trust (10%)                                               │
│  ████████████████████████████████████████████░░  92/100             │
│  "Strong personal connection, referenced prior conversation"        │
│                                                                      │
│  Accuracy (10%)                                                      │
│  ████████████████████████████████████████████░░  90/100             │
│  "All product information accurate"                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Feature 3: AI Coaching Feedback

#### Feedback Structure
```typescript
interface CoachingFeedback {
  summary: string;  // 2-3 sentence overview

  strengths: Strength[];
  improvements: Improvement[];
  actionItems: ActionItem[];

  comparisonToTeam?: {
    metric: string;
    userValue: number;
    teamAverage: number;
    percentile: number;
  }[];
}

interface Strength {
  title: string;
  description: string;
  quote?: string;
  timestamp?: string;
  impact: 'high' | 'medium';
}

interface Improvement {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  quote?: string;
  timestamp?: string;
  suggestion: string;
  example?: string;
}

interface ActionItem {
  task: string;
  type: 'practice' | 'study' | 'review' | 'discuss';
  dueDate?: string;
}
```

#### Coaching Tab UI
```
┌─────────────────────────────────────────────────────────────────────┐
│  AI Coaching Analysis                                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Overview                                                            │
│  ──────────────────────────────────────────────────────────────     │
│  Strong discovery call with excellent questioning. Marcus did a      │
│  great job uncovering the prospect's core challenges. The pricing   │
│  objection was handled professionally. Consider strengthening the   │
│  commitment on next steps.                                          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ✓ STRENGTHS                                                 │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  Outstanding Discovery Questions                             │   │
│  │  ────────────────────────────                               │   │
│  │  Asked 14 open-ended questions that surfaced 3 distinct     │   │
│  │  pain points. This is 40% above team average.               │   │
│  │                                                              │   │
│  │  📝 "What would it mean for your team if you could cut      │   │
│  │     review time by 80%?" [4:32]                             │   │
│  │                                                              │   │
│  │  ────────────────────────────────────────────────────────   │   │
│  │                                                              │   │
│  │  Effective Pricing Reframe                                   │   │
│  │  ────────────────────────────                               │   │
│  │  When prospect raised budget concerns, immediately pivoted   │   │
│  │  to ROI discussion with specific customer examples.          │   │
│  │                                                              │   │
│  │  📝 "Let me share what similar teams have seen..." [18:45]  │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ⚠ AREAS FOR IMPROVEMENT                                    │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  Strengthen Next Step Commitment         [MEDIUM PRIORITY]   │   │
│  │  ──────────────────────────────                             │   │
│  │  Follow-up was agreed upon but without a specific date.     │   │
│  │  This reduces show-rate by ~35%.                            │   │
│  │                                                              │   │
│  │  📝 "Let's connect again next week" [26:12]                 │   │
│  │                                                              │   │
│  │  💡 TRY THIS: "I have Thursday at 2pm or Friday at 10am -   │   │
│  │     which works better for you?" Get calendar commitment.   │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📋 ACTION ITEMS                                             │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  □ Practice the "two-option calendar close" technique       │   │
│  │  □ Review Sarah's call from Dec 15 for next-step examples   │   │
│  │  □ Study: "Getting Commitment" in the training library      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Feature 4: Team Analytics Dashboard

#### Dashboard Overview
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                                        │
│ │ Sidebar  │   Team Dashboard                     [Last 30 days ▾] │
│ │          │   ─────────────────────────────────────────────────   │
│ │ Dashboard│                                                        │
│ │ ────────│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────┐ │
│ │ Calls   │   │    82      │ │    127     │ │   44%      │ │  6  │ │
│ │ ◉ Team  │   │ Team Avg   │ │   Calls    │ │ Avg Talk   │ │Reps │ │
│ │ Coaching│   │  Score     │ │  Analyzed  │ │   Ratio    │ │     │ │
│ │ Settings│   │  ↑ 5%      │ │  ↑ 12%     │ │  → 0%      │ │     │ │
│ │          │   └────────────┘ └────────────┘ └────────────┘ └─────┘ │
│ │          │                                                        │
│ │          │   ┌───────────────────────┐ ┌─────────────────────┐   │
│ │          │   │  SCORE TREND          │ │  TOP PERFORMERS     │   │
│ │          │   │                       │ │                     │   │
│ │          │   │    [Line Chart]       │ │  1. Sarah Kim  94   │   │
│ │          │   │                       │ │  2. Marcus J.  89   │   │
│ │          │   │     ╱╲    ╱           │ │  3. Alex Chen  85   │   │
│ │          │   │   ╱    ╲╱            │ │  4. James Lee  78   │   │
│ │          │   │  ╱                    │ │  5. Lisa Park  72   │   │
│ │          │   │                       │ │                     │   │
│ │          │   └───────────────────────┘ └─────────────────────┘   │
│ │          │                                                        │
│ │          │   ┌───────────────────────┐ ┌─────────────────────┐   │
│ │          │   │ OBJECTION BREAKDOWN   │ │ COACHING PRIORITIES │   │
│ │          │   │                       │ │                     │   │
│ │          │   │ Pricing    ████ 42%   │ │   [Donut Chart]     │   │
│ │          │   │ Timeline   ███  28%   │ │                     │   │
│ │          │   │ Authority  ██   18%   │ │  • Objections 35%   │   │
│ │          │   │ Other      █    12%   │ │  • Discovery  28%   │   │
│ │          │   │                       │ │  • Next Steps 22%   │   │
│ │          │   └───────────────────────┘ └─────────────────────┘   │
│ │          │                                                        │
│ │          │   REP PERFORMANCE TABLE                               │
│ │          │   ┌───────────────────────────────────────────────┐   │
│ │          │   │ Rep          Calls   Score   Ratio   Trend   │   │
│ │          │   ├───────────────────────────────────────────────┤   │
│ │          │   │ Sarah Kim       24     94      42%    ↑ +6    │   │
│ │          │   │ Marcus J.       18     89      45%    ↑ +3    │   │
│ │          │   │ Alex Chen       21     85      48%    → 0     │   │
│ │          │   │ James Lee       15     78      55%    ↓ -2    │   │
│ │          │   │ Lisa Park       12     72      38%    ↑ +4    │   │
│ │          │   └───────────────────────────────────────────────┘   │
│ └──────────┘                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. AI Integration Strategy

### 8.1 Provider Selection
Primary: **Anthropic Claude 3** (claude-3-sonnet)
- Superior reasoning for nuanced conversation analysis
- Better at following complex JSON output formats
- More consistent coaching tone

Fallback: **OpenAI GPT-4**
- Widely available
- Good general performance

### 8.2 Prompt Templates

```typescript
// server/src/services/ai/prompts.ts

export const SYSTEM_PROMPT = `You are an expert sales coach and conversation analyst with 15+ years of experience developing top-performing sales teams. Your role is to analyze sales conversations and provide:

1. Objective, data-driven scoring
2. Specific, actionable coaching feedback
3. Practical improvement suggestions based on proven techniques

Be direct, specific, and cite exact moments from conversations. Focus on behaviors that can be changed and improved.`;

export const ANALYSIS_PROMPT = `Analyze this sales conversation transcript comprehensively.

TRANSCRIPT:
{transcript}

Provide your analysis in this exact JSON format:
{
  "summary": "2-3 sentence overview of the call",
  "score": {
    "overall": <0-100>,
    "categories": {
      "discovery": {
        "score": <0-100>,
        "reasoning": "Brief explanation",
        "highlights": ["Key moment 1", "Key moment 2"]
      },
      "talkBalance": {
        "score": <0-100>,
        "actualRatio": <percentage>,
        "reasoning": "Brief explanation"
      },
      "objectionHandling": {
        "score": <0-100>,
        "objectionsFound": <count>,
        "objectionsAddressed": <count>,
        "reasoning": "Brief explanation"
      },
      "nextSteps": {
        "score": <0-100>,
        "hasCommitment": <boolean>,
        "commitmentStrength": "weak|moderate|strong",
        "reasoning": "Brief explanation"
      },
      "rapport": {
        "score": <0-100>,
        "reasoning": "Brief explanation"
      },
      "accuracy": {
        "score": <0-100>,
        "reasoning": "Brief explanation"
      }
    }
  },
  "objections": [
    {
      "text": "What the prospect said",
      "type": "pricing|timeline|authority|competition|need|other",
      "timestamp": "approximate time",
      "addressed": <boolean>,
      "handling": "well|partial|poor|missed",
      "repResponse": "What the rep said (if addressed)"
    }
  ],
  "coaching": {
    "strengths": [
      {
        "title": "Short title",
        "description": "What was done well",
        "quote": "Exact quote if applicable",
        "timestamp": "When it happened"
      }
    ],
    "improvements": [
      {
        "title": "Short title",
        "description": "What could be better",
        "priority": "high|medium|low",
        "quote": "Exact quote if applicable",
        "timestamp": "When it happened",
        "suggestion": "Specific technique to try"
      }
    ],
    "actionItems": [
      {
        "task": "Specific action to take",
        "type": "practice|study|review|discuss"
      }
    ]
  },
  "tags": ["Relevant", "Tags", "For", "Filtering"]
}`;
```

### 8.3 Analysis Service

```typescript
// server/src/services/ai/analyzer.ts
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, ANALYSIS_PROMPT } from './prompts';

export class CallAnalyzer {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyzeCall(transcript: string): Promise<AnalysisResult> {
    const message = await this.client.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: ANALYSIS_PROMPT.replace('{transcript}', transcript),
      }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return JSON.parse(content.text);
  }
}
```

---

## 9. Database Schema Design

### MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,           // unique, indexed
  password: String,        // hashed, select: false
  fullName: String,
  avatar: String,
  companyName: String,
  role: String,            // 'user' | 'admin'

  // Team membership
  teamId: ObjectId,        // ref: 'Team'
  teamRole: String,        // 'owner' | 'admin' | 'member'

  // Account status
  isVerified: Boolean,
  lastLogin: Date,

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ email: 1 }              // unique
{ teamId: 1 }
```

#### Teams Collection
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,            // unique, URL-friendly
  ownerId: ObjectId,       // ref: 'User'

  settings: {
    allowMemberInvites: Boolean,
    defaultRole: String,
  },

  // Stats (denormalized for performance)
  stats: {
    memberCount: Number,
    callCount: Number,
    avgScore: Number,
  },

  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ slug: 1 }               // unique
{ ownerId: 1 }
```

#### Calls Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // ref: 'User' - who uploaded
  teamId: ObjectId,        // ref: 'Team'

  // Call info
  title: String,
  prospect: {
    name: String,
    company: String,
    role: String,
  },
  repName: String,
  date: Date,
  duration: Number,        // seconds

  // Content
  transcriptText: String,  // raw text for search
  transcript: [{           // parsed segments
    speaker: String,
    speakerName: String,
    startTime: Number,
    endTime: Number,
    text: String,
  }],
  audioUrl: String,

  // AI Analysis (stored as subdocuments)
  summary: String,
  score: Number,
  scoreBreakdown: {
    overall: Number,
    categories: Mixed,     // flexible schema
  },
  metrics: {
    talkRatio: Number,
    questionCount: Number,
    longestMonologue: Number,
    fillerWordCount: Number,
    sentiment: String,
    engagementScore: Number,
  },
  objections: [{
    text: String,
    type: String,
    timestamp: String,
    addressed: Boolean,
    handling: String,
    repResponse: String,
  }],
  coachingFeedback: {
    summary: String,
    strengths: Array,
    improvements: Array,
    actionItems: Array,
  },
  tags: [String],

  // Status
  status: String,          // 'pending' | 'processing' | 'analyzed' | 'error'
  errorMessage: String,

  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ userId: 1, date: -1 }
{ teamId: 1, date: -1 }
{ status: 1 }
{ tags: 1 }
{ 'prospect.company': 1 }
{ transcriptText: 'text' }  // text search
```

#### Invitations Collection
```javascript
{
  _id: ObjectId,
  teamId: ObjectId,        // ref: 'Team'
  email: String,
  role: String,            // 'admin' | 'member'
  token: String,           // unique invite token

  invitedBy: ObjectId,     // ref: 'User'
  expiresAt: Date,
  acceptedAt: Date,

  createdAt: Date
}

// Indexes
{ token: 1 }              // unique
{ teamId: 1, email: 1 }   // compound
{ expiresAt: 1 }          // TTL index possible
```

---

## 10. API Design

### Base URL & Headers
```
Base URL: /api/v1
Content-Type: application/json
Authorization: Bearer <token>
```

### Response Format
```typescript
// Success
{
  success: true,
  data: <response data>,
  meta?: {
    page: number,
    limit: number,
    total: number,
  }
}

// Error
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any,
  }
}
```

### Endpoints

#### Authentication
```
POST   /auth/register     Register new user
POST   /auth/login        Login
POST   /auth/logout       Logout
POST   /auth/refresh      Refresh token
GET    /auth/me           Get current user
PATCH  /auth/me           Update profile
POST   /auth/forgot       Request password reset
POST   /auth/reset/:token Reset password
```

#### Calls
```
GET    /calls             List calls (paginated, filterable)
POST   /calls             Create new call
GET    /calls/:id         Get call details
DELETE /calls/:id         Delete call
POST   /calls/:id/analyze Trigger AI analysis
GET    /calls/:id/export  Export call report
```

#### Teams
```
GET    /teams             Get user's team
POST   /teams             Create team
PATCH  /teams/:id         Update team
DELETE /teams/:id         Delete team

GET    /teams/:id/members      List members
POST   /teams/:id/members      Add member (direct)
DELETE /teams/:id/members/:uid Remove member
PATCH  /teams/:id/members/:uid Update member role

POST   /teams/:id/invitations       Create invitation
GET    /teams/:id/invitations       List pending invitations
DELETE /teams/:id/invitations/:iid  Cancel invitation
POST   /invitations/:token/accept   Accept invitation
```

#### Analytics
```
GET    /analytics/overview   Dashboard metrics
GET    /analytics/trends     Score trends over time
GET    /analytics/team       Team comparison data
GET    /analytics/objections Objection breakdown
```

---

## 11. UI/UX Guidelines

### Design System

#### Color Palette (Dark Theme Primary)
```css
:root {
  /* Primary - Violet */
  --primary-50: #f5f3ff;
  --primary-100: #ede9fe;
  --primary-200: #ddd6fe;
  --primary-300: #c4b5fd;
  --primary-400: #a78bfa;
  --primary-500: #8b5cf6;  /* Main accent */
  --primary-600: #7c3aed;
  --primary-700: #6d28d9;
  --primary-800: #5b21b6;
  --primary-900: #4c1d95;

  /* Background (Dark) */
  --bg-base: #0f0f12;
  --bg-surface: #18181b;
  --bg-elevated: #27272a;
  --bg-hover: #3f3f46;

  /* Text */
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;

  /* Status */
  --success: #22c55e;
  --warning: #eab308;
  --error: #ef4444;
  --info: #3b82f6;

  /* Score Colors */
  --score-excellent: #22c55e;  /* 80+ */
  --score-good: #84cc16;       /* 60-79 */
  --score-fair: #eab308;       /* 40-59 */
  --score-poor: #ef4444;       /* <40 */
}
```

#### Typography
```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Headings */
h1: 2rem (32px) / bold
h2: 1.5rem (24px) / semibold
h3: 1.25rem (20px) / semibold
h4: 1rem (16px) / semibold

/* Body */
body: 0.875rem (14px) / regular
small: 0.75rem (12px) / regular
```

#### Component Patterns

**Cards**
```
- Dark surface background (#18181b)
- Subtle border (1px #27272a)
- Rounded corners (8px)
- Padding: 16-24px
- Hover: slight brightness increase
```

**Buttons**
```
Primary: Gradient violet (#7c3aed → #8b5cf6)
Secondary: Dark with border
Ghost: Transparent with hover
Sizes: sm (32px), md (40px), lg (48px)
```

**Inputs**
```
Background: #27272a
Border: 1px #3f3f46
Focus: Ring with primary color
Border radius: 6px
Height: 40px
```

### Layout Patterns

#### Sidebar Navigation
```
┌──────────────────────────────────────────────┐
│ ┌────────┐                                   │
│ │ Logo   │   Main Content Area               │
│ ├────────┤                                   │
│ │        │                                   │
│ │  Nav   │   ┌───────────────────────────┐  │
│ │  Items │   │   Page Content            │  │
│ │        │   │                           │  │
│ │        │   │                           │  │
│ │        │   │                           │  │
│ ├────────┤   │                           │  │
│ │ User   │   │                           │  │
│ │ Menu   │   │                           │  │
│ └────────┘   └───────────────────────────┘  │
└──────────────────────────────────────────────┘

Sidebar width: 240px (collapsed: 64px)
Main content: flex-1
```

#### Responsive Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

---

## 12. Mocking Strategy for MVP

### What's Mocked vs Real

| Component | MVP Approach | Production |
|-----------|--------------|------------|
| **Auth** | Real JWT auth | Same + OAuth |
| **Database** | Real MongoDB | Same |
| **AI Analysis** | Real API calls OR mock | Real API |
| **Audio Upload** | Text only | Audio + transcription |
| **Team Members** | Seed data | Real invites |
| **Email** | Console log | SendGrid/SES |

### Mock Data Files
```
client/src/mocks/
├── calls.ts          # Sample analyzed calls
├── users.ts          # Team member profiles
├── transcripts.ts    # Full conversation transcripts
└── analytics.ts      # Dashboard statistics
```

### Mock Data Example
```typescript
// client/src/mocks/calls.ts
export const mockCalls = [
  {
    _id: '1',
    title: 'Discovery Call - TechCorp',
    prospect: {
      name: 'Jennifer Martinez',
      company: 'TechCorp Industries',
      role: 'VP of Operations',
    },
    repName: 'Marcus Johnson',
    date: new Date('2024-12-22'),
    duration: 1680, // 28 minutes
    summary: 'Strong discovery call focused on operational efficiency...',
    score: 92,
    scoreBreakdown: {
      overall: 92,
      categories: {
        discovery: { score: 95, reasoning: 'Exceptional questioning...' },
        // ... other categories
      },
    },
    status: 'analyzed',
    // ... full mock data
  },
  // More mock calls
];
```

---

## 13. Implementation Roadmap

### Phase 1: Project Foundation
- [ ] Initialize monorepo structure
- [ ] Set up React + Vite frontend
- [ ] Set up Express + TypeScript backend
- [ ] Configure MongoDB connection
- [ ] Set up Mantine UI theme
- [ ] Configure ESLint, Prettier

### Phase 2: Landing Page
- [ ] Build landing page layout
- [ ] Create hero section with animation
- [ ] Build feature sections
- [ ] Add pricing display
- [ ] Implement responsive design

### Phase 3: Authentication
- [ ] Create User model
- [ ] Build auth API routes
- [ ] Implement JWT middleware
- [ ] Create login/register forms
- [ ] Set up protected routes
- [ ] Add auth state management

### Phase 4: Dashboard Layout
- [ ] Build sidebar navigation
- [ ] Create dashboard layout component
- [ ] Build metric card components
- [ ] Set up routing structure
- [ ] Add user menu

### Phase 5: Call Features
- [ ] Create Call model
- [ ] Build calls API routes
- [ ] Create calls list page
- [ ] Build call detail page with tabs
- [ ] Implement transcript viewer
- [ ] Add upload call modal

### Phase 6: AI Integration
- [ ] Set up Anthropic/OpenAI client
- [ ] Create analysis prompts
- [ ] Build analysis service
- [ ] Create analyze endpoint
- [ ] Connect to UI
- [ ] Add processing states

### Phase 7: Team Analytics
- [ ] Build Team model
- [ ] Create team API routes
- [ ] Build analytics charts
- [ ] Create team dashboard
- [ ] Add member management

---

## 14. Production Considerations

### Security Checklist
- [ ] Rate limiting on all endpoints
- [ ] Input validation with Joi/Zod
- [ ] XSS protection
- [ ] CORS configuration
- [ ] Helmet.js security headers
- [ ] Password hashing with bcrypt (cost 12)
- [ ] JWT refresh token rotation
- [ ] Secure httpOnly cookies

### Performance
- [ ] MongoDB indexes optimized
- [ ] API response compression
- [ ] Frontend code splitting
- [ ] Image optimization
- [ ] CDN for static assets

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] API logging
- [ ] Performance monitoring
- [ ] Health check endpoints

### Deployment
- [ ] Environment variables documented
- [ ] Docker configuration
- [ ] CI/CD pipeline
- [ ] Database backup strategy

---

## Appendix A: Environment Variables

```env
# Client (.env)
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=CallMentor Pro

# Server (.env)
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/callmentor

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key

# File Storage (optional for MVP)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (optional for MVP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## Appendix B: Quick Start Commands

```bash
# Clone and setup
git clone <repo>
cd callmentor-pro

# Install dependencies
cd client && npm install
cd ../server && npm install

# Start development
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev

# Access
Frontend: http://localhost:5173
Backend: http://localhost:5000
```

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Stack: React + Express + MongoDB*
