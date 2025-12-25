import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';

// Supported audio MIME types
export const SUPPORTED_AUDIO_TYPES: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm',
};

export type SupportedMimeType = keyof typeof SUPPORTED_AUDIO_TYPES;

export interface TranscriptionResult {
  transcript: string;
  durationSeconds: number;
}

const TRANSCRIPTION_PROMPT = `You are an expert audio transcriber for sales calls. Transcribe this audio with the following requirements:

1. Identify speakers as "Rep" (the sales representative) and "Prospect" (the potential customer/client)
2. Format the transcript with clear speaker labels on each line
3. Preserve filler words (um, uh, like) as they're useful for coaching analysis
4. Use proper punctuation and paragraph breaks for readability
5. If you cannot clearly identify who is speaking, use "Speaker 1" and "Speaker 2"

Output format (use this exact format):
Rep: What they said...
Prospect: What they said...
Rep: Next thing they said...

IMPORTANT:
- Return ONLY the transcript text, no additional commentary, headers, or metadata
- Start directly with the first speaker line
- Do not include timestamps in the output`;

class TranscriptionService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: string = 'gemini-2.5-flash';

  private getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required for transcription');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Check if the MIME type is supported for transcription
   */
  isSupportedAudioType(mimeType: string): mimeType is SupportedMimeType {
    return mimeType in SUPPORTED_AUDIO_TYPES;
  }

  /**
   * Get file size in MB
   */
  async getFileSizeMB(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size / (1024 * 1024);
  }

  /**
   * Transcribe an audio file using Gemini
   */
  async transcribeAudio(
    filePath: string,
    mimeType: SupportedMimeType
  ): Promise<TranscriptionResult> {
    try {
      console.log(`[Transcription] Starting transcription for: ${filePath}`);
      console.log(`[Transcription] MIME type: ${mimeType}`);

      // Read file and convert to base64
      const audioBuffer = await fs.readFile(filePath);
      const base64Audio = audioBuffer.toString('base64');

      const fileSizeMB = audioBuffer.length / (1024 * 1024);
      console.log(`[Transcription] File size: ${fileSizeMB.toFixed(2)} MB`);

      // Get the model
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: 0.1, // Low temperature for accurate transcription
          maxOutputTokens: 16384, // Allow for long transcripts
        },
      });

      console.log(`[Transcription] Sending to Gemini ${this.model}...`);

      // Create content with audio part
      const result = await model.generateContent([
        TRANSCRIPTION_PROMPT,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Audio,
          },
        },
      ]);

      const response = result.response;
      const transcript = response.text().trim();

      console.log(`[Transcription] Received transcript, length: ${transcript.length} chars`);

      // Estimate duration from transcript length
      // Average speaking rate is ~150 words per minute
      const wordCount = transcript.split(/\s+/).length;
      const estimatedDuration = Math.round((wordCount / 150) * 60);

      console.log(`[Transcription] Estimated duration: ${estimatedDuration} seconds (${wordCount} words)`);

      return {
        transcript,
        durationSeconds: estimatedDuration,
      };
    } catch (error) {
      console.error('[Transcription] Error:', error);

      if (error instanceof Error) {
        // Check for common Gemini errors
        if (error.message.includes('INVALID_ARGUMENT')) {
          throw new Error('Invalid audio format or corrupted file. Please try a different file.');
        }
        if (error.message.includes('RESOURCE_EXHAUSTED')) {
          throw new Error('Audio file is too large. Please use a file under 20MB.');
        }
        if (error.message.includes('API key')) {
          throw new Error('AI service configuration error. Please contact support.');
        }
        throw new Error(`Transcription failed: ${error.message}`);
      }

      throw new Error('Failed to transcribe audio. Please try again.');
    }
  }
}

// Export singleton instance
export const transcriptionService = new TranscriptionService();
