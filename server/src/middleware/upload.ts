import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { SUPPORTED_AUDIO_TYPES } from '../services/ai/transcriptionService';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `audio-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow supported audio types
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype in SUPPORTED_AUDIO_TYPES) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported audio format: ${file.mimetype}. Supported formats: MP3, WAV, M4A, AAC, OGG, WebM`
      )
    );
  }
};

// Configure multer
export const audioUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max upload (Gemini limit is ~20MB for inline)
  },
});

/**
 * Cleanup function for temporary files
 */
export const cleanupFile = async (filePath: string): Promise<void> => {
  try {
    await fs.promises.unlink(filePath);
    console.log(`[Upload] Cleaned up temporary file: ${filePath}`);
  } catch (error) {
    // File might already be deleted, that's okay
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`[Upload] Failed to cleanup file ${filePath}:`, error);
    }
  }
};

/**
 * Error handler middleware for multer errors
 */
export const handleUploadError = (
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds the maximum limit of 100MB',
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message,
      },
    });
  }

  if (error.message.includes('Unsupported audio format')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: error.message,
      },
    });
  }

  next(error);
};
