import {
  Paper,
  Text,
  Group,
  Avatar,
  Stack,
  Progress,
  Badge,
  Table,
  ScrollArea,
} from '@mantine/core';
import { IconTrophy, IconMedal } from '@tabler/icons-react';

interface MemberPerformance {
  userId: string;
  name: string;
  avatar?: string;
  callCount: number;
  avgScore: number;
  totalDuration: number;
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <Badge
        leftSection={<IconTrophy size={12} />}
        color="yellow"
        variant="light"
      >
        1st
      </Badge>
    );
  }
  if (rank === 2) {
    return (
      <Badge
        leftSection={<IconMedal size={12} />}
        color="gray.4"
        variant="light"
      >
        2nd
      </Badge>
    );
  }
  if (rank === 3) {
    return (
      <Badge
        leftSection={<IconMedal size={12} />}
        color="orange.6"
        variant="light"
      >
        3rd
      </Badge>
    );
  }
  return (
    <Badge color="dark" variant="light">
      #{rank}
    </Badge>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

interface MemberLeaderboardProps {
  members: MemberPerformance[];
}

export default function MemberLeaderboard({ members }: MemberLeaderboardProps) {
  const rows = members.map((member, index) => (
    <Table.Tr key={member.userId}>
      <Table.Td>{getRankBadge(index + 1)}</Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Avatar
            src={member.avatar}
            radius="xl"
            size="sm"
            color="violet"
          >
            {member.name?.charAt(0)}
          </Avatar>
          <Text size="sm" fw={500} c="white">
            {member.name}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Stack gap={4}>
          <Group gap="xs">
            <Text size="sm" fw={600} c="white">
              {member.avgScore}%
            </Text>
          </Group>
          <Progress
            value={member.avgScore}
            size="xs"
            radius="xl"
            color={getScoreColor(member.avgScore)}
          />
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="gray.4">{member.callCount}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {formatDuration(member.totalDuration)}
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

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
        Team Leaderboard
      </Text>
      <ScrollArea>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={80}>Rank</Table.Th>
              <Table.Th>Member</Table.Th>
              <Table.Th w={150}>Avg Score</Table.Th>
              <Table.Th w={80}>Calls</Table.Th>
              <Table.Th w={100}>Duration</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" c="dimmed" py="xl">
                    No team members with analyzed calls yet
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
