# Phase 6: AI Integration

## Overview
Integrate AI (Anthropic Claude or OpenAI GPT-4) for call analysis including summarization, scoring, objection detection, and coaching feedback generation.

**Reference**: SPECIFICATION.md - Section 8 (AI Integration Strategy)

---

## Task 6.1: Set Up AI Client

### Description
Configure the AI client with support for Anthropic Claude and OpenAI as fallback.

### Installation
```bash
cd server
npm install @anthropic-ai/sdk openai
```

### Files to Create
```
server/src/services/ai/client.ts
```

### Implementation
```typescript
// server/src/services/ai/client.ts
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

type AIProvider = 'anthropic' | 'openai';

interface AIClient {
  provider: AIProvider;
  chat: (systemPrompt: string, userPrompt: string) => Promise<string>;
  chatJSON: <T>(systemPrompt: string, userPrompt: string) => Promise<T>;
}

// Anthropic Client
function createAnthropicClient(): AIClient | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });

  return {
    provider: 'anthropic',

    async chat(systemPrompt: string, userPrompt: string): Promise<string> {
      const message = await client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }
      return content.text;
    },

    async chatJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
      const response = await this.chat(systemPrompt, userPrompt);

      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response;
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      return JSON.parse(jsonStr.trim());
    },
  };
}

// OpenAI Client
function createOpenAIClient(): AIClient | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });

  return {
    provider: 'openai',

    async chat(systemPrompt: string, userPrompt: string): Promise<string> {
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      });

      return response.choices[0].message.content || '';
    },

    async chatJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    },
  };
}

// Get available AI client
export function getAIClient(): AIClient {
  // Try Anthropic first
  const anthropicClient = createAnthropicClient();
  if (anthropicClient) {
    console.log('Using Anthropic Claude for AI analysis');
    return anthropicClient;
  }

  // Fall back to OpenAI
  const openaiClient = createOpenAIClient();
  if (openaiClient) {
    console.log('Using OpenAI GPT-4 for AI analysis');
    return openaiClient;
  }

  throw new Error('No AI provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY');
}

// Check if mock mode
export function useMockAI(): boolean {
  return process.env.USE_MOCK_AI === 'true';
}
```

### Acceptance Criteria
- [ ] Anthropic client works
- [ ] OpenAI fallback works
- [ ] JSON parsing handles markdown
- [ ] Mock mode supported

---

## Task 6.2: Create AI Prompt Templates

### Description
Define all prompt templates for call analysis.

### Files to Create
```
server/src/services/ai/prompts.ts
```

### Implementation
```typescript
// server/src/services/ai/prompts.ts

export const SYSTEM_PROMPT = `You are an expert sales coach and conversation analyst with 15+ years of experience developing high-performing sales teams. Your role is to analyze sales conversations and provide:

1. Objective, data-driven scoring based on proven sales methodologies
2. Specific, actionable coaching feedback with exact quotes from the conversation
3. Practical improvement suggestions based on evidence from the call

Be direct, specific, and always cite exact moments from conversations. Focus on behaviors that can be changed and improved. Provide balanced feedback that acknowledges strengths before addressing improvements.`;

export const ANALYSIS_PROMPT = `Analyze this sales conversation transcript comprehensively.

TRANSCRIPT:
{transcript}

Analyze and provide your response in this exact JSON format:

