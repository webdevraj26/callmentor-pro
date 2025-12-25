import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Title,
  Text,
  Stack,
  Grid,
  Alert,
  Skeleton,
  Group,
  Button,
} from '@mantine/core';
import { IconAlertCircle, IconRefresh, IconUsersGroup, IconUserPlus } from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { useOrganizationStore } from '@/store/organizationStore';
import {
  TeamOverviewCard,
  TeamPerformanceChart,
  MemberLeaderboard,
  ScoreDistributionChart,
} from '@/components/analytics';

export default function TeamAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    stats,
    isLoadingStats,
    error,
    dateRange,
    fetchOrganizationStats,
    setDateRange,
  } = useOrganizationStore();

  useEffect(() => {
    if (user?.organization) {
      fetchOrganizationStats(user.organization as string);
    }
  }, [user?.organization, fetchOrganizationStats]);

  const handleRefresh = () => {
    if (user?.organization) {
      fetchOrganizationStats(user.organization as string);
    }
  };

  const handleInviteMember = () => {
    navigate('/settings/organization');
  };

  if (!user?.organization) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
        }}
      >
        <Container size="xl" py="xl">
          <Alert
            icon={<IconUsersGroup size={20} />}
            title="No Team"
            color="yellow"
            variant="outline"
          >
            <Text size="sm">
              You need to be part of a team to view team analytics.
              Create or join a team to get started.
            </Text>
            <Button
              variant="light"
              color="yellow"
              size="xs"
              mt="md"
              component="a"
              href="/settings/organization"
            >
              Create Team
            </Button>
          </Alert>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
        }}
      >
        <Container size="xl" py="xl">
          <Alert
            icon={<IconAlertCircle size={20} />}
            title="Error"
            color="red"
            variant="outline"
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  const overviewStats = stats ? {
    memberCount: stats.memberCount,
    totalCalls: stats.overview.totalCalls,
    avgScore: stats.overview.avgScore,
    totalDuration: stats.overview.totalDuration,
  } : null;

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
              <Title order={2} c="white">
                Team Analytics
              </Title>
              <Text c="dimmed" mt={4}>
                Track team performance and identify coaching opportunities
              </Text>
            </Box>
            <Group>
              <Button
                variant="light"
                leftSection={<IconUserPlus size={16} />}
                onClick={handleInviteMember}
              >
                Invite Member
              </Button>
              <Button
                variant="subtle"
                leftSection={<IconRefresh size={16} />}
                onClick={handleRefresh}
                loading={isLoadingStats}
              >
                Refresh
              </Button>
            </Group>
          </Group>

          {/* Overview Stats */}
          {isLoadingStats ? (
            <Skeleton height={140} radius="lg" />
          ) : (
            <TeamOverviewCard stats={overviewStats} />
          )}

          {/* Charts Row */}
          <Grid>
            <Grid.Col span={{ base: 12, lg: 8 }}>
              {isLoadingStats ? (
                <Skeleton height={380} radius="lg" />
              ) : (
                <TeamPerformanceChart
                  scoreTrend={stats?.scoreTrend || []}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              )}
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              {isLoadingStats ? (
                <Skeleton height={380} radius="lg" />
              ) : (
                <ScoreDistributionChart members={stats?.memberPerformance || []} />
              )}
            </Grid.Col>
          </Grid>

          {/* Leaderboard */}
          {isLoadingStats ? (
            <Skeleton height={400} radius="lg" />
          ) : (
            <MemberLeaderboard members={stats?.memberPerformance || []} />
          )}
        </Stack>
      </Container>
    </Box>
  );
}
