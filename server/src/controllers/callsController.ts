import { Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { Call } from '../models/Call';
import { AuthRequest, CreateCallRequest, UpdateCallRequest, CallsQueryParams } from '../types';
import { analyzeCallTranscript } from '../services/ai';
import { transcriptionService, SupportedMimeType } from '../services/ai/transcriptionService';
import { parseTranscript, estimateDuration } from '../utils/transcriptParser';
import { cleanupFile } from '../middleware/upload';
import { CONSTANTS } from '../config/constants';
import { processingQueue } from '../services/processingQueue';

// Extended request type for file uploads
interface AudioUploadRequest extends AuthRequest {
  file?: Express.Multer.File;
}

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

    // Add to processing queue (don't process directly - avoid rate limits)
    processingQueue.addJob(call._id.toString(), 'transcript', {});

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

    // Add to processing queue for re-analysis
    processingQueue.addJob(call._id.toString(), 'transcript', {});

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

/**
 * @desc    Create a new call by uploading audio file
 * @route   POST /api/calls/upload
 * @access  Private
 */
export const createCallWithAudio = async (req: AudioUploadRequest, res: Response): Promise<void> => {
  let filePath: string | undefined;

  try {
    const file = req.file;
    const user = req.user!;

    // Validate file exists
    if (!file) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'Audio file is required',
        },
      });
      return;
    }

    filePath = file.path;

    // Validate file size (20MB limit for Gemini)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 20) {
      await cleanupFile(filePath);
      res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'Audio file must be under 20MB for transcription',
        },
      });
      return;
    }

    // Validate MIME type
    if (!transcriptionService.isSupportedAudioType(file.mimetype)) {
      await cleanupFile(filePath);
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: `Unsupported audio format: ${file.mimetype}. Supported: MP3, WAV, M4A, AAC, OGG, WebM`,
        },
      });
      return;
    }

    // Parse metadata from request body
    const {
      title,
      prospectName,
      prospectCompany,
      prospectRole,
      repName,
      tags,
      date,
    } = req.body;

    // Validate required metadata
    if (!title || !prospectName || !prospectCompany) {
      await cleanupFile(filePath);
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title, prospect name, and prospect company are required',
        },
      });
      return;
    }

    // Create the call with transcribing status
    // Store audio filename for later playback
    const audioFileName = path.basename(file.path);

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
      duration: 0,
      transcript: [],
      transcriptText: '',
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      status: 'transcribing',
      uploadSource: 'audio',
      originalFileName: file.originalname,
      audioUrl: audioFileName, // Store the audio filename for playback
    });

    console.log(`[Audio Upload] Created call ${call._id} with status 'transcribing'`);

    // Add to processing queue (don't process directly - avoid rate limits)
    processingQueue.addJob(call._id.toString(), 'audio', {
      filePath,
      mimeType: file.mimetype,
      repName: call.repName,
      prospectName: call.prospect.name,
    });

    res.status(201).json({
      success: true,
      data: { call },
    });
  } catch (error) {
    console.error('Create call with audio error:', error);

    // Cleanup file on error
    if (filePath) {
      await cleanupFile(filePath);
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to process audio upload',
      },
    });
  }
};

/**
 * Process audio transcription and analysis asynchronously
 */
async function processAudioTranscription(
  callId: string,
  filePath: string,
  mimeType: SupportedMimeType,
  speakers: { repName: string; prospectName: string }
): Promise<void> {
  try {
    console.log(`[Audio Processing] Starting transcription for call ${callId}`);

    // Transcribe the audio
    const transcriptionResult = await transcriptionService.transcribeAudio(filePath, mimeType);

    console.log(`[Audio Processing] Transcription complete for call ${callId}`);

    // NOTE: We keep the audio file for playback - no cleanup here

    // Find the call and update with transcript
    const call = await Call.findById(callId);
    if (!call) {
      console.error('Call not found for transcription:', callId);
      return;
    }

    // Parse transcript into segments
    const transcript = parseTranscript(
      transcriptionResult.transcript,
      speakers.repName,
      speakers.prospectName
    );

    // Update call with transcript and move to processing status
    call.transcriptText = transcriptionResult.transcript;
    call.transcript = transcript;
    call.duration = transcriptionResult.durationSeconds;
    call.status = 'processing';
    await call.save();

    console.log(`[Audio Processing] Call ${callId} updated with transcript, starting analysis`);

    // Now analyze the transcript
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

    console.log(`[Audio Processing] Call ${callId} analysis complete. Score: ${analysis.overallScore}`);
  } catch (error) {
    console.error('Audio processing failed:', error);

    // Cleanup file if it still exists
    await cleanupFile(filePath);

    // Mark call as error
    await Call.findByIdAndUpdate(callId, {
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Audio processing failed',
    });
  }
}

/**
 * Process transcript analysis (for text-only uploads)
 */
async function processTranscriptAnalysis(callId: string): Promise<void> {
  try {
    const call = await Call.findById(callId);
    if (!call) {
      console.error('Call not found for analysis:', callId);
      return;
    }

    console.log(`[Analysis] Starting analysis for call ${callId}`);

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

    console.log(`[Analysis] Call ${callId} analysis complete. Score: ${analysis.overallScore}`);
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
 * Initialize the processing queue with the job processor
 * This should be called when the server starts
 */
export function initializeProcessingQueue(): void {
  processingQueue.setProcessor(async (job) => {
    console.log(`[Queue Processor] Processing job ${job.id} (${job.type}) for call ${job.callId}`);

    if (job.type === 'audio') {
      const { filePath, mimeType, repName, prospectName } = job.data as {
        filePath: string;
        mimeType: string;
        repName: string;
        prospectName: string;
      };

      await processAudioTranscription(
        job.callId,
        filePath,
        mimeType as SupportedMimeType,
        { repName, prospectName }
      );
    } else {
      // Transcript-only processing
      await processTranscriptAnalysis(job.callId);
    }
  });

  console.log('[Queue] Processing queue initialized');
}

/**
 * @desc    Stream audio file for a call
 * @route   GET /api/calls/:id/audio
 * @access  Private
 */
export const streamAudio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    // Find the call and verify ownership
    const call = await Call.findOne({
      _id: id,
      $or: [{ user: user._id }, { organization: user.organization }],
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

    // Check if audio exists
    if (!call.audioUrl) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NO_AUDIO',
          message: 'No audio file available for this call',
        },
      });
      return;
    }

    // Construct file path
    const audioPath = path.join(process.cwd(), 'uploads', call.audioUrl);

    // Check if file exists
    try {
      await fs.promises.access(audioPath, fs.constants.R_OK);
    } catch {
      res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Audio file not found on server',
        },
      });
      return;
    }

    // Get file stats for content-length
    const stat = await fs.promises.stat(audioPath);
    const fileSize = stat.size;

    // Determine content type from file extension
    const ext = path.extname(call.audioUrl).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.ogg': 'audio/ogg',
      '.webm': 'audio/webm',
    };
    const contentType = mimeTypes[ext] || 'audio/mpeg';

    // Handle range requests for seeking
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });

      const stream = fs.createReadStream(audioPath, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });

      const stream = fs.createReadStream(audioPath);
      stream.pipe(res);
    }
  } catch (error) {
    console.error('Stream audio error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to stream audio',
      },
    });
  }
};
