import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  Tabs,
  Paper,
  Group,
  Badge,
  List,
  ThemeIcon,
} from '@mantine/core';
import {
  IconBrain,
  IconMessageCircle,
  IconChartBar,
  IconUsers,
  IconCheck,
} from '@tabler/icons-react';

const features = [
  {
    id: 'scoring',
    icon: IconBrain,
    label: 'AI Scoring',
    title: 'Objective Performance Scoring',
    description: 'Every call gets a 0-100 score across 6 key dimensions. No bias, no guesswork—just data.',
    highlights: [
      'Discovery & qualification depth',
      'Talk-to-listen ratio analysis',
      'Objection handling effectiveness',
      'Next steps & commitment',
      'Rapport & relationship building',
      'Technical accuracy',
    ],
    preview: (
      <Box p="lg">
        <Group justify="space-between" mb="md">
          <Text size="sm" c="dimmed">Overall Score</Text>
          <Badge color="green" size="lg">78/100</Badge>
        </Group>
        {['Discovery', 'Talk Balance', 'Objections', 'Next Steps', 'Rapport', 'Accuracy'].map((cat, i) => (
          <Group key={cat} justify="space-between" py="xs" style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}>
            <Text size="sm" c="gray.4">{cat}</Text>
            <Text size="sm" fw={600} c={[82, 65, 71, 88, 75, 90][i] >= 70 ? 'green.4' : 'yellow.4'}>
              {[82, 65, 71, 88, 75, 90][i]}
            </Text>
          </Group>
        ))}
      </Box>
    ),
  },
  {
    id: 'objections',
    icon: IconMessageCircle,
    label: 'Objection Radar',
    title: 'Never Miss an Objection Again',
    description: 'AI automatically detects every objection and evaluates how well it was handled.',
    highlights: [
      'Auto-detect pricing concerns',
      'Identify timeline objections',
      'Spot competition mentions',
      'Track authority/decision-maker issues',
      'Measure handling effectiveness',
      'Suggest better responses',
    ],
    preview: (
      <Box p="lg">
        <Stack gap="md">
          {[
            { type: 'Pricing', text: '"That\'s more than we budgeted..."', status: 'Handled Well', color: 'green' },
            { type: 'Timeline', text: '"We\'re not ready until Q3..."', status: 'Partially Addressed', color: 'yellow' },
            { type: 'Competition', text: '"We\'re also looking at Gong..."', status: 'Missed', color: 'red' },
          ].map((obj) => (
            <Paper key={obj.type} p="sm" bg="dark.6" radius="md">
              <Group justify="space-between" mb={4}>
                <Badge size="sm" variant="light">{obj.type}</Badge>
                <Badge size="sm" color={obj.color}>{obj.status}</Badge>
              </Group>
              <Text size="sm" c="dimmed" fs="italic">{obj.text}</Text>
            </Paper>
          ))}
        </Stack>
      </Box>
    ),
  },
  {
    id: 'coaching',
    icon: IconChartBar,
    label: 'AI Coaching',
    title: 'Personalized Feedback in Seconds',
    description: 'Get specific, actionable coaching with quotes from the actual conversation.',
    highlights: [
      'Strengths with specific examples',
      'Areas for improvement',
      'Recommended responses',
      'Best practice comparisons',
      'Action items for follow-up',
      'Progress tracking over time',
    ],
    preview: (
      <Box p="lg">
        <Stack gap="md">
          <Paper p="sm" bg="green.9" radius="md" style={{ opacity: 0.8 }}>
            <Text size="xs" c="green.3" fw={600} mb={4}>STRENGTH</Text>
            <Text size="sm" c="white">Great discovery question at 2:34</Text>
            <Text size="xs" c="dimmed" fs="italic" mt={4}>"What would success look like 6 months from now?"</Text>
          </Paper>
          <Paper p="sm" bg="yellow.9" radius="md" style={{ opacity: 0.8 }}>
            <Text size="xs" c="yellow.3" fw={600} mb={4}>IMPROVE</Text>
            <Text size="sm" c="white">Talked 68% of the call—try to listen more</Text>
            <Text size="xs" c="dimmed" mt={4}>Ideal range: 40-60% talk time</Text>
          </Paper>
        </Stack>
      </Box>
    ),
  },
  {
    id: 'team',
    icon: IconUsers,
    label: 'Team Analytics',
    title: 'See Your Whole Team at a Glance',
    description: 'Compare performance, identify top performers, and spot who needs coaching.',
    highlights: [
      'Rep-by-rep comparisons',
      'Team performance trends',
      'Identify coaching priorities',
      'Benchmark against top performers',
      'Track improvement over time',
      'Export reports for leadership',
    ],
    preview: (
      <Box p="lg">
        <Stack gap="sm">
          {[
            { name: 'Sarah M.', score: 87, trend: '+12%', rank: 1 },
            { name: 'James K.', score: 79, trend: '+8%', rank: 2 },
            { name: 'Mike R.', score: 72, trend: '+3%', rank: 3 },
            { name: 'Lisa P.', score: 65, trend: '-2%', rank: 4 },
          ].map((rep) => (
            <Group key={rep.name} justify="space-between" py="xs" style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}>
              <Group gap="sm">
                <Text size="sm" c="dimmed">#{rep.rank}</Text>
                <Text size="sm" c="white">{rep.name}</Text>
              </Group>
              <Group gap="md">
                <Text size="sm" c={rep.trend.startsWith('+') ? 'green.4' : 'red.4'}>{rep.trend}</Text>
                <Badge color={rep.score >= 75 ? 'green' : rep.score >= 60 ? 'yellow' : 'red'}>{rep.score}</Badge>
              </Group>
            </Group>
          ))}
        </Stack>
      </Box>
    ),
  },
];

