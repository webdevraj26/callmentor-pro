import { AIService } from '../../types/ai';
import { CONSTANTS } from '../../config/constants';

// Lazy load services to avoid initialization errors when API keys aren't set
let _geminiService: AIService | null = null;
let _mockAiService: AIService | null = null;

const getGeminiService = async (): Promise<AIService> => {
  if (!_geminiService) {
    const { geminiService } = await import('./geminiService');
    _geminiService = geminiService;
  }
  return _geminiService;
};

const getMockAiService = async (): Promise<AIService> => {
  if (!_mockAiService) {
    const { mockAiService } = await import('./mockAiService');
    _mockAiService = mockAiService;
  }
  return _mockAiService;
};

/**
 * Get the appropriate AI service based on configuration
 * Uses mock service if USE_MOCK_AI is true or if Gemini API key is not set
 */
export async function getAiService(): Promise<AIService> {
  // Check if mock mode is enabled
  if (CONSTANTS.features.useMockAI) {
    console.log('Using mock AI service (USE_MOCK_AI=true)');
    return getMockAiService();
  }

  // Check if Gemini API key is available
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set, falling back to mock AI service');
    return getMockAiService();
  }

  // Try to use Gemini service
  try {
    const gemini = await getGeminiService();
    const isAvailable = await gemini.isAvailable();

    if (!isAvailable) {
      console.warn('Gemini service not available, falling back to mock AI service');
      return getMockAiService();
    }

    console.log('Using Gemini AI service');
    return gemini;
  } catch (error) {
    console.error('Failed to initialize Gemini service:', error);
    console.warn('Falling back to mock AI service');
    return getMockAiService();
  }
}

/**
 * Analyze a call transcript using the configured AI service
 */
export async function analyzeCallTranscript(
  transcriptText: string,
  context?: {
    repName?: string;
    prospectName?: string;
    prospectCompany?: string;
    callType?: string;
  }
) {
  const service = await getAiService();
  return service.analyzeTranscript(transcriptText, context);
}

export type { AIService } from '../../types/ai';
