import { ICallAnalysis } from '../models/Call';

// ============ AI SERVICE TYPES ============

export interface AIService {
  analyzeTranscript(transcriptText: string, context?: AnalysisContext): Promise<ICallAnalysis>;
  isAvailable(): Promise<boolean>;
}

export interface AnalysisContext {
  repName?: string;
  prospectName?: string;
  prospectCompany?: string;
  callType?: string;
}

// ============ GEMINI TYPES ============

export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface GeminiAnalysisResponse {
  overallScore: number;
  scoreBreakdown: {
    categories: {
      discovery: GeminiCategoryScore;
      talkBalance: GeminiCategoryScore;
      objectionHandling: GeminiCategoryScore;
      nextSteps: GeminiCategoryScore;
      rapport: GeminiCategoryScore;
      accuracy: GeminiCategoryScore;
    };
  };
  metrics: {
    talkRatio: number;
    questionCount: number;
    longestMonologue: number;
    fillerWordCount: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    engagementScore: number;
  };
  objections: GeminiObjection[];
  coachingFeedback: {
    summary: string;
    strengths: GeminiStrength[];
    improvements: GeminiImprovement[];
    actionItems: GeminiActionItem[];
  };
  summary: string;
}

export interface GeminiCategoryScore {
  score: number;
  weight: number;
  reasoning: string;
  highlights?: string[];
}

export interface GeminiObjection {
  id: string;
  text: string;
  type: 'pricing' | 'timeline' | 'competition' | 'authority' | 'need' | 'other';
  timestamp?: string;
  addressed: boolean;
  handling: 'well' | 'partial' | 'poor' | 'missed';
  repResponse?: string;
  suggestedResponse?: string;
}

export interface GeminiStrength {
  title: string;
  description: string;
  quote?: string;
  timestamp?: string;
  impact?: 'high' | 'medium';
}

export interface GeminiImprovement {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  quote?: string;
  timestamp?: string;
  suggestion: string;
  example?: string;
}

export interface GeminiActionItem {
  task: string;
  type: 'practice' | 'study' | 'review' | 'discuss';
  completed?: boolean;
}

// ============ SCORING RUBRIC ============

export interface ScoringWeights {
  discovery: number;
  talkBalance: number;
  objectionHandling: number;
  nextSteps: number;
  rapport: number;
  accuracy: number;
}

export interface ScoringThresholds {
  excellent: number;
  good: number;
  fair: number;
}

export interface ScoringRubric {
  weights: ScoringWeights;
  thresholds: ScoringThresholds;
  idealTalkRatio: {
    min: number;
    max: number;
  };
}
