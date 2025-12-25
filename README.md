# CallMentor Pro

AI-powered sales call analysis and coaching platform that helps sales teams improve performance through intelligent call evaluation and actionable insights.

## Overview

CallMentor Pro analyzes sales call transcripts using Google Gemini AI to provide:

- Comprehensive scoring and performance metrics
- Call quality analysis with detailed breakdowns
- Objection handling assessment
- Coaching feedback with actionable insights
- Team analytics and performance tracking
- Organization-level management

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Build tool with fast HMR
- **Mantine 8** - UI component library
- **Zustand** - State management
- **Chart.js** - Data visualization
- **React Router** - Client-side routing

### Backend
- **Node.js** with Express 5
- **TypeScript**
- **MongoDB** with Mongoose ODM
- **JWT** - Authentication
- **Multer** - File uploads

### AI Services
- **Google Gemini API** (gemini-2.5-flash)

## Project Structure

```
callmentor-pro/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── store/              # Zustand state stores
│   │   ├── services/           # API service layer
│   │   ├── types/              # TypeScript definitions
│   │   └── theme/              # Mantine theme config
│   └── package.json
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── models/             # Mongoose schemas
│   │   ├── controllers/        # Route handlers
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic & AI
│   │   ├── middleware/         # Auth & upload middleware
│   │   └── config/             # Database & constants
│   └── package.json
│
└── .env.example                # Environment template
```

## Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- Google Gemini API key

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd callmentor-pro
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/callmentor

# JWT Secrets (change in production)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# URLs
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

### 3. Backend Setup

```bash
cd server
npm install
npm run build
npm run dev
```

The server runs on `http://localhost:5000`

### 4. Frontend Setup

In a new terminal:

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173`

## Available Scripts

### Backend (`/server`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |

### Frontend (`/client`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Calls
- `POST /api/calls` - Create call with transcript
- `POST /api/calls/upload` - Upload audio file
- `GET /api/calls` - List calls (paginated)
- `GET /api/calls/:id` - Get call details
- `POST /api/calls/:id/analyze` - Analyze call

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/scores` - Score trends
- `GET /api/analytics/team` - Team performance

### Organizations
- `GET /api/organizations/me` - Get organization
- `POST /api/organizations/invite` - Invite member

## Features

### Call Analysis
- Upload transcripts or audio files
- AI-powered analysis with scoring
- Six-category scorecard:
  - Discovery (25%)
  - Talk Balance (20%)
  - Objection Handling (20%)
  - Next Steps (15%)
  - Rapport (10%)
  - Accuracy (10%)

### Metrics Tracked
- Talk ratio (rep vs prospect)
- Question count
- Longest monologue
- Filler word count
- Sentiment analysis
- Engagement score

### Objection Handling
- Identifies objection types (pricing, timeline, competition, etc.)
- Tracks handling quality
- Suggests better responses

### Coaching Feedback
- Strengths with impact assessment
- Improvement areas with priorities
- Actionable coaching items

### Team Management
- Role-based access control
- Member invitations
- Team analytics and leaderboards
- Organization settings

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `PORT` | Server port (default: 5000) | No |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `USE_MOCK_AI` | Use mock AI service | No |

## Development

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Path aliases for clean imports (`@/`, `@components/`)

### State Management
- Zustand stores with localStorage persistence
- Separate stores for auth, organization, and calls

### Security
- Helmet for HTTP headers
- CORS with origin whitelist
- bcrypt password hashing (12 rounds)
- JWT with 15m access / 7d refresh tokens

## License

MIT