{
  "summary": "2-3 sentence overview capturing call purpose, key discussions, and outcome",

  "score": {
    "overall": <weighted average 0-100>,
    "categories": {
      "discovery": {
        "score": <0-100>,
        "weight": 0.25,
        "reasoning": "1-2 sentence explanation with specific examples"
      },
      "talkBalance": {
        "score": <0-100>,
        "weight": 0.20,
        "actualRatio": <rep talk percentage>,
        "reasoning": "1-2 sentence explanation"
      },
      "objectionHandling": {
        "score": <0-100>,
        "weight": 0.20,
        "objectionsFound": <count>,
        "objectionsAddressed": <count>,
        "reasoning": "1-2 sentence explanation"
      },
      "nextSteps": {
        "score": <0-100>,
        "weight": 0.15,
        "hasCommitment": <boolean>,
        "commitmentStrength": "weak|moderate|strong",
        "reasoning": "1-2 sentence explanation"
      },
      "rapport": {
        "score": <0-100>,
        "weight": 0.10,
        "reasoning": "1-2 sentence explanation"
      },
      "accuracy": {
        "score": <0-100>,
        "weight": 0.10,
        "reasoning": "1-2 sentence explanation"
      }
    }
  },

  "metrics": {
    "talkRatio": <rep talk percentage 0-100>,
    "questionCount": <number of questions asked by rep>,
    "longestMonologue": <estimated seconds>,
    "fillerWordCount": <count of um, uh, like, etc>,
    "sentiment": "positive|neutral|negative",
    "engagementScore": <0-100>
  },

  "objections": [
    {
      "id": "obj-<index>",
      "text": "What the prospect said",
      "type": "pricing|timeline|competition|authority|need|other",
      "timestamp": "approximate time like 15:23 or mid-call",
      "addressed": <boolean>,
      "handling": "well|partial|poor|missed",
      "repResponse": "What the rep said in response (if addressed)"
    }
  ],

  "coaching": {
    "summary": "2-3 sentence coaching overview",
    "strengths": [
      {
        "title": "Short descriptive title",
        "description": "What was done well and why it was effective",
        "quote": "Exact quote from transcript",
        "timestamp": "Approximate time"
      }
    ],
    "improvements": [
      {
        "title": "Short descriptive title",
        "description": "What happened and why it's an opportunity",
        "priority": "high|medium|low",
        "quote": "Exact quote if applicable",
        "timestamp": "Approximate time",
        "suggestion": "Specific technique or phrase to try instead"
      }
    ],
    "actionItems": [
      {
        "task": "Specific action to take",
        "type": "practice|study|review|discuss"
      }
    ]
  },

  "tags": ["Relevant", "Tags", "For", "Filtering"]
}

SCORING GUIDELINES:
- Discovery (25%): Open questions, pain points identified, follow-up depth
- Talk Balance (20%): Ideal is 40-60% rep talk time
- Objection Handling (20%): Recognition and resolution of concerns
- Next Steps (15%): Specific commitments with dates/actions
- Rapport (10%): Personalization, active listening, empathy
- Accuracy (10%): Correct product information, honest responses

Include 2-3 strengths, 2-3 improvements (prioritized by impact), and 2-3 action items.
If no objections were found, return empty array for objections.`;

export function formatPrompt(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}
```

### Acceptance Criteria
- [ ] System prompt sets context
- [ ] Analysis prompt is comprehensive
- [ ] JSON format clearly defined
- [ ] Scoring guidelines included

---

## Task 6.3: Create Call Analyzer Service

### Description
Build the main service that orchestrates AI analysis.

### Files to Create
```
server/src/services/ai/analyzer.ts
```

