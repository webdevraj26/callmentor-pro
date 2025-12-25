import { Request, Response } from 'express';
import { Call } from '../models/Call';
import { AuthRequest, DashboardMetrics, ScoreTrendPoint, ObjectionStat, PerformanceDimension } from '../types';

/**
 * @desc    Get public platform statistics for landing page
 * @route   GET /api/analytics/public-stats
 * @access  Public
 */
export const getPublicStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Get total calls analyzed across all users
    const totalCalls = await Call.countDocuments({ status: 'analyzed' });

    // Get unique teams (users with at least one call)
    const uniqueTeams = await Call.distinct('user', { status: 'analyzed' });

    // Calculate average improvement (score trend across platform)
    const avgScoreStats = await Call.aggregate([
      { $match: { status: 'analyzed' } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$analysis.overallScore' },
        },
      },
    ]);

    const avgScore = avgScoreStats[0]?.avgScore || 0;
    // Estimate improvement percentage (baseline 55, max 85 = ~27% improvement on avg)
    const avgImprovement = avgScore > 55 ? Math.round(((avgScore - 55) / 55) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalCalls: totalCalls > 0 ? totalCalls.toLocaleString() : '0',
        totalTeams: uniqueTeams.length > 0 ? uniqueTeams.length.toString() : '0',
        avgImprovement: avgImprovement > 0 ? `${avgImprovement}%` : '0%',
        // Rating is kept static as it's an external metric
        rating: '4.9',
      },
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch public stats',
      },
    });
  }
};

/**
 * @desc    Get dashboard metrics
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
export const getDashboardMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Aggregate metrics for current period (last 30 days)
    const currentPeriodStats = await Call.aggregate([
      {
        $match: {
          user: user._id,
          status: 'analyzed',
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$analysis.overallScore' },
          totalCalls: { $sum: 1 },
          avgTalkRatio: { $avg: '$analysis.metrics.talkRatio' },
          uniqueReps: { $addToSet: '$repName' },
        },
      },
    ]);

    // Aggregate metrics for previous period (30-60 days ago)
    const previousPeriodStats = await Call.aggregate([
      {
        $match: {
          user: user._id,
          status: 'analyzed',
          date: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$analysis.overallScore' },
          totalCalls: { $sum: 1 },
        },
      },
    ]);

    const current = currentPeriodStats[0] || {
      avgScore: 0,
      totalCalls: 0,
      avgTalkRatio: 50,
      uniqueReps: [],
    };

    const previous = previousPeriodStats[0] || {
      avgScore: 0,
      totalCalls: 0,
    };

    // Calculate trends (percentage change)
    const avgScoreTrend = previous.avgScore
      ? Math.round(((current.avgScore - previous.avgScore) / previous.avgScore) * 100)
      : 0;

    const totalCallsTrend = previous.totalCalls
      ? Math.round(((current.totalCalls - previous.totalCalls) / previous.totalCalls) * 100)
      : 0;

    const metrics: DashboardMetrics = {
      avgScore: Math.round(current.avgScore || 0),
      avgScoreTrend,
      totalCalls: current.totalCalls || 0,
      totalCallsTrend,
      avgTalkRatio: Math.round(current.avgTalkRatio || 50),
      activeReps: current.uniqueReps?.length || 1,
    };

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch dashboard metrics',
      },
    });
  }
};

/**
 * @desc    Get score trends over time
 * @route   GET /api/analytics/trends
 * @access  Private
 */
export const getScoreTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { period = 'week' } = req.query;

    // Determine date range based on period
    let daysBack: number;
    let groupFormat: string;

    switch (period) {
      case 'month':
        daysBack = 30;
        groupFormat = '%Y-%m-%d';
        break;
      case 'quarter':
        daysBack = 90;
        groupFormat = '%Y-%W'; // Week of year
        break;
      case 'week':
      default:
        daysBack = 7;
        groupFormat = '%Y-%m-%d';
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const trends = await Call.aggregate([
      {
        $match: {
          user: user._id,
          status: 'analyzed',
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$date' } },
          score: { $avg: '$analysis.overallScore' },
          callCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          score: { $round: ['$score', 0] },
          callCount: 1,
        },
      },
    ]);

    // Fill in missing dates with null values
    const filledTrends: ScoreTrendPoint[] = [];
    const trendMap = new Map(trends.map(t => [t.date, t]));

    for (let i = 0; i < daysBack; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (daysBack - 1 - i));
      const dateStr = date.toISOString().split('T')[0];

      const existing = trendMap.get(dateStr);
      filledTrends.push({
        date: dateStr,
        score: existing?.score || 0,
        callCount: existing?.callCount || 0,
      });
    }

    res.json({
      success: true,
      data: filledTrends,
    });
  } catch (error) {
    console.error('Get score trends error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch score trends',
      },
    });
  }
};

/**
 * @desc    Get objection statistics
 * @route   GET /api/analytics/objections
 * @access  Private
 */
