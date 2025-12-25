import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Title,
  Text,
  Stack,
  Group,
  Paper,
  Button,
  TextInput,
  Select,
  Badge,
  Avatar,
  ActionIcon,
  Menu,
  Tabs,
  RingProgress,
  Tooltip,
  Chip,
  Modal,
  Textarea,
  SimpleGrid,
  Loader,
  Center,
  Skeleton,
  SegmentedControl,
  rem,
  ThemeIcon,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconUpload,
  IconSearch,
  IconFilter,
  IconSortDescending,
  IconPhone,
  IconClock,
  IconCalendar,
  IconChevronRight,
  IconPlayerPlay,
  IconPlayerPause,
  IconDotsVertical,
  IconTrash,
  IconDownload,
  IconShare,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconTrendingUp,
  IconMessageCircle,
  IconLoader,
  IconRefresh,
  IconMicrophone,
  IconFileText,
  IconMusic,
  IconCloudUpload,
} from '@tabler/icons-react';
import { useCallsStore } from '@/store/callsStore';
import type { Call } from '@/types';
import api from '@/services/api';

const scoreOptions = [
  { value: 'all', label: 'All Scores' },
  { value: 'high', label: '80+ (Excellent)' },
  { value: 'medium', label: '60-79 (Good)' },
  { value: 'low', label: 'Below 60 (Needs Work)' },
];

const sortOptions = [
  { value: '-date', label: 'Newest First' },
  { value: 'date', label: 'Oldest First' },
  { value: '-score', label: 'Highest Score' },
  { value: 'score', label: 'Lowest Score' },
  { value: '-duration', label: 'Longest Duration' },
];

// Audio MIME types for dropzone
const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/webm',
];

