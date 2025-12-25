// ============ USER TYPES ============
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  companyName?: string;
  role: 'user' | 'admin';
  salesRole?: 'sales_manager' | 'vp_sales' | 'sales_rep' | 'enablement';
  organization?: string;
  organizationRole?: 'owner' | 'admin' | 'manager' | 'member';
  isVerified: boolean;
  isOnboarded: boolean;
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
  user: string;
  organization?: string;
  title: string;
  prospect: Prospect;
  repName: string;
  date: string;
  duration: number;
  transcript: TranscriptSegment[];
  transcriptText?: string;
  audioUrl?: string;
  summary?: string;
  analysis?: CallAnalysis;
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

// ============ ANALYSIS TYPES ============
export interface CallAnalysis {
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  metrics: CallMetrics;
  objections: Objection[];
  coachingFeedback: CoachingFeedback;
  summary: string;
}

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
  suggestedResponse?: string;
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

// ============ ORGANIZATION TYPES ============
export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  settings: OrganizationSettings;
  subscription: Subscription;
  members: OrganizationMember[];
  pendingInvitations: Invitation[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  defaultCallVisibility: 'private' | 'team' | 'organization';
  allowMemberInvites: boolean;
  requireApproval: boolean;
}

export interface Subscription {
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  maxMembers: number;
  maxCallsPerMonth: number;
}

export interface OrganizationMember {
  user: User;
  role: 'owner' | 'admin' | 'manager' | 'member';
  joinedAt: string;
  invitedBy?: string;
}

export interface Invitation {
  email: string;
  role: 'admin' | 'manager' | 'member';
  token: string;
  expiresAt: string;
  invitedBy: User;
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
  callCount?: number;
}

export interface ObjectionStat {
  type: ObjectionType;
  label: string;
  count: number;
  percentage: number;
}

export interface MemberPerformance {
  userId: string;
  name: string;
  avatar?: string;
  callCount: number;
  avgScore: number;
  totalDuration: number;
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
  firstName: string;
  lastName: string;
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