### Implementation
```typescript
// server/src/services/ai/analyzer.ts
import { getAIClient, useMockAI } from './client';
import { SYSTEM_PROMPT, ANALYSIS_PROMPT, formatPrompt } from './prompts';
import { formatTranscriptForAI } from '@/utils/transcript';
import type { ICall } from '@/models/Call';

interface AnalysisResult {
  summary: string;
  score: {
    overall: number;
    categories: Record<string, any>;
  };
  metrics: {
    talkRatio: number;
    questionCount: number;
    longestMonologue: number;
    fillerWordCount: number;
    sentiment: string;
    engagementScore: number;
  };
  objections: Array<{
    id: string;
    text: string;
    type: string;
    timestamp?: string;
    addressed: boolean;
    handling: string;
    repResponse?: string;
  }>;
  coaching: {
    summary: string;
    strengths: Array<any>;
    improvements: Array<any>;
    actionItems: Array<any>;
  };
  tags: string[];
}

export async function analyzeCall(call: ICall): Promise<AnalysisResult> {
  // Use mock if configured
  if (useMockAI()) {
    console.log('Using mock AI analysis');
    return getMockAnalysis();
  }

  try {
    const client = getAIClient();

    // Format transcript
    const formattedTranscript = formatTranscriptForAI(call.transcript);

    // Build prompt
    const userPrompt = formatPrompt(ANALYSIS_PROMPT, {
      transcript: formattedTranscript,
    });

    // Get analysis from AI
    console.log(`Analyzing call ${call._id} with ${client.provider}...`);
    const result = await client.chatJSON<AnalysisResult>(SYSTEM_PROMPT, userPrompt);

    console.log(`Analysis complete for call ${call._id}`);
    return result;
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('AI analysis failed. Please try again.');
  }
}

function getMockAnalysis(): AnalysisResult {
  return {
    summary: 'This was a productive discovery call where the rep effectively identified key pain points around operational efficiency. The prospect showed genuine interest and agreed to a follow-up demo next week.',

    score: {
      overall: 78,
      categories: {
        discovery: {
          score: 85,
          weight: 0.25,
          reasoning: 'Asked 10 open-ended questions that uncovered 3 distinct pain points.',
        },
        talkBalance: {
          score: 80,
          weight: 0.20,
          actualRatio: 45,
          reasoning: 'Maintained good 45% talk ratio, allowing prospect to elaborate.',
        },
        objectionHandling: {
          score: 70,
          weight: 0.20,
          objectionsFound: 2,
          objectionsAddressed: 1,
          reasoning: 'Handled pricing concern well, but timeline objection was deflected.',
        },
        nextSteps: {
          score: 75,
          weight: 0.15,
          hasCommitment: true,
          commitmentStrength: 'moderate',
          reasoning: 'Agreed to follow-up but without specific date confirmed.',
        },
        rapport: {
          score: 80,
          weight: 0.10,
          reasoning: 'Good personalization and active listening demonstrated.',
        },
        accuracy: {
          score: 78,
          weight: 0.10,
          reasoning: 'Product information was accurate with minor gaps.',
        },
      },
    },

    metrics: {
      talkRatio: 45,
      questionCount: 10,
      longestMonologue: 85,
      fillerWordCount: 6,
      sentiment: 'positive',
      engagementScore: 75,
    },

    objections: [
      {
        id: 'obj-0',
        text: "That seems more expensive than what we budgeted for this quarter.",
        type: 'pricing',
        timestamp: '12:30',
        addressed: true,
        handling: 'well',
        repResponse: "I understand budget is a concern. Let me show you how our customers typically see ROI within 2 months...",
      },
      {
        id: 'obj-1',
        text: "We're not looking to make any changes until Q2.",
        type: 'timeline',
        timestamp: '18:45',
        addressed: true,
        handling: 'partial',
        repResponse: "That makes sense. Would it help to start evaluating now so you're ready for Q2?",
      },
    ],

    coaching: {
      summary: 'Strong discovery call with excellent questioning technique. The pricing objection was handled well with ROI reframing. Focus on strengthening next step commitments and fully addressing timeline concerns.',

      strengths: [
        {
          title: 'Excellent Discovery Questions',
          description: 'Asked 10 open-ended questions that surfaced multiple pain points, 40% above team average.',
          quote: "What would it mean for your team if you could cut review time by 80%?",
          timestamp: '5:20',
        },
        {
          title: 'Effective ROI Reframe',
          description: 'When pricing concern arose, immediately pivoted to value-based discussion with customer examples.',
          quote: "Let me show you how our customers typically see ROI within 2 months...",
          timestamp: '12:45',
        },
      ],

      improvements: [
        {
          title: 'Strengthen Next Step Commitment',
          description: 'Follow-up was agreed but without a specific date, reducing show rate probability.',
          priority: 'high',
          quote: "Let's touch base next week sometime.",
          timestamp: '25:30',
          suggestion: 'Try: "I have Thursday at 2pm or Friday at 10am - which works better for you?"',
        },
        {
          title: 'Address Timeline Objection Fully',
          description: 'The Q2 timeline concern was acknowledged but not fully explored for underlying reasons.',
          priority: 'medium',
          quote: "We're not looking to make any changes until Q2.",
          timestamp: '18:45',
          suggestion: 'Ask: "What specifically is happening in Q2 that makes that timing better?"',
        },
      ],

      actionItems: [
        { task: 'Practice the two-option calendar close technique', type: 'practice' },
        { task: 'Review Sarah\'s call from Dec 15 for timeline objection handling', type: 'review' },
        { task: 'Study "Getting Commitment" module in training library', type: 'study' },
      ],
    },

    tags: ['Discovery', 'Pricing Objection', 'Timeline Concern', 'Demo Scheduled'],
  };
}
```

