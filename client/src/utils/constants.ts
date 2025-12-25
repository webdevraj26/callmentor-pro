export const APP_NAME = 'CallMentor Pro';
export const API_URL = import.meta.env.VITE_API_URL || '/api';

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

export const getScoreLevel = (score: number) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
};

export const getScoreColor = (score: number) => {
  return SCORE_COLORS[getScoreLevel(score)];
};
