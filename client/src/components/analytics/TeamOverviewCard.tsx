import { Paper, Group, Text, Stack, ThemeIcon, SimpleGrid } from '@mantine/core';
import {
  IconPhone,
  IconChartBar,
  IconClock,
  IconUsers,
} from '@tabler/icons-react';

interface StatItemProps {
  icon: React.ComponentType<{ size: number }>;
  label: string;
  value: string | number;
  color: string;
}

function StatItem({ icon: Icon, label, value, color }: StatItemProps) {
  return (
    <Group>
      <ThemeIcon size="lg" radius="md" variant="light" color={color}>
        <Icon size={20} />
      </ThemeIcon>
      <Stack gap={0}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          {label}
        </Text>
        <Text size="xl" fw={700} c="white">
          {value}
        </Text>
      </Stack>
    </Group>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

interface TeamOverviewCardProps {
  stats: {
    memberCount?: number;
    totalCalls?: number;
    avgScore?: number;
    totalDuration?: number;
  } | null;
}

export default function TeamOverviewCard({ stats }: TeamOverviewCardProps) {
  return (
    <Paper
      p="xl"
      radius="lg"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--mantine-color-dark-4)',
      }}
    >
      <Text size="lg" fw={600} mb="lg" c="white">
        Team Overview
      </Text>
      <SimpleGrid cols={{ base: 2, md: 4 }}>
        <StatItem
          icon={IconUsers}
          label="Team Members"
          value={stats?.memberCount || 0}
          color="violet"
        />
        <StatItem
          icon={IconPhone}
          label="Total Calls"
          value={stats?.totalCalls || 0}
          color="blue"
        />
        <StatItem
          icon={IconChartBar}
          label="Avg Score"
          value={stats?.avgScore ? `${Math.round(stats.avgScore)}%` : '--'}
          color="green"
        />
        <StatItem
          icon={IconClock}
          label="Total Duration"
          value={formatDuration(stats?.totalDuration || 0)}
          color="orange"
        />
      </SimpleGrid>
    </Paper>
  );
}