export const getObjectionStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    const stats = await Call.aggregate([
      {
        $match: {
          user: user._id,
          status: 'analyzed',
          'analysis.objections': { $exists: true, $ne: [] },
        },
      },
      {
        $unwind: '$analysis.objections',
      },
      {
        $group: {
          _id: '$analysis.objections.type',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Calculate total for percentages
    const total = stats.reduce((sum, s) => sum + s.count, 0);

    const objectionLabels: Record<string, string> = {
      pricing: 'Pricing',
      timeline: 'Timeline',
      competition: 'Competition',
      authority: 'Authority',
      need: 'Need',
      other: 'Other',
    };

    const objectionStats: ObjectionStat[] = stats.map(s => ({
      type: s._id,
      label: objectionLabels[s._id] || s._id,
      count: s.count,
      percentage: total > 0 ? Math.round((s.count / total) * 100) : 0,
    }));

    res.json({
      success: true,
      data: objectionStats,
    });
  } catch (error) {
    console.error('Get objection stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch objection statistics',
      },
    });
  }
};

/**
 * @desc    Get performance dimensions (average scores by category)
 * @route   GET /api/analytics/dimensions
 * @access  Private
 */
export const getPerformanceDimensions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    const stats = await Call.aggregate([
      {
        $match: {
          user: user._id,
          status: 'analyzed',
          analysis: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          discovery: { $avg: '$analysis.scoreBreakdown.categories.discovery.score' },
          talkBalance: { $avg: '$analysis.scoreBreakdown.categories.talkBalance.score' },
          objectionHandling: { $avg: '$analysis.scoreBreakdown.categories.objectionHandling.score' },
          nextSteps: { $avg: '$analysis.scoreBreakdown.categories.nextSteps.score' },
          rapport: { $avg: '$analysis.scoreBreakdown.categories.rapport.score' },
          accuracy: { $avg: '$analysis.scoreBreakdown.categories.accuracy.score' },
        },
      },
    ]);

    const scores = stats[0] || {
      discovery: 0,
      talkBalance: 0,
      objectionHandling: 0,
      nextSteps: 0,
      rapport: 0,
      accuracy: 0,
    };

    const getColor = (score: number): string => {
      if (score >= 80) return 'green';
      if (score >= 60) return 'yellow';
      return 'red';
    };

    const dimensions: PerformanceDimension[] = [
      {
        name: 'Discovery',
        score: Math.round(scores.discovery || 0),
        maxScore: 100,
        color: getColor(scores.discovery || 0),
      },
      {
        name: 'Talk Balance',
        score: Math.round(scores.talkBalance || 0),
        maxScore: 100,
        color: getColor(scores.talkBalance || 0),
      },
      {
        name: 'Objection Handling',
        score: Math.round(scores.objectionHandling || 0),
        maxScore: 100,
        color: getColor(scores.objectionHandling || 0),
      },
      {
        name: 'Next Steps',
        score: Math.round(scores.nextSteps || 0),
        maxScore: 100,
        color: getColor(scores.nextSteps || 0),
      },
      {
        name: 'Rapport',
        score: Math.round(scores.rapport || 0),
        maxScore: 100,
        color: getColor(scores.rapport || 0),
      },
      {
        name: 'Accuracy',
        score: Math.round(scores.accuracy || 0),
        maxScore: 100,
        color: getColor(scores.accuracy || 0),
      },
    ];

    res.json({
      success: true,
      data: dimensions,
    });
  } catch (error) {
    console.error('Get performance dimensions error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch performance dimensions',
      },
    });
  }
};

/**
 * @desc    Get recent calls for dashboard
 * @route   GET /api/analytics/recent-calls
 * @access  Private
 */
export const getRecentCalls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { limit = 5 } = req.query;

    const calls = await Call.find({
      user: user._id,
      status: 'analyzed',
    })
      .sort({ date: -1 })
      .limit(Number(limit))
      .select('title prospect repName date duration analysis.overallScore tags')
      .lean();

    res.json({
      success: true,
      data: calls,
    });
  } catch (error) {
    console.error('Get recent calls error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch recent calls',
      },
    });
  }
};

/**
 * @desc    Get coaching insights (aggregated improvements)
 * @route   GET /api/analytics/insights
 * @access  Private
 */
export const getCoachingInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    // Get recent calls with coaching feedback
    const calls = await Call.find({
      user: user._id,
      status: 'analyzed',
      'analysis.coachingFeedback': { $exists: true },
    })
      .sort({ date: -1 })
      .limit(10)
      .select('analysis.coachingFeedback analysis.overallScore date')
      .lean();

    // Aggregate improvements by priority
    const improvementCounts: Record<string, number> = {};
    const strengthCounts: Record<string, number> = {};

    for (const call of calls) {
      const feedback = call.analysis?.coachingFeedback;
      if (!feedback) continue;

      for (const improvement of feedback.improvements || []) {
        const key = improvement.title.toLowerCase();
        improvementCounts[key] = (improvementCounts[key] || 0) + 1;
      }

      for (const strength of feedback.strengths || []) {
        const key = strength.title.toLowerCase();
        strengthCounts[key] = (strengthCounts[key] || 0) + 1;
      }
    }

    // Get top 5 most common improvements and strengths
    const topImprovements = Object.entries(improvementCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));

    const topStrengths = Object.entries(strengthCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));

    res.json({
      success: true,
      data: {
        topImprovements,
        topStrengths,
        callsAnalyzed: calls.length,
      },
    });
  } catch (error) {
    console.error('Get coaching insights error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch coaching insights',
      },
    });
  }
};
