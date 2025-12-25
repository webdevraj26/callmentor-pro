import { Request } from 'express';
import { IUser } from '../models/User';
import { ICall, ICallAnalysis, CallStatus } from '../models/Call';

// ============ AUTH TYPES ============

export interface AuthRequest extends Request {
  user?: IUser;
}

// ============ API RESPONSE TYPES ============

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

// ============ CALL REQUEST TYPES ============

export interface CreateCallRequest {
  title: string;
  prospectName: string;
  prospectCompany: string;
  prospectRole?: string;
  transcriptText: string;
  repName?: string;
  tags?: string[];
  date?: string;
}

export interface UpdateCallRequest {
  title?: string;
  prospect?: {
    name?: string;
    company?: string;
    role?: string;
  };
  tags?: string[];
  repName?: string;
}

export interface CallsQueryParams {
  page?: number;
  limit?: number;
  status?: CallStatus;
  search?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
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
  type: string;
  label: string;
  count: number;
  percentage: number;
}

export interface PerformanceDimension {
  name: string;
  score: number;
  maxScore: number;
  color: string;
}

export interface MemberPerformance {
  userId: string;
  name: string;
  avatar?: string;
  callCount: number;
  avgScore: number;
  totalDuration: number;
}

// ============ RE-EXPORTS ============

export type { ICall, ICallAnalysis, CallStatus };
