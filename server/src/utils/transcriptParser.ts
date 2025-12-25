import { ITranscriptSegment } from '../models/Call';

/**
 * Common speaker patterns in transcripts
 */
const SPEAKER_PATTERNS = [
  // "Name: text" format
  /^([A-Za-z]+(?:\s[A-Za-z]+)?)\s*:\s*(.+)$/,
  // "[Name] text" format
  /^\[([A-Za-z]+(?:\s[A-Za-z]+)?)\]\s*(.+)$/,
  // "(Name) text" format
  /^\(([A-Za-z]+(?:\s[A-Za-z]+)?)\)\s*(.+)$/,
  // "Name - text" format
  /^([A-Za-z]+(?:\s[A-Za-z]+)?)\s*-\s*(.+)$/,
];

/**
 * Keywords that typically indicate the sales rep
 */
const REP_INDICATORS = [
  'sales',
  'rep',
  'agent',
  'representative',
  'consultant',
  'account',
  'executive',
  'manager',
  'ae',
  'sdr',
  'bdr',
  'me',
  'i',
];

/**
 * Keywords that typically indicate the prospect/customer
 */
const PROSPECT_INDICATORS = [
  'customer',
  'prospect',
  'client',
  'buyer',
  'lead',
  'you',
  'they',
];

interface ParsedLine {
  speaker: string;
  text: string;
}

interface SpeakerMapping {
  [key: string]: 'rep' | 'prospect';
}

/**
 * Parse raw transcript text into structured segments
 */
export function parseTranscript(
  rawText: string,
  repName?: string,
  prospectName?: string
): ITranscriptSegment[] {
  const lines = rawText.split('\n').filter(line => line.trim());
  const parsedLines = lines.map(parseLine).filter((l): l is ParsedLine => l !== null);

  if (parsedLines.length === 0) {
    // No speaker format detected, return as single segment
    return [{
      speaker: 'rep',
      speakerName: repName || 'Rep',
      startTime: 0,
      endTime: estimateDuration(rawText),
      text: rawText.trim(),
    }];
  }

  // Build speaker mapping
  const speakerMapping = buildSpeakerMapping(parsedLines, repName, prospectName);

  // Convert to segments with estimated timing
  const segments: ITranscriptSegment[] = [];
  let currentTime = 0;
  const avgWordsPerSecond = 2.5; // Average speaking rate

  for (const line of parsedLines) {
    const wordCount = line.text.split(/\s+/).length;
    const duration = Math.max(2, wordCount / avgWordsPerSecond);

    segments.push({
      speaker: speakerMapping[line.speaker.toLowerCase()] || 'prospect',
      speakerName: line.speaker,
      startTime: Math.round(currentTime),
      endTime: Math.round(currentTime + duration),
      text: line.text,
    });

    currentTime += duration;
  }

  return segments;
}

/**
 * Parse a single line to extract speaker and text
 */
function parseLine(line: string): ParsedLine | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  for (const pattern of SPEAKER_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return {
        speaker: match[1].trim(),
        text: match[2].trim(),
      };
    }
  }

  return null;
}

/**
 * Build a mapping of speaker names to roles (rep or prospect)
 */
function buildSpeakerMapping(
  lines: ParsedLine[],
  repName?: string,
  prospectName?: string
): SpeakerMapping {
  const mapping: SpeakerMapping = {};
  const speakers = [...new Set(lines.map(l => l.speaker.toLowerCase()))];

  // If explicit names provided, use them
  if (repName) {
    mapping[repName.toLowerCase()] = 'rep';
  }
  if (prospectName) {
    mapping[prospectName.toLowerCase()] = 'prospect';
  }

  // For remaining speakers, try to infer role
  for (const speaker of speakers) {
    if (mapping[speaker]) continue;

    const lowerSpeaker = speaker.toLowerCase();

    // Check if speaker name matches rep indicators
    if (REP_INDICATORS.some(ind => lowerSpeaker.includes(ind))) {
      mapping[speaker] = 'rep';
      continue;
    }

    // Check if speaker name matches prospect indicators
    if (PROSPECT_INDICATORS.some(ind => lowerSpeaker.includes(ind))) {
      mapping[speaker] = 'prospect';
      continue;
    }

    // If we have exactly 2 speakers and one is identified, assign the other
    if (speakers.length === 2) {
      const otherSpeaker = speakers.find(s => mapping[s]);
      if (otherSpeaker) {
        mapping[speaker] = mapping[otherSpeaker] === 'rep' ? 'prospect' : 'rep';
        continue;
      }
    }

    // Default: First speaker is usually the rep (they initiate the call)
    const firstSpeaker = lines[0]?.speaker.toLowerCase();
    if (speaker === firstSpeaker && !mapping[speaker]) {
      mapping[speaker] = 'rep';
    } else if (!mapping[speaker]) {
      mapping[speaker] = 'prospect';
    }
  }

  return mapping;
}

/**
 * Estimate call duration based on word count
 */
export function estimateDuration(text: string): number {
  const wordCount = text.split(/\s+/).length;
  const avgWordsPerSecond = 2.5;
  return Math.round(wordCount / avgWordsPerSecond);
}

/**
 * Extract key speakers from transcript
 */
export function extractSpeakers(rawText: string): string[] {
  const lines = rawText.split('\n').filter(line => line.trim());
  const parsedLines = lines.map(parseLine).filter((l): l is ParsedLine => l !== null);
  return [...new Set(parsedLines.map(l => l.speaker))];
}

/**
 * Calculate talk ratio between speakers
 */
export function calculateTalkRatio(segments: ITranscriptSegment[]): { rep: number; prospect: number } {
  let repTime = 0;
  let prospectTime = 0;

  for (const segment of segments) {
    const duration = segment.endTime - segment.startTime;
    if (segment.speaker === 'rep') {
      repTime += duration;
    } else {
      prospectTime += duration;
    }
  }

  const total = repTime + prospectTime;
  if (total === 0) return { rep: 50, prospect: 50 };

  return {
    rep: Math.round((repTime / total) * 100),
    prospect: Math.round((prospectTime / total) * 100),
  };
}

/**
 * Count questions in transcript
 */
export function countQuestions(segments: ITranscriptSegment[], speakerType?: 'rep' | 'prospect'): number {
  let count = 0;

  for (const segment of segments) {
    if (speakerType && segment.speaker !== speakerType) continue;
    const questions = (segment.text.match(/\?/g) || []).length;
    count += questions;
  }

  return count;
}

/**
 * Get the full transcript as plain text
 */
export function getTranscriptText(segments: ITranscriptSegment[]): string {
  return segments
    .map(s => `${s.speakerName}: ${s.text}`)
    .join('\n');
}
