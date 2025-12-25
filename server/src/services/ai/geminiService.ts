import { GoogleGenerativeAI } from '@google/generative-ai';
import { ICallAnalysis } from '../../models/Call';
import { AIService, AnalysisContext, GeminiAnalysisResponse } from '../../types/ai';
import { CONSTANTS } from '../../config/constants';

const ANALYSIS_PROMPT = `Analyze this sales call transcript as a coach. Return ONLY valid JSON - no markdown, no extra text.

IMPORTANT: Keep all text fields SHORT (under 100 chars). Limit arrays to max 3 items.

{
  "overallScore": 0-100,
  "scoreBreakdown": {
    "categories": {
      "discovery": {"score": 0-100, "weight": 0.25, "reasoning": "brief", "highlights": []},
      "talkBalance": {"score": 0-100, "weight": 0.20, "reasoning": "brief", "highlights": []},
      "objectionHandling": {"score": 0-100, "weight": 0.20, "reasoning": "brief", "highlights": []},
      "nextSteps": {"score": 0-100, "weight": 0.15, "reasoning": "brief", "highlights": []},
      "rapport": {"score": 0-100, "weight": 0.10, "reasoning": "brief", "highlights": []},
      "accuracy": {"score": 0-100, "weight": 0.10, "reasoning": "brief", "highlights": []}
    }
  },
  "metrics": {
    "talkRatio": 0-100,
    "questionCount": number,
    "longestMonologue": seconds,
    "fillerWordCount": number,
    "sentiment": "positive|neutral|negative",
    "engagementScore": 0-100
  },
  "objections": [
    {"id": "1", "text": "short quote", "type": "pricing|timeline|competition|authority|need|other", "timestamp": "early|middle|late", "addressed": true/false, "handling": "well|partial|poor|missed", "repResponse": "brief", "suggestedResponse": "brief"}
  ],
  "coachingFeedback": {
    "summary": "2 sentences max",
    "strengths": [{"title": "short", "description": "brief", "impact": "high|medium"}],
    "improvements": [{"title": "short", "description": "brief", "priority": "high|medium|low", "suggestion": "brief"}],
    "actionItems": [{"task": "brief", "type": "practice|study|review|discuss"}]
  },
  "summary": "2 sentences max"
}

TRANSCRIPT:
`;