### Acceptance Criteria
- [ ] Analyzes calls with AI
- [ ] Mock mode works
- [ ] Error handling robust
- [ ] Returns structured result

---

## Task 6.4: Create Analysis API Route

### Description
Build the API endpoint that triggers call analysis.

### Files to Create
```
server/src/routes/calls.routes.ts (add analyze endpoint)
server/src/controllers/calls.controller.ts (add analyze function)
```

### Implementation
```typescript
// Add to server/src/controllers/calls.controller.ts

import { analyzeCall } from '@/services/ai/analyzer';

// Analyze call
export const triggerAnalysis = async (req: Request, res: Response) => {
  try {
    const call = await Call.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Call not found' },
      });
    }

    if (!call.transcript || call.transcript.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_TRANSCRIPT', message: 'Call has no transcript' },
      });
    }

    // Update status to processing
    call.status = 'processing';
    await call.save();

    try {
      // Run AI analysis
      const analysis = await analyzeCall(call);

      // Update call with results
      call.summary = analysis.summary;
      call.score = analysis.score.overall;
      call.scoreBreakdown = analysis.score;
      call.metrics = analysis.metrics;
      call.objections = analysis.objections;
      call.coachingFeedback = analysis.coaching;
      call.tags = analysis.tags;
      call.status = 'analyzed';
      call.errorMessage = undefined;

      await call.save();

      res.json({ success: true, data: call });
    } catch (analysisError: any) {
      // Update status to error
      call.status = 'error';
      call.errorMessage = analysisError.message || 'Analysis failed';
      await call.save();

      throw analysisError;
    }
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: error.message || 'Analysis failed',
      },
    });
  }
};

// Add to routes
// router.post('/:id/analyze', triggerAnalysis);
```

### Acceptance Criteria
- [ ] Endpoint triggers analysis
- [ ] Updates call status
- [ ] Stores analysis results
- [ ] Handles errors gracefully

---

## Task 6.5: Create Analysis Status Component

### Description
Build a component to show analysis progress on the call detail page.

### Files to Create
```
client/src/components/calls/AnalysisStatus.tsx
```

### Implementation
```typescript
// client/src/components/calls/AnalysisStatus.tsx
import { useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Progress,
  Text,
} from '@mantine/core';
import {
  IconRefresh,
  IconAlertCircle,
  IconLoader2,
  IconClock,
} from '@tabler/icons-react';
import { callsService } from '@/services/calls.service';
import { notifications } from '@mantine/notifications';

interface AnalysisStatusProps {
  callId: string;
  status: 'pending' | 'processing' | 'analyzed' | 'error';
  errorMessage?: string;
  onRefetch: () => void;
}

export function AnalysisStatus({
  callId,
  status,
  errorMessage,
  onRefetch,
}: AnalysisStatusProps) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await callsService.analyzeCall(callId);
      notifications.show({
        title: 'Analysis Started',
        message: 'Re-analyzing your call...',
        color: 'blue',
      });
      onRefetch();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to start analysis',
        color: 'red',
      });
    } finally {
      setRetrying(false);
    }
  };

  if (status === 'analyzed') {
    return null;
  }

  if (status === 'pending') {
    return (
      <Alert
        icon={<IconClock size={18} />}
        color="gray"
        variant="light"
      >
        <Group justify="space-between">
          <Text size="sm">
            Analysis pending. Click to start AI analysis.
          </Text>
          <Button
            size="xs"
            variant="light"
            loading={retrying}
            onClick={handleRetry}
          >
            Start Analysis
          </Button>
        </Group>
      </Alert>
    );
  }

  if (status === 'processing') {
    return (
      <Alert
        icon={<IconLoader2 size={18} className="animate-spin" />}
        color="blue"
        variant="light"
      >
        <Text size="sm" mb="xs">
          AI is analyzing your call. This usually takes 30-60 seconds...
        </Text>
        <Progress value={100} animated size="sm" />
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert
        icon={<IconAlertCircle size={18} />}
        color="red"
        variant="light"
      >
        <Group justify="space-between">
          <div>
            <Text size="sm" fw={500}>
              Analysis Failed
            </Text>
            <Text size="xs" c="dimmed">
              {errorMessage || 'An error occurred during analysis'}
            </Text>
          </div>
          <Button
            size="xs"
            variant="light"
            color="red"
            leftSection={<IconRefresh size={14} />}
            loading={retrying}
            onClick={handleRetry}
          >
            Retry
          </Button>
        </Group>
      </Alert>
    );
  }

  return null;
}
```

