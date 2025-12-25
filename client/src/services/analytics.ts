import api from './api';
import type {
  ApiResponse,
  DashboardMetrics,
  ScoreTrendPoint,
  ObjectionStat,
} from '@/types';

export interface PerformanceDimension {
  name: string;
  score: number;
  maxScore: number;
  color: string;
}

export interface CoachingInsights {
  topImprovements: Array<{ title: string; count: number }>;
  topStrengths: Array<{ title: string; count: number }>;
  callsAnalyzed: number;
}

export interface RecentCall {
  _id: string;
  title: string;
  prospect: {
    name: string;
    company: string;
  };
  repName: string;
  date: string;
  duration: number;
  analysis?: {
    overallScore: number;
  };
  tags: string[];
}

export const analyticsService = {
  /**
   * Get dashboard metrics (averages, trends, counts)
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await api.get<ApiResponse<DashboardMetrics>>('/analytics/dashboard');
    return response.data.data;
  },

  /**
   * Get score trends over time
   */
  async getScoreTrends(period: 'week' | 'month' | 'quarter' = 'week'): Promise<ScoreTrendPoint[]> {
    const response = await api.get<ApiResponse<ScoreTrendPoint[]>>('/analytics/trends', {
      params: { period },
    });
    return response.data.data;
  },

  /**
   * Get objection type statistics
   */
  async getObjectionStats(): Promise<ObjectionStat[]> {
    const response = await api.get<ApiResponse<ObjectionStat[]>>('/analytics/objections');
    return response.data.data;
  },

  /**
   * Get performance dimensions (category averages)
   */
  async getPerformanceDimensions(): Promise<PerformanceDimension[]> {
    const response = await api.get<ApiResponse<PerformanceDimension[]>>('/analytics/dimensions');
    return response.data.data;
  },

  /**
   * Get coaching insights (common improvements and strengths)
   */
  async getCoachingInsights(): Promise<CoachingInsights> {
    const response = await api.get<ApiResponse<CoachingInsights>>('/analytics/insights');
    return response.data.data;
  },

  /**
   * Get recent calls for dashboard
   */
  async getRecentCalls(limit: number = 5): Promise<RecentCall[]> {
    const response = await api.get<ApiResponse<RecentCall[]>>('/analytics/recent-calls', {
      params: { limit },
    });
    return response.data.data;
  },
};
