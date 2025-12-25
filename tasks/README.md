# CallMentor Pro - Implementation Tasks

## Overview

This folder contains all implementation task files for building CallMentor Pro, an AI-powered sales call coaching platform. The project is divided into 7 phases, each building upon the previous one.

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18 + Vite |
| UI Framework | Mantine v7 |
| State Management | Zustand + React Query |
| Forms | Formik + Yup |
| Charts | Chart.js + react-chartjs-2 |
| Backend | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (access + refresh tokens) |
| AI | Anthropic Claude / OpenAI GPT-4 |
| File Storage | Local / S3 |

## Phases Overview

### Phase 1: Project Setup
**File:** `phase-1-project-setup.md`

Initial project scaffolding and configuration:
- Monorepo structure with `/client` and `/server` folders
- Vite + React configuration
- Express server with MongoDB connection
- Mantine theme setup (dark theme, violet primary color)
- TypeScript types and interfaces
- Zustand stores and React Query setup
- React Router configuration

**Estimated Tasks:** 8 subtasks

---

### Phase 2: Landing Page
**File:** `phase-2-landing-page.md`

Public marketing website:
- Header with navigation and CTA buttons
- Hero section with gradient backgrounds
- Problem statement section
- How It Works section (3 steps)
- Features grid
- Social proof / testimonials
- Pricing section (3 tiers: Starter $49, Professional $146, Enterprise)
- Final CTA section
- Footer with links

**Estimated Tasks:** 10 subtasks

---

### Phase 3: Authentication
**File:** `phase-3-authentication.md`

User authentication system:
- User Mongoose model with bcrypt password hashing
- JWT utility functions (access + refresh tokens)
- Auth middleware for protected routes
- Auth controller (register, login, logout, refresh, me)
- Auth routes
- Zustand auth store
- Login page with Mantine forms
- Register page
- Route guards for protected pages

**Estimated Tasks:** 9 subtasks

---

### Phase 4: Dashboard & Navigation
**File:** `phase-4-dashboard-navigation.md`

Main application layout and dashboard:
- Sidebar navigation component (collapsible)
- Dashboard layout wrapper
- MetricCard component
- ScoreTrendChart component (Chart.js line chart)
- TopPerformersList component
- RecentCallsList component
- Dashboard page assembly
- User menu in sidebar

**Estimated Tasks:** 8 subtasks

---

### Phase 5: Call Features
**File:** `phase-5-call-features.md`

Core call management functionality:
- Call Mongoose model
- Calls API routes (CRUD operations)
- Calls controller
- Transcript parser utility
- Calls Zustand store
- CallCard component
- Calls list page with filters
- Upload call modal (file + metadata)
- Call detail page with tabs
- Transcript viewer component

**Estimated Tasks:** 10 subtasks

---

### Phase 6: AI Integration
**File:** `phase-6-ai-integration.md`

AI-powered call analysis:
- AI client supporting Anthropic Claude and OpenAI
- Analysis prompts for:
  - Overall scoring
  - Objection handling
  - Coaching suggestions
  - Talk ratio analysis
  - Sentiment detection
- Call analyzer service
- Analysis API endpoint
- Analysis progress UI
- CoachingTab component
- ObjectionsTab component
- ScoreBreakdown component

**Estimated Tasks:** 10 subtasks

---

### Phase 7: Team Analytics
**File:** `phase-7-team-analytics.md`

Organization and team features:
- Organization Mongoose model (members, roles, invitations)
- Organization API routes
- Organization controller
- Analytics Zustand store
- TeamOverviewCard component
- TeamPerformanceChart (Chart.js line chart)
- MemberLeaderboard component
- ScoreDistributionChart (Chart.js bar chart)
- TeamAnalyticsPage
- OrganizationSettingsPage with tabs
- Member invitation system
- Role management (owner, admin, manager, member)

**Estimated Tasks:** 6 subtasks

---

## Implementation Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
```

Each phase should be completed and tested before moving to the next. Some tasks within a phase can be done in parallel (e.g., frontend and backend work).

## Project Structure

```
callmentor-pro/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── stores/            # Zustand stores
│   │   ├── services/          # API service layer
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript types
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Express middleware
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   └── index.js           # Entry point
│   └── package.json
│
├── SPECIFICATION.md           # Full technical specification
└── tasks/                     # Implementation task files
    ├── README.md              # This file
    ├── phase-1-project-setup.md
    ├── phase-2-landing-page.md
    ├── phase-3-authentication.md
    ├── phase-4-dashboard-navigation.md
    ├── phase-5-call-features.md
    ├── phase-6-ai-integration.md
    └── phase-7-team-analytics.md
```

## Key Differences from SalesCoach AI

| Aspect | SalesCoach AI | CallMentor Pro |
|--------|--------------|----------------|
| Framework | Next.js 14 | React + Vite |
| UI Library | shadcn/ui + Tailwind | Mantine v7 |
| Database | Supabase (PostgreSQL) | MongoDB |
| Auth | Supabase Auth | JWT (custom) |
| Backend | Next.js API Routes | Express.js |
| State | React Query | Zustand + React Query |
| Forms | React Hook Form + Zod | Formik + Yup |
| Charts | Recharts | Chart.js |
| Theme | Light with blue accents | Dark with violet accents |
| Layout | Top navbar | Sidebar navigation |

## Getting Started

1. Read `SPECIFICATION.md` for the full technical specification
2. Start with `phase-1-project-setup.md`
3. Follow each phase in order
4. Each task file contains:
   - Task breakdown with code examples
   - File paths for each component
   - Verification checklists
   - Implementation notes

## Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/callmentor
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
```

## Notes

- All code examples use modern ES6+ JavaScript
- Mantine v7 is used throughout (different API from v6)
- Dark theme is the default
- Violet (#7c3aed) is the primary brand color
- Chart.js with react-chartjs-2 wrapper for all visualizations
