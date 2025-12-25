import { ICallAnalysis } from '../../models/Call';
import { AIService, AnalysisContext } from '../../types/ai';

// Simulates AI processing delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockAiService implements AIService {
  async isAvailable(): Promise<boolean> {
    return true;
  }

  async analyzeTranscript(
    transcriptText: string,
    context?: AnalysisContext
  ): Promise<ICallAnalysis> {
    // Simulate processing time (2-4 seconds)
    await delay(2000 + Math.random() * 2000);

    // Generate somewhat realistic scores based on transcript length
    const wordCount = transcriptText.split(/\s+/).length;
    const hasQuestions = (transcriptText.match(/\?/g) || []).length;
    const baseScore = Math.min(90, 50 + wordCount / 50 + hasQuestions * 3);

    // Add some randomness
    const randomVariance = () => Math.floor(Math.random() * 20) - 10;

    const discoveryScore = Math.min(100, Math.max(0, baseScore + randomVariance() + hasQuestions * 2));
    const talkBalanceScore = Math.min(100, Math.max(0, 70 + randomVariance()));
    const objectionScore = Math.min(100, Math.max(0, baseScore + randomVariance()));
    const nextStepsScore = Math.min(100, Math.max(0, baseScore + randomVariance() - 5));
    const rapportScore = Math.min(100, Math.max(0, baseScore + randomVariance() + 5));
    const accuracyScore = Math.min(100, Math.max(0, 75 + randomVariance()));

    const overallScore = Math.round(
      discoveryScore * 0.25 +
      talkBalanceScore * 0.20 +
      objectionScore * 0.20 +
      nextStepsScore * 0.15 +
      rapportScore * 0.10 +
      accuracyScore * 0.10
    );

    const repName = context?.repName || 'Sales Rep';
    const prospectName = context?.prospectName || 'Prospect';

    const analysis: ICallAnalysis = {
      overallScore,
      scoreBreakdown: {
        categories: {
          discovery: {
            score: discoveryScore,
            weight: 0.25,
            reasoning: `${repName} asked ${hasQuestions} questions during the call. ${discoveryScore >= 70 ? 'Good job uncovering prospect needs.' : 'Consider asking more open-ended questions to better understand the prospect\'s situation.'}`,
            highlights: hasQuestions >= 3 ? ['Good use of discovery questions'] : [],
          },
          talkBalance: {
            score: talkBalanceScore,
            weight: 0.20,
            reasoning: `Talk ratio appears ${talkBalanceScore >= 70 ? 'balanced' : 'skewed'}. ${talkBalanceScore >= 70 ? 'Nice balance of listening and talking.' : 'Consider letting the prospect speak more.'}`,
            highlights: talkBalanceScore >= 80 ? ['Excellent listening skills demonstrated'] : [],
          },
          objectionHandling: {
            score: objectionScore,
            weight: 0.20,
            reasoning: objectionScore >= 70
              ? 'Objections were identified and addressed appropriately.'
              : 'Some objections may have been missed or not fully addressed.',
            highlights: [],
          },
          nextSteps: {
            score: nextStepsScore,
            weight: 0.15,
            reasoning: nextStepsScore >= 70
              ? 'Clear next steps were established by the end of the call.'
              : 'Next steps could have been more clearly defined.',
            highlights: nextStepsScore >= 80 ? ['Strong close with clear action items'] : [],
          },
          rapport: {
            score: rapportScore,
            weight: 0.10,
            reasoning: rapportScore >= 70
              ? 'Good rapport was built throughout the conversation.'
              : 'Consider spending more time on relationship building.',
            highlights: [],
          },
          accuracy: {
            score: accuracyScore,
            weight: 0.10,
            reasoning: 'Product and company information appeared accurate.',
            highlights: [],
          },
        },
      },
      metrics: {
        talkRatio: 45 + Math.floor(Math.random() * 20),
        questionCount: hasQuestions,
        longestMonologue: 30 + Math.floor(Math.random() * 60),
        fillerWordCount: Math.floor(Math.random() * 15),
        sentiment: overallScore >= 70 ? 'positive' : overallScore >= 50 ? 'neutral' : 'negative',
        engagementScore: Math.min(100, Math.max(0, overallScore + randomVariance())),
      },
      objections: this.generateMockObjections(transcriptText),
      coachingFeedback: {
        summary: `This ${context?.callType || 'sales'} call with ${prospectName} ${overallScore >= 70 ? 'went well overall' : 'has room for improvement'}. ${repName} ${overallScore >= 70 ? 'demonstrated solid sales skills' : 'should focus on key improvement areas'}.`,
        strengths: this.generateStrengths(overallScore, repName),
        improvements: this.generateImprovements(overallScore),
        actionItems: this.generateActionItems(overallScore),
      },
      summary: `${repName} conducted a ${context?.callType || 'sales'} call with ${prospectName} from ${context?.prospectCompany || 'the prospect company'}. The call ${overallScore >= 70 ? 'achieved its main objectives' : 'had some challenges'} with an overall score of ${overallScore}/100.`,
    };

    return analysis;
  }

  private generateMockObjections(transcriptText: string): ICallAnalysis['objections'] {
    const objections: ICallAnalysis['objections'] = [];

    // Check for pricing-related words
    if (/price|cost|expensive|budget|afford/i.test(transcriptText)) {
      objections.push({
        id: 'obj-1',
        text: "That's more than we were expecting to spend.",
        type: 'pricing',
        timestamp: 'mid-call',
        addressed: Math.random() > 0.3,
        handling: Math.random() > 0.5 ? 'well' : 'partial',
        repResponse: 'Focused on value and ROI to justify the investment.',
        suggestedResponse: 'Consider breaking down the cost per user or showing competitive comparison.',
      });
    }

    // Check for timeline-related words
    if (/timeline|when|soon|deadline|urgent/i.test(transcriptText)) {
      objections.push({
        id: 'obj-2',
        text: "We need something that can be implemented quickly.",
        type: 'timeline',
        timestamp: 'late-call',
        addressed: Math.random() > 0.4,
        handling: Math.random() > 0.6 ? 'well' : 'partial',
        repResponse: 'Discussed accelerated implementation options.',
        suggestedResponse: 'Provide specific timeline commitments with milestones.',
      });
    }

    // Check for competitor mentions
    if (/competitor|alternative|other solution|comparing/i.test(transcriptText)) {
      objections.push({
        id: 'obj-3',
        text: "We're also looking at other solutions.",
        type: 'competition',
        timestamp: 'mid-call',
        addressed: Math.random() > 0.5,
        handling: Math.random() > 0.5 ? 'partial' : 'poor',
        repResponse: 'Highlighted key differentiators.',
        suggestedResponse: 'Ask which specific competitors and address unique value propositions.',
      });
    }

    return objections;
  }

  private generateStrengths(score: number, repName: string): ICallAnalysis['coachingFeedback']['strengths'] {
    const strengths: ICallAnalysis['coachingFeedback']['strengths'] = [];

    if (score >= 60) {
      strengths.push({
        title: 'Professional Demeanor',
        description: `${repName} maintained a professional and confident tone throughout the call.`,
        impact: 'medium',
      });
    }

    if (score >= 70) {
      strengths.push({
        title: 'Active Listening',
        description: 'Demonstrated good active listening by acknowledging prospect\'s points.',
        impact: 'high',
      });
    }

    if (score >= 80) {
      strengths.push({
        title: 'Value Articulation',
        description: 'Effectively communicated the value proposition aligned with prospect needs.',
        quote: 'Great job connecting features to specific pain points.',
        impact: 'high',
      });
    }

    return strengths;
  }

  private generateImprovements(score: number): ICallAnalysis['coachingFeedback']['improvements'] {
    const improvements: ICallAnalysis['coachingFeedback']['improvements'] = [];

    if (score < 80) {
      improvements.push({
        title: 'Ask More Open-Ended Questions',
        description: 'Relying too heavily on yes/no questions limits discovery.',
        priority: 'high',
        suggestion: 'Use questions starting with "What", "How", "Tell me about..."',
        example: 'Instead of "Do you have budget?", ask "How does your budgeting process typically work?"',
      });
    }

    if (score < 70) {
      improvements.push({
        title: 'Pause After Key Points',
        description: 'Allow 2-3 seconds after sharing important information.',
        priority: 'medium',
        suggestion: 'Let key messages sink in before moving on.',
      });
    }

    if (score < 60) {
      improvements.push({
        title: 'Strengthen Objection Handling',
        description: 'Some objections were not fully addressed.',
        priority: 'high',
        suggestion: 'Use the LAER framework: Listen, Acknowledge, Explore, Respond.',
        example: 'First acknowledge the concern, then ask clarifying questions before responding.',
      });
    }

    return improvements;
  }

  private generateActionItems(score: number): ICallAnalysis['coachingFeedback']['actionItems'] {
    const items: ICallAnalysis['coachingFeedback']['actionItems'] = [];

    items.push({
      task: 'Review this call recording and note 2-3 key learnings',
      type: 'review',
      completed: false,
    });

    if (score < 75) {
      items.push({
        task: 'Practice objection handling with a peer this week',
        type: 'practice',
        completed: false,
      });
    }

    if (score < 70) {
      items.push({
        task: 'Study the SPIN selling methodology for better discovery',
        type: 'study',
        completed: false,
      });
    }

    return items;
  }
}

export const mockAiService = new MockAiService();
