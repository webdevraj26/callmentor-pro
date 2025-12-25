# Phase 5: Call Features

## Overview
Build the core call management features including the calls list page, call detail page with tabs, transcript viewer, and upload functionality.

**Reference**: SPECIFICATION.md - Section 7 (Core Features Specification)

---

## Task 5.1: Create Call Model (MongoDB)

### Description
Define the Call schema with Mongoose for storing calls and analysis data.

### Files to Create
```
server/src/models/Call.ts
```

### Implementation
```typescript
import mongoose, { Document, Model } from 'mongoose';

export interface ICall extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;

  title: string;
  prospect: {
    name: string;
    company: string;
    role?: string;
  };
  repName: string;
  date: Date;
  duration: number;

  transcriptText: string;
  transcript: Array<{
    speaker: 'rep' | 'prospect';
    speakerName: string;
    startTime: number;
    endTime: number;
    text: string;
  }>;
  audioUrl?: string;

  summary?: string;
  score?: number;
  scoreBreakdown?: {
    overall: number;
    categories: {
      discovery: { score: number; weight: number; reasoning: string };
      talkBalance: { score: number; weight: number; reasoning: string };
      objectionHandling: { score: number; weight: number; reasoning: string };
      nextSteps: { score: number; weight: number; reasoning: string };
      rapport: { score: number; weight: number; reasoning: string };
      accuracy: { score: number; weight: number; reasoning: string };
    };
  };
  metrics?: {
    talkRatio: number;
    questionCount: number;
    longestMonologue: number;
    fillerWordCount: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    engagementScore: number;
  };
  objections?: Array<{
    id: string;
    text: string;
    type: string;
    timestamp?: string;
    addressed: boolean;
    handling: string;
    repResponse?: string;
  }>;
  coachingFeedback?: {
    summary: string;
    strengths: Array<{
      title: string;
      description: string;
      quote?: string;
      timestamp?: string;
    }>;
    improvements: Array<{
      title: string;
      description: string;
      priority: string;
      quote?: string;
      timestamp?: string;
      suggestion: string;
    }>;
    actionItems: Array<{
      task: string;
      type: string;
    }>;
  };
  tags: string[];

  status: 'pending' | 'processing' | 'analyzed' | 'error';
  errorMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

const callSchema = new mongoose.Schema<ICall>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    prospect: {
      name: { type: String, required: true },
      company: { type: String, required: true },
      role: String,
    },
    repName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number,
      default: 0,
    },

    transcriptText: {
      type: String,
      required: true,
    },
    transcript: [{
      speaker: {
        type: String,
        enum: ['rep', 'prospect'],
        required: true,
      },
      speakerName: String,
      startTime: Number,
      endTime: Number,
      text: String,
    }],
    audioUrl: String,

    summary: String,
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    scoreBreakdown: {
      type: mongoose.Schema.Types.Mixed,
    },
    metrics: {
      type: mongoose.Schema.Types.Mixed,
    },
    objections: [{
      id: String,
      text: String,
      type: String,
      timestamp: String,
      addressed: Boolean,
      handling: String,
      repResponse: String,
    }],
    coachingFeedback: {
      type: mongoose.Schema.Types.Mixed,
    },
    tags: [String],

    status: {
      type: String,
      enum: ['pending', 'processing', 'analyzed', 'error'],
      default: 'pending',
    },
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
callSchema.index({ userId: 1, date: -1 });
callSchema.index({ teamId: 1, date: -1 });
callSchema.index({ status: 1 });
callSchema.index({ tags: 1 });
callSchema.index({ transcriptText: 'text' });

export const Call = mongoose.model<ICall>('Call', callSchema);
```

### Acceptance Criteria
- [ ] Schema defined with all fields
- [ ] Indexes created
- [ ] Validation works
- [ ] Types exported

---

## Task 5.2: Create Calls API Routes

### Description
Build CRUD endpoints for managing calls.

### Files to Create
```
server/src/routes/calls.routes.ts
server/src/controllers/calls.controller.ts
```