### Acceptance Criteria
- [ ] Shows pending state
- [ ] Shows processing animation
- [ ] Shows error with retry
- [ ] Hidden when analyzed

---

## Task 6.6: Add Re-analyze Button

### Description
Allow users to re-analyze calls from the detail page.

### Update Call Detail Header
```typescript
// Update CallDetailHeader.tsx to include re-analyze button

import { useState } from 'react';
import { Button, Menu } from '@mantine/core';
import {
  IconRefresh,
  IconTrash,
  IconDotsVertical,
} from '@tabler/icons-react';

// In the header component
function ReAnalyzeButton({ callId, status, onRefetch }: any) {
  const [loading, setLoading] = useState(false);

  const handleReAnalyze = async () => {
    setLoading(true);
    try {
      await callsService.analyzeCall(callId);
      notifications.show({
        title: 'Re-analysis Started',
        message: 'Your call is being re-analyzed',
        color: 'blue',
      });
      onRefetch();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to start re-analysis',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'processing') {
    return (
      <Button variant="light" disabled>
        <IconRefresh size={16} className="animate-spin" />
        Analyzing...
      </Button>
    );
  }

  return (
    <Button
      variant="light"
      leftSection={<IconRefresh size={16} />}
      loading={loading}
      onClick={handleReAnalyze}
    >
      Re-analyze
    </Button>
  );
}
```

### Acceptance Criteria
- [ ] Button visible on detail page
- [ ] Disabled during processing
- [ ] Triggers re-analysis
- [ ] Shows loading state

---

## Task 6.7: Create Coaching & Objections Tabs

### Description
Build the coaching and objections tab content.

