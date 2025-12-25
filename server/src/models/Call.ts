import mongoose, { Document, Schema } from 'mongoose';

// ============ SUBDOCUMENT INTERFACES ============

export interface IProspect {
  name: string;
  company: string;
  role?: string;
}

export interface ITranscriptSegment {
  speaker: 'rep' | 'prospect';
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface ICategoryScore {
  score: number;
  weight: number;
  reasoning: string;
  highlights?: string[];
}

export interface IScoreBreakdown {
  categories: {
    discovery: ICategoryScore;
    talkBalance: ICategoryScore;
    objectionHandling: ICategoryScore;
    nextSteps: ICategoryScore;
    rapport: ICategoryScore;
    accuracy: ICategoryScore;
  };
}

export interface ICallMetrics {
  talkRatio: number;
  questionCount: number;
  longestMonologue: number;
  fillerWordCount: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  engagementScore: number;
}

export type ObjectionType = 'pricing' | 'timeline' | 'competition' | 'authority' | 'need' | 'other';
export type ObjectionHandling = 'well' | 'partial' | 'poor' | 'missed';

export interface IObjection {
  id: string;
  text: string;
  type: ObjectionType;
  timestamp?: string;
  addressed: boolean;
  handling: ObjectionHandling;
  repResponse?: string;
  suggestedResponse?: string;
}

export interface IStrength {
  title: string;
  description: string;
  quote?: string;
  timestamp?: string;
  impact?: 'high' | 'medium';
}

export interface IImprovement {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  quote?: string;
  timestamp?: string;
  suggestion: string;
  example?: string;
}

export interface IActionItem {
  task: string;
  type: 'practice' | 'study' | 'review' | 'discuss';
  completed?: boolean;
}

export interface ICoachingFeedback {
  summary: string;
  strengths: IStrength[];
  improvements: IImprovement[];
  actionItems: IActionItem[];
}

export interface ICallAnalysis {
  overallScore: number;
  scoreBreakdown: IScoreBreakdown;
  metrics: ICallMetrics;
  objections: IObjection[];
  coachingFeedback: ICoachingFeedback;
  summary: string;
}

export type CallStatus = 'pending' | 'transcribing' | 'processing' | 'analyzed' | 'error';
export type UploadSource = 'transcript' | 'audio';

// ============ MAIN CALL INTERFACE ============

export interface ICall extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  organization?: mongoose.Types.ObjectId;
  title: string;
  prospect: IProspect;
  repName: string;
  date: Date;
  duration: number;
  transcript: ITranscriptSegment[];
  transcriptText: string;
  audioUrl?: string;
  summary?: string;
  analysis?: ICallAnalysis;
  tags: string[];
  status: CallStatus;
  uploadSource: UploadSource;
  originalFileName?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============ SCHEMAS ============

const ProspectSchema = new Schema<IProspect>(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String },
  },
  { _id: false }
);

const TranscriptSegmentSchema = new Schema<ITranscriptSegment>(
  {
    speaker: { type: String, enum: ['rep', 'prospect'], required: true },
    speakerName: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const CategoryScoreSchema = new Schema<ICategoryScore>(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    weight: { type: Number, required: true },
    reasoning: { type: String, required: true },
    highlights: [{ type: String }],
  },
  { _id: false }
);

const ScoreBreakdownSchema = new Schema<IScoreBreakdown>(
  {
    categories: {
      discovery: { type: CategoryScoreSchema, required: true },
      talkBalance: { type: CategoryScoreSchema, required: true },
      objectionHandling: { type: CategoryScoreSchema, required: true },
      nextSteps: { type: CategoryScoreSchema, required: true },
      rapport: { type: CategoryScoreSchema, required: true },
      accuracy: { type: CategoryScoreSchema, required: true },
    },
  },
  { _id: false }
);

const CallMetricsSchema = new Schema<ICallMetrics>(
  {
    talkRatio: { type: Number, required: true },
    questionCount: { type: Number, required: true },
    longestMonologue: { type: Number, required: true },
    fillerWordCount: { type: Number, required: true },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], required: true },
    engagementScore: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const ObjectionSchema = new Schema<IObjection>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ['pricing', 'timeline', 'competition', 'authority', 'need', 'other'],
      required: true,
    },
    timestamp: { type: String },
    addressed: { type: Boolean, required: true },
    handling: {
      type: String,
      enum: ['well', 'partial', 'poor', 'missed'],
      required: true,
    },
    repResponse: { type: String },
    suggestedResponse: { type: String },
  },
  { _id: false }
);

const StrengthSchema = new Schema<IStrength>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    quote: { type: String },
    timestamp: { type: String },
    impact: { type: String, enum: ['high', 'medium'] },
  },
  { _id: false }
);

const ImprovementSchema = new Schema<IImprovement>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
    quote: { type: String },
    timestamp: { type: String },
    suggestion: { type: String, required: true },
    example: { type: String },
  },
  { _id: false }
);

const ActionItemSchema = new Schema<IActionItem>(
  {
    task: { type: String, required: true },
    type: { type: String, enum: ['practice', 'study', 'review', 'discuss'], required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const CoachingFeedbackSchema = new Schema<ICoachingFeedback>(
  {
    summary: { type: String, required: true },
    strengths: [StrengthSchema],
    improvements: [ImprovementSchema],
    actionItems: [ActionItemSchema],
  },
  { _id: false }
);

const CallAnalysisSchema = new Schema<ICallAnalysis>(
  {
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    scoreBreakdown: { type: ScoreBreakdownSchema, required: true },
    metrics: { type: CallMetricsSchema, required: true },
    objections: [ObjectionSchema],
    coachingFeedback: { type: CoachingFeedbackSchema, required: true },
    summary: { type: String, required: true },
  },
  { _id: false }
);

// ============ MAIN CALL SCHEMA ============

const CallSchema = new Schema<ICall>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Call title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      trim: true,
    },
    prospect: {
      type: ProspectSchema,
      required: true,
    },
    repName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    transcript: [TranscriptSegmentSchema],
    transcriptText: {
      type: String,
      default: '',
    },
    audioUrl: {
      type: String,
    },
    summary: {
      type: String,
    },
    analysis: {
      type: CallAnalysisSchema,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    status: {
      type: String,
      enum: ['pending', 'transcribing', 'processing', 'analyzed', 'error'],
      default: 'pending',
      index: true,
    },
    uploadSource: {
      type: String,
      enum: ['transcript', 'audio'],
      default: 'transcript',
    },
    originalFileName: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// ============ INDEXES ============

CallSchema.index({ user: 1, date: -1 });
CallSchema.index({ organization: 1, date: -1 });
CallSchema.index({ user: 1, status: 1 });
CallSchema.index({ 'analysis.overallScore': -1 });
CallSchema.index({ title: 'text', 'prospect.name': 'text', 'prospect.company': 'text' });

// ============ METHODS ============

CallSchema.methods.toJSON = function () {
  const call = this.toObject();
  delete call.__v;
  return call;
};

export const Call = mongoose.model<ICall>('Call', CallSchema);
