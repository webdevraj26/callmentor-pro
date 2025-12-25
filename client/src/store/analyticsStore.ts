import { create } from 'zustand';
import type { DashboardMetrics, ScoreTrendPoint, ObjectionStat } from '@/types';
import { analyticsService } from '@/services/analytics';
import type {
  PerformanceDimension,
  CoachingInsights,
  RecentCall,
} from '@/services/analytics';

interface AnalyticsState {
  // Dashboard data
  dashboardMetrics: DashboardMetrics | null;
  scoreTrends: ScoreTrendPoint[];
  performanceDimensions: PerformanceDimension[];
  objectionStats: ObjectionStat[];
  coachingInsights: CoachingInsights | null;
  recentCalls: RecentCall[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Settings
  trendPeriod: 'week' | 'month' | 'quarter';
}

interface AnalyticsActions {
  // Fetch operations
  fetchDashboardData: () => Promise<void>;
  fetchScoreTrends: (period?: 'week' | 'month' | 'quarter') => Promise<void>;
  fetchObjectionStats: () => Promise<void>;
  fetchCoachingInsights: () => Promise<void>;
  fetchRecentCalls: (limit?: number) => Promise<void>;

  // Convenience methods
  refreshAll: () => Promise<void>;
  setTrendPeriod: (period: 'week' | 'month' | 'quarter') => void;
  clearError: () => void;
  reset: () => void;
}

type AnalyticsStore = AnalyticsState & AnalyticsActions;

const initialState: AnalyticsState = {
  dashboardMetrics: null,
  scoreTrends: [],
  performanceDimensions: [],
  objectionStats: [],
  coachingInsights: null,
  recentCalls: [],
  isLoading: false,
  error: null,
  trendPeriod: 'week',
};

export const useAnalyticsStore = create<AnalyticsStore>()((set, get) => ({
  ...initialState,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [metrics, dimensions] = await Promise.all([
        analyticsService.getDashboardMetrics(),
        analyticsService.getPerformanceDimensions(),
      ]);
      set({
        dashboardMetrics: metrics,
        performanceDimensions: dimensions,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      set({ error: message, isLoading: false });
    }
  },

  fetchScoreTrends: async (period) => {
    const trendPeriod = period || get().trendPeriod;
    try {
      const trends = await analyticsService.getScoreTrends(trendPeriod);
      set({ scoreTrends: trends, trendPeriod });
    } catch (error) {
      console.error('Failed to fetch score trends:', error);
    }
  },

  fetchObjectionStats: async () => {
    try {
      const stats = await analyticsService.getObjectionStats();
      set({ objectionStats: stats });
    } catch (error) {
      console.error('Failed to fetch objection stats:', error);
    }
  },

  fetchCoachingInsights: async () => {
    try {
      const insights = await analyticsService.getCoachingInsights();
      set({ coachingInsights: insights });
    } catch (error) {
      console.error('Failed to fetch coaching insights:', error);
    }
  },

  fetchRecentCalls: async (limit = 5) => {
    try {
      const calls = await analyticsService.getRecentCalls(limit);
      set({ recentCalls: calls });
    } catch (error) {
      console.error('Failed to fetch recent calls:', error);
    }
  },

  refreshAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const period = get().trendPeriod;
      const [metrics, dimensions, trends, objections, insights, recentCalls] = await Promise.all([
        analyticsService.getDashboardMetrics(),
        analyticsService.getPerformanceDimensions(),
        analyticsService.getScoreTrends(period),
        analyticsService.getObjectionStats(),
        analyticsService.getCoachingInsights(),
        analyticsService.getRecentCalls(5),
      ]);
      set({
        dashboardMetrics: metrics,
        performanceDimensions: dimensions,
        scoreTrends: trends,
        objectionStats: objections,
        coachingInsights: insights,
        recentCalls,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh analytics';
      set({ error: message, isLoading: false });
    }
  },

  setTrendPeriod: (period) => {
    set({ trendPeriod: period });
    get().fetchScoreTrends(period);
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
