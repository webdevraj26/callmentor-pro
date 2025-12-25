import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Text,
  Title,
  Stack,
  Group,
  Avatar,
  Badge,
  ActionIcon,
  RingProgress,
  ThemeIcon,
  Tooltip,
  Menu,
  Progress,
  Center,
  Loader,
} from '@mantine/core';
import {
  IconSparkles,
  IconTrendingUp,
  IconMinus,
  IconPhone,
  IconPlus,
  IconUpload,
  IconUsers,
  IconBrain,
  IconCheck,
  IconChevronRight,
  IconArrowUp,
  IconArrowDown,
  IconRefresh,
} from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { useAnalyticsStore } from '@/store/analyticsStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const {
    dashboardMetrics,
    performanceDimensions,
    scoreTrends,
    coachingInsights,
    recentCalls,
    isLoading,
    refreshAll,
  } = useAnalyticsStore();

  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 65) return 'yellow';
    return 'red';
  };

  const getDimensionColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  // Prepare weekly data from score trends (last 7 days)
  const weeklyData = scoreTrends.slice(-7).map((point) => {
    const date = new Date(point.date);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      calls: point.callCount || 0,
      avgScore: point.score || 0,
    };
  });

  // Build AI insights from coaching insights
  const aiInsights = [
    ...(coachingInsights?.topImprovements?.slice(0, 2).map((imp, idx) => ({
      id: `imp-${idx}`,
      type: 'improvement',
      icon: IconTrendingUp,
      message: `Focus area: "${imp.title}" appeared in ${imp.count} recent calls`,
      priority: 'high' as const,
      time: 'Based on recent calls',
    })) || []),
    ...(coachingInsights?.topStrengths?.slice(0, 2).map((str, idx) => ({
      id: `str-${idx}`,
      type: 'positive',
      icon: IconCheck,
      message: `Strength: "${str.title}" demonstrated in ${str.count} calls`,
      priority: 'medium' as const,
      time: 'Keep it up!',
    })) || []),
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      default: return 'gray';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'green';
      case 'alert': return 'red';
      default: return 'violet';
    }
  };

  const teamScore = dashboardMetrics?.avgScore || 0;
  const scoreTrend = dashboardMetrics?.avgScoreTrend || 0;

  if (isLoading && !dashboardMetrics) {
    return (
      <Center h="100vh">
        <Loader size="lg" color="violet" />
      </Center>
    );
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
      }}
    >
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text c="dimmed" size="sm">
                {getGreeting()}, {user?.firstName}
              </Text>
              <Title order={2} c="white" mt={4}>
                Command Center
              </Title>
            </Box>
            <Group>
              <Tooltip label="Refresh data">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => refreshAll()}
                  loading={isLoading}
                >
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
              <Badge
                size="lg"
                variant="light"
                color="violet"
                leftSection={<IconSparkles size={14} />}
              >
                AI Insights Active
              </Badge>
            </Group>
          </Group>

          {/* Main Grid */}
          <Grid gutter="lg">
            {/* Left Column - Focus Score & Dimensions */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Stack gap="lg">
                {/* Focus Score Card */}
                <Paper
                  p="xl"
                  radius="lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(109, 40, 217, 0.1) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Animated pulse effect */}
                  <Box
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                      animation: 'pulse 3s ease-in-out infinite',
                    }}
                  />

                  <Stack align="center" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                    <Text size="sm" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: 1 }}>
                      Team Performance
                    </Text>

                    <RingProgress
                      size={180}
                      thickness={12}
                      roundCaps
                      sections={[{ value: teamScore, color: 'violet' }]}
                      label={
                        <Stack align="center" gap={0}>
                          <Text size="2.5rem" fw={700} c="white">
                            {teamScore}
                          </Text>
                          <Group gap={4}>
                            {scoreTrend > 0 ? (
                              <IconArrowUp size={16} color="var(--mantine-color-green-5)" />
                            ) : scoreTrend < 0 ? (
                              <IconArrowDown size={16} color="var(--mantine-color-red-5)" />
                            ) : (
                              <IconMinus size={16} color="var(--mantine-color-gray-5)" />
                            )}
                            <Text
                              size="sm"
                              c={scoreTrend > 0 ? 'green.5' : scoreTrend < 0 ? 'red.5' : 'gray.5'}
                              fw={500}
                            >
                              {scoreTrend > 0 ? '+' : ''}{scoreTrend}%
                            </Text>
                          </Group>
                        </Stack>
                      }
                    />

                    <Text size="xs" c="dimmed" ta="center">
                      {dashboardMetrics?.totalCalls || 0} calls analyzed
                    </Text>
                  </Stack>
                </Paper>

                {/* Performance Dimensions */}
                <Paper
                  p="lg"
                  radius="lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  }}
                >
                  <Text size="sm" fw={600} c="white" mb="md">
                    Performance Dimensions
                  </Text>
                  {performanceDimensions.length > 0 ? (
                    <Stack gap="sm">
                      {performanceDimensions.map((dim) => (
                        <Box key={dim.name}>
                          <Group justify="space-between" mb={4}>
                            <Text size="xs" c="gray.5">
                              {dim.name}
                            </Text>
                            <Text size="xs" fw={600} c={getDimensionColor(dim.score)}>
                              {dim.score}
                            </Text>
                          </Group>
                          <Progress
                            value={dim.score}
                            size="sm"
                            radius="xl"
                            color={getDimensionColor(dim.score)}
                            styles={{
                              root: { backgroundColor: 'var(--mantine-color-dark-5)' },
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No data yet. Upload your first call!
                    </Text>
                  )}
                </Paper>
              </Stack>
            </Grid.Col>

            {/* Center Column - AI Insights & Activity */}
            <Grid.Col span={{ base: 12, lg: 5 }}>
              <Stack gap="lg">
                {/* AI Insights Feed */}
                <Paper
                  p="lg"
                  radius="lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  }}
                >
                  <Group justify="space-between" mb="md">
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="violet" variant="light" radius="xl">
                        <IconBrain size={14} />
                      </ThemeIcon>
                      <Text size="sm" fw={600} c="white">
                        AI Insights
                      </Text>
                    </Group>
                    <Badge size="xs" variant="light" color="violet">
                      Live
                    </Badge>
                  </Group>

                  {aiInsights.length > 0 ? (
                    <Stack gap="sm">
                      {aiInsights.map((insight) => (
                        <Paper
                          key={insight.id}
                          p="sm"
                          radius="md"
                          style={{
                            background: `rgba(${getInsightColor(insight.type) === 'green' ? '34, 197, 94' : getInsightColor(insight.type) === 'red' ? '239, 68, 68' : '139, 92, 246'}, 0.08)`,
                            border: `1px solid rgba(${getInsightColor(insight.type) === 'green' ? '34, 197, 94' : getInsightColor(insight.type) === 'red' ? '239, 68, 68' : '139, 92, 246'}, 0.2)`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Group gap="sm" align="flex-start">
                            <ThemeIcon
                              size="md"
                              color={getInsightColor(insight.type)}
                              variant="light"
                              radius="xl"
                            >
                              <insight.icon size={14} />
                            </ThemeIcon>
                            <Box style={{ flex: 1 }}>
                              <Text size="sm" c="gray.3" lh={1.4}>
                                {insight.message}
                              </Text>
                              <Group gap="xs" mt={6}>
                                <Badge size="xs" color={getPriorityColor(insight.priority)} variant="light">
                                  {insight.priority}
                                </Badge>
                                <Text size="xs" c="dimmed">
                                  {insight.time}
                                </Text>
                              </Group>
                            </Box>
                            <IconChevronRight size={16} color="var(--mantine-color-gray-6)" />
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                      Upload calls to get AI-powered insights
                    </Text>
                  )}
                </Paper>

                {/* Weekly Performance Wave */}
                <Paper
                  p="lg"
                  radius="lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  }}
                >
                  <Text size="sm" fw={600} c="white" mb="md">
                    This Week's Performance
                  </Text>
                  {weeklyData.length > 0 ? (
                    <Group gap="xs" justify="space-between">
                      {weeklyData.map((day, index) => (
                        <Tooltip
                          key={`${day.day}-${index}`}
                          label={`${day.calls} calls, avg score ${day.avgScore}`}
                          position="top"
                        >
                          <Stack align="center" gap={4} style={{ flex: 1 }}>
                            <Box
                              style={{
                                width: '100%',
                                height: 80,
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                              }}
                            >
                              <Box
                                style={{
                                  width: '70%',
                                  height: `${Math.max(5, (day.avgScore / 100) * 80)}px`,
                                  background: `linear-gradient(180deg, var(--mantine-color-violet-5) 0%, var(--mantine-color-violet-9) 100%)`,
                                  borderRadius: '4px 4px 0 0',
                                  opacity: index === weeklyData.length - 1 ? 1 : 0.6,
                                }}
                              />
                            </Box>
                            <Text size="xs" c="dimmed">
                              {day.day}
                            </Text>
                            <Text size="xs" fw={600} c="white">
                              {day.avgScore || '-'}
                            </Text>
                          </Stack>
                        </Tooltip>
                      ))}
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No data for this week yet
                    </Text>
                  )}
                </Paper>
              </Stack>
            </Grid.Col>

            {/* Right Column - Activity & Stats */}
            <Grid.Col span={{ base: 12, lg: 3 }}>
              <Stack gap="lg">
                {/* Recent Calls */}
                <Paper
                  p="lg"
                  radius="lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  }}
                >
                  <Group justify="space-between" mb="md">
                    <Text size="sm" fw={600} c="white">
                      Recent Calls
                    </Text>
                    <Badge size="xs" variant="light" color="gray">
                      {recentCalls.length} recent
                    </Badge>
                  </Group>

                  {recentCalls.length > 0 ? (
                    <Stack gap="xs">
                      {recentCalls.map((call) => (
                        <Box
                          key={call._id}
                          component={Link}
                          to={`/calls/${call._id}`}
                          p="xs"
                          style={{
                            borderRadius: 'var(--mantine-radius-md)',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--mantine-spacing-sm)',
                          }}
                        >
                          <Avatar size="sm" color="violet" radius="xl">
                            {call.repName?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}
                          </Avatar>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text size="xs" c="white" fw={500} truncate>
                              {call.prospect?.company || call.title}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {call.repName} • {formatRelativeTime(call.date)}
                            </Text>
                          </Box>
                          <Badge
                            size="sm"
                            color={getScoreColor(call.analysis?.overallScore || 0)}
                            variant="light"
                          >
                            {call.analysis?.overallScore || '-'}
                          </Badge>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No recent calls
                    </Text>
                  )}
                </Paper>

                {/* Quick Stats */}
                <Paper
                  p="lg"
                  radius="lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}
                >
                  <Group justify="space-between">
                    <Box>
                      <Text size="xs" c="dimmed" tt="uppercase">
                        Total Calls
                      </Text>
                      <Text size="xl" fw={700} c="white">
                        {dashboardMetrics?.totalCalls || 0}
                      </Text>
                    </Box>
                    <ThemeIcon size={40} color="green" variant="light" radius="xl">
                      <IconPhone size={20} />
                    </ThemeIcon>
                  </Group>
                </Paper>

                {/* Talk Ratio Stat */}
                <Paper
                  p="lg"
                  radius="lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <Group justify="space-between">
                    <Box>
                      <Text size="xs" c="dimmed" tt="uppercase">
                        Avg Talk Ratio
                      </Text>
                      <Text size="xl" fw={700} c="white">
                        {dashboardMetrics?.avgTalkRatio || 50}%
                      </Text>
                    </Box>
                    <ThemeIcon size={40} color="blue" variant="light" radius="xl">
                      <IconUsers size={20} />
                    </ThemeIcon>
                  </Group>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>

      {/* Floating Action Button */}
      <Box
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 100,
        }}
      >
        <Menu
          opened={fabOpen}
          onChange={setFabOpen}
          position="top-end"
          withArrow
          arrowPosition="center"
        >
          <Menu.Target>
            <ActionIcon
              size={56}
              radius="xl"
              variant="gradient"
              gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
              style={{
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                transition: 'transform 0.2s',
                transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
              }}
            >
              <IconPlus size={24} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconUpload size={16} />}
              component={Link}
              to="/calls"
            >
              Upload Call
            </Menu.Item>
            <Menu.Item leftSection={<IconPhone size={16} />}>
              Start Recording
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Box>

      {/* Add pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
          }
        `}
      </style>
    </Box>
  );
}