### Controller Implementation
```typescript
// server/src/controllers/calls.controller.ts
import { Request, Response } from 'express';
import { Call } from '@/models/Call';
import { parseTranscript } from '@/utils/transcript';

// List calls
export const getCalls = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, search, sort = '-date' } = req.query;

    const query: any = { userId: req.userId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const calls = await Call.find(query)
      .sort(sort as string)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('-transcript -transcriptText');

    const total = await Call.countDocuments(query);

    res.json({
      success: true,
      data: calls,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get calls error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch calls' },
    });
  }
};

// Get single call
export const getCall = async (req: Request, res: Response) => {
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

    res.json({ success: true, data: call });
  } catch (error) {
    console.error('Get call error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch call' },
    });
  }
};

// Create call
export const createCall = async (req: Request, res: Response) => {
  try {
    const { title, prospectName, prospectCompany, prospectRole, transcriptText, repName } = req.body;

    // Parse transcript
    const { transcript, duration } = parseTranscript(transcriptText, repName || req.user!.fullName);

    const call = await Call.create({
      userId: req.userId,
      teamId: req.user!.teamId,
      title,
      prospect: {
        name: prospectName,
        company: prospectCompany,
        role: prospectRole,
      },
      repName: repName || req.user!.fullName,
      transcriptText,
      transcript,
      duration,
      status: 'pending',
      date: new Date(),
    });

    res.status(201).json({ success: true, data: call });
  } catch (error: any) {
    console.error('Create call error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create call' },
    });
  }
};

// Delete call
export const deleteCall = async (req: Request, res: Response) => {
  try {
    const call = await Call.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Call not found' },
      });
    }

    res.json({ success: true, data: { message: 'Call deleted successfully' } });
  } catch (error) {
    console.error('Delete call error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete call' },
    });
  }
};
```

### Routes
```typescript
// server/src/routes/calls.routes.ts
import { Router } from 'express';
import {
  getCalls,
  getCall,
  createCall,
  deleteCall,
} from '@/controllers/calls.controller';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validate';

const router = Router();

router.use(authMiddleware);

router.get('/', getCalls);
router.get('/:id', getCall);
router.post('/', createCall);
router.delete('/:id', deleteCall);

export default router;
```

### Acceptance Criteria
- [ ] List calls with pagination
- [ ] Get single call
- [ ] Create call with transcript parsing
- [ ] Delete call
- [ ] All routes protected

---

## Task 5.3: Create Transcript Parser Utility

### Description
Build a utility to parse raw transcript text into structured segments.

### Files to Create
```
server/src/utils/transcript.ts
```

### Implementation
```typescript
// server/src/utils/transcript.ts

interface TranscriptSegment {
  speaker: 'rep' | 'prospect';
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface ParseResult {
  transcript: TranscriptSegment[];
  duration: number;
}

export function parseTranscript(text: string, repName: string): ParseResult {
  const lines = text.split('\n').filter((line) => line.trim());
  const segments: TranscriptSegment[] = [];
  let currentTime = 0;

  // Common rep indicators
  const repIndicators = ['rep', 'sales', 'agent', repName.toLowerCase().split(' ')[0]];

  for (const line of lines) {
    // Try to match timestamp [0:15] or [00:15] or (0:15)
    const timestampMatch = line.match(/^[\[(]?(\d{1,2}):(\d{2})[\])]?\s*/);
    let cleanLine = line;

    if (timestampMatch) {
      currentTime = parseInt(timestampMatch[1]) * 60 + parseInt(timestampMatch[2]);
      cleanLine = line.slice(timestampMatch[0].length);
    }

    // Match speaker pattern: "Name:", "Name (Role):", etc.
    const speakerMatch = cleanLine.match(/^([^:]+):\s*(.+)$/);

    if (speakerMatch) {
      const speakerRaw = speakerMatch[1].toLowerCase().trim();
      const text = speakerMatch[2].trim();

      // Determine if speaker is rep or prospect
      const isRep = repIndicators.some((indicator) =>
        speakerRaw.includes(indicator)
      );

      // Estimate duration based on word count (~150 words per minute)
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = Math.max(3, Math.ceil((wordCount / 150) * 60));

      segments.push({
        speaker: isRep ? 'rep' : 'prospect',
        speakerName: speakerMatch[1].trim(),
        startTime: currentTime,
        endTime: currentTime + estimatedDuration,
        text,
      });

      currentTime += estimatedDuration;
    }
  }

  return {
    transcript: segments,
    duration: segments.length > 0 ? segments[segments.length - 1].endTime : 0,
  };
}

export function formatTranscriptForAI(segments: TranscriptSegment[]): string {
  return segments
    .map((segment) => {
      const time = formatTime(segment.startTime);
      const role = segment.speaker === 'rep' ? 'Rep' : 'Prospect';
      return `[${time}] ${role} (${segment.speakerName}): ${segment.text}`;
    })
    .join('\n\n');
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### Acceptance Criteria
- [ ] Parses speaker labels
- [ ] Handles timestamps
- [ ] Estimates duration
- [ ] Identifies rep vs prospect

---

## Task 5.4: Create Calls Service (Frontend)

### Description
Build the API service layer for calls.

### Files to Create
```
client/src/services/calls.service.ts
```

### Implementation
```typescript
// client/src/services/calls.service.ts
import api from './api';
import type { Call, UploadCallFormValues, PaginatedResponse } from '@/types';