### Coaching Tab
```typescript
// client/src/components/calls/tabs/CoachingTab.tsx
import {
  Stack,
  Paper,
  Text,
  Group,
  Badge,
  Box,
  ThemeIcon,
  Divider,
} from '@mantine/core';
import {
  IconCheck,
  IconAlertTriangle,
  IconTarget,
  IconBook,
  IconEye,
  IconMessageCircle,
  IconBulb,
} from '@tabler/icons-react';
import type { CoachingFeedback } from '@/types';

interface CoachingTabProps {
  coaching?: CoachingFeedback;
}

export function CoachingTab({ coaching }: CoachingTabProps) {
  if (!coaching) {
    return (
      <Box py="xl" ta="center">
        <Text c="dimmed">Coaching insights will appear after analysis</Text>
      </Box>
    );
  }

  return (
    <Stack gap="lg">
      {/* Summary */}
      <Paper p="lg" bg="dark.7" radius="md">
        <Text size="sm" c="dimmed" mb="xs">
          Coaching Summary
        </Text>
        <Text c="white" size="lg">
          {coaching.summary}
        </Text>
      </Paper>

      {/* Strengths */}
      <Paper p="lg" bg="dark.7" radius="md">
        <Group gap="xs" mb="lg">
          <ThemeIcon color="green" variant="light" size="lg">
            <IconCheck size={18} />
          </ThemeIcon>
          <Text fw={600} c="white">
            Strengths
          </Text>
        </Group>

        <Stack gap="md">
          {coaching.strengths.map((strength, index) => (
            <Box
              key={index}
              p="md"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderRadius: 8,
                borderLeft: '3px solid var(--mantine-color-green-5)',
              }}
            >
              <Text fw={600} c="white" mb="xs">
                {strength.title}
              </Text>
              <Text size="sm" c="gray.4" mb="sm">
                {strength.description}
              </Text>
              {strength.quote && (
                <Box
                  p="sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 4,
                  }}
                >
                  <Text size="sm" c="gray.3" fs="italic">
                    "{strength.quote}"
                  </Text>
                  {strength.timestamp && (
                    <Text size="xs" c="dimmed" mt="xs">
                      @ {strength.timestamp}
                    </Text>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Improvements */}
      <Paper p="lg" bg="dark.7" radius="md">
        <Group gap="xs" mb="lg">
          <ThemeIcon color="yellow" variant="light" size="lg">
            <IconAlertTriangle size={18} />
          </ThemeIcon>
          <Text fw={600} c="white">
            Areas for Improvement
          </Text>
        </Group>

        <Stack gap="md">
          {coaching.improvements.map((improvement, index) => (
            <Box
              key={index}
              p="md"
              style={{
                backgroundColor: improvement.priority === 'high'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(234, 179, 8, 0.1)',
                borderRadius: 8,
                borderLeft: `3px solid var(--mantine-color-${improvement.priority === 'high' ? 'red' : 'yellow'}-5)`,
              }}
            >
              <Group justify="space-between" mb="xs">
                <Text fw={600} c="white">
                  {improvement.title}
                </Text>
                <Badge
                  size="sm"
                  color={improvement.priority === 'high' ? 'red' : improvement.priority === 'medium' ? 'yellow' : 'blue'}
                >
                  {improvement.priority}
                </Badge>
              </Group>
              <Text size="sm" c="gray.4" mb="sm">
                {improvement.description}
              </Text>
              {improvement.quote && (
                <Box
                  p="sm"
                  mb="sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 4,
                  }}
                >
                  <Text size="sm" c="gray.3" fs="italic">
                    "{improvement.quote}"
                  </Text>
                  {improvement.timestamp && (
                    <Text size="xs" c="dimmed" mt="xs">
                      @ {improvement.timestamp}
                    </Text>
                  )}
                </Box>
              )}
              <Group gap="xs">
                <IconBulb size={14} color="var(--mantine-color-violet-4)" />
                <Text size="sm" c="violet.4" fw={500}>
                  {improvement.suggestion}
                </Text>
              </Group>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Action Items */}
      <Paper p="lg" bg="dark.7" radius="md">
        <Group gap="xs" mb="lg">
          <ThemeIcon color="violet" variant="light" size="lg">
            <IconTarget size={18} />
          </ThemeIcon>
          <Text fw={600} c="white">
            Action Items
          </Text>
        </Group>

        <Stack gap="sm">
          {coaching.actionItems.map((item, index) => (
            <Group key={index} gap="sm" p="sm" style={{ backgroundColor: 'var(--mantine-color-dark-6)', borderRadius: 8 }}>
              <ThemeIcon
                size="sm"
                variant="light"
                color={item.type === 'practice' ? 'blue' : item.type === 'study' ? 'green' : 'orange'}
              >
                {item.type === 'practice' && <IconTarget size={12} />}
                {item.type === 'study' && <IconBook size={12} />}
                {item.type === 'review' && <IconEye size={12} />}
                {item.type === 'discuss' && <IconMessageCircle size={12} />}
              </ThemeIcon>
              <Text size="sm" c="gray.3" style={{ flex: 1 }}>
                {item.task}
              </Text>
              <Badge size="xs" variant="outline">
                {item.type}
              </Badge>
            </Group>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
```