export default function CallsListPage() {
  const navigate = useNavigate();
  const [uploadOpened, { open: openUpload, close: closeUpload }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScore, setSelectedScore] = useState<string | null>('all');
  const [selectedSort, setSelectedSort] = useState<string | null>('-date');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Upload modal state
  const [uploadMode, setUploadMode] = useState<'audio' | 'transcript'>('audio');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const openRef = useRef<() => void>(null);

  // Audio player state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);

  const {
    calls,
    meta,
    isLoading,
    isCreating,
    error,
    fetchCalls,
    createCall,
    createCallWithAudio,
    deleteCall,
    pollCallStatus,
    stopPolling,
  } = useCallsStore();

  const uploadForm = useForm({
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
      transcriptText: (value, values) => {
        // Only required for transcript mode
        if (uploadMode === 'transcript' && !value) {
          return 'Transcript is required';
        }
        return null;
      },
    },
  });

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Fetch calls on mount and when filters change
  useEffect(() => {
    fetchCalls();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      fetchCalls({
        search: searchQuery || undefined,
        sort: selectedSort || '-date',
      });
    }, 300);
    setSearchTimeout(timeout);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery, selectedSort]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const resetModal = () => {
    uploadForm.reset();
    setAudioFile(null);
    setUploadMode('audio');
  };

  const handleCloseUpload = () => {
    closeUpload();
    resetModal();
  };

  const handleUpload = async (values: typeof uploadForm.values) => {
    try {
      let call;

      if (uploadMode === 'audio') {
        // Audio upload mode
        if (!audioFile) {
          notifications.show({
            title: 'No file selected',
            message: 'Please select an audio file to upload.',
            color: 'red',
          });
          return;
        }

        call = await createCallWithAudio({
          file: audioFile,
          title: values.title,
          prospectName: values.prospectName,
          prospectCompany: values.prospectCompany,
          prospectRole: values.prospectRole || undefined,
        });

        notifications.show({
          title: 'Audio uploaded',
          message: 'Your call is being transcribed and analyzed. This may take a few minutes.',
          color: 'green',
        });
      } else {
        // Transcript mode
        call = await createCall(values);

        notifications.show({
          title: 'Call uploaded',
          message: 'Your call is being analyzed. This may take a minute.',
          color: 'green',
        });

        // Start polling for this call
        pollCallStatus(call._id, (updatedCall) => {
          notifications.show({
            title: 'Analysis complete',
            message: `${updatedCall.title} has been analyzed.`,
            color: 'green',
          });
        });
      }

      // Close modal and reset immediately after upload
      closeUpload();
      resetModal();

      // Navigate to the call detail page
      navigate(`/calls/${call._id}`);
    } catch {
      notifications.show({
        title: 'Upload failed',
        message: 'Failed to upload call. Please try again.',
        color: 'red',
      });
    }
  };

  const handleDelete = async (callId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteCall(callId);
      notifications.show({
        title: 'Call deleted',
        message: 'The call has been removed.',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Delete failed',
        message: 'Failed to delete call. Please try again.',
        color: 'red',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'analyzed':
        return <Badge size="xs" color="green" leftSection={<IconCheck size={10} />}>Analyzed</Badge>;
      case 'transcribing':
        return <Badge size="xs" color="violet" leftSection={<IconMicrophone size={10} />}>Transcribing</Badge>;
      case 'processing':
        return <Badge size="xs" color="blue" leftSection={<IconLoader size={10} />}>Analyzing</Badge>;
      case 'error':
        return <Badge size="xs" color="red" leftSection={<IconX size={10} />}>Error</Badge>;
      default:
        return <Badge size="xs" color="gray">Pending</Badge>;
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSelectedScore('all');
    setSearchQuery('');
  };

  // Filter calls based on tab and score
  const filteredCalls = calls.filter((call) => {
    // Tab filter
    if (activeTab === 'needs-review') {
      const score = call.analysis?.overallScore ?? 100;
      return score < 60 || call.status === 'error';
    }
    if (activeTab === 'top-performers') {
      const score = call.analysis?.overallScore ?? 0;
      return score >= 80;
    }

    // Score filter
    if (selectedScore !== 'all') {
      const score = call.analysis?.overallScore ?? 0;
      if (selectedScore === 'high' && score < 80) return false;
      if (selectedScore === 'medium' && (score < 60 || score >= 80)) return false;
      if (selectedScore === 'low' && score >= 60) return false;
    }

    return true;
  });

  const needsReviewCount = calls.filter((call) => {
    const score = call.analysis?.overallScore ?? 100;
    return score < 60 || call.status === 'error';
  }).length;

  const getRepInitials = (call: Call) => {
    if (call.user && typeof call.user === 'object' && 'name' in call.user) {
      const name = (call.user as { name: string }).name;
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  const getRepName = (call: Call) => {
    if (call.user && typeof call.user === 'object' && 'name' in call.user) {
      return (call.user as { name: string }).name;
    }
    return 'Unknown';
  };

  // Load audio with authentication
  const loadAudio = async (callId: string): Promise<string | null> => {
    if (audioUrls[callId]) return audioUrls[callId];

    setLoadingAudioId(callId);
    try {
      const response = await api.get(`/calls/${callId}/audio`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      setAudioUrls(prev => ({ ...prev, [callId]: url }));
      return url;
    } catch (error) {
      console.error('Failed to load audio:', error);
      return null;
    } finally {
      setLoadingAudioId(null);
    }
  };

  // Toggle audio playback for a call
  const toggleAudio = async (call: Call, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!call.audioUrl) return;

    if (playingCallId === call._id && isAudioPlaying) {
      // Pause current
      audioRef.current?.pause();
      setIsAudioPlaying(false);
    } else if (playingCallId === call._id && audioUrls[call._id]) {
      // Resume current
      audioRef.current?.play();
      setIsAudioPlaying(true);
    } else {
      // Load and play new call
      const url = await loadAudio(call._id);
      if (url && audioRef.current) {
        setPlayingCallId(call._id);
        audioRef.current.src = url;
        audioRef.current.play();
        setIsAudioPlaying(true);
      }
    }
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    setIsAudioPlaying(false);
    setPlayingCallId(null);
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
      }}
    >
      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onPlay={() => setIsAudioPlaying(true)}
        onPause={() => setIsAudioPlaying(false)}
      />

      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Box>
              <Title order={2} c="white">
                Calls
              </Title>
              <Text c="dimmed" size="sm" mt={4}>
                {meta?.total ?? 0} calls {isLoading && <Loader size="xs" ml="xs" />}
              </Text>
            </Box>
            <Button
              leftSection={<IconUpload size={18} />}
              variant="gradient"
              gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
              onClick={openUpload}
            >
              Upload Call
            </Button>
          </Group>

          {/* Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="all" leftSection={<IconPhone size={16} />}>
                All Calls
              </Tabs.Tab>
              <Tabs.Tab value="needs-review" leftSection={<IconAlertTriangle size={16} />}>
                Needs Review
                {needsReviewCount > 0 && (
                  <Badge size="xs" color="red" variant="filled" ml={6}>{needsReviewCount}</Badge>
                )}
              </Tabs.Tab>
              <Tabs.Tab value="top-performers" leftSection={<IconTrendingUp size={16} />}>
                Top Performers
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {/* Search & Filters */}
          <Paper
            p="md"
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--mantine-color-dark-4)',
            }}
          >
            <Group gap="md" wrap="wrap">
              <TextInput
                placeholder="Search calls, prospects, or keywords..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, minWidth: 250 }}
                styles={{
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  },
                }}
              />
              <Select
                placeholder="Filter by Score"
                data={scoreOptions}
                value={selectedScore}
                onChange={setSelectedScore}
                leftSection={<IconFilter size={16} />}
                w={180}
                styles={{
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  },
                }}
              />
              <Select
                placeholder="Sort by"
                data={sortOptions}
                value={selectedSort}
                onChange={(value) => {
                  setSelectedSort(value);
                }}
                leftSection={<IconSortDescending size={16} />}
                w={180}
                styles={{
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  },
                }}
              />
              <Tooltip label="Refresh">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={() => fetchCalls()}
                  loading={isLoading}
                >
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <Group gap="xs" mt="md">
                <Text size="xs" c="dimmed">Active filters:</Text>
                {activeFilters.map((filter) => (
                  <Chip
                    key={filter}
                    checked
                    onChange={() => removeFilter(filter)}
                    size="xs"
                    color="violet"
                  >
                    {filter}
                  </Chip>
                ))}
                <Button variant="subtle" size="xs" color="gray" onClick={clearAllFilters}>
                  Clear all
                </Button>
              </Group>
            )}
          </Paper>

          {/* Error State */}
          {error && (
            <Paper p="lg" radius="lg" bg="red.9" style={{ opacity: 0.8 }}>
              <Group>
                <IconAlertTriangle size={20} />
                <Text c="white">{error}</Text>
              </Group>
            </Paper>
          )}

          {/* Loading State */}
          {isLoading && calls.length === 0 && (
            <Stack gap="md">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={100} radius="lg" />
              ))}
            </Stack>
          )}

          {/* Empty State */}
          {!isLoading && calls.length === 0 && (
            <Paper
              p="xl"
              radius="lg"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--mantine-color-dark-4)',
                textAlign: 'center',
              }}
            >
              <Stack align="center" gap="md">
                <IconPhone size={48} color="var(--mantine-color-gray-6)" />
                <Box>
                  <Text size="lg" fw={600} c="white">No calls yet</Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    Upload your first call transcript to get AI-powered analysis
                  </Text>
                </Box>
                <Button
                  leftSection={<IconUpload size={18} />}
                  variant="gradient"
                  gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
                  onClick={openUpload}
                >
                  Upload Call
                </Button>
              </Stack>
            </Paper>
          )}

          {/* Calls List */}
          <Stack gap="md">
            {filteredCalls.map((call) => (
              <Paper
                key={call._id}
                component={Link}
                to={`/calls/${call._id}`}
                p="lg"
                radius="lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--mantine-color-dark-4)',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--mantine-color-violet-7)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--mantine-color-dark-4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  {/* Left: Call Info */}
                  <Group gap="lg" style={{ flex: 1 }}>
                    {/* Score Ring or Status */}
                    {call.status === 'analyzed' && call.analysis?.overallScore ? (
                      <Tooltip label={`${getScoreLabel(call.analysis.overallScore)} - ${call.analysis.overallScore}/100`}>
                        <RingProgress
                          size={60}
                          thickness={5}
                          roundCaps
                          sections={[{ value: call.analysis.overallScore, color: getScoreColor(call.analysis.overallScore) }]}
                          label={
                            <Text size="sm" fw={700} ta="center" c="white">
                              {call.analysis.overallScore}
                            </Text>
                          }
                        />
                      </Tooltip>
                    ) : (
                      <Center w={60} h={60}>
                        {call.status === 'transcribing' ? (
                          <Tooltip label="Transcribing audio...">
                            <Loader size="sm" color="violet" type="dots" />
                          </Tooltip>
                        ) : call.status === 'processing' ? (
                          <Tooltip label="Analyzing...">
                            <Loader size="sm" color="blue" />
                          </Tooltip>
                        ) : call.status === 'error' ? (
                          <IconAlertTriangle size={24} color="var(--mantine-color-red-5)" />
                        ) : (
                          <IconClock size={24} color="var(--mantine-color-gray-5)" />
                        )}
                      </Center>
                    )}

                    {/* Call Details */}
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="sm" mb={4}>
                        <Text size="md" fw={600} c="white" truncate>
                          {call.title}
                        </Text>
                        {getStatusBadge(call.status)}
                        {call.tags?.map((tag) => (
                          <Badge key={tag} size="xs" variant="light" color="violet">
                            {tag}
                          </Badge>
                        ))}
                      </Group>
                      <Group gap="md">
                        <Text size="sm" c="dimmed">
                          {call.prospect.name} • {call.prospect.company}
                        </Text>
                      </Group>
                    </Box>
                  </Group>

                  {/* Center: Objection count */}
                  <Group gap="xs" visibleFrom="md">
                    {call.analysis?.objections && call.analysis.objections.length > 0 && (
                      <Tooltip label={`${call.analysis.objections.length} objections detected`}>
                        <Badge size="sm" variant="light" color="orange" leftSection={<IconMessageCircle size={10} />}>
                          {call.analysis.objections.length} objections
                        </Badge>
                      </Tooltip>
                    )}
                  </Group>

                  {/* Right: Meta & Actions */}
                  <Group gap="lg" wrap="nowrap">
                    {/* Rep */}
                    <Group gap="xs" visibleFrom="sm">
                      <Avatar size="sm" color="violet" radius="xl">
                        {getRepInitials(call)}
                      </Avatar>
                      <Text size="sm" c="gray.4">
                        {getRepName(call)}
                      </Text>
                    </Group>

                    {/* Duration & Date */}
                    <Stack gap={2} align="flex-end" visibleFrom="sm">
                      <Group gap={4}>
                        <IconClock size={12} color="var(--mantine-color-gray-6)" />
                        <Text size="xs" c="dimmed">
                          {formatDuration(call.duration)}
                        </Text>
                      </Group>
                      <Group gap={4}>
                        <IconCalendar size={12} color="var(--mantine-color-gray-6)" />
                        <Text size="xs" c="dimmed">
                          {formatDate(call.date)}
                        </Text>
                      </Group>
                    </Stack>

                    {/* Play Button - only show for audio uploads with audioUrl */}
                    {call.uploadSource === 'audio' && call.audioUrl && (
                      <Tooltip label={playingCallId === call._id && isAudioPlaying ? "Pause" : "Play audio"}>
                        <ActionIcon
                          size="lg"
                          radius="xl"
                          variant={playingCallId === call._id && isAudioPlaying ? "filled" : "light"}
                          color="violet"
                          onClick={(e) => toggleAudio(call, e)}
                          loading={loadingAudioId === call._id}
                        >
                          {playingCallId === call._id && isAudioPlaying ? (
                            <IconPlayerPause size={16} />
                          ) : (
                            <IconPlayerPlay size={16} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}

                    {/* More Actions */}
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconDownload size={14} />}>
                          Download
                        </Menu.Item>
                        <Menu.Item leftSection={<IconShare size={14} />}>
                          Share
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={(e) => handleDelete(call._id, e)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>

                    <IconChevronRight size={16} color="var(--mantine-color-gray-6)" />
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Container>

      {/* Upload Modal */}
      <Modal
        opened={uploadOpened}
        onClose={handleCloseUpload}
        title={
          <Text fw={600} size="lg">Upload Call</Text>
        }
        size="lg"
        radius="lg"
        styles={{
          header: { backgroundColor: 'var(--mantine-color-dark-7)' },
          body: { backgroundColor: 'var(--mantine-color-dark-7)' },
        }}
      >
        <form onSubmit={uploadForm.onSubmit(handleUpload)}>
          <Stack gap="lg">
            {/* Mode Selector */}
            <SegmentedControl
              value={uploadMode}
              onChange={(value) => setUploadMode(value as 'audio' | 'transcript')}
              disabled={isCreating}
              fullWidth
              data={[
                {
                  value: 'audio',
                  label: (
                    <Group gap="xs" justify="center">
                      <IconMicrophone size={16} />
                      <span>Upload Audio</span>
                    </Group>
                  ),
                },
                {
                  value: 'transcript',
                  label: (
                    <Group gap="xs" justify="center">
                      <IconFileText size={16} />
                      <span>Paste Transcript</span>
                    </Group>
                  ),
                },
              ]}
              styles={{
                root: {
                  backgroundColor: 'var(--mantine-color-dark-6)',
                },
              }}
            />

            {/* Audio Upload Mode */}
            {uploadMode === 'audio' && (
              <>
                <Dropzone
                  openRef={openRef}
                  onDrop={(files) => setAudioFile(files[0])}
                  onReject={(files) => {
                    notifications.show({
                      title: 'Invalid file',
                      message: files[0]?.errors?.[0]?.message || 'Please upload a valid audio file.',
                      color: 'red',
                    });
                  }}
                  maxSize={20 * 1024 * 1024}
                  accept={AUDIO_MIME_TYPES}
                  disabled={isCreating}
                  multiple={false}
                  styles={{
                    root: {
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '2px dashed var(--mantine-color-dark-4)',
                      '&[data-accept]': {
                        borderColor: 'var(--mantine-color-violet-6)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      },
                      '&[data-reject]': {
                        borderColor: 'var(--mantine-color-red-6)',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                      },
                    },
                  }}
                >
                  <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
                    <Dropzone.Accept>
                      <IconCloudUpload
                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-violet-6)' }}
                        stroke={1.5}
                      />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                      <IconX
                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                        stroke={1.5}
                      />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                      <IconMusic
                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                        stroke={1.5}
                      />
                    </Dropzone.Idle>

                    <Box>
                      <Text size="lg" inline c="white">
                        Drag audio file here or click to select
                      </Text>
                      <Text size="sm" c="dimmed" inline mt={7}>
                        Supports MP3, WAV, M4A, AAC, OGG, WebM (max 20MB)
                      </Text>
                    </Box>
                  </Group>
                </Dropzone>

                {/* File Preview */}
                {audioFile && (
                  <Paper
                    p="md"
                    radius="md"
                    style={{
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid var(--mantine-color-violet-6)',
                    }}
                  >
                    <Group justify="space-between">
                      <Group gap="sm">
                        <ThemeIcon size="lg" color="violet" variant="light" radius="md">
                          <IconMusic size={18} />
                        </ThemeIcon>
                        <Box>
                          <Text size="sm" fw={500} c="white" truncate maw={300}>
                            {audioFile.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatFileSize(audioFile.size)}
                          </Text>
                        </Box>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => setAudioFile(null)}
                        disabled={isCreating}
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                )}
              </>
            )}

            {/* Transcript Mode */}
            {uploadMode === 'transcript' && (
              <Textarea
                label="Transcript"
                placeholder="Paste your call transcript here...

Example format:
Rep: Hi, thanks for taking the time today...
Prospect: Thanks for reaching out..."
                minRows={8}
                disabled={isCreating}
                {...uploadForm.getInputProps('transcriptText')}
                styles={{
                  label: { color: 'var(--mantine-color-gray-4)' },
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  },
                }}
              />
            )}

            <TextInput
              label="Call Title"
              placeholder="Discovery Call - Company Name"
              disabled={isCreating}
              {...uploadForm.getInputProps('title')}
              styles={{
                label: { color: 'var(--mantine-color-gray-4)' },
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--mantine-color-dark-4)',
                },
              }}
            />

            <SimpleGrid cols={2}>
              <TextInput
                label="Prospect Name"
                placeholder="John Smith"
                disabled={isCreating}
                {...uploadForm.getInputProps('prospectName')}
                styles={{
                  label: { color: 'var(--mantine-color-gray-4)' },
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  },
                }}
              />
              <TextInput
                label="Company"
                placeholder="Acme Corp"
                disabled={isCreating}
                {...uploadForm.getInputProps('prospectCompany')}
                styles={{
                  label: { color: 'var(--mantine-color-gray-4)' },
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  },
                }}
              />
            </SimpleGrid>

            <TextInput
              label="Prospect Role (Optional)"
              placeholder="VP of Sales"
              disabled={isCreating}
              {...uploadForm.getInputProps('prospectRole')}
              styles={{
                label: { color: 'var(--mantine-color-gray-4)' },
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--mantine-color-dark-4)',
                },
              }}
            />

            <Group justify="flex-end">
              <Button
                variant="subtle"
                color="gray"
                onClick={handleCloseUpload}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
                loading={isCreating}
                disabled={uploadMode === 'audio' && !audioFile}
                leftSection={uploadMode === 'audio' ? <IconCloudUpload size={18} /> : <IconUpload size={18} />}
              >
                {uploadMode === 'audio' ? 'Upload & Transcribe' : 'Analyze Call'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}