interface CallsQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: string;
}

export const callsService = {
  async getCalls(query: CallsQuery = {}): Promise<PaginatedResponse<Call>> {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.status) params.set('status', query.status);
    if (query.search) params.set('search', query.search);
    if (query.sort) params.set('sort', query.sort);

    const response = await api.get(`/calls?${params.toString()}`);
    return response.data;
  },

  async getCall(id: string): Promise<Call> {
    const response = await api.get(`/calls/${id}`);
    return response.data.data;
  },

  async createCall(data: UploadCallFormValues): Promise<Call> {
    const response = await api.post('/calls', data);
    return response.data.data;
  },

  async deleteCall(id: string): Promise<void> {
    await api.delete(`/calls/${id}`);
  },

  async analyzeCall(id: string): Promise<Call> {
    const response = await api.post(`/calls/${id}/analyze`);
    return response.data.data;
  },
};
```

### Acceptance Criteria
- [ ] All CRUD methods work
- [ ] Pagination supported
- [ ] Search supported
- [ ] Analysis trigger works

---

## Task 5.5: Create Calls List Page

### Description
Build the page displaying all calls with filtering and search.

### Files to Create
```
client/src/pages/Calls/CallsList.tsx
client/src/components/calls/CallCard.tsx
client/src/components/calls/CallsFilters.tsx
client/src/components/calls/UploadCallModal.tsx
```

### Calls List Page
```typescript
// client/src/pages/Calls/CallsList.tsx
import { useState } from 'react';
import {
  Stack,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  SimpleGrid,
  Text,
  Box,
  Pagination,
  LoadingOverlay,
} from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { CallCard } from '@/components/calls/CallCard';
import { UploadCallModal } from '@/components/calls/UploadCallModal';
import { callsService } from '@/services/calls.service';

export default function CallsListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['calls', page, search, status],
    queryFn: () => callsService.getCalls({
      page,
      limit: 12,
      search: search || undefined,
      status: status !== 'all' ? status : undefined,
    }),
  });

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <Title order={2} c="white">
          All Conversations
        </Title>
        <Button
          leftSection={<IconPlus size={18} />}
          variant="gradient"
          gradient={{ from: 'violet.7', to: 'violet.5' }}
          onClick={() => setUploadOpen(true)}
        >
          Upload Call
        </Button>
      </Group>

      {/* Filters */}
      <Group>
        <TextInput
          placeholder="Search calls..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: 300 }}
        />
        <Select
          value={status}
          onChange={(value) => setStatus(value || 'all')}
          data={[
            { value: 'all', label: 'All Status' },
            { value: 'analyzed', label: 'Analyzed' },
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'error', label: 'Error' },
          ]}
          style={{ width: 150 }}
        />
      </Group>

      {/* Calls Grid */}
      <Box pos="relative" mih={400}>
        <LoadingOverlay visible={isLoading} />

        {data?.data && data.data.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {data.data.map((call) => (
              <CallCard key={call._id} call={call} />
            ))}
          </SimpleGrid>
        ) : (
          <Box py={60} ta="center">
            <Text c="dimmed" size="lg">
              {search || status !== 'all'
                ? 'No calls match your filters'
                : 'No calls yet. Upload your first call to get started!'}
            </Text>
            {!search && status === 'all' && (
              <Button
                variant="light"
                mt="md"
                onClick={() => setUploadOpen(true)}
              >
                Upload Your First Call
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <Group justify="center">
          <Pagination
            value={page}
            onChange={setPage}
            total={data.meta.totalPages}
          />
        </Group>
      )}

      {/* Upload Modal */}
      <UploadCallModal
        opened={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          setUploadOpen(false);
          refetch();
        }}
      />
    </Stack>
  );
}
```

### Call Card Component
```typescript
// client/src/components/calls/CallCard.tsx
import { Link } from 'react-router-dom';
import {
  Paper,
  Group,
  Text,
  Badge,
  Stack,
  Avatar,
  Box,
} from '@mantine/core';
import { IconClock, IconCalendar } from '@tabler/icons-react';
import type { Call } from '@/types';
import { formatDate, formatDuration, getScoreColor } from '@/utils/formatters';

