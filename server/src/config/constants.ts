export const CONSTANTS = {
  app: {
    name: 'CallMentor Pro',
    version: '1.0.0',
  },

  jwt: {
    accessExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  ai: {
    gemini: {
      model: 'gemini-2.0-flash',
      maxTokens: 8192,
      temperature: 0.3,
    },
  },

  scoring: {
    weights: {
      discovery: 0.25,
      talkBalance: 0.20,
      objectionHandling: 0.20,
      nextSteps: 0.15,
      rapport: 0.10,
      accuracy: 0.10,
    },
    thresholds: {
      excellent: 80,
      good: 60,
      fair: 40,
    },
  },

  talkRatio: {
    ideal: { min: 40, max: 60 },
    acceptable: { min: 30, max: 70 },
  },

  features: {
    useMockAI: process.env.USE_MOCK_AI === 'true',
    useMockData: process.env.USE_MOCK_DATA === 'true',
  },
} as const;

// Backward compatibility
export const constants = CONSTANTS;
