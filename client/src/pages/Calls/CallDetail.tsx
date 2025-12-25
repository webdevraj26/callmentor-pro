import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import {
  Box,
  Container,
  Title,
  Text,
  Stack,
  Group,
  Paper,
  Button,
  ActionIcon,
  Badge,
  Avatar,
  RingProgress,
  Progress,
  Tabs,
  Tooltip,
  Divider,
  ScrollArea,
  ThemeIcon,
  Grid,
  Timeline,
  Loader,
  Center,
  Skeleton,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconPlayerPlay,
  IconPlayerPause,
  IconVolume,
  IconDownload,
  IconShare,
  IconEdit,
  IconClock,
  IconCalendar,
  IconUser,
  IconBuilding,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconBulb,
  IconTarget,
  IconMessageCircle,
  IconTrendingUp,
  IconRefresh,
  IconChartBar,
  IconBrain,
  IconStar,
  IconPlayerSkipForward,
  IconPlayerSkipBack,
  IconWaveSine,
} from '@tabler/icons-react';
import { useCallsStore } from '@/store/callsStore';

export default function CallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<string | null>('analysis');
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const {
    currentCall: call,
    isLoading,
    error,
    fetchCall,
    reanalyzeCall,
    pollCallStatus,
    stopPolling,
    clearCurrentCall,
  } = useCallsStore();

  // Fetch call on mount
  useEffect(() => {
    if (id) {
      fetchCall(id);
    }
    return () => {
      clearCurrentCall();
      stopPolling();
    };
  }, [id, fetchCall, clearCurrentCall, stopPolling]);

  // Start polling if call is processing
  useEffect(() => {
    if (call && call.status === 'processing' && id) {
      pollCallStatus(id, () => {
        notifications.show({
          title: 'Analysis complete',
          message: 'The call has been analyzed.',
          color: 'green',
        });
      });
    }
  }, [call?.status, id, pollCallStatus]);

  const handleReanalyze = async () => {
    if (!id) return;
    setIsReanalyzing(true);
    try {
      await reanalyzeCall(id);
      notifications.show({
        title: 'Re-analysis started',
        message: 'The call is being re-analyzed.',
        color: 'blue',
      });
      pollCallStatus(id, () => {
        notifications.show({
          title: 'Re-analysis complete',
          message: 'The call has been re-analyzed.',
          color: 'green',
        });
      });
    } catch {
      notifications.show({
        title: 'Re-analysis failed',
        message: 'Failed to re-analyze the call.',
        color: 'red',
      });
    } finally {
      setIsReanalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getMomentIcon = (type: string) => {
    switch (type) {
      case 'positive': return IconCheck;
      case 'warning': return IconAlertTriangle;
      case 'negative': return IconX;
      default: return IconBulb;
    }
  };

  const getMomentColor = (type: string) => {
    switch (type) {
      case 'positive': return 'green';
      case 'warning': return 'yellow';
      case 'negative': return 'red';
      default: return 'gray';
    }
  };

  const seekToTime = (timestamp: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timestamp;
    }
    setCurrentTime(timestamp);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(Math.floor(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(Math.floor(audioRef.current.duration));
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const skipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioDuration, audioRef.current.currentTime + 10);
    }
  };

  // Load audio with authentication
  const loadAudio = useCallback(async () => {
    if (!call?._id || !call?.audioUrl || audioUrl) return;

    setIsLoadingAudio(true);
    try {
      const response = await api.get(`/calls/${call._id}/audio`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Failed to load audio:', error);
    } finally {
      setIsLoadingAudio(false);
    }
  }, [call?._id, call?.audioUrl, audioUrl]);

  // Load audio when call is available
  useEffect(() => {
    if (call?.uploadSource === 'audio' && call?.audioUrl) {
      loadAudio();
    }
    // Cleanup blob URL on unmount
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [call?.uploadSource, call?.audioUrl, loadAudio]);

  const getRepName = () => {
    if (call?.user && typeof call.user === 'object' && 'name' in call.user) {
      return (call.user as { name: string }).name;
    }
    return 'Unknown';
  };

  const getRepInitials = () => {
    const name = getRepName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Loading state
  if (isLoading && !call) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
        }}
      >
        <Container size="xl" py="lg">
          <Stack gap="lg">
            <Group>
              <ActionIcon component={Link} to="/calls" variant="subtle" color="gray" size="lg">
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Skeleton height={30} width={300} />
            </Group>
            <Skeleton height={100} radius="lg" />
            <Skeleton height={150} radius="lg" />
            <Skeleton height={400} radius="lg" />
          </Stack>
        </Container>
      </Box>
    );
  }

  // Error state
  if (error || !call) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
        }}
      >
        <Container size="xl" py="lg">
          <Stack gap="lg" align="center" pt="xl">
            <ActionIcon component={Link} to="/calls" variant="subtle" color="gray" size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
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
                <IconAlertTriangle size={48} color="var(--mantine-color-red-5)" />
                <Title order={3} c="white">Call not found</Title>
                <Text c="dimmed">{error || 'The call you are looking for does not exist.'}</Text>
                <Button component={Link} to="/calls" variant="light" color="violet">
                  Back to Calls
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>
    );
  }

  // Processing state
  if (call.status === 'processing') {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
        }}
      >
        <Container size="xl" py="lg">
          <Stack gap="lg">
            <Group>
              <ActionIcon component={Link} to="/calls" variant="subtle" color="gray" size="lg">
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Box>
                <Title order={3} c="white">{call.title}</Title>
                <Text size="sm" c="dimmed">{call.prospect.name} • {call.prospect.company}</Text>
              </Box>
            </Group>
            <Paper
              p="xl"
              radius="lg"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid var(--mantine-color-violet-7)',
                textAlign: 'center',
              }}
            >
              <Stack align="center" gap="lg" py="xl">
                <Loader size="xl" color="violet" />
                <Box>
                  <Title order={3} c="white">Analyzing your call...</Title>
                  <Text c="dimmed" mt="sm">
                    Our AI is reviewing the transcript and generating insights.
                    This usually takes 30-60 seconds.
                  </Text>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>
    );
  }

  const analysis = call.analysis;
  const transcript = call.transcript || [];
  const objections = analysis?.objections || [];

  // Transform scoreBreakdown categories into dimensions array for UI
  const dimensions = analysis?.scoreBreakdown?.categories
    ? Object.entries(analysis.scoreBreakdown.categories).map(([key, value]) => ({
        name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim(),
        score: value.score,
      }))
    : [];

  // Transform coaching feedback into tips array for UI
  const coachingTips = analysis?.coachingFeedback
    ? [
        ...analysis.coachingFeedback.strengths.map(s => ({
          type: 'strength' as const,
          title: s.title,
          description: s.description,
          priority: s.impact || 'medium',
        })),
        ...analysis.coachingFeedback.improvements.map(i => ({
          type: 'improvement' as const,
          title: i.title,
          description: i.description,
          priority: i.priority,
        })),
      ]
    : [];

  // Calculate talk ratio as rep/prospect percentages
  const talkRatio = analysis?.metrics?.talkRatio
    ? {
        rep: Math.round(analysis.metrics.talkRatio),
        prospect: Math.round(100 - analysis.metrics.talkRatio),
      }
    : null;

  // Transform sentiment to percentages (mock - would need actual data from AI)
  const sentiment = analysis?.metrics?.sentiment
    ? {
        positive: analysis.metrics.sentiment === 'positive' ? 70 : analysis.metrics.sentiment === 'neutral' ? 30 : 10,
        neutral: analysis.metrics.sentiment === 'neutral' ? 50 : 25,
        negative: analysis.metrics.sentiment === 'negative' ? 60 : analysis.metrics.sentiment === 'neutral' ? 20 : 5,
      }
    : null;

  // Key moments would come from AI - for now create from objections
  const keyMoments = objections.map((obj, idx) => ({
    type: obj.handling === 'well' ? 'positive' : obj.handling === 'missed' ? 'negative' : 'warning',
    label: `${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)} Objection`,
    description: obj.text.substring(0, 50) + (obj.text.length > 50 ? '...' : ''),
    timestamp: idx * 120, // Placeholder timestamps
  }));

  // Extract key topics from objection types
  const keyTopics = analysis?.objections
    ? [...new Set(analysis.objections.map(o => o.type))]
    : [];

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
      }}
    >
      <Container size="xl" py="lg">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" wrap="nowrap">
            <Group gap="md">
              <ActionIcon
                component={Link}
                to="/calls"
                variant="subtle"
                color="gray"
                size="lg"
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Box>
                <Group gap="sm">
                  <Title order={3} c="white">{call.title}</Title>
                  {call.tags?.map((tag) => (
                    <Badge key={tag} size="sm" variant="light" color="violet">
                      {tag}
                    </Badge>
                  ))}
                </Group>
                <Group gap="lg" mt={4}>
                  <Group gap={6}>
                    <IconCalendar size={14} color="var(--mantine-color-gray-5)" />
                    <Text size="sm" c="dimmed">{formatDate(call.date)}</Text>
                  </Group>
                  <Group gap={6}>
                    <IconClock size={14} color="var(--mantine-color-gray-5)" />
                    <Text size="sm" c="dimmed">{formatTime(call.duration)}</Text>
                  </Group>
                </Group>
              </Box>
            </Group>
            <Group gap="sm">
              <Tooltip label="Re-analyze">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={handleReanalyze}
                  loading={isReanalyzing}
                >
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Download">
                <ActionIcon variant="subtle" color="gray" size="lg">
                  <IconDownload size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Share">
                <ActionIcon variant="subtle" color="gray" size="lg">
                  <IconShare size={18} />
                </ActionIcon>
              </Tooltip>
              <Button
                variant="light"
                color="violet"
                leftSection={<IconEdit size={16} />}
              >
                Edit Details
              </Button>
            </Group>
          </Group>

          {/* Participants Bar */}
          <Paper
            p="md"
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--mantine-color-dark-4)',
            }}
          >
            <Group justify="space-between">
              <Group gap="xl">
                <Group gap="sm">
                  <Avatar size="md" color="violet" radius="xl">
                    {getRepInitials()}
                  </Avatar>
                  <Box>
                    <Text size="sm" c="white" fw={500}>{getRepName()}</Text>
                    <Text size="xs" c="dimmed">Sales Rep</Text>
                  </Box>
                </Group>
                <Divider orientation="vertical" />
                <Group gap="sm">
                  <Avatar size="md" color="blue" radius="xl">
                    <IconUser size={18} />
                  </Avatar>
                  <Box>
                    <Text size="sm" c="white" fw={500}>{call.prospect.name}</Text>
                    <Group gap={4}>
                      <Text size="xs" c="dimmed">{call.prospect.role || 'Prospect'}</Text>
                      <Text size="xs" c="dimmed">•</Text>
                      <Text size="xs" c="dimmed">{call.prospect.company}</Text>
                    </Group>
                  </Box>
                </Group>
              </Group>
              {analysis?.overallScore && (
                <RingProgress
                  size={70}
                  thickness={6}
                  roundCaps
                  sections={[{ value: analysis.overallScore, color: getScoreColor(analysis.overallScore) }]}
                  label={
                    <Text size="sm" fw={700} ta="center" c="white">
                      {analysis.overallScore}
                    </Text>
                  }
                />
              )}
            </Group>
          </Paper>

          {/* Audio Player - only show for audio uploads */}
          {call.uploadSource === 'audio' && call.audioUrl && (
            <Paper
              p="lg"
              radius="lg"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(109, 40, 217, 0.05) 100%)',
                border: '1px solid var(--mantine-color-violet-9)',
              }}
            >
              {/* Hidden audio element */}
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              )}

              <Stack gap="md">
                {/* Waveform Visualization (Simulated) */}
                <Box
                  style={{
                    height: 60,
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 'var(--mantine-radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    padding: '0 16px',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    const duration = audioDuration || call.duration;
                    seekToTime(Math.floor(percentage * duration));
                  }}
                >
                  {/* Simulated waveform bars */}
                  {Array.from({ length: 100 }).map((_, i) => {
                    const height = Math.sin(i * 0.3) * 20 + Math.random() * 15 + 10;
                    const duration = audioDuration || call.duration;
                    const isPlayed = duration > 0 && (i / 100) < (currentTime / duration);
                    return (
                      <Box
                        key={i}
                        style={{
                          width: 3,
                          height,
                          borderRadius: 2,
                          backgroundColor: isPlayed
                            ? 'var(--mantine-color-violet-5)'
                            : 'var(--mantine-color-dark-4)',
                          transition: 'background-color 0.1s',
                          flexShrink: 0,
                        }}
                      />
                    );
                  })}
                  {/* Key moments markers */}
                  {keyMoments.map((moment, idx) => {
                    const duration = audioDuration || call.duration;
                    return (
                      <Tooltip key={idx} label={moment.label}>
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            seekToTime(moment.timestamp || 0);
                          }}
                          style={{
                            position: 'absolute',
                            left: `${duration > 0 ? ((moment.timestamp || 0) / duration) * 100 : 0}%`,
                            top: 0,
                            bottom: 0,
                            width: 3,
                            backgroundColor: `var(--mantine-color-${getMomentColor(moment.type)}-6)`,
                            cursor: 'pointer',
                            opacity: 0.8,
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Box>

                {/* Controls */}
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">{formatTime(currentTime)}</Text>
                  <Group gap="md">
                    <Tooltip label="Back 10s">
                      <ActionIcon variant="subtle" color="gray" size="lg" onClick={skipBack}>
                        <IconPlayerSkipBack size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <ActionIcon
                      variant="filled"
                      color="violet"
                      size="xl"
                      radius="xl"
                      onClick={togglePlayPause}
                      disabled={!audioUrl}
                      loading={isLoadingAudio}
                    >
                      {isPlaying ? <IconPlayerPause size={22} /> : <IconPlayerPlay size={22} />}
                    </ActionIcon>
                    <Tooltip label="Forward 10s">
                      <ActionIcon variant="subtle" color="gray" size="lg" onClick={skipForward}>
                        <IconPlayerSkipForward size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  <Group gap="md">
                    <Group gap={4}>
                      <IconVolume size={16} color="var(--mantine-color-gray-5)" />
                      <Progress value={80} w={60} size="xs" color="violet" />
                    </Group>
                    <Text size="sm" c="dimmed">{formatTime(audioDuration || call.duration)}</Text>
                  </Group>
                </Group>
              </Stack>
            </Paper>
          )}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="analysis" leftSection={<IconBrain size={16} />}>
                AI Analysis
              </Tabs.Tab>
              <Tabs.Tab value="transcript" leftSection={<IconMessageCircle size={16} />}>
                Transcript
              </Tabs.Tab>
              <Tabs.Tab value="moments" leftSection={<IconStar size={16} />}>
                Key Moments
              </Tabs.Tab>
              <Tabs.Tab value="coaching" leftSection={<IconBulb size={16} />}>
                Coaching Tips
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {/* Tab Content */}
          <Grid gutter="lg">
            {/* Main Content Area */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              {activeTab === 'analysis' && (
                <Stack gap="lg">
                  {/* Performance Dimensions */}
                  <Paper
                    p="lg"
                    radius="lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--mantine-color-dark-4)',
                    }}
                  >
                    <Group mb="md" gap="sm">
                      <ThemeIcon size="md" variant="light" color="violet">
                        <IconChartBar size={16} />
                      </ThemeIcon>
                      <Text size="md" fw={600} c="white">Performance Breakdown</Text>
                    </Group>
                    {dimensions.length > 0 ? (
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                        {dimensions.map((dim) => (
                          <Box key={dim.name}>
                            <Group justify="space-between" mb={4}>
                              <Text size="sm" c="gray.4">{dim.name}</Text>
                              <Text size="sm" fw={600} c={getScoreColor(dim.score)}>{dim.score}</Text>
                            </Group>
                            <Progress
                              value={dim.score}
                              color={getScoreColor(dim.score)}
                              size="md"
                              radius="xl"
                              styles={{
                                root: { backgroundColor: 'var(--mantine-color-dark-5)' }
                              }}
                            />
                          </Box>
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Text c="dimmed" ta="center" py="lg">No dimension scores available</Text>
                    )}
                  </Paper>

                  {/* Talk Ratio & Sentiment */}
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Paper
                        p="lg"
                        radius="lg"
                        h="100%"
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--mantine-color-dark-4)',
                        }}
                      >
                        <Group mb="md" gap="sm">
                          <ThemeIcon size="md" variant="light" color="blue">
                            <IconWaveSine size={16} />
                          </ThemeIcon>
                          <Text size="md" fw={600} c="white">Talk Ratio</Text>
                        </Group>
                        {talkRatio ? (
                          <Group justify="center" gap="xl">
                            <Box ta="center">
                              <RingProgress
                                size={100}
                                thickness={8}
                                roundCaps
                                sections={[
                                  { value: talkRatio.rep, color: 'violet' },
                                  { value: talkRatio.prospect, color: 'blue' },
                                ]}
                                label={
                                  <Text size="xs" c="dimmed" ta="center">
                                    {talkRatio.rep <= 50 ? 'Balanced' : 'Talk more'}
                                  </Text>
                                }
                              />
                            </Box>
                            <Stack gap="xs">
                              <Group gap="sm">
                                <Box w={12} h={12} style={{ backgroundColor: 'var(--mantine-color-violet-5)', borderRadius: 2 }} />
                                <Text size="sm" c="gray.4">Rep: {talkRatio.rep}%</Text>
                              </Group>
                              <Group gap="sm">
                                <Box w={12} h={12} style={{ backgroundColor: 'var(--mantine-color-blue-5)', borderRadius: 2 }} />
                                <Text size="sm" c="gray.4">Prospect: {talkRatio.prospect}%</Text>
                              </Group>
                            </Stack>
                          </Group>
                        ) : (
                          <Text c="dimmed" ta="center" py="lg">No talk ratio data</Text>
                        )}
                      </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Paper
                        p="lg"
                        radius="lg"
                        h="100%"
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--mantine-color-dark-4)',
                        }}
                      >
                        <Group mb="md" gap="sm">
                          <ThemeIcon size="md" variant="light" color="green">
                            <IconTrendingUp size={16} />
                          </ThemeIcon>
                          <Text size="md" fw={600} c="white">Sentiment</Text>
                        </Group>
                        {sentiment ? (
                          <Stack gap="sm">
                            <Group justify="space-between">
                              <Text size="sm" c="gray.4">Positive</Text>
                              <Text size="sm" c="green">{sentiment.positive}%</Text>
                            </Group>
                            <Progress value={sentiment.positive} color="green" size="sm" radius="xl" />
                            <Group justify="space-between">
                              <Text size="sm" c="gray.4">Neutral</Text>
                              <Text size="sm" c="gray">{sentiment.neutral}%</Text>
                            </Group>
                            <Progress value={sentiment.neutral} color="gray" size="sm" radius="xl" />
                            <Group justify="space-between">
                              <Text size="sm" c="gray.4">Negative</Text>
                              <Text size="sm" c="red">{sentiment.negative}%</Text>
                            </Group>
                            <Progress value={sentiment.negative} color="red" size="sm" radius="xl" />
                          </Stack>
                        ) : (
                          <Text c="dimmed" ta="center" py="lg">No sentiment data</Text>
                        )}
                      </Paper>
                    </Grid.Col>
                  </Grid>

                  {/* Key Topics */}
                  <Paper
                    p="lg"
                    radius="lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--mantine-color-dark-4)',
                    }}
                  >
                    <Group mb="md" gap="sm">
                      <ThemeIcon size="md" variant="light" color="orange">
                        <IconTarget size={16} />
                      </ThemeIcon>
                      <Text size="md" fw={600} c="white">Key Topics Discussed</Text>
                    </Group>
                    {keyTopics.length > 0 ? (
                      <Group gap="sm">
                        {keyTopics.map((topic) => (
                          <Badge key={topic} size="lg" variant="light" color="violet" radius="sm">
                            {topic.charAt(0).toUpperCase() + topic.slice(1)}
                          </Badge>
                        ))}
                      </Group>
                    ) : (
                      <Text c="dimmed" ta="center" py="lg">No key topics identified</Text>
                    )}
                  </Paper>
                </Stack>
              )}

              {activeTab === 'transcript' && (
                <Paper
                  p="lg"
                  radius="lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  }}
                >
                  {transcript.length > 0 ? (
                    <ScrollArea h={500}>
                      <Stack gap="md">
                        {transcript.map((line, idx) => (
                          <Group
                            key={idx}
                            align="flex-start"
                            gap="md"
                            p="sm"
                            style={{
                              borderRadius: 'var(--mantine-radius-md)',
                              backgroundColor: line.speaker === 'rep'
                                ? 'rgba(139, 92, 246, 0.08)'
                                : 'rgba(59, 130, 246, 0.08)',
                              cursor: 'pointer',
                            }}
                            onClick={() => seekToTime(line.startTime || 0)}
                          >
                            <Avatar
                              size="sm"
                              color={line.speaker === 'rep' ? 'violet' : 'blue'}
                              radius="xl"
                            >
                              {(line.speakerName || line.speaker || 'U').charAt(0)}
                            </Avatar>
                            <Box style={{ flex: 1 }}>
                              <Group gap="sm" mb={4}>
                                <Text size="sm" fw={600} c={line.speaker === 'rep' ? 'violet.4' : 'blue.4'}>
                                  {line.speakerName || (line.speaker === 'rep' ? 'Rep' : 'Prospect')}
                                </Text>
                                <Text size="xs" c="dimmed">{formatTime(line.startTime || 0)}</Text>
                              </Group>
                              <Text size="sm" c="gray.3">{line.text}</Text>
                            </Box>
                          </Group>
                        ))}
                      </Stack>
                    </ScrollArea>
                  ) : (
                    <Center py="xl">
                      <Text c="dimmed">No transcript available</Text>
                    </Center>
                  )}
                </Paper>
              )}

              {activeTab === 'moments' && (
                <Paper
                  p="lg"
                  radius="lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  }}
                >
                  {keyMoments.length > 0 ? (
                    <Timeline bulletSize={28} lineWidth={2}>
                      {keyMoments.map((moment, idx) => {
                        const MomentIcon = getMomentIcon(moment.type);
                        return (
                          <Timeline.Item
                            key={idx}
                            bullet={
                              <ThemeIcon
                                size={24}
                                radius="xl"
                                color={getMomentColor(moment.type)}
                                variant="filled"
                              >
                                <MomentIcon size={14} />
                              </ThemeIcon>
                            }
                            onClick={() => seekToTime(moment.timestamp || 0)}
                            style={{ cursor: 'pointer' }}
                          >
                            <Group justify="space-between" mb={4}>
                              <Text size="sm" fw={600} c="white">{moment.label}</Text>
                              <Badge size="sm" variant="light" color="gray">
                                {formatTime(moment.timestamp || 0)}
                              </Badge>
                            </Group>
                            <Text size="sm" c="dimmed">{moment.description}</Text>
                          </Timeline.Item>
                        );
                      })}
                    </Timeline>
                  ) : (
                    <Center py="xl">
                      <Text c="dimmed">No key moments identified</Text>
                    </Center>
                  )}
                </Paper>
              )}

              {activeTab === 'coaching' && (
                <Stack gap="md">
                  {coachingTips.length > 0 ? (
                    coachingTips.map((tip, idx) => (
                      <Paper
                        key={idx}
                        p="lg"
                        radius="lg"
                        style={{
                          background: tip.type === 'strength'
                            ? 'rgba(34, 197, 94, 0.08)'
                            : 'rgba(251, 191, 36, 0.08)',
                          border: `1px solid ${tip.type === 'strength'
                            ? 'var(--mantine-color-green-9)'
                            : 'var(--mantine-color-yellow-9)'}`,
                        }}
                      >
                        <Group gap="md" mb="sm">
                          <ThemeIcon
                            size="lg"
                            radius="xl"
                            variant="light"
                            color={tip.type === 'strength' ? 'green' : 'yellow'}
                          >
                            {tip.type === 'strength' ? <IconCheck size={18} /> : <IconBulb size={18} />}
                          </ThemeIcon>
                          <Box style={{ flex: 1 }}>
                            <Group justify="space-between">
                              <Text size="md" fw={600} c="white">{tip.title}</Text>
                              <Badge
                                size="sm"
                                variant="light"
                                color={tip.priority === 'high' ? 'red' : 'gray'}
                              >
                                {tip.priority} priority
                              </Badge>
                            </Group>
                          </Box>
                        </Group>
                        <Text size="sm" c="gray.4" ml={52}>
                          {tip.description}
                        </Text>
                      </Paper>
                    ))
                  ) : (
                    <Paper
                      p="xl"
                      radius="lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--mantine-color-dark-4)',
                        textAlign: 'center',
                      }}
                    >
                      <Text c="dimmed">No coaching tips available</Text>
                    </Paper>
                  )}
                </Stack>
              )}
            </Grid.Col>

            {/* Sidebar */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Stack gap="lg">
                {/* Objections Handled */}
                <Paper
                  p="lg"
                  radius="lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  }}
                >
                  <Group mb="md" gap="sm">
                    <ThemeIcon size="md" variant="light" color="orange">
                      <IconAlertTriangle size={16} />
                    </ThemeIcon>
                    <Text size="md" fw={600} c="white">Objections</Text>
                    <Badge size="sm" color="orange">{objections.length}</Badge>
                  </Group>
                  {objections.length > 0 ? (
                    <Stack gap="sm">
                      {objections.map((obj, idx) => (
                        <Paper
                          key={idx}
                          p="sm"
                          radius="md"
                          style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            cursor: 'pointer',
                          }}
                          onClick={() => seekToTime(idx * 120)}
                        >
                          <Group justify="space-between" mb={4}>
                            <Badge size="xs" color={obj.handling === 'well' ? 'green' : obj.handling === 'missed' ? 'red' : 'yellow'}>
                              {obj.handling === 'well' ? 'Handled Well' : obj.handling === 'missed' ? 'Missed' : 'Partial'}
                            </Badge>
                            <Text size="xs" c="dimmed">{obj.timestamp || '-'}</Text>
                          </Group>
                          <Text size="sm" c="gray.4" fs="italic">
                            "{obj.text}"
                          </Text>
                          <Badge size="xs" variant="light" color="violet" mt="xs">
                            {obj.type}
                          </Badge>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Text c="dimmed" ta="center" py="md">No objections detected</Text>
                  )}
                </Paper>

                {/* Quick Stats */}
                <Paper
                  p="lg"
                  radius="lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  }}
                >
                  <Text size="md" fw={600} c="white" mb="md">Quick Stats</Text>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Filler Words</Text>
                      <Text size="sm" c="white" fw={500}>{analysis?.metrics?.fillerWordCount ?? '-'}</Text>
                    </Group>
                    <Divider color="dark.5" />
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Questions Asked</Text>
                      <Text size="sm" c="white" fw={500}>{analysis?.metrics?.questionCount ?? '-'}</Text>
                    </Group>
                    <Divider color="dark.5" />
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Longest Monologue</Text>
                      <Text size="sm" c="white" fw={500}>
                        {analysis?.metrics?.longestMonologue ? `${analysis.metrics.longestMonologue} sec` : '-'}
                      </Text>
                    </Group>
                    <Divider color="dark.5" />
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Engagement</Text>
                      <Badge size="sm" color={analysis?.metrics?.engagementScore && analysis.metrics.engagementScore > 70 ? 'green' : 'yellow'}>
                        {analysis?.metrics?.engagementScore ? `${analysis.metrics.engagementScore}%` : '-'}
                      </Badge>
                    </Group>
                  </Stack>
                </Paper>

                {/* Prospect Info */}
                <Paper
                  p="lg"
                  radius="lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  }}
                >
                  <Group mb="md" gap="sm">
                    <ThemeIcon size="md" variant="light" color="blue">
                      <IconBuilding size={16} />
                    </ThemeIcon>
                    <Text size="md" fw={600} c="white">Prospect Info</Text>
                  </Group>
                  <Stack gap="sm">
                    <Group gap="sm">
                      <Avatar size="lg" color="blue" radius="xl">
                        {call.prospect.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Text size="sm" c="white" fw={500}>{call.prospect.name}</Text>
                        <Text size="xs" c="dimmed">{call.prospect.role || 'Prospect'}</Text>
                      </Box>
                    </Group>
                    <Divider color="dark.5" />
                    <Group gap="xs">
                      <IconBuilding size={14} color="var(--mantine-color-gray-6)" />
                      <Text size="sm" c="gray.4">{call.prospect.company}</Text>
                    </Group>
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

// Simple grid component for local use
function SimpleGrid({ cols, spacing, children }: { cols: { base: number; sm?: number }; spacing: string; children: React.ReactNode }) {
  return (
    <Grid gutter={spacing}>
      {Array.isArray(children) ? children.map((child, idx) => (
        <Grid.Col key={idx} span={{ base: 12 / cols.base, sm: cols.sm ? 12 / cols.sm : undefined }}>
          {child}
        </Grid.Col>
      )) : children}
    </Grid>
  );
}