class GeminiService implements AIService {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = 'gemini-2.5-flash';
  }

  async isAvailable(): Promise<boolean> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      // Simple test to check if API is reachable
      await model.generateContent('test');
      return true;
    } catch {
      return false;
    }
  }

  async analyzeTranscript(
    transcriptText: string,
    context?: AnalysisContext
  ): Promise<ICallAnalysis> {
    const MAX_RETRIES = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.model,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 16384, // Increased to avoid truncation
            responseMimeType: 'application/json',
          },
        });

        // Build context-enhanced prompt
        let contextInfo = '';
        if (context) {
          const parts = [];
          if (context.repName) parts.push(`Sales Rep: ${context.repName}`);
          if (context.prospectName) parts.push(`Prospect: ${context.prospectName}`);
          if (context.prospectCompany) parts.push(`Company: ${context.prospectCompany}`);
          if (context.callType) parts.push(`Call Type: ${context.callType}`);
          if (parts.length > 0) {
            contextInfo = `\n\nCALL CONTEXT:\n${parts.join('\n')}\n`;
          }
        }

        const fullPrompt = ANALYSIS_PROMPT + contextInfo + transcriptText;

        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const text = response.text();

        // Parse and validate the JSON response
        const analysis = this.parseAndValidateResponse(text);

        return analysis;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`Gemini analysis attempt ${attempt + 1} failed:`, lastError.message);

        if (attempt < MAX_RETRIES) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    console.error('Gemini analysis error after all retries:', lastError);
    throw new Error(
      `Failed to analyze transcript: ${lastError?.message || 'Unknown error'}`
    );
  }

  private parseAndValidateResponse(text: string): ICallAnalysis {
    try {
      // Try to extract JSON from the response
      let jsonStr = text.trim();

      // If wrapped in markdown code blocks, extract
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      // Attempt to repair common JSON malformations from Gemini
      jsonStr = this.repairJson(jsonStr);

      const parsed: GeminiAnalysisResponse = JSON.parse(jsonStr);

      // Validate and normalize the response
      const analysis: ICallAnalysis = {
        overallScore: this.clampScore(parsed.overallScore),
        scoreBreakdown: {
          categories: {
            discovery: this.validateCategoryScore(parsed.scoreBreakdown?.categories?.discovery, 0.25),
            talkBalance: this.validateCategoryScore(parsed.scoreBreakdown?.categories?.talkBalance, 0.20),
            objectionHandling: this.validateCategoryScore(parsed.scoreBreakdown?.categories?.objectionHandling, 0.20),
            nextSteps: this.validateCategoryScore(parsed.scoreBreakdown?.categories?.nextSteps, 0.15),
            rapport: this.validateCategoryScore(parsed.scoreBreakdown?.categories?.rapport, 0.10),
            accuracy: this.validateCategoryScore(parsed.scoreBreakdown?.categories?.accuracy, 0.10),
          },
        },
        metrics: {
          talkRatio: this.clampScore(parsed.metrics?.talkRatio || 50),
          questionCount: Math.max(0, parsed.metrics?.questionCount || 0),
          longestMonologue: Math.max(0, parsed.metrics?.longestMonologue || 0),
          fillerWordCount: Math.max(0, parsed.metrics?.fillerWordCount || 0),
          sentiment: this.validateSentiment(parsed.metrics?.sentiment),
          engagementScore: this.clampScore(parsed.metrics?.engagementScore || 50),
        },
        objections: (parsed.objections || []).map((obj, index) => ({
          id: obj.id || `obj-${index + 1}`,
          text: obj.text || '',
          type: this.validateObjectionType(obj.type),
          timestamp: obj.timestamp,
          addressed: Boolean(obj.addressed),
          handling: this.validateHandling(obj.handling),
          repResponse: obj.repResponse,
          suggestedResponse: obj.suggestedResponse,
        })),
        coachingFeedback: {
          summary: parsed.coachingFeedback?.summary || 'Analysis complete.',
          strengths: (parsed.coachingFeedback?.strengths || []).map(s => ({
            title: s.title || 'Strength',
            description: s.description || '',
            quote: s.quote,
            timestamp: s.timestamp,
            impact: s.impact === 'high' || s.impact === 'medium' ? s.impact : undefined,
          })),
          improvements: (parsed.coachingFeedback?.improvements || []).map(i => ({
            title: i.title || 'Area for Improvement',
            description: i.description || '',
            priority: this.validatePriority(i.priority),
            quote: i.quote,
            timestamp: i.timestamp,
            suggestion: i.suggestion || 'Consider improving in this area.',
            example: i.example,
          })),
          actionItems: (parsed.coachingFeedback?.actionItems || []).map(a => ({
            task: a.task || 'Review this call',
            type: this.validateActionType(a.type),
            completed: false,
          })),
        },
        summary: parsed.summary || 'Call analysis complete.',
      };

      // Recalculate overall score based on weighted categories
      analysis.overallScore = this.calculateWeightedScore(analysis.scoreBreakdown.categories);

      return analysis;
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.error('Raw response:', text);
      throw new Error('Failed to parse AI response');
    }
  }

  private repairJson(jsonStr: string): string {
    let repaired = jsonStr;

    // Fix: Truncated strings - find unclosed strings and close them
    // Count quotes to detect unclosed strings
    let inString = false;
    let lastQuoteIndex = -1;
    for (let i = 0; i < repaired.length; i++) {
      if (repaired[i] === '"' && (i === 0 || repaired[i - 1] !== '\\')) {
        inString = !inString;
        if (inString) {
          lastQuoteIndex = i;
        }
      }
    }

    // If we ended inside a string, close it and clean up
    if (inString && lastQuoteIndex !== -1) {
      // Find a safe truncation point (before the last incomplete value)
      // Look backwards for the last complete key-value pair
      const beforeString = repaired.substring(0, lastQuoteIndex);
      const lastCompleteComma = beforeString.lastIndexOf(',');
      const lastCompleteColon = beforeString.lastIndexOf(':');

      if (lastCompleteComma > lastCompleteColon) {
        // Truncate at the last comma (remove incomplete key-value pair)
        repaired = repaired.substring(0, lastCompleteComma);
      } else {
        // Close the current string with placeholder text and close the value
        repaired = repaired + '..."';
      }
    }

    // Fix: Missing closing brace before comma followed by opening brace
    // Pattern: "value" ,\n    { should be "value" },\n    {
    repaired = repaired.replace(/("(?:[^"\\]|\\.)*")\s*,(\s*\{)/g, '$1},$2');

    // Fix: Missing closing brace before comma in arrays of objects
    // Pattern: "value"\n    ,\n    { should be "value"\n    },\n    {
    repaired = repaired.replace(/("(?:[^"\\]|\\.)*")\s*\n\s*,\s*\n\s*\{/g, '$1\n    },\n    {');

    // Fix: Trailing commas before closing brackets
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

    // Fix: Double commas
    repaired = repaired.replace(/,\s*,/g, ',');

    // Remove trailing comma at the very end
    repaired = repaired.replace(/,\s*$/, '');

    // Try to balance braces/brackets if response is truncated
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;

    // Add missing closing brackets first, then braces
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      repaired += ']';
    }
    for (let i = 0; i < openBraces - closeBraces; i++) {
      repaired += '}';
    }

    return repaired;
  }

  private clampScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private validateCategoryScore(
    score: GeminiAnalysisResponse['scoreBreakdown']['categories']['discovery'] | undefined,
    defaultWeight: number
  ) {
    return {
      score: this.clampScore(score?.score || 50),
      weight: score?.weight || defaultWeight,
      reasoning: score?.reasoning || 'No detailed analysis available.',
      highlights: score?.highlights || [],
    };
  }

  private validateSentiment(sentiment: string | undefined): 'positive' | 'neutral' | 'negative' {
    if (sentiment === 'positive' || sentiment === 'neutral' || sentiment === 'negative') {
      return sentiment;
    }
    return 'neutral';
  }

  private validateObjectionType(type: string | undefined): 'pricing' | 'timeline' | 'competition' | 'authority' | 'need' | 'other' {
    const validTypes: Array<'pricing' | 'timeline' | 'competition' | 'authority' | 'need' | 'other'> =
      ['pricing', 'timeline', 'competition', 'authority', 'need', 'other'];
    const normalized = type?.toLowerCase();
    if (normalized && validTypes.includes(normalized as typeof validTypes[number])) {
      return normalized as typeof validTypes[number];
    }
    return 'other';
  }

  private validateHandling(handling: string | undefined): 'well' | 'partial' | 'poor' | 'missed' {
    const validHandling: Array<'well' | 'partial' | 'poor' | 'missed'> = ['well', 'partial', 'poor', 'missed'];
    const normalized = handling?.toLowerCase();
    if (normalized && validHandling.includes(normalized as typeof validHandling[number])) {
      return normalized as typeof validHandling[number];
    }
    return 'partial';
  }

  private validatePriority(priority: string | undefined): 'high' | 'medium' | 'low' {
    if (priority === 'high' || priority === 'medium' || priority === 'low') {
      return priority;
    }
    return 'medium';
  }

  private validateActionType(type: string | undefined): 'practice' | 'study' | 'review' | 'discuss' {
    const validTypes: Array<'practice' | 'study' | 'review' | 'discuss'> = ['practice', 'study', 'review', 'discuss'];
    const normalized = type?.toLowerCase();
    if (normalized && validTypes.includes(normalized as typeof validTypes[number])) {
      return normalized as typeof validTypes[number];
    }
    return 'review';
  }

  private calculateWeightedScore(categories: ICallAnalysis['scoreBreakdown']['categories']): number {
    const weights = CONSTANTS.scoring.weights;
    const score =
      categories.discovery.score * weights.discovery +
      categories.talkBalance.score * weights.talkBalance +
      categories.objectionHandling.score * weights.objectionHandling +
      categories.nextSteps.score * weights.nextSteps +
      categories.rapport.score * weights.rapport +
      categories.accuracy.score * weights.accuracy;
    return Math.round(score);
  }
}

export const geminiService = new GeminiService();