### Objections Tab
```typescript
// client/src/components/calls/tabs/ObjectionsTab.tsx
import {
  Stack,
  Paper,
  Text,
  Group,
  Badge,
  Box,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCurrencyDollar,
  IconClock,
  IconUsers,
  IconShield,
  IconHelp,
  IconMessage,
  IconCheck,
  IconX,
  IconMinus,
} from '@tabler/icons-react';
import type { Objection } from '@/types';

interface ObjectionsTabProps {
  objections: Objection[];
}

const objectionIcons: Record<string, any> = {
  pricing: IconCurrencyDollar,
  timeline: IconClock,
  competition: IconUsers,
  authority: IconShield,
  need: IconHelp,
  other: IconMessage,
};

const handlingStatus = {
  well: { color: 'green', icon: IconCheck, label: 'Well Handled' },
  partial: { color: 'yellow', icon: IconMinus, label: 'Partially Addressed' },
  poor: { color: 'red', icon: IconX, label: 'Poorly Handled' },
  missed: { color: 'red', icon: IconX, label: 'Not Addressed' },
};

export function ObjectionsTab({ objections }: ObjectionsTabProps) {
  if (!objections || objections.length === 0) {
    return (
      <Box py="xl" ta="center">
        <ThemeIcon size={60} radius="xl" variant="light" color="gray" mb="md">
          <IconCheck size={30} />
        </ThemeIcon>
        <Text c="dimmed" size="lg">
          No objections detected in this call
        </Text>
        <Text c="dimmed" size="sm" mt="xs">
          This could indicate a smooth conversation or a less engaged prospect
        </Text>
      </Box>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text c="white" fw={600}>
          {objections.length} Objection{objections.length !== 1 ? 's' : ''} Detected
        </Text>
        <Badge variant="light">
          {objections.filter(o => o.handling === 'well').length} / {objections.length} handled well
        </Badge>
      </Group>

      {objections.map((objection) => {
        const Icon = objectionIcons[objection.type] || IconMessage;
        const status = handlingStatus[objection.handling as keyof typeof handlingStatus];

        return (
          <Paper
            key={objection.id}
            p="lg"
            bg="dark.7"
            radius="md"
            style={{
              borderLeft: `3px solid var(--mantine-color-${status.color}-5)`,
            }}
          >
            <Group justify="space-between" mb="md">
              <Group gap="sm">
                <ThemeIcon variant="light" color="gray">
                  <Icon size={18} />
                </ThemeIcon>
                <Text fw={600} c="white" tt="capitalize">
                  {objection.type} Objection
                </Text>
              </Group>
              <Group gap="sm">
                {objection.timestamp && (
                  <Badge variant="outline" color="gray" size="sm">
                    @ {objection.timestamp}
                  </Badge>
                )}
                <Badge
                  leftSection={<status.icon size={12} />}
                  color={status.color}
                  variant="light"
                >
                  {status.label}
                </Badge>
              </Group>
            </Group>

            <Box
              p="md"
              mb="md"
              style={{
                backgroundColor: 'var(--mantine-color-dark-6)',
                borderRadius: 8,
              }}
            >
              <Text size="sm" c="gray.3" fs="italic">
                "{objection.text}"
              </Text>
            </Box>

            {objection.repResponse && (
              <Box>
                <Text size="xs" c="dimmed" mb="xs">
                  Rep Response:
                </Text>
                <Text size="sm" c="gray.4">
                  "{objection.repResponse}"
                </Text>
              </Box>
            )}
          </Paper>
        );
      })}
    </Stack>
  );
}
```

### Acceptance Criteria
- [ ] Coaching tab shows all sections
- [ ] Strengths and improvements styled
- [ ] Action items categorized
- [ ] Objections tab shows all objections
- [ ] Handling status colored

---

## Phase 6 Checklist Summary

| Task | Description | Status |
|------|-------------|--------|
| 6.1 | Set up AI client | [ ] |
| 6.2 | Create AI prompt templates | [ ] |
| 6.3 | Create call analyzer service | [ ] |
| 6.4 | Create analysis API route | [ ] |
| 6.5 | Create analysis status component | [ ] |
| 6.6 | Add re-analyze button | [ ] |
| 6.7 | Create coaching & objections tabs | [ ] |

---

## Dependencies for Next Phase
Before starting Phase 7 (Team Analytics), ensure:
- AI analysis produces results
- All tabs render analysis data
- Re-analysis works
- Error handling complete