export function FeatureSpotlight() {
  const [activeTab, setActiveTab] = useState<string | null>('scoring');
  const activeFeature = features.find((f) => f.id === activeTab) || features[0];

  return (
    <Box py={{ base: 60, md: 100 }}>
      <Container size="lg">
        <Stack align="center" gap="xl">
          <Stack align="center" gap="xs" maw={500} ta="center">
            <Text size="sm" tt="uppercase" fw={600} c="violet.4" style={{ letterSpacing: 1 }}>
              Capabilities
            </Text>
            <Title order={2} c="white">
              Everything Runs on AI
            </Title>
            <Text c="dimmed">
              Explore what CallMentor can do for your team
            </Text>
          </Stack>

          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            variant="pills"
            radius="xl"
            styles={{
              list: {
                gap: 8,
                justifyContent: 'center',
                flexWrap: 'wrap',
              },
              tab: {
                backgroundColor: 'transparent',
                border: '1px solid var(--mantine-color-dark-4)',
                color: 'var(--mantine-color-gray-5)',
                '&[dataActive]': {
                  backgroundColor: 'var(--mantine-color-violet-9)',
                  borderColor: 'var(--mantine-color-violet-7)',
                  color: 'white',
                },
              },
            }}
          >
            <Tabs.List>
              {features.map((feature) => (
                <Tabs.Tab
                  key={feature.id}
                  value={feature.id}
                  leftSection={<feature.icon size={16} />}
                >
                  {feature.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          <Paper
            p={0}
            radius="lg"
            w="100%"
            maw={900}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              overflow: 'hidden',
            }}
          >
            <Group gap={0} align="stretch" wrap="nowrap">
              {/* Content */}
              <Box p="xl" style={{ flex: 1 }}>
                <Stack gap="lg">
                  <Box>
                    <Title order={3} c="white" mb="xs">
                      {activeFeature.title}
                    </Title>
                    <Text c="dimmed">
                      {activeFeature.description}
                    </Text>
                  </Box>

                  <List
                    spacing="sm"
                    icon={
                      <ThemeIcon size={18} radius="xl" color="violet" variant="light">
                        <IconCheck size={10} />
                      </ThemeIcon>
                    }
                  >
                    {activeFeature.highlights.map((h) => (
                      <List.Item key={h}>
                        <Text size="sm" c="gray.4">{h}</Text>
                      </List.Item>
                    ))}
                  </List>
                </Stack>
              </Box>

              {/* Preview */}
              <Box
                w={320}
                bg="dark.7"
                style={{
                  borderLeft: '1px solid var(--mantine-color-dark-5)',
                  position: 'relative',
                }}
                visibleFrom="md"
              >
                <Badge
                  size="xs"
                  variant="light"
                  color="gray"
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 10,
                  }}
                >
                  Example
                </Badge>
                {activeFeature.preview}
              </Box>
            </Group>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
