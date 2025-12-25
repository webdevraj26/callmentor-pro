import { Response } from 'express';
import mongoose from 'mongoose';
import { Call, ICall } from '../models/Call';
import { AuthRequest, CreateCallRequest, UpdateCallRequest, CallsQueryParams } from '../types';
import { analyzeCallTranscript } from '../services/ai';
import { parseTranscript, estimateDuration } from '../utils/transcriptParser';
import { CONSTANTS } from '../config/constants';

/**
 * @desc    Create a new call with transcript
 * @route   POST /api/calls
 * @access  Private
 */
export const createCall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      prospectName,
      prospectCompany,
      prospectRole,
      transcriptText,
      repName,
      tags,
      date,
    }: CreateCallRequest = req.body;

    // Validate required fields
    if (!title || !prospectName || !prospectCompany || !transcriptText) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title, prospect name, prospect company, and transcript are required',
        },
      });
      return;
    }

    const user = req.user!;

    // Parse transcript into segments
    const transcript = parseTranscript(
      transcriptText,
      repName || `${user.firstName} ${user.lastName}`,
      prospectName
    );

    // Estimate duration from transcript
    const duration = estimateDuration(transcriptText);

    // Create the call with pending status
    const call = await Call.create({
      user: user._id,
      organization: user.organization,
      title,
      prospect: {
        name: prospectName,
        company: prospectCompany,
        role: prospectRole,
      },
      repName: repName || `${user.firstName} ${user.lastName}`,
      date: date ? new Date(date) : new Date(),
      duration,
      transcript,
      transcriptText,
      tags: tags || [],
      status: 'processing',
    });

    // Start async analysis (don't await - respond immediately)
    processCallAnalysis(call._id.toString()).catch(err => {
      console.error('Background analysis failed:', err);
    });

    res.status(201).json({
      success: true,
      data: { call },
    });
  } catch (error) {
    console.error('Create call error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create call',
      },
    });
  }
};

/**
 * Process call analysis asynchronously
 */
async function processCallAnalysis(callId: string): Promise<void> {
  try {
    const call = await Call.findById(callId);
    if (!call) {
      console.error('Call not found for analysis:', callId);
      return;
    }

    // Analyze the transcript
    const analysis = await analyzeCallTranscript(call.transcriptText, {
      repName: call.repName,
      prospectName: call.prospect.name,
      prospectCompany: call.prospect.company,
    });

    // Update call with analysis results
    call.analysis = analysis;
    call.summary = analysis.summary;
    call.status = 'analyzed';
    await call.save();

    console.log(`Call ${callId} analysis complete. Score: ${analysis.overallScore}`);
  } catch (error) {
    console.error('Call analysis failed:', error);

    // Mark call as error
    await Call.findByIdAndUpdate(callId, {
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Analysis failed',
    });
  }
}

/**
 * @desc    Get all calls for user (paginated)
 * @route   GET /api/calls
 * @access  Private
 */
export const getCalls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const {
      page = 1,
      limit = CONSTANTS.pagination.defaultLimit,
      status,
      search,
      sort = '-date',
      startDate,
      endDate,
      tags,
    } = req.query as unknown as CallsQueryParams;

    // Build query
    const query: Record<string, unknown> = {
      user: user._id,
    };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        (query.date as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.date as Record<string, unknown>).$lte = new Date(endDate);
      }
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'prospect.name': { $regex: search, $options: 'i' } },
        { 'prospect.company': { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(Number(limit), CONSTANTS.pagination.maxLimit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith('-') ? -1 : 1;
    const sortObj: Record<string, 1 | -1> = { [sortField]: sortOrder };

    // Execute query
    const [calls, total] = await Promise.all([
      Call.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Call.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: calls,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get calls error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch calls',
      },
    });
  }
};

/**
 * @desc    Get single call by ID
 * @route   GET /api/calls/:id
 * @access  Private
 */
export const getCall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid call ID',
        },
      });
      return;
    }

    const call = await Call.findOne({
      _id: id,
      user: user._id,
    });

    if (!call) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Call not found',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { call },
    });
  } catch (error) {
    console.error('Get call error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch call',
      },
    });
  }
};

/**
 * @desc    Update call metadata
 * @route   PUT /api/calls/:id
 * @access  Private
 */
export const updateCall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const updates: UpdateCallRequest = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid call ID',
        },
      });
      return;
    }

    // Build update object
    const updateObj: Record<string, unknown> = {};
    if (updates.title) updateObj.title = updates.title;
    if (updates.repName) updateObj.repName = updates.repName;
    if (updates.tags) updateObj.tags = updates.tags;
    if (updates.prospect) {
      if (updates.prospect.name) updateObj['prospect.name'] = updates.prospect.name;
      if (updates.prospect.company) updateObj['prospect.company'] = updates.prospect.company;
      if (updates.prospect.role) updateObj['prospect.role'] = updates.prospect.role;
    }

    const call = await Call.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: updateObj },
      { new: true, runValidators: true }
    );

    if (!call) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Call not found',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { call },
    });
  } catch (error) {
    console.error('Update call error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update call',
      },
    });
  }
};

/**
 * @desc    Delete call
 * @route   DELETE /api/calls/:id
 * @access  Private
 */
export const deleteCall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid call ID',
        },
      });
      return;
    }

    const call = await Call.findOneAndDelete({
      _id: id,
      user: user._id,
    });

    if (!call) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Call not found',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { message: 'Call deleted successfully' },
    });
  } catch (error) {
    console.error('Delete call error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete call',
      },
    });
  }
};

/**
 * @desc    Re-analyze a call
 * @route   POST /api/calls/:id/analyze
 * @access  Private
 */
export const reanalyzeCall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid call ID',
        },
      });
      return;
    }

    const call = await Call.findOne({
      _id: id,
      user: user._id,
    });

    if (!call) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Call not found',
        },
      });
      return;
    }

    // Update status to processing
    call.status = 'processing';
    call.errorMessage = undefined;
    await call.save();

    // Start async analysis
    processCallAnalysis(call._id.toString()).catch(err => {
      console.error('Re-analysis failed:', err);
    });

    res.json({
      success: true,
      data: { call },
    });
  } catch (error) {
    console.error('Reanalyze call error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to re-analyze call',
      },
    });
  }
};

/**
 * @desc    Get call analysis status
 * @route   GET /api/calls/:id/status
 * @access  Private
 */
export const getCallStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid call ID',
        },
      });
      return;
    }

    const call = await Call.findOne(
      { _id: id, user: user._id },
      { status: 1, errorMessage: 1, 'analysis.overallScore': 1 }
    );

    if (!call) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Call not found',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        status: call.status,
        errorMessage: call.errorMessage,
        score: call.analysis?.overallScore,
      },
    });
  } catch (error) {
    console.error('Get call status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get call status',
      },
    });
  }
};