interface CallCardProps {
  call: Call;
}

export function CallCard({ call }: CallCardProps) {
  return (
    <Paper
      component={Link}
      to={`/calls/${call._id}`}
      p="lg"
      radius="md"
      bg="dark.7"
      style={{
        border: '1px solid var(--mantine-color-dark-5)',
        textDecoration: 'none',
        transition: 'all 0.2s',
        display: 'block',
      }}
      onMouseEnter={(e: any) => {
        e.currentTarget.style.borderColor = 'var(--mantine-color-violet-7)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.borderColor = 'var(--mantine-color-dark-5)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <Avatar
              size="md"
              radius="md"
              color="violet"
            >
              {call.prospect.company.substring(0, 2).toUpperCase()}
            </Avatar>
            <Box>
              <Text size="sm" fw={600} c="white" lineClamp={1}>
                {call.title}
              </Text>
              <Text size="xs" c="dimmed">
                {call.prospect.company}
              </Text>
            </Box>
          </Group>

          {call.status === 'analyzed' && call.score !== undefined ? (
            <Badge
              size="lg"
              variant="light"
              color={getScoreColor(call.score)}
            >
              {call.score}
            </Badge>
          ) : (
            <Badge
              size="sm"
              variant="light"
              color={call.status === 'error' ? 'red' : 'gray'}
            >
              {call.status}
            </Badge>
          )}
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {call.summary || 'Analysis pending...'}
        </Text>

        <Group gap="lg">
          <Group gap="xs">
            <IconCalendar size={14} color="var(--mantine-color-gray-6)" />
            <Text size="xs" c="dimmed">
              {formatDate(call.date)}
            </Text>
          </Group>
          <Group gap="xs">
            <IconClock size={14} color="var(--mantine-color-gray-6)" />
            <Text size="xs" c="dimmed">
              {formatDuration(call.duration)}
            </Text>
          </Group>
        </Group>

        {call.tags && call.tags.length > 0 && (
          <Group gap="xs">
            {call.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                size="xs"
                variant="outline"
                color="gray"
              >
                {tag}
              </Badge>
            ))}
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
```

### Acceptance Criteria
- [ ] Calls list renders
- [ ] Search filters calls
- [ ] Status filter works
- [ ] Pagination works
- [ ] Cards link to detail

---

## Task 5.6: Create Upload Call Modal

### Description
Build the modal for uploading new calls.

### Files to Create
```
client/src/components/calls/UploadCallModal.tsx
```

### Implementation
```typescript
// client/src/components/calls/UploadCallModal.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Stack,
  Group,
  Text,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconUpload } from '@tabler/icons-react';
import { callsService } from '@/services/calls.service';

interface UploadCallModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadCallModal({ opened, onClose, onSuccess }: UploadCallModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      title: '',
      prospectName: '',
      prospectCompany: '',
      prospectRole: '',
      transcriptText: '',
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      prospectName: (value) => (!value ? 'Prospect name is required' : null),
      prospectCompany: (value) => (!value ? 'Company is required' : null),
      transcriptText: (value) => {
        if (!value) return 'Transcript is required';
        if (value.length < 100) return 'Transcript must be at least 100 characters';
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      // Create call
      const call = await callsService.createCall(values);

      // Trigger analysis
      notifications.show({
        title: 'Call Uploaded',
        message: 'Starting AI analysis...',
        color: 'blue',
        loading: true,
        id: 'analyze',
      });

      try {
        await callsService.analyzeCall(call._id);
        notifications.update({
          id: 'analyze',
          title: 'Analysis Complete',
          message: 'Your call has been analyzed',
          color: 'green',
          loading: false,
        });
      } catch (analyzeError) {
        notifications.update({
          id: 'analyze',
          title: 'Analysis Pending',
          message: 'You can retry analysis from the call page',
          color: 'yellow',
          loading: false,
        });
      }

      form.reset();
      onSuccess?.();
      navigate(`/calls/${call._id}`);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Failed to upload call';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Upload New Call"
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <TextInput
            label="Call Title"
            placeholder="Discovery Call - Company Name"
            required
            {...form.getInputProps('title')}
          />

          <Group grow>
            <TextInput
              label="Prospect Name"
              placeholder="John Smith"
              required
              {...form.getInputProps('prospectName')}
            />
            <TextInput
              label="Company"
              placeholder="Acme Corp"
              required
              {...form.getInputProps('prospectCompany')}
            />
          </Group>

          <TextInput
            label="Prospect Role (Optional)"
            placeholder="VP of Sales"
            {...form.getInputProps('prospectRole')}
          />

          <Textarea
            label="Transcript"
            placeholder={`Paste your call transcript here...

Format example:
Rep: Hello, thanks for meeting with me today.
Prospect: Of course, I've been looking forward to this.
Rep: Great! Tell me about your current process...`}
            required
            minRows={8}
            maxRows={15}
            styles={{
              input: {
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              },
            }}
            {...form.getInputProps('transcriptText')}
          />

          <Text size="xs" c="dimmed">
            Format as "Speaker: Text" for best results. Timestamps like [0:15] are optional.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftSection={<IconUpload size={18} />}
              variant="gradient"
              gradient={{ from: 'violet.7', to: 'violet.5' }}
            >
              Upload & Analyze
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
```

### Acceptance Criteria
- [ ] Modal opens/closes
- [ ] Form validates
- [ ] Uploads call
- [ ] Triggers analysis
- [ ] Shows progress

---

## Task 5.7: Create Call Detail Page

### Description
Build the call detail page with tabs for different sections.

### Files to Create
```
client/src/pages/Calls/CallDetail.tsx
client/src/components/calls/CallDetailHeader.tsx
client/src/components/calls/tabs/OverviewTab.tsx
client/src/components/calls/tabs/TranscriptTab.tsx
client/src/components/calls/tabs/CoachingTab.tsx
client/src/components/calls/tabs/ObjectionsTab.tsx
```

### Call Detail Page
```typescript
// client/src/pages/Calls/CallDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import {
  Stack,
  Tabs,
  LoadingOverlay,
  Box,
  Alert,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import {
  IconChartBar,
  IconFileText,
  IconBulb,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { CallDetailHeader } from '@/components/calls/CallDetailHeader';
import { OverviewTab } from '@/components/calls/tabs/OverviewTab';
import { TranscriptTab } from '@/components/calls/tabs/TranscriptTab';
import { CoachingTab } from '@/components/calls/tabs/CoachingTab';
import { ObjectionsTab } from '@/components/calls/tabs/ObjectionsTab';
import { callsService } from '@/services/calls.service';

export default function CallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: call, isLoading, error, refetch } = useQuery({
    queryKey: ['call', id],
    queryFn: () => callsService.getCall(id!),
    enabled: !!id,
    refetchInterval: (data) =>
      data?.status === 'processing' ? 3000 : false,
  });

  if (error) {
    return (
      <Alert color="red" title="Error">
        Failed to load call. It may have been deleted.
      </Alert>
    );
  }

  return (
    <Box pos="relative" mih={400}>
      <LoadingOverlay visible={isLoading} />

      {call && (
        <Stack gap="lg">
          <CallDetailHeader call={call} onRefetch={refetch} />

          <Tabs defaultValue="overview" variant="pills">
            <Tabs.List>
              <Tabs.Tab
                value="overview"
                leftSection={<IconChartBar size={16} />}
              >
                Overview
              </Tabs.Tab>
              <Tabs.Tab
                value="transcript"
                leftSection={<IconFileText size={16} />}
              >
                Transcript
              </Tabs.Tab>
              <Tabs.Tab
                value="coaching"
                leftSection={<IconBulb size={16} />}
              >
                Coaching
              </Tabs.Tab>
              <Tabs.Tab
                value="objections"
                leftSection={<IconAlertTriangle size={16} />}
              >
                Objections ({call.objections?.length || 0})
              </Tabs.Tab>
            </Tabs.List>

            <Box mt="lg">
              <Tabs.Panel value="overview">
                <OverviewTab call={call} />
              </Tabs.Panel>

              <Tabs.Panel value="transcript">
                <TranscriptTab transcript={call.transcript} />
              </Tabs.Panel>

              <Tabs.Panel value="coaching">
                <CoachingTab coaching={call.coachingFeedback} />
              </Tabs.Panel>

              <Tabs.Panel value="objections">
                <ObjectionsTab objections={call.objections || []} />
              </Tabs.Panel>
            </Box>
          </Tabs>
        </Stack>
      )}
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] Loads call data
- [ ] Shows processing state
- [ ] Tab navigation works
- [ ] Auto-refreshes when processing
- [ ] Error state handled

---

## Task 5.8: Create Call Detail Tabs

### Description
Build the individual tab components for call details.

### Overview Tab
```typescript
// client/src/components/calls/tabs/OverviewTab.tsx
import {
  SimpleGrid,
  Paper,
  Stack,
  Text,
  Group,
  Progress,
  Box,
  Badge,
} from '@mantine/core';
import {
  IconMessageCircle,
  IconQuestionMark,
  IconMicrophone,
  IconMoodSmile,
} from '@tabler/icons-react';
import type { Call } from '@/types';
import { getScoreColor, formatDuration } from '@/utils/formatters';

interface OverviewTabProps {
  call: Call;
}

export function OverviewTab({ call }: OverviewTabProps) {
  const metrics = call.metrics;
  const breakdown = call.scoreBreakdown?.categories;

  return (
    <Stack gap="lg">
      {/* Summary */}
      <Paper p="lg" bg="dark.7" radius="md">
        <Text size="sm" c="dimmed" mb="xs">
          AI Summary
        </Text>
        <Text c="white">
          {call.summary || 'Analysis pending...'}
        </Text>
      </Paper>

      {/* Metrics Grid */}
      {metrics && (
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
          <MetricItem
            icon={IconMessageCircle}
            label="Talk Ratio"
            value={`${metrics.talkRatio}%`}
            detail={metrics.talkRatio >= 40 && metrics.talkRatio <= 60 ? 'Ideal' : 'Adjust needed'}
            color={metrics.talkRatio >= 40 && metrics.talkRatio <= 60 ? 'green' : 'yellow'}
          />
          <MetricItem
            icon={IconQuestionMark}
            label="Questions Asked"
            value={metrics.questionCount}
            detail={metrics.questionCount >= 8 ? 'Great' : 'Ask more'}
            color={metrics.questionCount >= 8 ? 'green' : 'yellow'}
          />
          <MetricItem
            icon={IconMicrophone}
            label="Longest Monologue"
            value={formatDuration(metrics.longestMonologue)}
            detail={metrics.longestMonologue < 120 ? 'Good' : 'Too long'}
            color={metrics.longestMonologue < 120 ? 'green' : 'yellow'}
          />
          <MetricItem
            icon={IconMoodSmile}
            label="Engagement"
            value={metrics.engagementScore}
            detail={metrics.sentiment}
            color={metrics.engagementScore >= 70 ? 'green' : 'yellow'}
          />
        </SimpleGrid>
      )}

      {/* Score Breakdown */}
      {breakdown && (
        <Paper p="lg" bg="dark.7" radius="md">
          <Text fw={600} c="white" mb="lg">
            Score Breakdown
          </Text>
          <Stack gap="md">
            {Object.entries(breakdown).map(([key, value]) => (
              <ScoreCategory
                key={key}
                name={formatCategoryName(key)}
                score={value.score}
                weight={value.weight}
                reasoning={value.reasoning}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Tags */}
      {call.tags && call.tags.length > 0 && (
        <Group gap="xs">
          {call.tags.map((tag) => (
            <Badge key={tag} variant="light" color="violet">
              {tag}
            </Badge>
          ))}
        </Group>
      )}
    </Stack>
  );
}

function MetricItem({ icon: Icon, label, value, detail, color }: any) {
  return (
    <Paper p="md" bg="dark.6" radius="md">
      <Group gap="sm" mb="xs">
        <Icon size={18} color={`var(--mantine-color-${color}-5)`} />
        <Text size="xs" c="dimmed">
          {label}
        </Text>
      </Group>
      <Text size="xl" fw={700} c="white">
        {value}
      </Text>
      <Text size="xs" c={`${color}.5`}>
        {detail}
      </Text>
    </Paper>
  );
}

function ScoreCategory({ name, score, weight, reasoning }: any) {
  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="white">
          {name} ({Math.round(weight * 100)}%)
        </Text>
        <Text size="sm" fw={600} c={getScoreColor(score)}>
          {score}/100
        </Text>
      </Group>
      <Progress value={score} color={getScoreColor(score)} size="sm" radius="xl" />
      <Text size="xs" c="dimmed" mt="xs">
        {reasoning}
      </Text>
    </Box>
  );
}

function formatCategoryName(key: string): string {
  const names: Record<string, string> = {
    discovery: 'Discovery & Questions',
    talkBalance: 'Talk Balance',
    objectionHandling: 'Objection Handling',
    nextSteps: 'Next Steps',
    rapport: 'Rapport & Trust',
    accuracy: 'Technical Accuracy',
  };
  return names[key] || key;
}
```

### Transcript Tab
```typescript
// client/src/components/calls/tabs/TranscriptTab.tsx
import { useState } from 'react';
import {
  Stack,
  TextInput,
  Box,
  Text,
  Badge,
  Group,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { formatTime } from '@/utils/formatters';

interface TranscriptSegment {
  speaker: 'rep' | 'prospect';
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface TranscriptTabProps {
  transcript: TranscriptSegment[];
}

export function TranscriptTab({ transcript }: TranscriptTabProps) {
  const [search, setSearch] = useState('');

  const filteredTranscript = search
    ? transcript.filter((s) =>
        s.text.toLowerCase().includes(search.toLowerCase())
      )
    : transcript;

  const highlightText = (text: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={i} style={{ backgroundColor: 'rgba(234, 179, 8, 0.3)', color: 'inherit' }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Stack gap="md">
      <TextInput
        placeholder="Search transcript..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        style={{ maxWidth: 400 }}
      />

      <Stack gap="sm">
        {filteredTranscript.map((segment, index) => (
          <Box
            key={index}
            p="md"
            style={{
              backgroundColor: segment.speaker === 'rep'
                ? 'rgba(139, 92, 246, 0.1)'
                : 'var(--mantine-color-dark-6)',
              borderRadius: 8,
              marginLeft: segment.speaker === 'rep' ? 0 : 40,
              marginRight: segment.speaker === 'rep' ? 40 : 0,
            }}
          >
            <Group gap="sm" mb="xs">
              <Text size="xs" c="dimmed" ff="monospace">
                [{formatTime(segment.startTime)}]
              </Text>
              <Text
                size="sm"
                fw={600}
                c={segment.speaker === 'rep' ? 'violet.4' : 'white'}
              >
                {segment.speakerName}
              </Text>
              <Badge size="xs" variant="light" color={segment.speaker === 'rep' ? 'violet' : 'gray'}>
                {segment.speaker === 'rep' ? 'Rep' : 'Prospect'}
              </Badge>
            </Group>
            <Text size="sm" c="gray.3" lh={1.6}>
              {highlightText(segment.text)}
            </Text>
          </Box>
        ))}

        {filteredTranscript.length === 0 && (
          <Box py="xl" ta="center">
            <Text c="dimmed">
              {search ? `No matches found for "${search}"` : 'No transcript available'}
            </Text>
          </Box>
        )}
      </Stack>
    </Stack>
  );
}
```

### Acceptance Criteria
- [ ] Overview shows summary and metrics
- [ ] Score breakdown displays
- [ ] Transcript searchable
- [ ] Speaker segments styled
- [ ] Timestamps shown

---

## Phase 5 Checklist Summary

| Task | Description | Status |
|------|-------------|--------|
| 5.1 | Create Call Model (MongoDB) | [ ] |
| 5.2 | Create calls API routes | [ ] |
| 5.3 | Create transcript parser | [ ] |
| 5.4 | Create calls service (frontend) | [ ] |
| 5.5 | Create calls list page | [ ] |
| 5.6 | Create upload call modal | [ ] |
| 5.7 | Create call detail page | [ ] |
| 5.8 | Create call detail tabs | [ ] |

---

## Dependencies for Next Phase
Before starting Phase 6 (AI Integration), ensure:
- Calls can be created and stored
- Transcript parsing works
- Detail page renders all tabs
- Upload flow complete
